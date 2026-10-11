#!/usr/bin/env node
// Run every test file in here.
//
//   node tests/run.js            all of them
//   node tests/run.js chat       only the ones whose name contains "chat"
//
// Each test runs in its own process, because they all load the site's scripts
// into one global scope and would otherwise tread on each other.
//
// This lives in the repo rather than in a scratch directory on purpose. The
// suite used to be kept outside it and was lost in a container restart, which
// is a silly way to lose a thousand assertions.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const only = process.argv.slice(2);
const files = fs.readdirSync(__dirname)
    .filter(f => /^test-.*\.js$/.test(f))
    .filter(f => !only.length || only.some(q => f.includes(q)))
    .sort();

if (!files.length) {
    console.log(only.length ? 'No test file matches ' + only.join(', ') : 'No test files found.');
    process.exit(1);
}

let failed = 0;
files.forEach((f) => {
    process.stdout.write(f.padEnd(26));
    try {
        const out = execFileSync(process.execPath, [path.join(__dirname, f)], { encoding: 'utf8' });
        process.stdout.write(out.trim().split('\n').pop() + '\n');
    } catch (e) {
        failed++;
        const out = ((e.stdout || '') + (e.stderr || '')).trim();
        process.stdout.write('FAILED\n');
        out.split('\n').forEach(l => console.log('    ' + l));
    }
});

console.log('\n' + files.length + ' file' + (files.length === 1 ? '' : 's') + ', ' +
    (failed ? failed + ' failing' : 'all passing'));
process.exit(failed ? 1 : 0);
