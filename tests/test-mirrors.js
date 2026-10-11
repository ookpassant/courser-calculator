// Shared loci written the other way round.
//
// Two genes can sit at one locus, so a compound like Crprl can be written
// prlCr and mean exactly the same horse. The engine used to know only one
// spelling of each and threw the other away as a typo, quietly losing a gene.
//
// It handles the two orders in two different ways, and both are worth pinning
// down. Some second spellings are aliases that normalise onto the first; some
// are listed as tokens in their own right, so the written spelling survives
// parsing. Either way the horse has to come out the same.
const { load, suite } = require('./harness');
const A = load(['breeding-calculator.js'],
    '{ parseGenotype, isKnownGeneToken, resolveTraits, normalizeGeneToken, findUnknownTokens }');
const t = suite('mirrors');
const ok = (l, c) => t.ok(l, c);

// Written one way, written the other.
const ALIASED = [
    ['Crprl', 'prlCr'],   // Cream and Pearl
    ['TpCr', 'CrTp'],     // Tyrian and Cream
    ['Tpprl', 'prlTp'],   // Tyrian and Pearl
    ['Cher', 'erCh'],     // Champagne and Ether
    ['Lusp', 'spLu'],     // Illuminated and Sepulchered
    ['PrOp', 'OpPr'],     // Prism and Opal
    ['CuCw', 'CwCu']      // Cuirass and Crowned
];
// Both orders are tokens in their own right, so a genotype keeps whichever
// spelling it was written with. The masterlist writes RnT, and so do we.
const BOTH_LISTED = [
    ['TRn', 'RnT'],       // Tobiano and Roan
    ['GiCo', 'CoGi'],     // Girdle and Collar
    ['GrAp', 'ApGr'],     // the Gray / Appaloosa locus
    ['DmD', 'DDm']        // Damascus and Dun
];
const ALL = ALIASED.concat(BOTH_LISTED);

const horse = x => 'Ee Aa ' + x + ' nSty';
const look = (g) => {
    const r = A.resolveTraits(g);
    return r.coatColor + ' | ' + (r.allTraits || []).slice().sort().join(', ');
};

// The part that matters, and it holds for every pair however it is stored.
ALL.forEach(([a, b]) => {
    ok(a + ' and ' + b + ' make the same horse', look(horse(a)) === look(horse(b)));
    ok(b + ' is never reported as a typo', A.findUnknownTokens(horse(b)).unknownGenes.length === 0);
    ok(a + ' is not either', A.findUnknownTokens(horse(a)).unknownGenes.length === 0);
    ok(a + ' survives parsing', A.parseGenotype(horse(a)).genes.indexOf(A.normalizeGeneToken(a)) !== -1);
    ok(b + ' survives parsing', A.parseGenotype(horse(b)).genes.indexOf(A.normalizeGeneToken(b)) !== -1);
    ok('neither spelling loses a gene',
        A.parseGenotype(horse(a)).genes.length === A.parseGenotype(horse(b)).genes.length);
});

// An alias is not a token of its own: it is rewritten on the way in.
ALIASED.forEach(([a, b]) => {
    ok(a + ' is a token the engine lists', A.isKnownGeneToken(a));
    ok(b + ' normalises onto ' + a, A.normalizeGeneToken(b) === a);
    ok('so ' + b + ' is parsed as ' + a, A.parseGenotype(horse(b)).genes.indexOf(a) !== -1);
});

// A spelling that is listed is kept as written, so a roster can match the
// page it was copied from.
BOTH_LISTED.forEach(([a, b]) => {
    ok(a + ' is listed', A.isKnownGeneToken(a));
    ok(b + ' is listed too', A.isKnownGeneToken(b));
    ok(b + ' is kept as written', A.parseGenotype(horse(b)).genes.indexOf(b) !== -1);
});

// A real courser off the masterlist, mirrored at a shared locus.
ok('a whole courser reads the same mirrored',
    look('Ee aa Cher nSty spsp nP nPr') === look('Ee aa erCh nSty spsp nP nPr'));

// The fix must be "accept the other order", not "accept anything".
ok('a genuine typo is still unknown', !A.isKnownGeneToken('Crzz'));
ok('and is reported as one', A.findUnknownTokens('Ee Aa Crzz').unknownGenes.length === 1);
ok('two genes from different loci are not a compound', !A.isKnownGeneToken('CrCh'));

t.report();
