// Smart Search deciding what a pairing can make.
//
// It used to answer this with a long chain of per-trait tests against the two
// parents' genotypes run together as one lowercased string, and text cannot
// see a locus. That produced Weaselheart's bug (patterns offered that no foal
// could have), Cricri's bug (pairs refused that really work), and a quieter
// one where Damascus was offered to any pair with a Dm and a D between them,
// even when the only parent holding either was DmD and could pass just one.
//
// Everything the possibility engine can name now goes to the engine, and the
// few carriers it does not name are worked out by walking the locus. The rule
// this file holds: the verdict must match what breeding the pair really does.
const { load, suite } = require('./harness');
const A = load(['group-horses.js', 'breeding-calculator.js'],
    '{ GROUP_HORSES, calculateMatchScore, generateChimeraPossibilities, extractTraitsFromQuery,' +
    '  searchEngineTraits, SEARCH_ENGINE_SKIPS, resolveTraits, generateFoal, RARITY_GENES,' +
    '  CANONICAL_COATS, COAT_FAMILIES, recipeCarrierAllele }');
const t = suite('search');
const ok = (l, c) => t.ok(l, c);

const mk = (g, temp) => ({ genotype: g, temperament: temp });
const score = (g1, g2, trait) => A.calculateMatchScore(mk(g1, 'Sanguine'), mk(g2, 'Phlegmatic'), [trait]);
const rolls = (g1, g2, trait, n) => {
    const a = mk(g1, 'Sanguine'), b = mk(g2, 'Phlegmatic');
    let hits = 0;
    for (let k = 0; k < n; k++) {
        if (A.resolveTraits(A.generateFoal(a, b, k).genotype).allTraits.indexOf(trait) !== -1) hits++;
    }
    return hits;
};

// --- the vocabulary is derived, not listed ----------------------------------
const vocab = A.searchEngineTraits();
const plain = A.resolveTraits('Ee Aa').allTraits;
const poolNames = new Set();
Object.keys(A.RARITY_GENES).forEach((tier) => {
    const v = A.RARITY_GENES[tier] || {};
    [].concat(v.markings || [], v.modifiers || []).forEach((tokens) => {
        A.resolveTraits('Ee Aa ' + tokens).allTraits
            .filter(n => plain.indexOf(n) === -1).forEach(n => poolNames.add(n));
    });
});
ok('there is a decent vocabulary', Object.keys(vocab).length > 40);
const unrouted = [...poolNames].filter(n => !vocab[n.toLowerCase()] && A.SEARCH_ENGINE_SKIPS.indexOf(n.toLowerCase()) === -1);
ok('every marking and modifier in the pools is routed to the engine' +
    (unrouted.length ? ': ' + unrouted.join(', ') : ''), !unrouted.length);

// The five bare dilutions are the one listed part, so check the engine really
// produces each. A rename upstream should fail here, not go quietly missing.
const dilutionsSeen = new Set();
[['Ee Aa nCr', 'ee aa nCr'], ['Ee Aa nprl ner', 'ee aa nprl ner'], ['Ee Aa nTp nCh', 'ee aa nTp nCh']]
    .forEach(([a, b]) => A.generateChimeraPossibilities('', a, b).dilutions.forEach(d => dilutionsSeen.add(d)));
['Cream', 'Tapestry', 'Pearl', 'Champagne', 'Ether'].forEach((d) => {
    ok('the engine really names ' + d, dilutionsSeen.has(d));
    ok('and ' + d + ' is routed to it', vocab[d.toLowerCase()] === d);
});

// The skips must stay out: the engine never lists them, so routing them would
// score every pair zero. That is the shape of Cricri's bug.
A.SEARCH_ENGINE_SKIPS.forEach((k) => {
    ok(k + ' is kept off the engine branch', !vocab[k]);
    ok('and still has a carrier allele to go on', !!A.recipeCarrierAllele(
        k.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')));
});

// --- Damascus, the quiet one ------------------------------------------------
// Dm and D share a locus. A DmD parent holds both and can pass only one, so
// "both alleles are somewhere across the pair" was never the question.
ok('two DmD parents can make Damascus', score('Ee Aa DmD', 'ee aa DmD', 'Damascus') > 0);
ok('and really do', rolls('Ee Aa DmD', 'ee aa DmD', 'Damascus', 400) > 0);
ok('one DmD parent alone cannot', score('Ee Aa DmD', 'ee aa', 'Damascus') === 0);
ok('and really cannot', rolls('Ee Aa DmD', 'ee aa', 'Damascus', 400) === 0);
ok('nDm with nD can', score('Ee Aa nDm', 'ee aa nD', 'Damascus') > 0);
ok('two nDm parents cannot', score('Ee Aa nDm', 'ee aa nDm', 'Damascus') === 0);
ok('and really cannot', rolls('Ee Aa nDm', 'ee aa nDm', 'Damascus', 400) === 0);

// --- carriers, which are not simply "the allele beside an n" ----------------
ok('two prlprl parents cannot make a Pearl carrier',
    score('Ee Aa prlprl', 'ee aa prlprl', 'Carries Pearl') === 0);
ok('and really cannot', rolls('Ee Aa prlprl', 'ee aa prlprl', 'Carries Pearl', 400) === 0);
ok('a Crprl parent can', score('Ee Aa Crprl', 'ee aa', 'Carries Pearl') > 0);
ok('and really does', rolls('Ee Aa Crprl', 'ee aa', 'Carries Pearl', 400) > 0);
// Cher expresses Champagne and carries Ether at the same time, so a carrier is
// not always the allele sat beside a plain n.
ok('Cher counts as carrying Ether', A.resolveTraits('Ee Aa Cher').allTraits.indexOf('Carries Ether') !== -1);
ok('so Cher with erer can make an Ether carrier', score('Ee Aa Cher', 'ee aa erer', 'Carries Ether') > 0);
ok('and really does', rolls('Ee Aa Cher', 'ee aa erer', 'Carries Ether', 400) > 0);

// --- coat families answer the same in either case ---------------------------
// The table is keyed as written and was indexed with the raw query. The parser
// hands over canonical names so it never showed, but it is the same trap that
// let the two leopard tools drift apart.
const famPairs = [['Ee Aa CrCr erer', 'ee aa CrCr erer'], ['Ee Aa nprl ner', 'ee aa nprl ner']];
Object.keys(A.COAT_FAMILIES).slice(0, 6).forEach((fam) => {
    famPairs.forEach(([g1, g2]) => {
        ok(fam + ' scores the same in lower case',
            (score(g1, g2, fam) > 0) === (score(g1, g2, fam.toLowerCase()) > 0));
    });
});

// --- the roster, judged against actual breeding -----------------------------
// The check that would have caught all three bugs. Real pairings, bred out,
// compared with what the search says.
const WATCH = ['Damascus', 'Dun', 'Roan', 'Tobiano', 'Overo', 'Sabino', 'Gray', 'Silver', 'Sooty',
    'Rabicano', 'Harlequin', 'Blanched', 'Prism', 'Opal', 'Gilt', 'Vellum', 'Illuminated',
    'Carries Pearl', 'Carries Ether', 'Carrying Flaxen', 'Carrying Sepulchered',
    'Snowflake', 'Blanket', 'Snowcap', 'Varnish Roan'];
const herd = (A.GROUP_HORSES || []).slice(0, 16);
ok('a slice of the roster loaded', herd.length === 16);
const refused = [], offered = [];
let judged = 0;
for (let i = 0; i < herd.length; i++) {
    for (let j = i + 1; j < herd.length; j++) {
        const a = herd[i], b = herd[j];
        if (a.temperament === b.temperament) continue;
        judged++;
        const seen = new Set();
        for (let k = 0; k < 300; k++) {
            A.resolveTraits(A.generateFoal(a, b, k).genotype).allTraits.forEach(n => seen.add(n));
        }
        WATCH.forEach((n) => {
            const says = A.calculateMatchScore(a, b, [n]) > 0;
            if (!says && seen.has(n)) refused.push(n + ': ' + a.name + ' x ' + b.name);
            // A trait can honestly miss 300 rolls, so only count the ones the
            // possibility engine will not back either.
            if (says && !seen.has(n)) {
                const p = A.generateChimeraPossibilities('', a.genotype, b.genotype);
                const named = [].concat(p.whiteMarkings || [], p.modifiers || [], p.dilutions || []);
                if (named.indexOf(n) === -1 && !A.recipeCarrierAllele(n)) {
                    offered.push(n + ': ' + a.name + ' x ' + b.name);
                }
            }
        });
    }
}
ok('judged a decent number of real pairings', judged > 80);
ok('nothing refused that the pair really throws' + (refused.length ? ': ' + refused.slice(0, 3).join('; ') : ''),
    !refused.length);
ok('nothing offered that it cannot' + (offered.length ? ': ' + offered.slice(0, 3).join('; ') : ''),
    !offered.length);

// --- the query parser still reaches all of it -------------------------------
// The branch keys off the canonical name, so a query that parses to something
// the vocabulary does not hold would silently score nothing.
['snowflake', 'damascus', 'carries pearl', 'carries ether', 'gray', 'grey', 'roan',
 'tobiano', 'silver', 'pearl', 'ether', 'cream'].forEach((q) => {
    const parsed = A.extractTraitsFromQuery(q);
    ok('"' + q + '" parses to something the scorer knows', parsed.length > 0 && parsed.every(n => {
        const l = n.toLowerCase();
        return !!vocab[l] || A.CANONICAL_COATS.has(l) || !!A.COAT_FAMILIES[n] || !!A.recipeCarrierAllele(n);
    }));
});

t.report();
