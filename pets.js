// ===========================================================================
// Pets and Excursions
// ---------------------------------------------------------------------------
// Pets go out on excursions and come back with loot. Every pet also has one
// drop of its own, and The Buried Castle guarantees those on top of the area's
// own haul, which is what makes picking the team worth thinking about.
//
// Data only: the roster, the areas, and the bonding ladder. Everything the page
// works out is derived from these.
// ===========================================================================

// Bonding runs in this order, and an area asks for a rung on it. A pet that has
// never been attached to a courser sits at No Bonding, below the ladder proper;
// once earned, bonding stays even if the pet is later unattached.
const PET_BONDING = ['No Bonding', 'Wary', 'Aloof', 'Comfortable', 'Friendly', 'Loyal', 'Devoted'];

// A pet already out on an excursion, or resting it off, cannot be sent anywhere.
const PET_STATUS = ['Ready', 'Away', 'Resting'];

const PET_AREAS = [
    { stage: 0, name: 'The Smithy',          hours: 2,   pets: 1, needs: null,      loot: 'Egg',
      note: 'Smiths from the surface have set up shop. A stealthy pet can have a look around.' },
    { stage: 1, name: 'Gentle Meadows',      hours: 2,   pets: 1, needs: null,      loot: 'Monster Parts',
      note: 'Perilous footing for a Courser, but a pet can collect Monster Parts.' },
    { stage: 2, name: 'Overgrown Ruins',     hours: 4,   pets: 1, needs: 'Aloof',   loot: 'Herbs',
      note: 'An ancient building too densely entangled in vines for most Coursers to reach.' },
    { stage: 3, name: 'Slumbering Heath',    hours: 6,   pets: 1, needs: 'Friendly',loot: 'Roots',
      note: 'Thick with woody brambles and vicious wildlife, but plentiful Roots.' },
    { stage: 4, name: 'Obsidian Alcove',     hours: 24,  pets: 1, needs: 'Loyal',   loot: 'Metal',
      note: 'Hard to squeeze into, but full of metal fragments and nuggets.' },
    { stage: 5, name: 'Crumbling Gatehouse', hours: 48,  pets: 1, needs: 'Devoted', loot: 'Transformation items',
      note: 'A discreet way into the castle. Less-rare Transformation items turn up among the treasures.' },
    { stage: 6, name: 'The Buried Castle',   hours: 168, pets: 4, needs: 'Devoted', loot: 'Dungeon Dive Level 1 Loot',
      guaranteesDrops: true,
      note: 'Too dangerous for one pet. A team of four, and every one of them brings its own drop back as well.' }
];

const PETS = [
    { typeId: 1, name: 'Hound', rarity: 'Common', drop: 'Old Bone' },
    { typeId: 2, name: 'Eagle', rarity: 'Common', drop: 'Monster Parts', variantOf: 'Hawk' },
    { typeId: 3, name: 'Osprey', rarity: 'Common', drop: 'Monster Parts', variantOf: 'Hawk' },
    { typeId: 4, name: 'Hawk', rarity: 'Common', drop: 'Monster Parts' },
    { typeId: 6, name: 'Wisp', rarity: 'Common', drop: 'Cave Moss' },
    { typeId: 10, name: 'Owl', rarity: 'Common', drop: 'Monster Parts' },
    { typeId: 29, name: 'Cat', rarity: 'Common', drop: 'Critter Tail' },
    { typeId: 63, name: 'Cute Bookworm', rarity: 'Common', drop: 'Juicy Apple' },
    { typeId: 65, name: 'Green Frog', rarity: 'Common', drop: 'Creature Eye' },
    { typeId: 67, name: 'Raccoon', rarity: 'Common', drop: 'Empty Bottle' },
    { typeId: 7, name: 'Evil Mushroom', rarity: 'Uncommon', drop: 'Hearty Mushroom' },
    { typeId: 9, name: 'Bat', rarity: 'Uncommon', drop: 'Juicy Berry' },
    { typeId: 12, name: 'Mole', rarity: 'Uncommon', drop: 'Cave Root' },
    { typeId: 14, name: 'Slime', rarity: 'Uncommon', drop: 'Acidic Tongue' },
    { typeId: 15, name: 'Fox', rarity: 'Uncommon', drop: 'Old Bone' },
    { typeId: 16, name: 'Giant Moth', rarity: 'Uncommon', drop: 'Soothing Herb' },
    { typeId: 17, name: 'Giant Beetle', rarity: 'Uncommon', drop: 'Bland Vegetable' },
    { typeId: 18, name: 'Big Toad', rarity: 'Uncommon', drop: 'Juicy Berry' },
    { typeId: 28, name: 'Tiny Snail', rarity: 'Uncommon', drop: 'Soothing Herb' },
    { typeId: 43, name: 'Rat', rarity: 'Uncommon', drop: 'Stinky Bait' },
    { typeId: 44, name: 'Black Cat', rarity: 'Uncommon', drop: 'Monster Parts', variantOf: 'Cat' },
    { typeId: 58, name: 'Bouncing Bunny', rarity: 'Uncommon', drop: 'Clump of Fur' },
    { typeId: 66, name: 'Sneaky Weasel', rarity: 'Uncommon', drop: 'Clump of Fur' },
    { typeId: 68, name: 'Opossum', rarity: 'Uncommon', drop: 'Hearty Mushroom' },
    { typeId: 73, name: 'Unsteady Automaton', rarity: 'Uncommon', drop: 'Metal Scrap' },
    { typeId: 74, name: 'Mycelid', rarity: 'Uncommon', drop: 'Mushroom Skewer' },
    { typeId: 8, name: 'Mimic', rarity: 'Rare', drop: 'Sack of Coin' },
    { typeId: 11, name: 'Floating Eyeball', rarity: 'Rare', drop: 'Brute Tentacle' },
    { typeId: 13, name: 'Pygmy Drake', rarity: 'Rare', drop: 'Herbs' },
    { typeId: 19, name: 'Molten Dragonbat', rarity: 'Rare', drop: 'Humongous Egg', variantOf: 'Bat' },
    { typeId: 20, name: 'Obsidian Golem', rarity: 'Rare', drop: 'Strong Root' },
    { typeId: 21, name: 'Carrion Crawler', rarity: 'Rare', drop: 'Humanoid Skull' },
    { typeId: 22, name: 'Crow', rarity: 'Rare', drop: 'Plain Key' },
    { typeId: 23, name: 'Fire Elemental', rarity: 'Rare', drop: 'Carnite Nugget' },
    { typeId: 24, name: 'Lava Ant', rarity: 'Rare', drop: 'Searing Herb' },
    { typeId: 27, name: 'Skeletal Servant', rarity: 'Rare', drop: 'Fabric Scrap' },
    { typeId: 35, name: 'Dracula Bat', rarity: 'Rare', drop: 'Monster Juice', variantOf: 'Bat' },
    { typeId: 36, name: 'Painted Bat', rarity: 'Rare', drop: 'Juicy Apple', variantOf: 'Bat' },
    { typeId: 37, name: 'Dark Hound', rarity: 'Rare', drop: 'Old Bone', variantOf: 'Hound' },
    { typeId: 45, name: 'Wandering Spirit', rarity: 'Rare', drop: 'Humanoid Skull' },
    { typeId: 46, name: 'Scarecrow', rarity: 'Rare', drop: 'Soul Seeds x5' },
    { typeId: 54, name: 'Hedge Golem', rarity: 'Rare', drop: 'Strong Root' },
    { typeId: 56, name: 'Killer Bee', rarity: 'Rare', drop: 'Blooming Herb' },
    { typeId: 62, name: 'Fierce Chimera', rarity: 'Rare', drop: 'Monster Juice' },
    { typeId: 64, name: 'Oomling', rarity: 'Rare', drop: 'Library Key' },
    { typeId: 69, name: 'Pigeon', rarity: 'Rare', drop: 'Dropped Feather' },
    { typeId: 70, name: 'Owlbear', rarity: 'Rare', drop: 'Berserker Potion' },
    { typeId: 75, name: 'Seriously Sinister Shroom', rarity: 'Rare', drop: 'Bitter Bud', variantOf: 'Evil Mushroom' },
    { typeId: 76, name: 'Iron Golem', rarity: 'Rare', drop: 'Humming Fragments' },
    { typeId: 78, name: 'Slimy Snail', rarity: 'Rare', drop: 'Corroding Elixir', variantOf: 'Tiny Snail' },
    { typeId: 79, name: 'Cave Boar', rarity: 'Rare', drop: 'Mushroom Trinkets' },
    { typeId: 25, name: 'Wolf', rarity: 'Epic', drop: 'Monster Parts' },
    { typeId: 26, name: 'Phantasmal Hand', rarity: 'Epic', drop: 'Forager\'s Pack Contents (Random)' },
    { typeId: 31, name: 'Treent', rarity: 'Epic', drop: 'Herbs' },
    { typeId: 32, name: 'Normal Goose', rarity: 'Epic', drop: 'Humongous Egg' },
    { typeId: 34, name: 'Sizeable Serpent', rarity: 'Epic', drop: 'Monster Parts' },
    { typeId: 38, name: 'Golden Hound', rarity: 'Epic', drop: 'Old Bone', variantOf: 'Hound' },
    { typeId: 39, name: 'Mutant Hound', rarity: 'Epic', drop: 'Humanoid Skull', variantOf: 'Hound' },
    { typeId: 40, name: 'Mutant Goose', rarity: 'Epic', drop: 'Bunch of Grapes', variantOf: 'Normal Goose' },
    { typeId: 41, name: 'Ghastly Eyeball', rarity: 'Epic', drop: 'Scrying Lens' },
    { typeId: 42, name: 'Corrupted Treent', rarity: 'Epic', drop: 'Strong Root', variantOf: 'Treent' },
    { typeId: 48, name: 'BABY SKULL', rarity: 'Epic', drop: 'Tome of Skull Summoning' },
    { typeId: 49, name: 'Undead Dragonling', rarity: 'Epic', drop: 'Beast Fang x2' },
    { typeId: 50, name: 'Wretched Imp', rarity: 'Epic', drop: 'Carnite Nugget' },
    { typeId: 53, name: 'Grotesque Gargoyle', rarity: 'Epic', drop: 'Beast Fang x2' },
    { typeId: 55, name: 'Addled Minotaur', rarity: 'Epic', drop: 'Ancient Key' },
    { typeId: 57, name: 'Fairy Drake', rarity: 'Epic', drop: 'Stained Glass Shards', variantOf: 'Pygmy Drake' },
    { typeId: 60, name: 'Kasperl', rarity: 'Epic', drop: 'Soul Seeds x5' },
    { typeId: 61, name: 'Living Puppet', rarity: 'Epic', drop: 'Metal Scrap' },
    { typeId: 71, name: 'Botched Servant', rarity: 'Epic', drop: 'Monstrous Pack', variantOf: 'Skeletal Servant' },
    { typeId: 77, name: 'Luminous Lion', rarity: 'Epic', drop: 'Gold Nugget' },
    { typeId: 5, name: 'White Dragon', rarity: 'Legendary', drop: 'Mithril Nugget' },
    { typeId: 30, name: 'Strange Shadow', rarity: 'Legendary', drop: 'Treasure Map' },
    { typeId: 33, name: 'Gelatinous Cube', rarity: 'Legendary', drop: 'Dungeon Dive Level 1 Loot' },
    { typeId: 47, name: 'Polar Bear', rarity: 'Legendary', drop: 'Monster Haunch' },
    { typeId: 51, name: 'Yucky Bug', rarity: 'Legendary', drop: 'Dubious Coin x5' },
    { typeId: 52, name: 'Celestial Snake', rarity: 'Legendary', drop: 'Glittering Swarf' },
    { typeId: 59, name: 'Gift Mimic', rarity: 'Legendary', drop: 'Dubious Coin x10', variantOf: 'Mimic' },
    { typeId: 72, name: 'Rainbow Slime', rarity: 'Legendary', drop: 'Furled Pennant', variantOf: 'Slime' }
];

// Fresh copies, so nothing downstream can bend the roster.
function getPets() { return PETS.map(p => Object.assign({}, p)); }

// Where a bonding level sits on the ladder. -1 for anything unrecognised.
function petBondingRank(level) { return PET_BONDING.indexOf(level); }

// Is this pet free to be sent at all?
function petIsReady(pet) {
    return !pet || !pet.status || pet.status === 'Ready';
}

// Can this pet go to this area? An area with no requirement still needs a pet
// that is actually free, and No Bonding sits below every requirement.
function petCanGo(bonding, area) {
    if (!area || !area.needs) return true;
    return petBondingRank(bonding) >= petBondingRank(area.needs);
}

// ===========================================================================
// Working out who goes where
// ---------------------------------------------------------------------------
// Only The Buried Castle guarantees a pet's own drop, so everywhere else the
// pet is interchangeable and the only real question is which one you can spare.
// Sending a Devoted pet to Gentle Meadows costs you a Castle slot for a week,
// so the advice is always to send the least-bonded pet that still qualifies.
// ===========================================================================

const PET_STORE_KEY = 'bloodline.pets.v1';
// How many the site says you own, so the page can tell you when a paste has
// only covered part of a multi-page collection.
const PET_TOTAL_KEY = 'bloodline.pets.total.v1';

function petTotalOwned() {
    const n = Number(localStorage.getItem(PET_TOTAL_KEY));
    return n > 0 ? n : 0;
}

function petLoad() {
    try {
        const v = JSON.parse(localStorage.getItem(PET_STORE_KEY));
        return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
}

function petSave(list) {
    try { localStorage.setItem(PET_STORE_KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
}

// Look a species up by name or by the game's own pet type id.
function petSpecies(key) {
    return PETS.find(p => p.name === key || p.typeId === Number(key)) || null;
}

// Everything known about one of your pets, roster entry folded in.
//
// You can own several of the same species at different bonding levels, so a
// stored pet is an individual with its own id. `species` is what it is and
// `name` is what you call it, which are often not the same thing.
function petResolve(mine) {
    const base = petSpecies(mine.species || mine.name);
    return Object.assign(
        { drop: '', rarity: '', species: mine.species || mine.name },
        base || {},
        mine,
        { name: mine.name || (base && base.name) || mine.species }
    );
}

// A stable key for one owned pet, since two can share a species and a name.
function petKey(pet) {
    return String(pet.id || pet.name || pet.species);
}

// Which items a given pet name brings back.
function petsDropping(item) {
    const want = String(item || '').toLowerCase().trim();
    if (!want) return [];
    return PETS.filter(p => p.drop.toLowerCase().indexOf(want) !== -1);
}

// Every distinct drop on the roster, for the picker.
function petAllDrops() {
    return [...new Set(PETS.map(p => p.drop))].sort();
}

// Hand out your pets across every area at once, because one pet can only be on
// one excursion at a time and the naive answer sends the same Devoted pet to
// three places.
//
// Areas are filled hardest requirement first. A Devoted pet qualifies
// everywhere, so if the strict areas do not get first refusal they end up with
// nobody while an easy area is sitting on somebody who was overqualified. Within
// an area the least-bonded pet that still qualifies goes, which keeps the
// Devoted ones free for the Castle.
//
// `wishlist` only matters at the Castle, the one place a pet's own drop is
// guaranteed, so that area picks by drop rather than by sparing anybody.
function petPlan(mine, wishlist) {
    const all = (mine || []).map(petResolve);
    const busy = all.filter(p => !petIsReady(p));
    const pets = all.filter(petIsReady);
    const want = (wishlist || []).map(w => String(w).toLowerCase());
    const wanted = p => want.some(w => p.drop.toLowerCase().indexOf(w) !== -1);
    const taken = {};

    const order = PET_AREAS.slice().sort((a, b) =>
        petBondingRank(b.needs) - petBondingRank(a.needs) || b.stage - a.stage);

    const assigned = {};
    order.forEach((area) => {
        const free = pets.filter(p => !taken[petKey(p)] && petCanGo(p.bonding, area));
        let pick;
        if (area.guaranteesDrops) {
            // Every pet here brings its own drop, so a team of four identical
            // pets brings four of the same thing. Take the drops you asked for
            // first, then anything that widens the haul, and only then fill.
            const got = {};
            const rank = p => (wanted(p) ? 0 : 2) + (got[p.drop] ? 1 : 0);
            const pool = free.slice();
            pick = [];
            while (pick.length < area.pets && pool.length) {
                pool.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
                const next = pool.shift();
                got[next.drop] = true;
                pick.push(next);
            }
        } else {
            // Everywhere else, spend the least-bonded pet you can.
            free.sort((a, b) => petBondingRank(a.bonding) - petBondingRank(b.bonding) ||
                a.name.localeCompare(b.name));
            pick = free.slice(0, area.pets);
        }
        pick.forEach(p => { taken[petKey(p)] = true; });
        assigned[area.stage] = {
            area: area,
            pick: pick.map(p => Object.assign({ wanted: wanted(p) }, p)),
            eligible: pets.filter(p => petCanGo(p.bonding, area)),
            short: Math.max(0, area.pets - pick.length)
        };
    });

    return {
        rows: PET_AREAS.map(a => assigned[a.stage]),
        idle: pets.filter(p => !taken[petKey(p)]),
        busy: busy
    };
}

// The Castle row on its own, for callers that only care about the team.
function petCastleTeam(mine, wishlist) {
    const plan = petPlan(mine, wishlist);
    return plan.rows.find(r => r.area.guaranteesDrops) || null;
}

// ===========================================================================
// The page
// ===========================================================================

function petEsc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function petHours(h) {
    if (h < 24) return h + ' hours';
    if (h === 24) return '1 day';
    if (h % 168 === 0) return (h / 168) + ' week' + (h === 168 ? '' : 's');
    return (h / 24) + ' days';
}

// Items Recipe asks for, so a drop that is one of them can say so.
function petRecipeItems() {
    const tables = [];
    if (typeof RECIPE_ITEMS !== 'undefined') tables.push(RECIPE_ITEMS);
    if (typeof RECIPE_FRUIT !== 'undefined') tables.push(RECIPE_FRUIT);
    if (typeof RECIPE_SCROLL_ADDONS !== 'undefined') tables.push(RECIPE_SCROLL_ADDONS);
    const out = {};
    tables.forEach(t => Object.keys(t).forEach(k => { out[t[k].name] = true; }));
    return out;
}

function petsRefreshRoster() {
    const sel = document.getElementById('petAddName');
    if (!sel) return;
    const mine = petLoad().map(p => p.name);
    sel.innerHTML = '<option value="">Pick a pet…</option>' + PETS
        .filter(p => mine.indexOf(p.name) === -1)
        .map(p => `<option value="${petEsc(p.name)}">${petEsc(p.name)} (${petEsc(p.rarity)}, drops ${petEsc(p.drop)})</option>`)
        .join('');
}

function petAdd() {
    const sel = document.getElementById('petAddName');
    const lvl = document.getElementById('petAddBonding');
    if (!sel || !sel.value) return;
    const list = petLoad();
    // Duplicates are allowed: several of one species is the normal case.
    list.push({
        id: 'pet-local-' + Date.now() + '-' + list.length,
        species: sel.value,
        name: sel.value,
        bonding: (lvl && lvl.value) || PET_BONDING[0],
        status: 'Ready'
    });
    petSave(list);
    sel.value = '';
    showPets();
}

function petSetStatus(id, status) {
    const list = petLoad();
    const hit = list.find(p => petKey(p) === id);
    if (hit) { hit.status = status; petSave(list); }
    showPets();
}

function petClearAll() {
    petSave([]);
    try { localStorage.removeItem(PET_TOTAL_KEY); } catch (e) { /* not fatal */ }
    showPets();
}

function petDoImport() {
    const box = document.getElementById('petImportBox');
    const out = document.getElementById('petImportResult');
    if (!box) return;
    const res = petImport(box.value);
    if (out) {
        out.innerHTML = (res.added || res.updated)
            ? `<p class="recipe-stable-blurb">${petResultText(res)}</p>`
            : '<p class="recipe-stable-blurb">Nothing recognisable in there. Paste the page source from your pets page, not the text of it.</p>';
    }
    box.value = '';
    showPets();
}

function petRemove(id) {
    petSave(petLoad().filter(p => petKey(p) !== id));
    showPets();
}

function petSetBonding(id, level) {
    const list = petLoad();
    const hit = list.find(p => petKey(p) === id);
    if (hit) { hit.bonding = level; petSave(list); }
    showPets();
}

// What a paste just did. A page you have already pasted is all updates and no
// additions, so say that rather than "read 0 new pets".
function petImportText(res) {
    const pets = n => n + ' pet' + (n === 1 ? '' : 's');
    if (!res.added) return 'That page was already in, so ' + pets(res.updated) + ' got refreshed.';
    if (!res.updated) return 'Read ' + pets(res.added) + '.';
    return 'Read ' + pets(res.added) + ' and refreshed ' + res.updated + ' already in.';
}

// What a paste or a click gets told. The progress line already leads with the
// count, so the first sentence is dropped when it would only say it again.
function petResultText(res) {
    const have = petLoad().length;
    const progress = petProgressText(have);
    if (res.added === have && !res.updated) return progress;
    return petImportText(res) + ' ' + progress;
}

// "30 pets" on its own, or "30 of your 119" when a paste has told us the size.
function petProgressText(have) {
    const owned = petTotalOwned();
    if (!owned || owned <= have) return have + ' pet' + (have === 1 ? '' : 's') + '.';
    return have + ' of your ' + owned + ' pets. Bring in the next page for the other ' +
        (owned - have) + '.';
}

// The pet's own picture, straight off Dungeon Coursers. The species is what
// decides it, so a renamed pet still shows the right animal. If it fails to
// load the card drops back to text and nothing breaks.
function petImageUrl(typeId) {
    return typeId ? 'https://dungeon-coursers.com/images/data/pets/' + Number(typeId) + '-image.gif' : '';
}

// One pet as a card: picture, what it is, what it drops, and its two settings.
function petCardHtml(p, recipeItems) {
    const full = petResolve(p);
    const key = petEsc(petKey(p)).replace(/'/g, "\\'");
    const img = petImageUrl(full.typeId);
    const opts = PET_BONDING.map(b =>
        `<option value="${petEsc(b)}"${b === p.bonding ? ' selected' : ''}>${petEsc(b)}</option>`).join('');
    const statusOpts = PET_STATUS.map(st =>
        `<option value="${petEsc(st)}"${st === (p.status || 'Ready') ? ' selected' : ''}>${petEsc(st)}</option>`).join('');
    // A renamed pet shows its own name, with the species underneath.
    const named = full.name && full.name !== full.species;
    const status = p.status || 'Ready';

    return `<li class="pet-card">
        <button class="pet-card-x" title="Remove ${petEsc(full.name)}" onclick="petRemove('${key}')">&times;</button>
        ${img ? `<div class="pet-card-pic"><img src="${petEsc(img)}" alt="" loading="lazy"
            referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></div>` : ''}
        <div class="pet-card-name">${petEsc(full.name)}</div>
        <div class="pet-card-species">${named ? petEsc(full.species) + ' &middot; ' : ''}${petEsc(full.rarity)}</div>
        <div class="pet-card-drop">${petEsc(full.drop)}${
            recipeItems[full.drop] ? '<span class="recipe-fit-group">Recipe</span>' : ''}</div>
        ${status === 'Ready' ? '' : `<div class="pet-card-busy">${petEsc(
            status === 'Away' && p.away ? 'Away: ' + p.away : status)}</div>`}
        <select class="pet-card-sel" aria-label="Bonding for ${petEsc(full.name)}"
            onchange="petSetBonding('${key}', this.value)">${opts}</select>
        <select class="pet-card-sel" aria-label="Status for ${petEsc(full.name)}"
            onchange="petSetStatus('${key}', this.value)">${statusOpts}</select>
    </li>`;
}

function showPets() {
    const out = document.getElementById('petResult');
    if (!out) return;
    petsRefreshRoster();

    const mine = petLoad();
    const wishRaw = (document.getElementById('petWishlist') || {}).value || '';
    const wishlist = wishRaw.split(',').map(s => s.trim()).filter(Boolean);
    const recipeItems = petRecipeItems();

    // Your pets, with their bonding and status editable in place. Sorted so the
    // ones that can go the furthest are at the top.
    const sorted = mine.slice().sort((a, b) =>
        petBondingRank(b.bonding) - petBondingRank(a.bonding) ||
        String(a.name || '').localeCompare(String(b.name || '')));
    const yours = mine.length
        ? `<ul class="pet-grid">${sorted.map(p => petCardHtml(p, recipeItems)).join('')}</ul>
        <p class="recipe-stable-blurb">${petProgressText(mine.length)}
            <button class="dc-btn" onclick="petClearAll()">Clear them all</button></p>`
        : '<p class="recipe-stable-empty">No pets yet. Paste your pets page above, or add them one at a time.</p>';

    // The allocation.
    const plan = petPlan(mine, wishlist);
    const rows = plan.rows.map((r) => {
        const who = r.pick.length
            ? r.pick.map(p => `<strong>${petEsc(p.name)}</strong> <span class="recipe-fit-temp">${petEsc(p.bonding)}</span>` +
                (r.area.guaranteesDrops ? ` <span class="recipe-fit-x">brings</span> ${petEsc(p.drop)}${p.wanted ? ' <span class="recipe-fit-group">on your list</span>' : ''}` : '')).join(', ')
            : '<span class="recipe-fit-miss">nobody spare</span>';
        // Devoted is the top rung, so "Devoted or higher" reads as though there
        // were something above it.
        const top = petBondingRank(r.area.needs) === PET_BONDING.length - 1;
        const need = r.area.needs ? petEsc(r.area.needs) + (top ? '' : ' or higher') : 'any pet';
        return `<li class="recipe-fit">
            <div class="recipe-fit-head"><strong>${petEsc(r.area.name)}</strong>
                <span class="recipe-fit-temp">${petHours(r.area.hours)}</span>
                <span class="recipe-fit-temp">${r.area.pets} pet${r.area.pets === 1 ? '' : 's'}</span>
                <span class="recipe-fit-temp">${need}</span></div>
            <div class="recipe-fit-meta">${who}${r.short ? ` <span class="recipe-fit-miss">short ${r.short}</span>` : ''}</div>
            <div class="recipe-fit-meta">Brings back ${petEsc(r.area.loot)}. ${petEsc(r.area.note)}</div>
        </li>`;
    }).join('');

    const idle = plan.idle.length
        ? `<p class="recipe-stable-blurb">Free but not needed: ${plan.idle.map(p => petEsc(p.name)).join(', ')}.</p>`
        : '';
    const busy = plan.busy.length
        ? `<p class="recipe-stable-blurb">Not available: ${plan.busy.map(p => `${petEsc(p.name)} (${petEsc(p.status)}${p.away ? ' at ' + petEsc(p.away) : ''})`).join(', ')}.</p>`
        : '';


    // Reverse lookup for whatever is in the wishlist box.
    const lookups = wishlist.map((w) => {
        const hits = petsDropping(w);
        return `<li><strong>${petEsc(w)}</strong>: ` + (hits.length
            ? hits.map(p => `${petEsc(p.name)} <span class="recipe-fit-temp">${petEsc(p.rarity)}</span>${mine.some(m => m.name === p.name) ? ' <span class="recipe-fit-group">you have this one</span>' : ''}`).join(', ')
            : '<span class="recipe-fit-miss">no pet drops this</span>') + '</li>';
    }).join('');

    out.innerHTML = `
        <div class="recipe-stable"><h3 class="recipe-head">Your pets</h3>${yours}</div>
        ${wishlist.length ? `<div class="recipe-stable"><h3 class="recipe-head">Who drops what you asked for</h3>
            <ul class="recipe-near-list">${lookups}</ul></div>` : ''}
        <div class="recipe-stable"><h3 class="recipe-head">Where to send them</h3>
            <p class="recipe-stable-blurb">One pet can only be on one excursion, so this hands them out across all seven at once. The strict areas get first refusal, and everywhere else takes the least-bonded pet that still qualifies, which keeps your Devoted ones free for the Castle.</p>
            <ul class="recipe-fit-list">${rows}</ul>${idle}${busy}</div>`;
}

// ===========================================================================
// Importing your pets
// ---------------------------------------------------------------------------
// Paste the source of your pets page and this reads it. The species comes from
// the image path rather than the caption, because a pet you have named yourself
// shows your name instead of its species, and the image is the only place the
// species survives: /images/data/pets/12-image.gif is a Mole whatever you call
// it. Nothing is sent anywhere; the parsing happens in your own browser.
// ===========================================================================

function petParseCollection(html) {
    const out = { pets: [], skipped: 0, owned: 0 };
    const text = String(html || '');
    if (!text.trim()) return out;

    const total = text.match(/Showing\s+\d+[–\-]\d+\s+of\s+(\d+)/i);
    if (total) out.owned = Number(total[1]);

    // One card per pet. Splitting on the wrapper keeps each card's fields together.
    const cards = text.split(/class="[^"]*inventory-pet[^"]*"/i).slice(1);
    cards.forEach((card) => {
        const typeId = (card.match(/\/images\/data\/pets\/(\d+)-image/) || [])[1];
        const species = typeId ? petSpecies(typeId) : null;
        if (!species) { out.skipped++; return; }

        // The caption is the species unless you have renamed the pet.
        const caption = (card.match(/btn-(?:primary|dark) btn btn-sm[^>]*>\s*([^<]+?)\s*</) || [])[1] || '';
        const owned = (card.match(/\/pets\/view\/(\d+)/) || [])[1];

        // Bonding is either a plain label or the muted "No Bonding".
        let bonding = 'No Bonding';
        const bonded = card.match(/<span style="font-size:14px;">\s*([A-Za-z ]+?)\s*<\/span>/);
        if (bonded && PET_BONDING.indexOf(bonded[1].trim()) !== -1) bonding = bonded[1].trim();

        let status = 'Ready', where = '';
        if (/badge-secondary[^>]*>\s*Resting/i.test(card)) status = 'Resting';
        const away = card.match(/badge-warning[^>]*>\s*Away:\s*([^<]+?)\s*</i);
        if (away) { status = 'Away'; where = away[1].trim(); }

        out.pets.push({
            id: owned ? 'pet-' + owned : 'pet-' + species.typeId + '-' + out.pets.length,
            species: species.name,
            name: caption && caption !== species.name ? caption : species.name,
            bonding: bonding,
            status: status,
            away: where
        });
    });
    return out;
}

// ---------------------------------------------------------------------------
// The bookmarklet
//
// Same idea as the stable's "Import all": drag it to the bookmarks bar, click
// it on your pets page, and it reads the page you are standing on and hands the
// list over in the URL. It runs in your own browser and talks to nobody.
//
// The payload is kept short because it travels in a URL: t is the species' type
// id, and name, bonding and status are left out when they are the obvious
// default, since this side can work them back out.
// ---------------------------------------------------------------------------

function petBookmarklet(base) {
    const site = base || 'https://ook.monster/courser-calc/';
    return "javascript:(function(){" +
        "var B=['Wary','Aloof','Comfortable','Friendly','Loyal','Devoted'],out=[];" +
        "document.querySelectorAll('.inventory-pet').forEach(function(c){" +
        "var im=c.querySelector('img[src*=\"/images/data/pets/\"]');if(!im)return;" +
        "var t=(im.getAttribute('src').match(/pets\\/(\\d+)-image/)||[])[1];if(!t)return;" +
        "var a=c.querySelector('a[href*=\"/pets/view/\"]');" +
        "var id=a?(a.getAttribute('href').match(/\\/pets\\/view\\/(\\d+)/)||[])[1]:'';" +
        "var cap=c.querySelector('.btn.btn-sm');var n=cap?cap.textContent.replace(/\\s+/g,' ').trim():'';" +
        "var b='';c.querySelectorAll('span').forEach(function(s){" +
        "var v=s.textContent.replace(/\\s+/g,' ').trim();if(B.indexOf(v)>-1)b=v;});" +
        "var st='',aw='';var w=c.querySelector('.badge-warning'),r=c.querySelector('.badge-secondary');" +
        "if(w&&/Away/i.test(w.textContent)){st='Away';aw=w.textContent.replace(/\\s+/g,' ').replace(/^\\s*Away:\\s*/i,'').trim();}" +
        "else if(r&&/Resting/i.test(r.textContent))st='Resting';" +
        "var p={t:Number(t)};if(id)p.i=id;if(n)p.n=n;if(b)p.b=b;if(st)p.s=st;if(aw)p.a=aw;out.push(p);});" +
        "if(!out.length){alert('Bloodline: no pets found. Open your pets page and try again.');return;}" +
        "var tot=(document.body.innerText.match(/Showing\\s+\\d+\\s*[\\u2013-]\\s*\\d+\\s+of\\s+(\\d+)/)||[])[1];" +
        "var d={p:out};if(tot)d.o=Number(tot);" +
        "window.open('" + site + "#pets=' + encodeURIComponent(JSON.stringify(d)),'bloodline');" +
        "})();";
}

// The other end of it. Takes what the bookmarklet sent, fills the defaults back
// in, and merges exactly the way a paste does.
function petImportBulk(data) {
    const payload = data && Array.isArray(data.p) ? data : { p: [] };
    const list = petLoad();
    let added = 0, updated = 0, skipped = 0;

    payload.p.forEach((raw, ix) => {
        const species = petSpecies(raw.t);
        if (!species) { skipped++; return; }
        const pet = {
            id: raw.i ? 'pet-' + raw.i : 'pet-' + species.typeId + '-' + ix,
            species: species.name,
            name: raw.n || species.name,
            bonding: PET_BONDING.indexOf(raw.b) > 0 ? raw.b : 'No Bonding',
            status: PET_STATUS.indexOf(raw.s) > 0 ? raw.s : 'Ready',
            away: raw.a || ''
        };
        const at = list.findIndex(x => x.id === pet.id);
        if (at >= 0) { list[at] = Object.assign({}, list[at], pet); updated++; }
        else { list.push(pet); added++; }
    });

    petSave(list);
    if (payload.o) {
        try { localStorage.setItem(PET_TOTAL_KEY, String(payload.o)); } catch (e) { /* not fatal */ }
    }
    return { added: added, updated: updated, skipped: skipped, total: payload.o || 0 };
}

// Reads a "#pets=..." hash left by the bookmarklet. Anything else, including a
// plain "#pets", is left alone for the normal routing to deal with.
function petImportFromHash(hash) {
    const h = hash == null ? (window.location.hash || '') : hash;
    const m = h.match(/^#pets=(.+)$/);
    if (!m) return null;
    let data;
    try { data = JSON.parse(decodeURIComponent(m[1])); } catch (e) { return { bad: true }; }
    if (!data || !Array.isArray(data.p) || !data.p.length) return { bad: true };
    return petImportBulk(data);
}

// Merge an import into what is stored, matching on the game's own pet id so a
// second paste updates rather than duplicates.
function petImport(html) {
    const parsed = petParseCollection(html);
    if (!parsed.pets.length) return { added: 0, updated: 0, skipped: parsed.skipped, total: parsed.owned };
    const list = petLoad();
    let added = 0, updated = 0;
    parsed.pets.forEach((p) => {
        const at = list.findIndex(x => x.id === p.id);
        if (at >= 0) { list[at] = Object.assign({}, list[at], p); updated++; }
        else { list.push(p); added++; }
    });
    petSave(list);
    // Remember what the site said the collection size was, so the page can keep
    // saying how much of it is in.
    if (parsed.owned) {
        try { localStorage.setItem(PET_TOTAL_KEY, String(parsed.owned)); } catch (e) { /* not fatal */ }
    }
    return { added: added, updated: updated, skipped: parsed.skipped, total: parsed.owned };
}
