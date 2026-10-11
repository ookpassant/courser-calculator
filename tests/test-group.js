// The group horse roster.
//
// The genotypes are checked against the Group Horse Masterlist on the Dungeon
// Coursers site, GH01 to GH44, so the facts asserted at the bottom are the
// site's and not ours. Several of them are corrections that were wrong once,
// which is exactly why they are written down here.
const { load, suite } = require('./harness');
const A = load(['group-horses.js', 'breeding-calculator.js'],
    '{ GROUP_HORSES, getGroupHorses, parseGenotype, isKnownGeneToken, resolveTraits }');
const t = suite('group');
const ok = (l, c) => t.ok(l, c);
const H = A.GROUP_HORSES;
const by = name => H.find(h => h.name === name);
const traits = name => A.resolveTraits(by(name).genotype).allTraits || [];
const coat = name => A.resolveTraits(by(name).genotype).coatColor;

// --- the roster as a whole -------------------------------------------------
ok('all 44 are here', H.length === 44);
ok('every id is unique', new Set(H.map(h => h.id)).size === 44);
ok('every name is unique', new Set(H.map(h => h.name)).size === 44);
ok('a fresh copy each time', A.getGroupHorses() !== A.getGroupHorses());
ok('and a copy nobody can mutate the roster through', (() => {
    const c = A.getGroupHorses();
    c[0].name = 'vandalised';
    return H[0].name !== 'vandalised';
})());

H.forEach((h) => {
    ok(h.name + ' is marked as a group horse', h.group === true);
    ok(h.name + ' costs a fruit the engine knows', h.cost === 'Berry' || h.cost === 'Apple');
    ok(h.name + ' has a temperament',
        ['Choleric', 'Phlegmatic', 'Melancholic', 'Sanguine'].indexOf(h.temperament) !== -1);
    ok(h.name + ' has a variant',
        ['Standard', 'Heraldic', 'Puck', 'Cavedweller', 'Restored'].indexOf(h.variant) !== -1);
    // Every token has to be one the engine understands, or the horse quietly
    // loses a gene everywhere it is used.
    const parsed = A.parseGenotype(h.genotype);
    const unknown = parsed.genes.filter(g => !A.isKnownGeneToken(g));
    ok(h.name + ' has no unknown gene token' + (unknown.length ? ': ' + unknown.join(' ') : ''), !unknown.length);
    ok(h.name + ' resolves to a coat', !!A.resolveTraits(h.genotype).coatColor);
});

// --- what the masterlist says ---------------------------------------------
// Tower's directory writes "(Recessive)" to mean the trait needs a copy from
// each parent to show, and that this horse has it. It was read the other way
// round once, as a single carried copy, which hid the trait on ten coursers.
// The masterlist settled it: these express.
const expressing = {
    Moritz: 'Flaxen', Cerridwen: 'Flaxen', Goud: 'Flaxen', Calix: 'Filigree',
    Inkwell: 'Sepulchered', Calen: 'Sepulchered', Caldera: 'Sepulchered',
    Bastion: 'Sepulchered', Aurelia: 'Sepulchered', Mobberley: 'Sepulchered'
};
Object.keys(expressing).forEach((name) => {
    const want = expressing[name], got = traits(name);
    ok(name + ' shows ' + want, got.indexOf(want) !== -1);
    ok(name + ' does not merely carry it',
        !got.some(x => /^(Carrying|Carries)\s/.test(x) && x.indexOf(want) !== -1));
});

// Calix is TT on the masterlist, not nT. It looks the same either way, so the
// only place it shows is in breeding: every foal gets Tobiano, not half.
ok('Calix is homozygous Tobiano', by('Calix').genotype.indexOf('TT') !== -1);
ok('and still a Tobiano', traits('Calix').indexOf('Tobiano') !== -1);

// The masterlist writes the KIT compound RnT, and so do we, so the page and
// the calculator read the same. The mirror of it must resolve identically.
['Alcyone', 'Bold'].forEach((n) => {
    ok(n + ' spells its compound RnT, as the masterlist does', by(n).genotype.indexOf('RnT') !== -1);
    const mirrored = by(n).genotype.replace('RnT', 'TRn');
    ok(n + ' reads the same written the other way round',
        A.resolveTraits(mirrored).allTraits.slice().sort().join() === traits(n).slice().sort().join());
});

// A handful of coats, as the masterlist prints them.
[['Inkwell', 'Classic Champagne'], ['Calen', 'Ombre Ash Ether'], ['Mobberley', 'Smoky Black'],
 ['Tarot', 'Woad Ether'], ['Tiger', 'Bay'], ['Rosario', 'Cremello']].forEach(([n, c]) => {
    ok(n + ' is a ' + c, coat(n) === c);
});

// Anomalies are not genes. They ride after the + and come back in their own
// field rather than in allTraits, which is worth pinning down: reading them
// off the wrong list is how a horse looks like it has lost one.
const anomalies = name => A.resolveTraits(by(name).genotype).anomalies || [];
ok('Crispin keeps both anomalies',
    ['Stained Glass', 'Vitiligo'].every(a => anomalies('Crispin').indexOf(a) !== -1));
ok('and they are not in allTraits', traits('Crispin').indexOf('Vitiligo') === -1);
ok('a horse with none has none', anomalies('Robin').length === 0);
ok('Goud carries Stained Glass, not the retired Ore', by('Goud').genotype.indexOf('Stained Glass') !== -1);

t.report();
