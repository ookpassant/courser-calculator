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

// Bonding runs in this order, and an area asks for a rung on it.
const PET_BONDING = ['Aloof', 'Friendly', 'Loyal', 'Devoted'];

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
    { name: 'Hound', rarity: 'Common', drop: 'Old Bone' },
    { name: 'Eagle', rarity: 'Common', drop: 'Monster Parts', variantOf: 'Hawk' },
    { name: 'Osprey', rarity: 'Common', drop: 'Monster Parts', variantOf: 'Hawk' },
    { name: 'Hawk', rarity: 'Common', drop: 'Monster Parts' },
    { name: 'Wisp', rarity: 'Common', drop: 'Cave Moss' },
    { name: 'Owl', rarity: 'Common', drop: 'Monster Parts' },
    { name: 'Cat', rarity: 'Common', drop: 'Critter Tail' },
    { name: 'Cute Bookworm', rarity: 'Common', drop: 'Juicy Apple' },
    { name: 'Green Frog', rarity: 'Common', drop: 'Creature Eye' },
    { name: 'Raccoon', rarity: 'Common', drop: 'Empty Bottle' },
    { name: 'Evil Mushroom', rarity: 'Uncommon', drop: 'Hearty Mushroom' },
    { name: 'Bat', rarity: 'Uncommon', drop: 'Juicy Berry' },
    { name: 'Mole', rarity: 'Uncommon', drop: 'Cave Root' },
    { name: 'Slime', rarity: 'Uncommon', drop: 'Acidic Tongue' },
    { name: 'Fox', rarity: 'Uncommon', drop: 'Old Bone' },
    { name: 'Giant Moth', rarity: 'Uncommon', drop: 'Soothing Herb' },
    { name: 'Giant Beetle', rarity: 'Uncommon', drop: 'Bland Vegetable' },
    { name: 'Big Toad', rarity: 'Uncommon', drop: 'Juicy Berry' },
    { name: 'Tiny Snail', rarity: 'Uncommon', drop: 'Soothing Herb' },
    { name: 'Rat', rarity: 'Uncommon', drop: 'Stinky Bait' },
    { name: 'Black Cat', rarity: 'Uncommon', drop: 'Monster Parts', variantOf: 'Cat' },
    { name: 'Bouncing Bunny', rarity: 'Uncommon', drop: 'Clump of Fur' },
    { name: 'Sneaky Weasel', rarity: 'Uncommon', drop: 'Clump of Fur' },
    { name: 'Opossum', rarity: 'Uncommon', drop: 'Hearty Mushroom' },
    { name: 'Unsteady Automaton', rarity: 'Uncommon', drop: 'Metal Scrap' },
    { name: 'Mycelid', rarity: 'Uncommon', drop: 'Mushroom Skewer' },
    { name: 'Mimic', rarity: 'Rare', drop: 'Sack of Coin' },
    { name: 'Floating Eyeball', rarity: 'Rare', drop: 'Brute Tentacle' },
    { name: 'Pygmy Drake', rarity: 'Rare', drop: 'Herbs' },
    { name: 'Molten Dragonbat', rarity: 'Rare', drop: 'Humongous Egg', variantOf: 'Bat' },
    { name: 'Obsidian Golem', rarity: 'Rare', drop: 'Strong Root' },
    { name: 'Carrion Crawler', rarity: 'Rare', drop: 'Humanoid Skull' },
    { name: 'Crow', rarity: 'Rare', drop: 'Plain Key' },
    { name: 'Fire Elemental', rarity: 'Rare', drop: 'Carnite Nugget' },
    { name: 'Lava Ant', rarity: 'Rare', drop: 'Searing Herb' },
    { name: 'Skeletal Servant', rarity: 'Rare', drop: 'Fabric Scrap' },
    { name: 'Dracula Bat', rarity: 'Rare', drop: 'Monster Juice', variantOf: 'Bat' },
    { name: 'Painted Bat', rarity: 'Rare', drop: 'Juicy Apple', variantOf: 'Bat' },
    { name: 'Dark Hound', rarity: 'Rare', drop: 'Old Bone', variantOf: 'Hound' },
    { name: 'Wandering Spirit', rarity: 'Rare', drop: 'Humanoid Skull' },
    { name: 'Scarecrow', rarity: 'Rare', drop: 'Soul Seeds x5' },
    { name: 'Hedge Golem', rarity: 'Rare', drop: 'Strong Root' },
    { name: 'Killer Bee', rarity: 'Rare', drop: 'Blooming Herb' },
    { name: 'Fierce Chimera', rarity: 'Rare', drop: 'Monster Juice' },
    { name: 'Oomling', rarity: 'Rare', drop: 'Library Key' },
    { name: 'Pigeon', rarity: 'Rare', drop: 'Dropped Feather' },
    { name: 'Owlbear', rarity: 'Rare', drop: 'Berserker Potion' },
    { name: 'Seriously Sinister Shroom', rarity: 'Rare', drop: 'Bitter Bud', variantOf: 'Evil Mushroom' },
    { name: 'Iron Golem', rarity: 'Rare', drop: 'Humming Fragments' },
    { name: 'Slimy Snail', rarity: 'Rare', drop: 'Corroding Elixir', variantOf: 'Tiny Snail' },
    { name: 'Cave Boar', rarity: 'Rare', drop: 'Mushroom Trinkets' },
    { name: 'Wolf', rarity: 'Epic', drop: 'Monster Parts' },
    { name: 'Phantasmal Hand', rarity: 'Epic', drop: 'Forager\'s Pack Contents (Random)' },
    { name: 'Treent', rarity: 'Epic', drop: 'Herbs' },
    { name: 'Normal Goose', rarity: 'Epic', drop: 'Humongous Egg' },
    { name: 'Sizeable Serpent', rarity: 'Epic', drop: 'Monster Parts' },
    { name: 'Golden Hound', rarity: 'Epic', drop: 'Old Bone', variantOf: 'Hound' },
    { name: 'Mutant Hound', rarity: 'Epic', drop: 'Humanoid Skull', variantOf: 'Hound' },
    { name: 'Mutant Goose', rarity: 'Epic', drop: 'Bunch of Grapes', variantOf: 'Normal Goose' },
    { name: 'Ghastly Eyeball', rarity: 'Epic', drop: 'Scrying Lens' },
    { name: 'Corrupted Treent', rarity: 'Epic', drop: 'Strong Root', variantOf: 'Treent' },
    { name: 'BABY SKULL', rarity: 'Epic', drop: 'Tome of Skull Summoning' },
    { name: 'Undead Dragonling', rarity: 'Epic', drop: 'Beast Fang x2' },
    { name: 'Wretched Imp', rarity: 'Epic', drop: 'Carnite Nugget' },
    { name: 'Grotesque Gargoyle', rarity: 'Epic', drop: 'Beast Fang x2' },
    { name: 'Addled Minotaur', rarity: 'Epic', drop: 'Ancient Key' },
    { name: 'Fairy Drake', rarity: 'Epic', drop: 'Stained Glass Shards', variantOf: 'Pygmy Drake' },
    { name: 'Kasperl', rarity: 'Epic', drop: 'Soul Seeds x5' },
    { name: 'Living Puppet', rarity: 'Epic', drop: 'Metal Scrap' },
    { name: 'Botched Servant', rarity: 'Epic', drop: 'Monstrous Pack', variantOf: 'Skeletal Servant' },
    { name: 'Luminous Lion', rarity: 'Epic', drop: 'Gold Nugget' },
    { name: 'White Dragon', rarity: 'Legendary', drop: 'Mithril Nugget' },
    { name: 'Strange Shadow', rarity: 'Legendary', drop: 'Treasure Map' },
    { name: 'Gelatinous Cube', rarity: 'Legendary', drop: 'Dungeon Dive Level 1 Loot' },
    { name: 'Polar Bear', rarity: 'Legendary', drop: 'Monster Haunch' },
    { name: 'Yucky Bug', rarity: 'Legendary', drop: 'Dubious Coin x5' },
    { name: 'Celestial Snake', rarity: 'Legendary', drop: 'Glittering Swarf' },
    { name: 'Gift Mimic', rarity: 'Legendary', drop: 'Dubious Coin x10', variantOf: 'Mimic' },
    { name: 'Rainbow Slime', rarity: 'Legendary', drop: 'Furled Pennant', variantOf: 'Slime' }
];

// Fresh copies, so nothing downstream can bend the roster.
function getPets() { return PETS.map(p => Object.assign({}, p)); }

// Where a bonding level sits on the ladder. -1 for anything unrecognised.
function petBondingRank(level) { return PET_BONDING.indexOf(level); }

// Can this pet go to this area? An area with no requirement takes anybody.
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

// Everything known about one of your pets, roster entry included.
function petResolve(mine) {
    const base = PETS.find(p => p.name === mine.name);
    return Object.assign({ drop: '', rarity: '' }, base || {}, mine);
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
    const pets = (mine || []).map(petResolve);
    const want = (wishlist || []).map(w => String(w).toLowerCase());
    const wanted = p => want.some(w => p.drop.toLowerCase().indexOf(w) !== -1);
    const taken = {};

    const order = PET_AREAS.slice().sort((a, b) =>
        petBondingRank(b.needs) - petBondingRank(a.needs) || b.stage - a.stage);

    const assigned = {};
    order.forEach((area) => {
        const free = pets.filter(p => !taken[p.name] && petCanGo(p.bonding, area));
        free.sort((a, b) => area.guaranteesDrops
            // At the Castle, take the useful drops first.
            ? (wanted(b) ? 1 : 0) - (wanted(a) ? 1 : 0) || a.name.localeCompare(b.name)
            // Everywhere else, spend the least-bonded pet you can.
            : petBondingRank(a.bonding) - petBondingRank(b.bonding) || a.name.localeCompare(b.name));
        const pick = free.slice(0, area.pets);
        pick.forEach(p => { taken[p.name] = true; });
        assigned[area.stage] = {
            area: area,
            pick: pick.map(p => Object.assign({ wanted: wanted(p) }, p)),
            eligible: pets.filter(p => petCanGo(p.bonding, area)),
            short: Math.max(0, area.pets - pick.length)
        };
    });

    return {
        rows: PET_AREAS.map(a => assigned[a.stage]),
        idle: pets.filter(p => !taken[p.name])
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
    if (!list.some(p => p.name === sel.value)) {
        list.push({ name: sel.value, bonding: (lvl && lvl.value) || PET_BONDING[0] });
        petSave(list);
    }
    sel.value = '';
    showPets();
}

function petRemove(name) {
    petSave(petLoad().filter(p => p.name !== name));
    showPets();
}

function petSetBonding(name, level) {
    const list = petLoad();
    const hit = list.find(p => p.name === name);
    if (hit) { hit.bonding = level; petSave(list); }
    showPets();
}

function showPets() {
    const out = document.getElementById('petResult');
    if (!out) return;
    petsRefreshRoster();

    const mine = petLoad();
    const wishRaw = (document.getElementById('petWishlist') || {}).value || '';
    const wishlist = wishRaw.split(',').map(s => s.trim()).filter(Boolean);
    const recipeItems = petRecipeItems();

    // Your pets, with their bonding editable in place.
    const yours = mine.length
        ? `<ul class="recipe-fit-list">${mine.map(p => {
            const full = petResolve(p);
            const opts = PET_BONDING.map(b =>
                `<option value="${petEsc(b)}"${b === p.bonding ? ' selected' : ''}>${petEsc(b)}</option>`).join('');
            return `<li class="recipe-fit">
                <div class="recipe-fit-head">
                    <strong>${petEsc(p.name)}</strong>
                    <span class="recipe-fit-temp">${petEsc(full.rarity)}</span>
                    <span class="recipe-fit-x">drops</span>
                    <strong>${petEsc(full.drop)}</strong>
                    ${recipeItems[full.drop] ? '<span class="recipe-fit-group">Recipe asks for this</span>' : ''}
                </div>
                <div class="pet-controls">
                    <span class="pet-label">Bonding</span>
                    <select onchange="petSetBonding('${petEsc(p.name).replace(/'/g, "\\'")}', this.value)">${opts}</select>
                    <button class="dc-btn" onclick="petRemove('${petEsc(p.name).replace(/'/g, "\\'")}')">Remove</button>
                </div>
            </li>`;
        }).join('')}</ul>`
        : '<p class="recipe-stable-empty">No pets yet. Add them above and this fills in.</p>';

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
        ? `<p class="recipe-stable-blurb">Sitting out: ${plan.idle.map(p => petEsc(p.name)).join(', ')}.</p>`
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
            <ul class="recipe-fit-list">${rows}</ul>${idle}</div>`;
}
