// The item list under a Recipe pairing: grouped by what each root does, folded
// away behind a summary, and open only on the pairing you are meant to read.
const { load, suite } = require('./harness');
const A = load(['group-horses.js', 'breeding-calculator.js'],
    '{ GROUP_HORSES, computeRecipe, computeRecipeStable, recipeItemsHtml, parseGenotype, getGeneAlleles }');
const t = suite('rootlist');
const ok = (l, c) => t.ok(l, c);

ok('no items means no list at all', A.recipeItemsHtml([], true) === '' && A.recipeItemsHtml(null, true) === '');

const st = A.computeRecipeStable(A.computeRecipe('ee aa nCr nO nSty'), A.GROUP_HORSES);
ok('the target still finds pairs', st.pairs.length >= 3);

st.pairs.forEach((p, i) => {
    const h = A.recipeItemsHtml(p.items, i === 0);
    ok('pair ' + i + ' is a details block', /^<details class="recipe-items"/.test(h));
    ok('pair ' + i + ' open only when first', / open>/.test(h) === (i === 0));
    ok('pair ' + i + ' has one summary', (h.match(/<summary>/g) || []).length === 1);
    // Every item lands in exactly one group, and none is lost.
    const shown = (h.match(/<li>/g) || []).length;
    ok('pair ' + i + ' lists every item once: ' + shown + ' of ' + p.items.length, shown === p.items.length);
    ['slot', 'force', 'block'].forEach((mode) => {
        const want = p.items.filter(it => it.mode === mode).length;
        const group = h.indexOf('recipe-item-group is-' + mode) !== -1;
        ok('pair ' + i + ' has a ' + mode + ' group only when it needs one', group === (want > 0));
        if (!want) return;
        const m = h.match(new RegExp('<span class="recipe-tally-bit is-' + mode + '">(\\d+)'));
        ok('pair ' + i + ' tally counts ' + mode + ' right', m && Number(m[1]) === want);
    });
    // A force and a block must never be written the same way.
    if (p.items.some(it => it.mode === 'force') && p.items.some(it => it.mode === 'block')) {
        ok('pair ' + i + ' tags force and block apart',
            h.indexOf('recipe-item-tag is-force') !== -1 && h.indexOf('recipe-item-tag is-block') !== -1);
    }
});

// Slots are named by courser, without repeating the group heading.
const slotty = st.pairs.find(p => p.items.some(it => it.mode === 'slot'));
const sh = A.recipeItemsHtml(slotty.items, true);
ok('a slot line drops the "breeding slot to" prefix', sh.indexOf('>breeding slot to ') === -1);
ok('a slot line still names the courser',
    slotty.items.filter(it => it.mode === 'slot')
        .every(it => sh.indexOf('>' + String(it.trait).replace(/^breeding slot to /, '') + '<') !== -1));
ok('base coat reads once, not "e base coat e"',
    sh.indexOf('<code>e</code> <span class="recipe-item-trait">base coat e<') === -1);

// Anything with an allele keeps its chip.
const anyRoot = st.pairs[0].items.find(it => it.allele);
ok('a root still shows its allele', A.recipeItemsHtml([anyRoot], true).indexOf('<code>' + anyRoot.allele + '</code>') !== -1);

// A root can force an allele a parent carries, never one neither of them has.
// This is the bug the 6 Oct fix was for, so it is worth a standing guard.
const has = (horse, allele) => A.parseGenotype(horse.genotype).genes
    .some(tok => A.getGeneAlleles(tok).indexOf(allele) !== -1);
let impossible = 0, lines = 0;
['ee AA Tpprl erer', 'Ee aa Tpprl erer', 'ee Aa prlprl nT', 'Ee Aa CrCr erer',
 'ee aa nCr nO nSty', 'Ee aa nCh nOs spsp nP', 'Ee Aa nCr nD nG', 'ee aa nprl ner ff',
 'Ee aa TT fefe nCw', 'EE aa Tpprl erer nLp patnpatn', 'ee Aa nCu nSb ff'].forEach((target) => {
    const s = A.computeRecipeStable(A.computeRecipe(target), A.GROUP_HORSES);
    s.pairs.forEach((p) => {
        (p.items || []).forEach((it) => {
            if (it.mode !== 'force') return;
            lines++;
            if (!has(p.a, it.allele) && !has(p.b, it.allele)) impossible++;
        });
    });
});
ok('across 11 targets, ' + lines + ' force lines, none asks for an allele neither parent has', impossible === 0);
ok('and the sweep actually looked at something', lines > 50);

t.report();
