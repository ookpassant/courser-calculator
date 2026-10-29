// Building a coat out of a cheaper scroll and Genotype Update items.
//
// The Wizard stocks nothing above Rare, so for 51 of the 75 coats Recipe used
// to hand back a scroll nobody sells. Cream and Tapestry can be added to an
// undesigned geno after the fact, three items to a geno, which turns a Rare
// scroll into thirty of those coats.
//
// The invariants: a route it offers has to actually arrive at the coat, it
// must never claim one that needs a gene no item adds, and it must never spend
// more than the three items the game allows.
const { load, suite } = require('./harness');
const A = load(['breeding-calculator.js'],
    '{ recipeCoatSteps, recipeCoatRoutes, computeRecipeScroll, recipeScrollHtml,' +
    '  RECIPE_COAT_LOCUS_GENES, RECIPE_COAT_TIER, RECIPE_COAT_LOCUS_LIST, RECIPE_UPDATE_ITEMS,' +
    '  RECIPE_ALLELE_ITEM, RECIPE_UPDATE_LIMIT, RECIPE_SCROLL_PRICE, RECIPE_TIER_ORDER,' +
    '  resolveTraits, recipeItemTag, RARITY_GENES }');
const t = suite('coat-upgrade');
const ok = (l, c) => t.ok(l, c);

const COATS = Object.keys(A.RECIPE_COAT_LOCUS_GENES);
const buyable = c => typeof A.RECIPE_SCROLL_PRICE[A.RECIPE_COAT_TIER[c]] === 'number';

// --- the gene model ---------------------------------------------------------
ok('every coat in the pools has its genes broken out', COATS.length === 75);
ok('and each one sits at the base loci', COATS.every(c => {
    const g = A.RECIPE_COAT_LOCUS_GENES[c];
    return g.e && g.e.length === 2 && g.a && g.a.length === 2;
}));
// Cr, prl and Tp are roommates, and Ch and er are roommates. That is what makes
// one herb enough to turn prlprl into Tpprl, so it is worth pinning down.
ok('Cream, Pearl and Tapestry share one locus',
    A.RECIPE_COAT_LOCUS_LIST.indexOf('prl') !== -1 &&
    ['Cremello', 'Gold Pearl', 'Weld'].every(c => A.RECIPE_COAT_LOCUS_GENES[c].prl));
ok('Champagne and Ether share another',
    ['Gold Champagne', 'Cold Ether'].every(c => A.RECIPE_COAT_LOCUS_GENES[c].er));
ok('and the two are not the same locus',
    A.RECIPE_COAT_LOCUS_GENES['Cold Ether'].prl === undefined);

// --- what an item can and cannot add ----------------------------------------
ok('only Cream and Tapestry have an item behind them',
    Object.keys(A.RECIPE_ALLELE_ITEM).sort().join() === 'Cr,Tp');
['prl', 'Ch', 'er'].forEach((allele) => {
    ok('nothing adds ' + allele, !A.RECIPE_ALLELE_ITEM[allele]);
});
ok('three items to a geno', A.RECIPE_UPDATE_LIMIT === 3);

// --- the steps actually arrive ----------------------------------------------
// The real test of a route: apply its steps to the starting coat's genes and
// see whether you are holding the target. Anything less is taking the cost
// function's word for it.
function applySteps(fromCoat, steps, toCoat) {
    const from = A.RECIPE_COAT_LOCUS_GENES[fromCoat], to = A.RECIPE_COAT_LOCUS_GENES[toCoat];
    const pair = (c, l) => (c[l] || ['n', 'n']).slice();
    const got = {};
    A.RECIPE_COAT_LOCUS_LIST.forEach(l => { got[l] = pair(from, l); });
    steps.forEach((s) => {
        if (!s.allele) {
            // the base herb, which sets E and A to whatever the target wants
            ['e', 'a'].forEach(l => { got[l] = pair(to, l); });
            return;
        }
        const locus = A.RECIPE_COAT_LOCUS_LIST.find(l => (to[l] || []).indexOf(s.allele) !== -1);
        const slot = got[locus].findIndex(x => (to[locus] || []).indexOf(x) === -1);
        got[locus][slot === -1 ? 0 : slot] = s.allele;
    });
    return A.RECIPE_COAT_LOCUS_LIST.every(l => got[l].slice().sort().join() === pair(to, l).sort().join());
}

let wrongArrival = null, overCap = null, routeCount = 0;
COATS.forEach((to) => {
    A.recipeCoatRoutes(to).forEach((r) => {
        routeCount++;
        if (r.steps.length > A.RECIPE_UPDATE_LIMIT && !overCap) overCap = to + ' from ' + r.coat;
        if (!applySteps(r.coat, r.steps, to) && !wrongArrival) {
            wrongArrival = r.coat + ' + ' + r.steps.length + ' item(s) does not give ' + to;
        }
    });
});
ok('there are routes to check at all', routeCount > 100);
ok('every route lands on the coat it claims' + (wrongArrival ? ': ' + wrongArrival : ''), !wrongArrival);
ok('and none spends more than three items' + (overCap ? ': ' + overCap : ''), !overCap);

// --- a coat you can buy is never "upgraded" into -----------------------------
COATS.filter(buyable).forEach((c) => {
    const best = A.recipeCoatRoutes(c)[0];
    ok(c + ' is bought outright, not built', best && best.coat === c && best.steps.length === 0);
});

// --- the thirty that open up -------------------------------------------------
const stranded = COATS.filter(c => !buyable(c));
const reachable = stranded.filter(c => {
    const best = A.recipeCoatRoutes(c)[0];
    return best && best.scrollSold;
});
ok('51 coats have no scroll on the shelf', stranded.length === 51);
ok('30 of them can be built from one that is', reachable.length === 30);
ok('and every one of those starts from a scroll you can buy',
    reachable.every(c => A.recipeCoatRoutes(c)[0].scrollSold));
ok('none of them needs more than two items',
    reachable.every(c => A.recipeCoatRoutes(c)[0].steps.length <= 2));

// The named cases, worked by hand off the gene table.
const route = c => A.recipeCoatRoutes(c)[0];
[
    ['Ochre Pearl', 'Gold Pearl', 1, 'Tapestry'],
    ['Tyrian Pearl', 'Bay Pearl', 1, 'Tapestry'],
    ['Cold Ash Ether', 'Cold Ether', 2, 'Cream'],
    ['Ombre Ash Ether', 'Ombre Ether', 2, 'Cream'],
    ['Cremello Champagne', 'Gold Champagne', 2, 'Cream'],
    ['Weld Ether', 'Cold Ether', 1, 'Tapestry']
].forEach(([target, from, items, adds]) => {
    const r = route(target);
    ok(target + ' is built from ' + from + ', ' + items + ' item(s)',
        r && r.coat === from && r.steps.length === items);
    ok('  and the item adds ' + adds, r && r.steps.every(s => s.label === adds));
});

// Cold Ash Ether is Sasha's, and two Cream Wands is the whole of it.
const ash = route('Cold Ash Ether');
ok('Cold Ash Ether takes two of the same item',
    ash.steps.length === 2 && ash.steps[0].item.name === ash.steps[1].item.name);
ok('and the scroll under it costs 3000', ash.scrollCoin === 3000);

// --- the twenty-one that stay out of reach -----------------------------------
const noRoute = stranded.filter(c => !route(c) || !route(c).scrollSold);
ok('21 coats cannot be reached at all', noRoute.length === 21);
// Every one of them wants pearl together with champagne or ether, which is the
// one shape no pair of items covers.
ok('and every one of them wants a gene no item adds', noRoute.every((c) => {
    const g = A.RECIPE_COAT_LOCUS_GENES[c];
    const cream = g.prl || [], champ = g.er || [];
    return cream.indexOf('prl') !== -1 && champ.some(x => x === 'Ch' || x === 'er');
}));
['Ochre Pearl Ether', 'Rose Gold Nacre', 'Bay Pearl Champagne'].forEach((c) => {
    ok(c + ' is honestly out of reach', noRoute.indexOf(c) !== -1);
});

// --- nothing is reachable the other way round --------------------------------
// Taking an allele back out is not something any of these items do, so a route
// that would need one removed must come back null rather than silently costing
// it at nothing.
ok('a route that would need Cream removed is refused',
    A.recipeCoatSteps('Perlino', 'Buckskin') === null);
ok('and one that would need Pearl added is refused',
    A.recipeCoatSteps('Bay', 'Bay Pearl') === null);
ok('a coat to itself costs nothing', A.recipeCoatSteps('Bay', 'Bay').length === 0);

// --- what Recipe does with it ------------------------------------------------
const scrollFor = (geno) => A.computeRecipeScroll({ target: geno, anomalies: [], free: [] }, null);

let s = scrollFor('ee AA CrCr erer');          // Cold Ash Ether
ok('Recipe offers the Rare scroll for Cold Ash Ether', s && s.buyTier === 'rare');
ok('and says the coat is Legendary', s.coatTier === 'legendary');
ok('and marks it as built rather than rolled', !!s.upgrade);
ok('and the figure is the Rare scroll price', s.scrollCoin === 3000 && s.scrollSold);
ok('and it is not called stranded', !s.strandedTier);

s = scrollFor('ee AA Tpprl erer');             // Ochre Pearl Ether
ok('Ochre Pearl Ether has no route', s && !s.upgrade);
ok('and is marked stranded', s.strandedTier === 'legendary');

s = scrollFor('Ee AA nCr');                    // Buckskin, buyable outright
ok('a Buckskin is still just a scroll', s && !s.upgrade && s.buyTier === 'uncommon');
ok('and still costs 1500', s.scrollCoin === 1500);

// The free trait rides on the scroll you buy, so dropping a tier to build the
// coat has to drop what the free trait can cover with it. Getting this wrong
// would quietly hand out an Epic trait off a Rare scroll.
s = scrollFor('ee AA CrCr erer nRb');          // Cold Ash Ether + Rabicano
ok('the free trait is judged against the scroll bought, not the coat wanted',
    s.buyTier === 'rare');
const tooGood = (s.covered && A.RECIPE_TIER_ORDER.indexOf(
    (s.covered.tier || 'common')) > A.RECIPE_TIER_ORDER.indexOf(s.buyTier));
ok('so no trait above the bought scroll gets covered free', !tooGood);

// --- when the card shows at all -----------------------------------------------
// The scroll block used to be purely the consolation prize for a target no pair
// could reach. For a coat above Rare that a buyable scroll can be built into it
// is worth saying either way, because those pairings run to nine or ten roots.
const withPairs = (geno) => A.computeRecipeScroll(
    { target: geno, anomalies: [], free: [] }, { pairs: [{}, {}] });

s = withPairs('ee AA CrCr erer');              // Cold Ash Ether, breedable
ok('a buildable coat still offers the scroll when a pair exists', !!s && !!s.upgrade);
ok('and knows a pairing was found', s.bred === true);

s = withPairs('ee AA Tpprl erer');             // Ochre Pearl Ether, no route
ok('a stranded coat says nothing when a pair can do it', s === null);

s = withPairs('Ee AA nCr');                    // Buckskin, buyable outright
ok('and nor does an ordinary coat', s === null);

ok('with no pair, the stranded coat still speaks',
    !!scrollFor('ee AA Tpprl erer'));

let card = A.recipeScrollHtml(withPairs('ee AA CrCr erer'));
ok('the card does not claim no pair can breed it', !/No available pair can breed/.test(card));
ok('it offers itself as the alternative', /A pairing above can do it/.test(card));
ok('and the heading says so', /Or make it with a scroll/.test(card));
card = A.recipeScrollHtml(scrollFor('ee AA CrCr erer'));
ok('with no pair it reads as the only route', /No available pair can breed/.test(card));
ok('and the heading drops the "Or"', !/Or make it with a scroll/.test(card));

// --- the page says it ---------------------------------------------------------
let html = A.recipeScrollHtml(scrollFor('ee AA CrCr erer'));
ok('the card names the coat the scroll actually rolls', /Cold Ether/.test(html));
ok('and names the item', /Cream Wand/.test(html));
ok('and counts it rather than listing it twice', /2 x Cream Wand/.test(html));
ok('and explains why a cheaper scroll is on offer', /No scroll above Rare is sold/.test(html));
ok('and says how many item slots are left', /out of the 3 a geno takes/.test(html));
ok('and does not claim the Wizard sells a Legendary scroll',
    !/does not stock at this rarity/.test(html));

html = A.recipeScrollHtml(scrollFor('ee AA Tpprl erer'));
ok('a stranded coat says which genes are the problem',
    /no Genotype Update item adds Pearl, Champagne or Ether/.test(html));
ok('and does not read as though the scroll were on the shelf',
    !/covers the whole courser on its own\./.test(html) &&
    /does not stock one at this rarity/.test(html));
ok('and does not offer a route it cannot do', !/Cream Wand/.test(html));

// --- items are tagged honestly -------------------------------------------------
ok('the Wizard\'s herbs say so, not "from gameplay"',
    /Wizard's shelf/.test(A.recipeItemTag(A.RECIPE_UPDATE_ITEMS.bloomingHerb)));
ok('a crafted wand says crafted', /crafted/.test(A.recipeItemTag(A.RECIPE_UPDATE_ITEMS.creamWand)));
ok('and no wand has been given a made-up price',
    !A.RECIPE_UPDATE_ITEMS.creamWand.weight && !A.RECIPE_UPDATE_ITEMS.creamWand.shop);
ok('the herbs carry the resale values off their item pages',
    A.RECIPE_UPDATE_ITEMS.redHerb.weight === 50 &&
    A.RECIPE_UPDATE_ITEMS.bloomingHerb.weight === 75 &&
    A.RECIPE_UPDATE_ITEMS.sweetHerb.weight === 50 &&
    A.RECIPE_UPDATE_ITEMS.soothingHerb.weight === 75 &&
    A.RECIPE_UPDATE_ITEMS.searingHerb.weight === 75 &&
    A.RECIPE_UPDATE_ITEMS.cleanHerb.weight === 50);

t.report();
