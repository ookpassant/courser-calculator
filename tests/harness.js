// ===========================================================================
// Test harness
// ---------------------------------------------------------------------------
// The site has no build step and no modules: index.html loads five scripts and
// they share one global scope. So the tests load the real files the same way
// the browser does, with a small DOM shim standing in for the page, and ask
// for the handful of names each one needs.
//
// Nothing is mocked. A test that passes here is running the code that ships.
// ===========================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Enough of a page for the scripts to load against. They only touch the DOM
// from inside functions the tests do not call, so this never has to do more
// than exist.
function shim() {
    global.document = {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ style: {}, addEventListener() {}, appendChild() {} }),
        addEventListener: () => {},
        body: { appendChild() {}, removeChild() {}, style: {} }
    };
    global.window = { addEventListener: () => {} };
    global.navigator = {};
    const mem = {};
    global.localStorage = {
        getItem: k => (k in mem ? mem[k] : null),
        setItem: (k, v) => { mem[k] = String(v); },
        removeItem: (k) => { delete mem[k]; }
    };
}

// Load site scripts and hand back the names asked for.
//
//   const A = load(['chat.js'], '{ chatParse, chatRender }');
//
// The export list is a string because the names only exist inside the eval:
// a direct eval keeps its own const declarations to itself, so the expression
// that reads them has to be evaluated in there with them.
function load(files, exports) {
    shim();
    const src = files.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
    return eval(src + '\n;(() => (' + exports + '))()');
}

// A test file collects its results here and ends with report().
function suite(name) {
    const fails = [];
    let count = 0;
    return {
        ok(label, cond) {
            count++;
            if (!cond) fails.push(label);
            return !!cond;
        },
        eq(label, got, want) {
            return this.ok(label + ' (got ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(want) + ')', got === want);
        },
        report() {
            if (fails.length) {
                fails.forEach(f => console.log('  FAIL: ' + f));
                console.log(fails.length + ' of ' + count + ' FAILED');
                process.exit(1);
            }
            console.log('ALL PASS (' + count + ' checks)');
            process.exit(0);
        }
    };
}

module.exports = { ROOT, load, shim, suite };
