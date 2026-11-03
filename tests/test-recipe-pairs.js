// Recipe's "Who can make it" list.
//
// The list is the answer to the question the tool is for, so the two ways it
// can lie both matter: offering a pairing that cannot work, and leaving out
// one that can. The second is the one that actually happened. Harlan x Calen
// throws a Cold Ash Ether about one foal in eight, Recipe found it, and then
// cut it off at a silent limit of five, which reads as "no".
const { load, suite } = require('./harness');
const A = load(['group-horses.js', 'breeding-calculator.js'],
    '{ GROUP_HORSES, computeRecipe, computeRecipeStable, resolveTraits, generateFoal,' +
    '  recipeFromEnglish, RECIPE_MAX_PAIRS, RECIPE_PAIRS_SHOWN, recipePairEvaluate }');
const t = suite('recipe-pairs');
const ok = (l, c) => t.ok(l, c);
const H = A.GROUP_HORSES;
const horse = n => H.find(h => h.name === n);
const pairsFor = (target, coatOnly) =>
    A.computeRecipeStable(A.computeRecipe(target, { coatOnly: !!coatOnly }), H);
const has = (st, a, b) => st.pairs.some(p => [p.a.name, p.b.name].sort().join('|') === [a, b].sort().join('|'));

// --- the report -----------------------------------------------------------
const target = A.recipeFromEnglish('Cold ash ether').genotype;
ok('"Cold ash ether" reads as ee AA CrCr erer', target === 'ee AA CrCr erer');

const coat = pairsFor(target, true);
ok('going on coat alone, plenty of pairs can do it', coat.pairs.length > 5);
ok('Harlan x Calen is one of them', has(coat, 'Harlan', 'Calen'));

// And the foal generator agrees, which is where the report came from.
const trials = (a, b, want) => {
    let hit = 0;
    for (let i = 0; i < 1500; i++) {
        if (A.resolveTraits(A.generateFoal(horse(a), horse(b), i).genotype).coatColor === want) hit++;
    }
    return hit / 1500;
};
const rate = trials('Harlan', 'Calen', 'Cold Ash Ether');
ok('and it really throws one, about one foal in eight: ' + (100 * rate).toFixed(1) + '%', rate > 0.08 && rate < 0.18);

// On the whole horse it is correctly impossible: Calen is spsp, so every foal
// gets Sepulchered whether you want it or not, and no root can stop it.
const whole = pairsFor(target, false);
ok('on the exact genotype Harlan x Calen cannot work', !has(whole, 'Harlan', 'Calen'));
ok('because Calen is homozygous there', horse('Calen').genotype.indexOf('spsp') !== -1);
ok('but some pair still can', whole.pairs.length > 0);

// --- nothing is cut off in silence ----------------------------------------
['ee AA CrCr erer', 'Ee Aa CrCr erer', 'ee aa nCr nO nSty', 'Ee Aa nCr nD nG'].forEach((g) => {
    [true, false].forEach((coatOnly) => {
        const st = pairsFor(g, coatOnly);
        const label = g + (coatOnly ? ' (coat)' : ' (whole)');
        ok(label + ': the real total is reported', typeof st.pairTotal === 'number');
        ok(label + ': and is never less than what is kept', st.pairTotal >= st.pairs.length);
        ok(label + ': no more than the cap is kept', st.pairs.length <= A.RECIPE_MAX_PAIRS);
        // Two sections: everything that breeds it unaided, then everything that
        // needs a wand. Within each, fewest items first and then best odds. The
        // page shows both of those, so a list ordered by anything else reads as
        // unsorted, and a wand pairing mixed in among the rest reads as a
        // pairing that works when it does not.
        for (let i = 1; i < st.pairs.length; i++) {
            const x = st.pairs[i - 1], y = st.pairs[i];
            if (!x.wands && y.wands) continue;          // the boundary, by design
            ok(label + ': pair ' + i + ' is not ordered worse than the one before',
                x.items.length < y.items.length ||
                (x.items.length === y.items.length && x.chance >= y.chance - 1e-12));
        }
        // No wand pairing may sit above one that needs no wand, because that is
        // how a pairing that really works gets pushed past the cap and lost.
        const firstWand = st.pairs.findIndex(p => p.wands);
        ok(label + ': wand pairings never come before unaided ones',
            firstWand === -1 || st.pairs.slice(firstWand).every(p => p.wands));
        ok(label + ': the unaided count is reported',
            st.pairPlain === st.pairs.filter(p => !p.wands).length ||
            st.pairPlain >= A.RECIPE_MAX_PAIRS);
        // No pairing appears twice, in either orientation.
        const keys = st.pairs.map(p => [p.a.name, p.b.name].sort().join('|'));
        ok(label + ': no pairing is listed twice', new Set(keys).size === keys.length);
        // Nobody is paired with themselves, and temperaments always differ.
        ok(label + ': no horse is paired with itself', st.pairs.every(p => p.a.name !== p.b.name));
        ok(label + ': temperaments always differ', st.pairs.every(p => p.a.temperament !== p.b.temperament));
    });
});

// --- the fold ---------------------------------------------------------------
ok('the fold shows fewer than the cap keeps', A.RECIPE_PAIRS_SHOWN < A.RECIPE_MAX_PAIRS);
ok('and keeps enough to be worth folding', A.RECIPE_MAX_PAIRS >= 20);

// --- the hard one: never say no to a pair that works ------------------------
//
// Breed every legal pairing in the roster and see which ones actually throw
// the coat. Every single one of those has to be in the list. This is the
// invariant the bug broke, so it is worth the seconds it costs.
//
// generateFoal is seeded by the loop index, so this is the same run every
// time: a failure here is a real one, not a bad roll.
const WANT = 'Cold Ash Ether';
const offered = new Set(coat.pairs.map(p => [p.a.name, p.b.name].sort().join('|')));
const missed = [];
let tested = 0;
for (let i = 0; i < H.length; i++) {
    for (let j = i + 1; j < H.length; j++) {
        if (H[i].temperament === H[j].temperament) continue;
        tested++;
        let works = false;
        for (let k = 0; k < 250 && !works; k++) {
            if (A.resolveTraits(A.generateFoal(H[i], H[j], k).genotype).coatColor === WANT) works = true;
        }
        if (!works) continue;
        const key = [H[i].name, H[j].name].sort().join('|');
        if (!offered.has(key)) missed.push(key);
    }
}
ok('swept ' + tested + ' legal pairings', tested > 500);
ok('every pairing that breeds a ' + WANT + ' is listed' + (missed.length ? ': missing ' + missed.join(', ') : ''),
    missed.length === 0);

// Every pairing that breeds it unaided must come before any that needs a wand,
// so the sweep above can never be crowded out by one.
const plain = coat.pairs.filter(p => !p.wands);
ok('the unaided pairings are all at the top',
    coat.pairs.slice(0, plain.length).every(p => !p.wands));
ok('and there are some', plain.length > 0);

// And the other way: nothing offered unaided should be unable to do it. A wand
// pairing is exempt by definition, since the wand is what makes it work and
// generateFoal knows nothing about items.
const bogus = plain.filter(p => trials(p.a.name, p.b.name, WANT) === 0).map(p => p.a.name + ' x ' + p.b.name);
ok('and every unaided pairing listed can really do it' + (bogus.length ? ': ' + bogus.join(', ') : ''), bogus.length === 0);

// A wand pairing has to be one that genuinely cannot breed it on its own,
// otherwise it belongs in the section above and is being needlessly charged
// for an item.
const needless = coat.pairs.filter(p => p.wands && trials(p.a.name, p.b.name, WANT) > 0)
    .map(p => p.a.name + ' x ' + p.b.name);
ok('and no pairing is charged a wand it does not need' + (needless.length ? ': ' + needless.join(', ') : ''),
    needless.length === 0);
// Only Cream and Tapestry have a wand, and both sit at one locus, so two is the
// most any pairing can ever be asked for.
ok('no pairing needs more than two wands', coat.pairs.every(p => (p.wands || 0) <= 2));
ok('and every wand item is a wand', coat.pairs.every(p =>
    p.items.filter(i => i.mode === 'wand').length === (p.wands || 0)));

// --- the coat alone, with dilutions ----------------------------------------
// Coat-only mode lets markings and modifiers come along for free. A dilution
// is not one of those: it changes the coat. Two parents who always pass a
// dilution were offered for a plain Black at no cost, ranked first, and never
// once threw one. The other way round, a carried recessive at that locus
// does not change the coat, and pairs with one were refused.
const mk = (n, g, temp) => ({ name: n, genotype: g, temperament: temp });
const feasible = (rec, a, b) => A.recipePairEvaluate(rec, a, b);
const coatRolls = (a, b, coat, n) => {
    let h = 0;
    for (let k = 0; k < n; k++) if (A.resolveTraits(A.generateFoal(a, b, k).genotype).coatColor === coat) h++;
    return h;
};
const black = A.computeRecipe('Ee aa nG nLp', { coatOnly: true });
ok('coat-only Black reduces to the base', black.coatTarget === 'Ee aa');
let ev = feasible(black, mk('a', 'EE aa Tpprl', 'Melancholic'), mk('b', 'ee aa prlprl', 'Sanguine'));
ok('two parents who always pass a dilution cannot make a Black', !ev.feasible);
ok('and really never do', coatRolls(mk('a', 'EE aa Tpprl', 'Melancholic'), mk('b', 'ee aa prlprl', 'Sanguine'), 'Black', 300) === 0);
ev = feasible(black, mk('a', 'Ee Aa nTp', 'Sanguine'), mk('b', 'Ee aa', 'Phlegmatic'));
ok('one Tapestry carrier can, with the Tapestry blocked', ev.feasible && ev.items.some(i => i.mode === 'block' && i.allele === 'Tp'));
ev = feasible(black, mk('a', 'Ee aa nprl', 'Sanguine'), mk('b', 'Ee aa', 'Phlegmatic'));
ok('a Pearl carrier can, since a Black carrying Pearl is still Black', ev.feasible);
ok('and is charged nothing for the Pearl', !ev.items.some(i => i.allele === 'prl'));
ev = feasible(black, mk('a', 'Ee aa nT', 'Sanguine'), mk('b', 'Ee aa', 'Phlegmatic'));
ok('a Tobiano parent costs nothing extra on the coat alone', ev.feasible && !ev.items.some(i => i.allele === 'T'));
ev = feasible(black, mk('a', 'Ee aa nprl', 'Sanguine'), mk('b', 'Ee aa nprl', 'Phlegmatic'));
// One blocked side would do; it charges both, since it costs each acceptable
// spelling on its own. Over-priced, never mis-offered, and noted rather than
// rewritten.
ok('two Pearl carriers can, with the Pearl blocked', ev.feasible && ev.items.filter(i => i.allele === 'prl').length >= 1);

// Cher is a Champagne that carries Ether: for a Weld Champagne on the coat
// alone it is the coat asked for, and on the whole genotype it is not.
const pyany = mk('Pyany', 'ee AA nTp nCh nT nLp nSty', 'Phlegmatic');
const pwnco = mk('Pwnco', 'Ee aa erer nSh nG nOs nD', 'Sanguine');
ok('an Ether parent can make a Weld Champagne on the coat alone',
    feasible(A.computeRecipe('ee AA nTp nCh', { coatOnly: true }), pyany, pwnco).feasible);
ok('and really does', coatRolls(pyany, pwnco, 'Weld Champagne', 300) > 0);
ok('but not the whole genotype, which carries nothing',
    !feasible(A.computeRecipe('ee AA nTp nCh', { coatOnly: false }), pyany, pwnco).feasible);

// Every coat-only verdict against breeding, over the roster slice, for the
// three base coats and two dilute ones.
const herdSlice = H.slice(0, 16);
const wrongly = [];
[['Ee aa', 'Black'], ['Ee AA', 'Bay'], ['ee AA', 'Chestnut'], ['Ee AA nCr', 'Buckskin'], ['ee AA nCh', 'Gold Champagne']].forEach(([geno, coat]) => {
    const rec = A.computeRecipe(geno, { coatOnly: true });
    for (let i = 0; i < herdSlice.length; i++) for (let j = i + 1; j < herdSlice.length; j++) {
        const a = herdSlice[i], b = herdSlice[j];
        if (a.temperament === b.temperament) continue;
        const e = feasible(rec, a, b);
        const hits = coatRolls(a, b, coat, 200);
        if (e.feasible && !e.wands && e.items.length <= 3 && !hits) wrongly.push(coat + ' offered cheaply, never rolled: ' + a.name + ' x ' + b.name);
        if (!e.feasible && hits > 10) wrongly.push(coat + ' refused, rolled ' + hits + '/200: ' + a.name + ' x ' + b.name);
    }
});
ok('coat-only verdicts agree with breeding across the roster slice' + (wrongly.length ? ': ' + wrongly.slice(0, 3).join('; ') : ''),
    !wrongly.length);

t.report();
