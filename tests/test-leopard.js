// The leopard complex across two loci.
//
// Lp and patn sit at different loci but name one trait between them, so a
// pattern is only possible where some pair of alleles the parents can really
// hand down produces it. Reading each locus on its own is what listed Varnish
// Roan for a pairing that can never throw one.
//
// Reported by Weaselheart: a parent carrying patnpatn hands a patn to every
// foal, so no foal can be the "no patn at all" case, and Varnish Roan and
// Snowflake are both off the table however much Lp is about.
const { load, suite } = require('./harness');
const A = load(['breeding-calculator.js'],
    '{ generateChimeraPossibilities, resolveTraits, generateFoal, parseGenotype, calculateMatchScore }');
const t = suite('leopard');
const ok = (l, c) => t.ok(l, c);

const marks = (g1, g2) => A.generateChimeraPossibilities('', g1, g2).whiteMarkings;
const PLAIN = A.resolveTraits('Ee Aa').allTraits;
const patternOf = (lp, patn) => A.resolveTraits(['Ee Aa', lp, patn].filter(Boolean).join(' '))
    .allTraits.filter(n => PLAIN.indexOf(n) === -1);

// --- the table the engine actually holds ------------------------------------
// Everything below depends on this being the mapping, so it is checked rather
// than assumed. If the game ever changes it, these fail first and loudly.
[
    ['nLp', '', 'Snowflake'],
    ['nLp', 'npatn', 'Blanket'],
    ['nLp', 'patnpatn', 'Leopard'],
    ['LpLp', '', 'Varnish Roan'],
    ['LpLp', 'npatn', 'Snowcap'],
    ['LpLp', 'patnpatn', 'Fewspot']
].forEach(([lp, patn, want]) => {
    ok(lp + ' with ' + (patn || 'no patn') + ' is ' + want, patternOf(lp, patn).join() === want);
});
ok('patn with no Lp is carried, not worn', patternOf('', 'npatn').join() === 'Carries Patn');

// --- Weaselheart's pairing --------------------------------------------------
const EGLISSERON = 'ee AA Crprl nCh nRb nB nGi nG RnT nLp patnpatn nGl nOp nV nZ nSty + Pennant, Signet';
const RECTOVERSO = 'Ee aa Crprl erer nHq BFl nO nRn nLp nGl nV nZ nTd nD nSty + Chimera, Signet';
const both = marks(EGLISSERON, RECTOVERSO);

ok('one parent is patnpatn', A.parseGenotype(EGLISSERON).genes.indexOf('patnpatn') !== -1);
ok('and the other has no patn at all',
    A.parseGenotype(RECTOVERSO).genes.every(g => g.indexOf('patn') === -1));
ok('both carry one copy of Lp',
    A.parseGenotype(EGLISSERON).genes.indexOf('nLp') !== -1 &&
    A.parseGenotype(RECTOVERSO).genes.indexOf('nLp') !== -1);

// The report itself.
ok('Varnish Roan is not offered', both.indexOf('Varnish Roan') === -1);
// Not in the report, but the same rule and the same cause.
ok('and neither is Snowflake', both.indexOf('Snowflake') === -1);
// Every foal gets exactly one patn, so these two are the only patterns left.
ok('Blanket is still offered', both.indexOf('Blanket') !== -1);
ok('and Snowcap is still offered', both.indexOf('Snowcap') !== -1);
ok('Leopard needs two patn and is not offered', both.indexOf('Leopard') === -1);
ok('nor is Fewspot', both.indexOf('Fewspot') === -1);

// --- nothing offered may be unreachable, and nothing reachable may be missing -
// Breed the pair a few hundred times and compare what really turns up against
// what was offered. This is the check that would have caught it first.
const LEOPARD = ['Snowflake', 'Blanket', 'Leopard', 'Varnish Roan', 'Snowcap', 'Fewspot'];
function sweep(g1, g2, rolls) {
    const seen = new Set();
    const p1 = { genotype: g1, temperament: 'Sanguine' };
    const p2 = { genotype: g2, temperament: 'Phlegmatic' };
    for (let i = 0; i < rolls; i++) {
        A.resolveTraits(A.generateFoal(p1, p2, i).genotype).allTraits
            .forEach(n => { if (LEOPARD.indexOf(n) !== -1) seen.add(n); });
    }
    return seen;
}
const rolled = sweep(EGLISSERON, RECTOVERSO, 800);
const offered = both.filter(n => LEOPARD.indexOf(n) !== -1);
const ghosts = offered.filter(n => !rolled.has(n));
const absent = [...rolled].filter(n => offered.indexOf(n) === -1);
ok('every leopard pattern offered really turns up' + (ghosts.length ? ': ' + ghosts.join(', ') : ''),
    !ghosts.length);
ok('and every one that turns up was offered' + (absent.length ? ': ' + absent.join(', ') : ''),
    !absent.length);

// --- the other shapes of the same bug ---------------------------------------
// Two homozygous parents can only make homozygous foals, so the patterns
// needing a single copy are gone. Reading the locus as "at least one Lp" got
// this wrong too.
const HOM = 'Ee Aa LpLp patnpatn', HOM2 = 'ee aa LpLp patnpatn';
const homOnly = marks(HOM, HOM2);
ok('two LpLp patnpatn parents give only Fewspot',
    homOnly.filter(n => LEOPARD.indexOf(n) !== -1).join() === 'Fewspot');

// Neither parent carries patn, so no foal can have one.
const NOPATN = 'Ee Aa nLp', NOPATN2 = 'ee aa nLp';
const noPatn = marks(NOPATN, NOPATN2).filter(n => LEOPARD.indexOf(n) !== -1).sort();
ok('without patn in either parent only the no-patn patterns show',
    noPatn.join() === 'Snowflake,Varnish Roan');

// One parent heterozygous at both loci gives the full spread, which is the
// case that always worked and must keep working.
const ALL = marks('Ee Aa nLp npatn', 'ee aa nLp npatn').filter(n => LEOPARD.indexOf(n) !== -1).sort();
ok('two nLp npatn parents can still make all six', ALL.length === 6);

// A parent with no Lp at all on either side: no pattern is possible.
ok('no Lp anywhere means no leopard pattern',
    marks('Ee Aa npatn', 'ee aa patnpatn').filter(n => LEOPARD.indexOf(n) !== -1).length === 0);
ok('and Carries Patn is not smuggled in as a marking',
    marks('Ee Aa npatn', 'ee aa patnpatn').indexOf('Carries Patn') === -1);

// --- the same list drives both views ----------------------------------------
// "Every possible foal" and the Chimera panel both read whiteMarkings, so the
// fix has to land on both. Weaselheart saw Varnish Roan in each.
ok('the chimera panel reads the same markings',
    A.generateChimeraPossibilities('Ee Aa nLp npatn', EGLISSERON, RECTOVERSO)
        .whiteMarkings.indexOf('Varnish Roan') === -1);

// --- Smart Search, which was wrong the other way round ----------------------
//
// Reported by Cricri: searching a phenotype with Snowflake in it returned
// nothing, while the same pairs showed up once Snowflake was removed.
//
// The possibility engine ignored patn and offered patterns no foal could have.
// Smart Search tested "no patn" as "neither parent carries patn", which is a
// different mistake in the opposite direction: a parent with npatn passes n
// half the time, so pairs that really do throw Snowflake scored zero.
const score = (g1, g2, trait) => A.calculateMatchScore(
    { genotype: g1, temperament: 'Sanguine' },
    { genotype: g2, temperament: 'Phlegmatic' }, [trait]);

// Cricri's shape: both parents carry one patn, so a no-patn foal is a quarter
// of the rolls and Snowflake is plainly on.
ok('a pair carrying npatn can still be searched for Snowflake',
    score('Ee Aa nLp npatn', 'ee aa nLp npatn', 'Snowflake') > 0);
ok('and for Varnish Roan', score('Ee Aa nLp npatn', 'ee aa nLp npatn', 'Varnish Roan') > 0);
ok('and all six patterns are reachable from that pair', LEOPARD.every(
    n => score('Ee Aa nLp npatn', 'ee aa nLp npatn', n) > 0));

// The other direction still has to hold: Weaselheart's pair must not match.
ok('Weaselheart\'s pair does not match Snowflake', score(EGLISSERON, RECTOVERSO, 'Snowflake') === 0);
ok('nor Varnish Roan', score(EGLISSERON, RECTOVERSO, 'Varnish Roan') === 0);
ok('but does match Blanket', score(EGLISSERON, RECTOVERSO, 'Blanket') > 0);
ok('and Snowcap', score(EGLISSERON, RECTOVERSO, 'Snowcap') > 0);

// Two homozygous parents can only make homozygous foals.
ok('two LpLp parents cannot be searched for Snowflake', score(HOM, HOM2, 'Snowflake') === 0);
ok('and only Fewspot matches',
    LEOPARD.filter(n => score(HOM, HOM2, n) > 0).join() === 'Fewspot');

// False Leopard is a KIT marking on its own locus and must not be caught by
// the Leopard branch, which matches on the substring.
ok('False Leopard is not judged as a leopard pattern',
    score('Ee Aa BFl', 'ee aa BFl', 'False Leopard') > 0);
ok('and a pair with no Lp never matches Leopard',
    score('Ee Aa BFl', 'ee aa BFl', 'Leopard') === 0);

// --- the two tools must agree, and both must agree with breeding ------------
// This is the check that would have caught either bug on its own. Both were
// shipped because each tool decided the question for itself.
const PAIRS = [
    [EGLISSERON, RECTOVERSO],
    ['Ee Aa nLp npatn', 'ee aa nLp npatn'],
    ['Ee Aa LpLp patnpatn', 'ee aa nLp'],
    ['Ee Aa nLp', 'ee aa patnpatn'],
    ['Ee Aa LpLp', 'ee aa LpLp npatn'],
    ['Ee Aa nLp patnpatn', 'ee aa nLp patnpatn'],
    ['Ee Aa', 'ee aa nLp npatn'],
    [HOM, HOM2]
];
const disagree = [], unreal = [], missed = [];
PAIRS.forEach(([g1, g2]) => {
    const offered = new Set(marks(g1, g2).filter(n => LEOPARD.indexOf(n) !== -1));
    const rolled = sweep(g1, g2, 600);
    LEOPARD.forEach((n) => {
        const searchSays = score(g1, g2, n) > 0;
        if (searchSays !== offered.has(n)) disagree.push(n + ' on ' + g1 + ' x ' + g2);
        // Breeding is the authority. A sweep can miss something very rare, so
        // only the direction that cannot be explained by luck is an error.
        if (searchSays && !rolled.has(n) && !offered.has(n)) unreal.push(n + ' on ' + g1);
        if (rolled.has(n) && !searchSays) missed.push(n + ' on ' + g1 + ' x ' + g2);
    });
});
ok('Smart Search and the possibility list never disagree' + (disagree.length ? ': ' + disagree.join('; ') : ''),
    !disagree.length);
ok('Smart Search never offers a pattern that cannot happen' + (unreal.length ? ': ' + unreal.join('; ') : ''),
    !unreal.length);
ok('and never refuses one that does happen' + (missed.length ? ': ' + missed.join('; ') : ''),
    !missed.length);

// --- the roster, judged against actual breeding -----------------------------
// Both bugs were about a pairing the tool judged wrongly, so the honest test is
// to breed real pairs and compare. A slice of the roster keeps this quick; the
// full 44 agree too, it just takes rather longer than a test should.
const R = load(['group-horses.js', 'breeding-calculator.js'],
    '{ GROUP_HORSES, calculateMatchScore, generateChimeraPossibilities, resolveTraits, generateFoal }');
const slice = (R.GROUP_HORSES || []).slice(0, 18);
ok('a slice of the roster loaded', slice.length === 18);

const wrongly = { offered: [], refused: [] };
let judged = 0;
for (let i = 0; i < slice.length; i++) {
    for (let j = i + 1; j < slice.length; j++) {
        const a = slice[i], b = slice[j];
        if (a.temperament === b.temperament) continue;
        judged++;
        let rolled = new Set();
        for (let k = 0; k < 400; k++) {
            R.resolveTraits(R.generateFoal(a, b, k).genotype).allTraits
                .forEach(n => { if (LEOPARD.indexOf(n) !== -1) rolled.add(n); });
        }
        LEOPARD.forEach((n) => {
            const says = R.calculateMatchScore(a, b, [n]) > 0;
            // A pattern that turned up in 400 rolls and was refused is flatly
            // wrong. The other way round needs care: something very rare can
            // miss 400 rolls honestly, so the possibility engine breaks the
            // tie, and only a pattern neither of them can justify counts.
            if (!says && rolled.has(n)) wrongly.refused.push(n + ': ' + a.name + ' x ' + b.name);
            if (says && !rolled.has(n)) {
                const offered = R.generateChimeraPossibilities('', a.genotype, b.genotype).whiteMarkings;
                if (offered.indexOf(n) === -1) wrongly.offered.push(n + ': ' + a.name + ' x ' + b.name);
            }
        });
    }
}
ok('judged a decent number of real pairings', judged > 100);
ok('none refused a pattern it really throws' + (wrongly.refused.length ? ': ' + wrongly.refused.slice(0, 3).join('; ') : ''),
    !wrongly.refused.length);
ok('and none offered one it cannot' + (wrongly.offered.length ? ': ' + wrongly.offered.slice(0, 3).join('; ') : ''),
    !wrongly.offered.length);

t.report();
