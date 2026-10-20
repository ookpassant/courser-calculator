// The Scroll Generator, with add-ons.
//
// A scroll comes with a coat and one free trait. Everything past that is paid
// for in potions, and the roller now lets you say how many and from which
// tier. The invariants worth holding: what comes out is a genotype the engine
// can actually read, nothing lands twice on the same locus, and every trait it
// can roll is one the game knows how to price.
const { load, suite } = require('./harness');
const A = load(['breeding-calculator.js'],
    '{ generateCustomScroll, scrollAddonPool, scrollDrawTraits, parseGenotype, isKnownGeneToken,' +
    '  resolveTraits, recipeLocusOfToken, recipePoolNames, recipeScrollPotion, RARITY_GENES,' +
    '  RECIPE_TRAIT_TIER, RECIPE_TRAIT_KIND, ALL_ANOMALIES, RECIPE_ANOMALY_POTION_LIMIT, SCROLL_TIER_ORDER }');
const t = suite('scroll');
const ok = (l, c) => t.ok(l, c);
const roll = (rarity, opts) => A.generateCustomScroll(rarity, opts);

// --- whatever it rolls has to be a real horse ------------------------------
//
// This is the one that matters. A horse has two alleles at a locus, so a
// genotype naming the same locus twice is not a horse, and rolling several
// markings blind would produce those constantly.
const CASES = [
    ['a plain roll', 'Rare', {}],
    ['three markings', 'Rare', { markings: 3 }],
    ['two modifiers', 'Uncommon', { modifiers: 2 }],
    ['both at once', 'Epic', { markings: 3, modifiers: 3 }],
    ['the lot', 'Legendary', { markings: 6, modifiers: 6, anomalies: 2 }],
    ['legendary add-ons on a common scroll', 'Common', { markings: 2, markingTier: 'legendary' }],
    ['every tier named', 'Rare', { markings: 2, markingTier: 'common', modifiers: 2, modifierTier: 'epic' }]
];
CASES.forEach(([label, rarity, opts]) => {
    let unknown = null, repeated = null, unreadable = null;
    for (let i = 0; i < 300; i++) {
        const r = roll(rarity, opts);
        const genes = A.parseGenotype(r.genotype).genes;
        const bad = genes.filter(g => !A.isKnownGeneToken(g));
        if (bad.length && !unknown) unknown = r.genotype + ' -> ' + bad.join(' ');
        const loci = genes.map(A.recipeLocusOfToken).filter(Boolean);
        const dupe = loci.filter((l, n) => loci.indexOf(l) !== n);
        if (dupe.length && !repeated) repeated = r.genotype + ' -> ' + dupe.join(' ');
        if (!A.resolveTraits(r.genotype).coatColor && !unreadable) unreadable = r.genotype;
    }
    ok(label + ': every token is one the engine knows' + (unknown ? ', ' + unknown : ''), !unknown);
    ok(label + ': no locus is named twice' + (repeated ? ', ' + repeated : ''), !repeated);
    ok(label + ': every roll resolves to a coat, so none is a lethal white' +
        (unreadable ? ', ' + unreadable : ''), !unreadable);
});

// The one that bit: Overo and Ossuary are at different loci, so the locus
// rule lets them through, and together there is no foal.
let lethalPair = null;
for (let i = 0; i < 400; i++) {
    const g = roll('Legendary', { markings: 6, modifiers: 6, anomalies: 2 }).genotype;
    if (/\bnO\b/.test(g) && /\bnOs\b/.test(g)) { lethalPair = g; break; }
}
ok('Overo and Ossuary never come out on the same scroll' + (lethalPair ? ': ' + lethalPair : ''), !lethalPair);

// --- the counts are honoured ----------------------------------------------
for (let n = 0; n <= 4; n++) {
    const r = roll('Legendary', { markings: n });
    ok('asking for ' + n + ' markings gives ' + n,
        r.addons.filter(a => a.kind === 'marking').length === n);
}
let r = roll('Legendary', { markings: 2, modifiers: 3 });
ok('markings and modifiers are counted apart',
    r.addons.filter(a => a.kind === 'marking').length === 2 &&
    r.addons.filter(a => a.kind === 'modifier').length === 3);
ok('a plain roll has no add-ons at all', roll('Rare', {}).addons.length === 0);
ok('and still has its one free trait', !!roll('Rare', {}).free);

// --- the tier is honoured --------------------------------------------------
A.SCROLL_TIER_ORDER.forEach((tier) => {
    const pool = A.scrollAddonPool('marking', tier, 'legendary');
    if (pool.length < 2) return;
    let wrong = null;
    for (let i = 0; i < 60; i++) {
        roll('Common', { markings: 2, markingTier: tier }).addons
            .filter(a => a.kind === 'marking')
            .forEach((a) => { if (a.tier !== tier && !wrong) wrong = a.name + ' came out ' + a.tier; });
    }
    ok('asking for ' + tier + ' markings gets ' + tier + (wrong ? ', not ' + wrong : ''), !wrong);
});
// The default draws from the scroll's own tier and everything under it, so a
// Common scroll can never roll an Epic trait by accident.
let tooGood = null;
for (let i = 0; i < 200; i++) {
    roll('Common', { markings: 1, modifiers: 1 }).addons.forEach((a) => {
        if (A.SCROLL_TIER_ORDER.indexOf(a.tier) > 0 && !tooGood) tooGood = a.name + ' is ' + a.tier;
    });
}
ok('a common scroll draws common add-ons by default' + (tooGood ? ', not ' + tooGood : ''), !tooGood);

// --- anomalies -------------------------------------------------------------
ok('two per scroll is the limit', A.RECIPE_ANOMALY_POTION_LIMIT === 2);
let overCap = false, repeatAnomaly = false;
for (let i = 0; i < 300; i++) {
    const s = roll('Rare', { anomalies: 5 });
    const paid = s.addons.filter(a => a.kind === 'anomaly');
    if (paid.length > A.RECIPE_ANOMALY_POTION_LIMIT) overCap = true;
    const all = A.parseGenotype(s.genotype).anomalies;
    if (new Set(all).size !== all.length) repeatAnomaly = true;
}
ok('asking for five still only gets two', !overCap);
ok('and the scroll never names the same anomaly twice', !repeatAnomaly);
ok('asking for none can still roll the free one',
    (function () {
        for (let i = 0; i < 400; i++) { if (roll('Rare', {}).freeAnomalies.length) return true; }
        return false;
    })());

// --- what it costs ---------------------------------------------------------
r = roll('Legendary', { markings: 3, modifiers: 3, anomalies: 2 });
ok('every add-on is priced', r.addons.every(a => a.potion && a.potion.count > 0));
ok('and priced the same as Recipe would', r.addons.filter(a => a.kind !== 'anomaly').every((a) => {
    const want = A.recipeScrollPotion(a.name, a.tier);
    return want && want.item.name === a.potion.item.name && want.count === a.potion.count;
}));
ok('an anomaly is one Anomaly Potion',
    r.addons.filter(a => a.kind === 'anomaly').every(a => a.potion.count === 1 && /Anomaly Potion/.test(a.potion.item.name)));

// Every trait the roller can reach has to be priceable, or a roll comes back
// with "no price on record" and the tool has lied about what it costs.
const unpriced = [];
A.SCROLL_TIER_ORDER.forEach((tier) => {
    const v = A.RARITY_GENES[tier] || {};
    (v.markings || []).concat(v.modifiers || []).forEach((tokens) => {
        const name = (A.recipePoolNames(tokens) || [])[0];
        if (!name) { unpriced.push(tokens + ' (no name)'); return; }
        if (!A.RECIPE_TRAIT_TIER[name]) { unpriced.push(name + ' (no tier)'); return; }
        if (!A.RECIPE_TRAIT_KIND[name]) { unpriced.push(name + ' (no kind)'); return; }
        if (!A.recipeScrollPotion(name, tier)) unpriced.push(name + ' (no potion)');
    });
});
ok('every rollable trait can be priced' + (unpriced.length ? ': ' + unpriced.join(', ') : ''), !unpriced.length);

// --- running out is said out loud ------------------------------------------
// The Epic marking pool is small, so asking for six must report the shortfall
// rather than quietly handing back three.
const epicMarkings = A.scrollAddonPool('marking', 'epic', 'legendary').length;
ok('the epic marking pool is small enough to run out', epicMarkings < 6);
const shortRoll = roll('Legendary', { markings: 6, markingTier: 'epic' });
ok('asking for more than it holds is reported', shortRoll.short.length === 1);
ok('and the report says how many it managed',
    shortRoll.short[0].got === shortRoll.addons.filter(a => a.kind === 'marking').length);
ok('and how many were asked for', shortRoll.short[0].asked === 6);
ok('a roll that fits reports nothing', roll('Legendary', { markings: 1 }).short.length === 0);

// --- the old shape still works ---------------------------------------------
const plain = roll('Rare');
ok('calling it with no options at all still rolls', !!plain && !!plain.genotype);
ok('it still carries a temperament', ['Choleric', 'Melancholic', 'Phlegmatic', 'Sanguine'].indexOf(plain.temperament) !== -1);
ok('and a variant', ['Standard', 'Heraldic', 'Puck', 'Cavedweller', 'Restored'].indexOf(plain.variant) !== -1);
ok('an unknown rarity still returns nothing', roll('Mythical') === null);

t.report();
