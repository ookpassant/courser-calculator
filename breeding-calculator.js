// Dungeon Coursers Breeding Calculator
// Because doing genetics by hand is suffering

// Ye olde tab switcheroo — now delegated to the app shell (app.js), which owns
// the top-nav routing. Kept as a thin shim so the engine's own callers
// (fillParents, fillChimeraCalculator) don't need to know how navigation works.
function switchTab(tabName) {
    if (window.AppShell && window.AppShell.switchTab) {
        window.AppShell.switchTab(tabName);
    }
}

// The stable: where all your precious pixel ponies live
let horseCollection = [];

// --- Seam for the app shell (app.js) ---------------------------------------
// app.js owns persistence (localStorage) and the collection UI; the engine
// stays the source of truth for genetics. These let the shell read/replace the
// working collection without the engine caring where the data came from.
window.getCollection = function () { return horseCollection; };
window.applyCollection = function (arr) {
    horseCollection = Array.isArray(arr) ? arr.slice() : [];
    const cs = document.getElementById('collectionStatus');
    if (cs) cs.style.display = horseCollection.length ? 'block' : 'none';
    const hc = document.getElementById('horseCount');
    if (hc) hc.textContent = horseCollection.length;
    return horseCollection;
};

// Convince the browser to eat a spreadsheet
document.addEventListener('DOMContentLoaded', function() {
    const csvInput = document.getElementById('csvUpload');
    if (csvInput) {
        csvInput.addEventListener('change', handleCSVUpload);
    }

    // Press Escape to flee the modal like a coward fleeing the final boss
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSearchModal();
    });
    const modalOverlay = document.getElementById('searchModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeSearchModal();
        });
    }
});

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

// Pure parse: text in, structured horses out. No globals, no DOM — so the
// import wizard (app.js) can preview & validate before anything is committed.
// Returns { headerDetected, horses: [...] } where each horse also carries the
// source row number for error reporting.
window.parseHorsesCSV = function (text) {
    const lines = text.split('\n');
    const firstLineValues = parseCSVLine(lines[0] || '');
    const firstLineLower = firstLineValues.map(v => v.trim().toLowerCase());

    // Detect whether this CSV was lovingly hand-crafted or catapulted at us from the ramparts
    const knownHeaders = ['genotype', 'temperament', 'name', 'id', 'variant'];
    const hasHeaders = firstLineLower.some(h => knownHeaders.includes(h));

    let headers;
    let startLine;
    if (hasHeaders) {
        headers = firstLineLower;
        startLine = 1;
    } else {
        // No headers? Bold move. We'll wing it like a courser jumping a bottomless chasm.
        headers = ['id', 'name', 'genotype', 'temperament', 'variant'];
        startLine = 0;
    }

    const horses = [];
    for (let i = startLine; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = parseCSVLine(lines[i]);
        const horse = {};
        headers.forEach((header, index) => {
            horse[header] = values[index] ? values[index].trim() : '';
        });

        if (horse.genotype && horse.temperament) {
            horses.push({
                id: horse.id || horse.name || `Horse ${i}`,
                name: horse.name || `Horse ${i}`,
                genotype: horse.genotype,
                temperament: horse.temperament,
                variant: horse.variant || 'Standard',
                _row: i + 1
            });
        }
    }
    return { headerDetected: hasHeaders, horses };
};

function parseCSV(text) {
    const { horses } = window.parseHorsesCSV(text);
    horseCollection = horses;

    if (window.AppShell && window.AppShell.onCollectionChanged) {
        // Let the shell merge/persist and refresh the collection UI.
        window.AppShell.onCollectionChanged(horseCollection, { persist: true, replace: true });
    } else {
        const cs = document.getElementById('collectionStatus');
        if (cs) cs.style.display = 'block';
        const hc = document.getElementById('horseCount');
        if (hc) hc.textContent = horseCollection.length;
    }

    console.log(`Loaded ${horseCollection.length} horses:`, horseCollection);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result.map(val => val.replace(/^"|"$/g, ''));
}

// The sacred scrolls of coat color — transcribed at 3am by candlelight, errors are lore-accurate
const COAT_COLORS = {
    'EE_AA': 'Bay', 'Ee_AA': 'Bay', 'EE_Aa': 'Bay', 'Ee_Aa': 'Bay',
    'EE_aa': 'Black', 'Ee_aa': 'Black',
    'ee_AA': 'Chestnut', 'ee_Aa': 'Chestnut', 'ee_aa': 'Chestnut'
};

// The VIP lounge — coats so fancy they got their own titles at the royal naming ceremony
const SPECIAL_COAT_NAMES = {
    // One scoop of Cream — entry-level bougie
    'Bay_Cream': 'Buckskin',
    'Black_Cream': 'Smoky Black',
    'Chestnut_Cream': 'Palomino',

    // Double Cream — for when your horse demands to speak to the stable manager
    'Bay_Double Cream': 'Perlino',
    'Black_Double Cream': 'Smoky Cream',
    'Chestnut_Double Cream': 'Cremello',

    // Tapestry — congratulations, your horse is a medieval interior decoration
    'Bay_Tapestry': 'Madder',
    'Black_Tapestry': 'Woad',
    'Chestnut_Tapestry': 'Weld',

    // Pearl — looted from a dungeon oyster on floor 47, probably
    'Bay_Pearl': 'Bay Pearl',
    'Black_Pearl': 'Black Pearl',
    'Chestnut_Pearl': 'Gold Pearl',

    // Champagne dilutions — pop the cork, your horse is celebrating
    'Bay_Champagne': 'Amber Champagne',
    'Black_Champagne': 'Classic Champagne',
    'Chestnut_Champagne': 'Gold Champagne',

    // Ether dilutions — your horse is literally fading into the ethereal plane
    'Bay_Ether': 'Ombre Ether',
    'Black_Ether': 'Classic Ether',
    'Chestnut_Ether': 'Cold Ether',

    // Cream Pearl — the Cream fancy names carry through when Pearl tags along
    'Bay_Cream Pearl': 'Buckskin Pearl',
    'Black_Cream Pearl': 'Smoky Black Pearl',
    'Chestnut_Cream Pearl': 'Palomino Pearl',

    // Tapestry + Cream — a wall hanging dipped in artisanal buttercream
    'Bay_Tapestry Cream': 'Madder Buckskin',
    'Black_Tapestry Cream': 'Woad Smoky Black',
    'Chestnut_Tapestry Cream': 'Weld Palomino',

    // Tapestry Ether — a ghostly wall hanging, very haunted chic
    'Bay_Tapestry Ether': 'Madder Ether',
    'Black_Tapestry Ether': 'Woad Ether',
    'Chestnut_Tapestry Ether': 'Weld Ether',

    // Pearl Ether — iridescent AND translucent, show-off
    'Bay_Pearl Ether': 'Bay Pearl Ether',
    'Black_Pearl Ether': 'Black Pearl Ether',
    'Chestnut_Pearl Ether': 'Gold Pearl Ether',

    // Pearl Champagne — sparkly AND bubbly, the life of the dungeon party
    'Bay_Pearl Champagne': 'Bay Pearl Champagne',
    'Black_Pearl Champagne': 'Black Pearl Champagne',
    'Chestnut_Pearl Champagne': 'Gold Pearl Champagne',

    // Cream Champagne — your horse orders the most expensive drink at every tavern
    // Double Cream (CrCr) uses the same name, just presents paler
    'Bay_Cream Champagne': 'Amber Cream Champagne',
    'Black_Cream Champagne': 'Classic Cream Champagne',
    'Chestnut_Cream Champagne': 'Gold Cream Champagne',
    'Bay_Double Cream Champagne': 'Amber Cream Champagne',
    'Black_Double Cream Champagne': 'Classic Cream Champagne',
    'Chestnut_Double Cream Champagne': 'Gold Cream Champagne',

    // Cream Ether — fancy AND barely corporeal, the ultimate flex
    // Double Cream (CrCr) uses the same name, just presents paler
    'Bay_Cream Ether': 'Ombre Cream Ether',
    'Black_Cream Ether': 'Classic Cream Ether',
    'Chestnut_Cream Ether': 'Cold Cream Ether',
    'Bay_Double Cream Ether': 'Ombre Cream Ether',
    'Black_Double Cream Ether': 'Classic Cream Ether',
    'Chestnut_Double Cream Ether': 'Cold Cream Ether',

    // Tapestry Champagne — woven AND fizzy, the sommelier's tapestry
    'Bay_Tapestry Champagne': 'Madder Champagne',
    'Black_Tapestry Champagne': 'Woad Champagne',
    'Chestnut_Tapestry Champagne': 'Weld Champagne',

    // Cream Pearl Champagne (triple dilution) — this horse has THREE trust funds
    'Bay_Cream Pearl Champagne': 'Amber Cream Pearl Champagne',
    'Black_Cream Pearl Champagne': 'Classic Cream Pearl Champagne',
    'Chestnut_Cream Pearl Champagne': 'Gold Cream Pearl Champagne',

    // Cream Pearl Ether (triple dilution) — so diluted it's basically a rumor of a horse
    'Bay_Cream Pearl Ether': 'Ombre Cream Pearl Ether',
    'Black_Cream Pearl Ether': 'Classic Cream Pearl Ether',
    'Chestnut_Cream Pearl Ether': 'Cold Cream Pearl Ether',

    // Tapestry Cream Ether (triple dilution) — a ghost woven into a fancy throw blanket
    'Bay_Tapestry Cream Ether': 'Madder Cream Ether',
    'Black_Tapestry Cream Ether': 'Woad Cream Ether',
    'Chestnut_Tapestry Cream Ether': 'Weld Cream Ether',

    // Tapestry Pearl (double dilution) — a pearlescent tapestry, very museum gift shop
    'Bay_Tapestry Pearl': 'Tyrian Pearl',
    'Black_Tapestry Pearl': 'Phthalo Pearl',
    'Chestnut_Tapestry Pearl': 'Ochre Pearl',

    // Tapestry Pearl Champagne (triple dilution) — we've gone full boss-drop territory
    'Bay_Tapestry Pearl Champagne': 'Tyrian Pearl Champagne',
    'Black_Tapestry Pearl Champagne': 'Phthalo Pearl Champagne',
    'Chestnut_Tapestry Pearl Champagne': 'Ochre Pearl Champagne',

    // Tapestry Pearl Ether (triple dilution) — if this horse was any more diluted it would evaporate
    'Bay_Tapestry Pearl Ether': 'Tyrian Pearl Ether',
    'Black_Tapestry Pearl Ether': 'Phthalo Pearl Ether',
    'Chestnut_Tapestry Pearl Ether': 'Ochre Pearl Ether',

    // Tapestry Cream Champagne (triple dilution) — peak horse aristocracy achieved
    'Bay_Tapestry Cream Champagne': 'Madder Cream Champagne',
    'Black_Tapestry Cream Champagne': 'Woad Cream Champagne',
    'Chestnut_Tapestry Cream Champagne': 'Weld Cream Champagne'
};

const DILUTION_NAMES = {
    // Locus 1: Cr, Tp, prl — three dilutions crammed into one locus like adventurers in a tavern booth
    'nCr': 'Cream', 'Cr': 'Cream', 'CrCr': 'Double Cream',
    'nTp': 'Tapestry', 'Tp': 'Tapestry', 'TpTp': 'Tapestry',
    'nprl': 'Pearl', 'prl': 'Pearl', 'prlprl': 'Pearl',
    'Crprl': 'Cream Pearl',
    'TpCr': 'Tapestry Cream',
    'Tpprl': 'Tapestry Pearl',

    // Locus 2: Ch, er — roommates who don't get along; Ch always hogs the spotlight
    'nCh': 'Champagne', 'Ch': 'Champagne', 'ChCh': 'Champagne',
    'erer': 'Ether',
    'Cher': 'Champagne'
};

const MODIFIER_NAMES = {
    'nD': 'Dun', 'DD': 'Dun',
    'nP': 'Pangare', 'PP': 'Pangare',
    'nSty': 'Sooty', 'StySty': 'Sooty',
    'nG': 'Gray', 'GG': 'Gray',
    'nf': 'Flaxen', 'ff': 'Flaxen',
    'nZ': 'Silver', 'ZZ': 'Silver',
    'nLu': 'Illuminated', 'LuLu': 'Illuminated',
    'nsp': 'Sepulchered', 'spsp': 'Sepulchered',
    'Lusp': 'Illuminated Sepulchered',
    'nTd': 'Tabard', 'TdTd': 'Tabard',
    'nGl': 'Gilt', 'GlGl': 'Gilt',
    'nV': 'Vellum', 'VV': 'Vellum',
    'nOp': 'Opal', 'OpOp': 'Opal',
    'nPr': 'Prism', 'PrPr': 'Prism',
    'PrOp': 'Prism Opal',
    'nsf': 'Starfield', 'sfsf': 'Starfield',
    'nlr': 'Lacquer', 'lrlr': 'Lacquer'
};

// Traits that swagger in BEFORE the coat color, like heralds announcing the king
const TRAITS_BEFORE_COAT = [
    'Dominant White', 'Crowned', 'Flaxen', 'Carrying Flaxen', 'Pangare',
    'Sooty', 'Gray', 'Silver', 'Illuminated', 'Gilt', 'Opal', 'Prism',
    'Starfield', 'Carrying Starfield', 'Vellum', 'Lacquer', 'Carrying Lacquer'
];

// Traits that trail AFTER the coat color like a horse's entourage
const TRAITS_AFTER_COAT = [
    'Dun', 'Tabard', 'Cuirass', 'Sepulchered', 'Carrying Sepulchered',
    // White markings tag along at the back like they missed the group photo
    'Tobiano', 'Overo', 'Splash', 'Roan', 'Sabino', 'Blanket', 'Snowcap',
    'Varnish Roan', 'Leopard', 'Fewspot', 'Snowflake', 'Ossuary',
    'Shroud', 'Filigree', 'Carrying Filigree', 'Harlequin', 'Rabicano', 'False Leopard',
    'Girdle', 'Collar', 'Blanched',
    // KIT compound phenotypes — when one white pattern wasn't dramatic enough
    'Tobiano Roan', 'Tobiano Sabino', 'Tobiano Dominant White',
    'Roan Sabino', 'Roan Dominant White', 'Sabino Dominant White',
    // B/Fl compound — the buddy-cop duo of markings
    'Blanched False Leopard',
    // Gi/Co compound — accessorized from both ends
    'Girdle Collar',
    // Carrier traits — the "I swear it's in my bloodline" genes
    'Carries Ether', 'Carries Patn'
];

const WHITE_MARKING_NAMES = {
    'nSpl': 'Splash', 'SplSpl': 'Splash',
    'nRn': 'Roan', 'RnRn': 'Roan',
    'nT': 'Tobiano', 'TT': 'Tobiano',
    'nCu': 'Cuirass', 'CuCu': 'Cuirass', 'CuCw': 'Cuirass Crowned',
    'nCw': 'Crowned', 'CwCw': 'Crowned',
    'nO': 'Overo', 'OO': 'Overo',
    'nSb': 'Sabino', 'SbSb': 'Sabino',
    'nGi': 'Girdle', 'GiGi': 'Girdle',
    'nCo': 'Collar', 'CoCo': 'Collar', 'GiCo': 'Girdle Collar', 'CoGi': 'Girdle Collar',
    'nB': 'Blanched', 'BB': 'Blanched', 'BFl': 'Blanched False Leopard', 'FlB': 'Blanched False Leopard',
    'nW': 'Dominant White', 'WW': 'Dominant White',
    'nRb': 'Rabicano', 'RbRb': 'Rabicano',
    'nFl': 'False Leopard', 'FlFl': 'False Leopard',
    'nHq': 'Harlequin', 'HqHq': 'Harlequin',
    'nSh': 'Shroud', 'ShSh': 'Shroud',
    'nfe': 'Filigree', 'fefe': 'Filigree',
    'nOs': 'Ossuary', 'OsOs': 'Ossuary',
    // KIT locus compounds (both orderings, because alleles can't agree who goes first)
    'TRn': 'Tobiano Roan', 'RnT': 'Tobiano Roan',
    'TSb': 'Tobiano Sabino', 'SbT': 'Tobiano Sabino',
    'TW': 'Tobiano Dominant White', 'WT': 'Tobiano Dominant White',
    'RnSb': 'Roan Sabino', 'SbRn': 'Roan Sabino',
    'RnW': 'Roan Dominant White', 'WRn': 'Roan Dominant White',
    'SbW': 'Sabino Dominant White', 'WSb': 'Sabino Dominant White'
};

function parseGenotype(genoString) {
    const parts = genoString.trim().split('+');
    const genes = parts[0].trim().split(/\s+/);
    const anomalies = parts.length > 1 ? parts[1].trim().split(',').map(a => a.trim()) : [];

    return { genes, anomalies };
}

function isLethalWhite(genes) {
    const hasOO = genes.includes('OO');
    const hasOsOs = genes.includes('OsOs');
    const hasWW = genes.includes('WW');
    const hasOveroOssuary = genes.includes('nO') && genes.includes('nOs');
    return hasOO || hasOsOs || hasWW || hasOveroOssuary;
}

function genotypeToPhenotype(genoString) {
    const { genes, anomalies } = parseGenotype(genoString);

    // OO, OsOs, WW, or nO+nOs = dead foal, sorry
    if (isLethalWhite(genes)) {
        return 'LETHAL WHITE - This foal would not survive.';
    }

    let baseCoat = '';
    let dilutions = [];
    const allTraits = []; // The growing pile of everything this horse decided to be

    // Find base coat — the foundation upon which all genetic chaos is built
    const eGene = genes.find(g => g.match(/^[Ee][Ee]?$/));
    const aGene = genes.find(g => g.match(/^[Aa][Aa]?$/));

    if (eGene && aGene) {
        const key = `${eGene}_${aGene}`;
        baseCoat = COAT_COLORS[key] || 'Unknown';
    }

    // Grab dilutions from both loci — double-fisting fancy genes
    // Locus 1: the Cream/Tapestry/Pearl apartment — Locus 2: the Champagne/Ether flat

    const locus1Gene = genes.find(g => /Cr|Tp|prl/.test(g) && !/(Ch|er)/.test(g));
    const locus2Gene = genes.find(g => /Ch|er/.test(g) && !/(Cr|Tp|prl)/.test(g));

    if (locus1Gene && DILUTION_NAMES[locus1Gene]) {
        dilutions.push(DILUTION_NAMES[locus1Gene]);
    }
    if (locus2Gene && DILUTION_NAMES[locus2Gene]) {
        dilutions.push(DILUTION_NAMES[locus2Gene]);
    }

    // Ether is recessive — lurking in the shadows until it gets a matching copy, very dungeon energy
    if (locus2Gene === 'ner' || locus2Gene === 'Cher') {
        allTraits.push('Carries Ether');
    }

    // Assemble the coat's full title, like a fantasy character's increasingly absurd name
    let coatColor = baseCoat;
    if (dilutions.length > 0) {
        const dilutionStr = dilutions.join(' ');
        const specialKey = `${baseCoat}_${dilutionStr}`;
        if (SPECIAL_COAT_NAMES[specialKey]) {
            coatColor = SPECIAL_COAT_NAMES[specialKey];
        } else {
            coatColor += ' ' + dilutionStr;
        }
    }

    // White markings — untangling compound genes like a bard untangling a lute string
    genes.forEach(gene => {
        if (WHITE_MARKING_NAMES[gene]) {
            // nfe = "I have Filigree at home" (carrier only); fefe = the real deal
            if (gene === 'nfe') {
                allTraits.push('Carrying Filigree');
            // Compound locus genes — divorce court, splitting shared-locus couples
            } else if (gene === 'CuCw') {
                allTraits.push('Cuirass');
                allTraits.push('Crowned');
            } else if (gene === 'BFl' || gene === 'FlB') {
                allTraits.push('Blanched');
                allTraits.push('False Leopard');
            } else if (gene === 'TRn' || gene === 'RnT') {
                allTraits.push('Tobiano');
                allTraits.push('Roan');
            } else if (gene === 'TSb' || gene === 'SbT') {
                allTraits.push('Tobiano');
                allTraits.push('Sabino');
            } else if (gene === 'TW' || gene === 'WT') {
                allTraits.push('Tobiano');
                allTraits.push('Dominant White');
            } else if (gene === 'RnSb' || gene === 'SbRn') {
                allTraits.push('Roan');
                allTraits.push('Sabino');
            } else if (gene === 'RnW' || gene === 'WRn') {
                allTraits.push('Roan');
                allTraits.push('Dominant White');
            } else if (gene === 'SbW' || gene === 'WSb') {
                allTraits.push('Sabino');
                allTraits.push('Dominant White');
            } else if (gene === 'GiCo' || gene === 'CoGi') {
                allTraits.push('Girdle');
                allTraits.push('Collar');
            } else {
                allTraits.push(WHITE_MARKING_NAMES[gene]);
            }
        }
    });

    // Leopard Complex — Lp and patn team up to decide just how spotty this horse gets
    const lpGene = genes.find(g => g === 'nLp' || g === 'LpLp');
    const patnGene = genes.find(g => g === 'npatn' || g === 'patnpatn');
    if (lpGene) {
        const isHomozygousLp = lpGene === 'LpLp';
        const patnStatus = patnGene ? (patnGene === 'patnpatn' ? 'homozygous' : 'heterozygous') : 'none';
        let leopardPattern = '';
        if (isHomozygousLp && patnStatus === 'homozygous') leopardPattern = 'Fewspot';
        else if (isHomozygousLp && patnStatus === 'heterozygous') leopardPattern = 'Snowcap';
        else if (isHomozygousLp && patnStatus === 'none') leopardPattern = 'Varnish Roan';
        else if (!isHomozygousLp && patnStatus === 'homozygous') leopardPattern = 'Leopard';
        else if (!isHomozygousLp && patnStatus === 'heterozygous') leopardPattern = 'Blanket';
        else if (!isHomozygousLp && patnStatus === 'none') leopardPattern = 'Snowflake';
        if (leopardPattern) allTraits.push(leopardPattern);
    } else if (patnGene) {
        // patn without Lp is just vibes — all potential, no spots
        allTraits.push('Carries Patn');
    }

    // Modifiers — the spice rack of horse genetics; compounds get split, carriers get outed
    genes.forEach(gene => {
        if (MODIFIER_NAMES[gene]) {
            // Compound genes get broken up — you can't sit together anymore
            if (gene === 'PrOp') {
                allTraits.push('Prism');
                allTraits.push('Opal');
            } else if (gene === 'Lusp') {
                allTraits.push('Illuminated');
                allTraits.push('Carrying Sepulchered');
            } else if (gene === 'nf') {
                allTraits.push('Carrying Flaxen');
            } else if (gene === 'nsp') {
                allTraits.push('Carrying Sepulchered');
            } else if (gene === 'nsf') {
                allTraits.push('Carrying Starfield');
            } else if (gene === 'nlr') {
                allTraits.push('Carrying Lacquer');
            } else {
                allTraits.push(MODIFIER_NAMES[gene]);
            }
        }
    });

    // Sort traits into their proper positions — phenotype formatting is an ancient and sacred art
    const traitsBeforeCoat = allTraits.filter(trait => TRAITS_BEFORE_COAT.includes(trait));
    const traitsAfterCoat = allTraits.filter(trait => TRAITS_AFTER_COAT.includes(trait));

    // Assemble the final phenotype string like a quest reward description
    const phenotypeParts = [];
    if (traitsBeforeCoat.length > 0) phenotypeParts.push(traitsBeforeCoat.join(' '));
    phenotypeParts.push(coatColor);
    if (traitsAfterCoat.length > 0) phenotypeParts.push(traitsAfterCoat.join(' '));

    let phenotype = phenotypeParts.join(' ');

    // Tack on anomalies with "with" because even horses need accessories
    if (anomalies.length > 0) {
        phenotype += ' with ' + anomalies.join(', ');
    }

    return phenotype.trim();
}

function getGeneAlleles(gene) {
    // Crack a gene open like a dungeon chest to see what alleles are inside
    if (gene === 'EE' || gene === 'Ee' || gene === 'ee') {
        return gene.split('');
    }
    if (gene === 'AA' || gene === 'Aa' || gene === 'aa') {
        return gene.split('');
    }
    
    // n-prefix = heterozygous — one fancy allele, one normie
    if (gene.startsWith('n')) {
        return ['n', gene.substring(1)];
    }
    
    // Compound dilutions — two different dilutions sharing a locus like feuding roommates
    if (gene.includes('Cr') && gene.includes('prl')) {
        return ['Cr', 'prl'];  // Crprl
    }
    if (gene.includes('Tp') && gene.includes('prl')) {
        return ['Tp', 'prl'];  // Tpprl
    }
    if (gene.includes('Tp') && gene.includes('Cr')) {
        return ['Tp', 'Cr'];  // TpCr
    }

    // Ch and er have their own apartment (separate from the Cr/Tp/prl flat)
    if (gene.includes('Ch') && gene.includes('er')) {
        return ['Ch', 'er'];  // Cher
    }

    // Homozygous versions — when you bring TWO of the same allele to the party
    if (gene === 'CrCr') return ['Cr', 'Cr'];
    if (gene === 'TpTp') return ['Tp', 'Tp'];
    if (gene === 'prlprl') return ['prl', 'prl'];
    if (gene === 'erer') return ['er', 'er'];
    if (gene === 'ChCh') return ['Ch', 'Ch'];
    if (gene === 'DD') return ['D', 'D'];
    if (gene === 'TT') return ['T', 'T'];
    if (gene === 'GG') return ['G', 'G'];
    if (gene === 'RnRn') return ['Rn', 'Rn'];
    if (gene === 'LpLp') return ['Lp', 'Lp'];
    if (gene === 'ff') return ['f', 'f'];
    if (gene === 'spsp') return ['sp', 'sp'];
    if (gene === 'sfsf') return ['sf', 'sf'];
    if (gene === 'fefe') return ['fe', 'fe'];
    if (gene === 'lrlr') return ['lr', 'lr'];
    // White marking homozygous — spotty AND committed to it
    if (gene === 'OO') return ['O', 'O'];
    if (gene === 'SplSpl') return ['Spl', 'Spl'];
    if (gene === 'SbSb') return ['Sb', 'Sb'];
    if (gene === 'GiGi') return ['Gi', 'Gi'];
    if (gene === 'CoCo') return ['Co', 'Co'];
    if (gene === 'BB') return ['B', 'B'];
    if (gene === 'WW') return ['W', 'W'];
    if (gene === 'RbRb') return ['Rb', 'Rb'];
    if (gene === 'FlFl') return ['Fl', 'Fl'];
    if (gene === 'HqHq') return ['Hq', 'Hq'];
    if (gene === 'ShSh') return ['Sh', 'Sh'];
    if (gene === 'OsOs') return ['Os', 'Os'];
    if (gene === 'CuCu') return ['Cu', 'Cu'];
    if (gene === 'CwCw') return ['Cw', 'Cw'];
    
    // Modifier homozygous — double the modifier, double the drama
    if (gene === 'PP') return ['P', 'P'];
    if (gene === 'StySty') return ['Sty', 'Sty'];
    if (gene === 'GlGl') return ['Gl', 'Gl'];
    if (gene === 'ZZ') return ['Z', 'Z'];
    if (gene === 'TdTd') return ['Td', 'Td'];
    if (gene === 'VV') return ['V', 'V'];
    // Shared locus homozygous — twins in the same bunk bed
    if (gene === 'LuLu') return ['Lu', 'Lu'];
    if (gene === 'PrPr') return ['Pr', 'Pr'];
    if (gene === 'OpOp') return ['Op', 'Op'];
    // Compound heterozygous genes — the odd couples of the genetic world
    if (gene === 'Lusp') return ['Lu', 'sp'];
    if (gene === 'PrOp') return ['Pr', 'Op'];
    if (gene === 'CuCw') return ['Cu', 'Cw'];
    if (gene === 'BFl' || gene === 'FlB') return ['B', 'Fl'];
    if (gene === 'GiCo' || gene === 'CoGi') return ['Gi', 'Co'];
    // KIT locus compounds — the most crowded locus in all of horse genetics
    if (gene === 'TRn' || gene === 'RnT') return ['T', 'Rn'];
    if (gene === 'TSb' || gene === 'SbT') return ['T', 'Sb'];
    if (gene === 'TW' || gene === 'WT') return ['T', 'W'];
    if (gene === 'RnSb' || gene === 'SbRn') return ['Rn', 'Sb'];
    if (gene === 'RnW' || gene === 'WRn') return ['Rn', 'W'];
    if (gene === 'SbW' || gene === 'WSb') return ['Sb', 'W'];

    // Complex patterns — patn does its own weird thing
    if (gene === 'patnpatn') return ['patn', 'patn'];
    if (gene === 'patn') return ['patn'];

    return [gene];
}

function inheritGene(parent1Gene, parent2Gene, probability = 0.5) {
    const alleles1 = getGeneAlleles(parent1Gene);
    const alleles2 = getGeneAlleles(parent2Gene);
    
    // Randomly yoink one allele from each parent — Mendel's coin flip of destiny
    const from1 = alleles1[Math.random() < 0.5 ? 0 : Math.min(1, alleles1.length - 1)];
    const from2 = alleles2[Math.random() < 0.5 ? 0 : Math.min(1, alleles2.length - 1)];
    
    return combineAlleles(from1, from2);
}

function combineAlleles(allele1, allele2) {
    // Smash two alleles together like a genetic blacksmith forging a gene on an anvil
    if (allele1 === allele2) {
        // Homozygous — they're the same picture
        if (allele1 === 'E' || allele1 === 'e') return allele1 + allele1;
        if (allele1 === 'A' || allele1 === 'a') return allele1 + allele1;
        if (allele1 === 'Cr') return 'CrCr';
        if (allele1 === 'Tp') return 'TpTp';
        if (allele1 === 'prl') return 'prlprl';
        if (allele1 === 'er') return 'erer';
        if (allele1 === 'Ch') return 'ChCh';
        if (allele1 === 'D') return 'DD';
        if (allele1 === 'T') return 'TT';
        if (allele1 === 'G') return 'GG';
        if (allele1 === 'Rn') return 'RnRn';
        if (allele1 === 'Lp') return 'LpLp';
        if (allele1 === 'f') return 'ff';
        if (allele1 === 'sp') return 'spsp';
        if (allele1 === 'sf') return 'sfsf';
        if (allele1 === 'fe') return 'fefe';
        if (allele1 === 'lr') return 'lrlr';
        if (allele1 === 'patn') return 'patnpatn';
        // White marking homozygous — double trouble edition
        if (allele1 === 'O') return 'OO';
        if (allele1 === 'Spl') return 'SplSpl';
        if (allele1 === 'Sb') return 'SbSb';
        if (allele1 === 'Gi') return 'GiGi';
        if (allele1 === 'Co') return 'CoCo';
        if (allele1 === 'B') return 'BB';
        if (allele1 === 'W') return 'WW';
        if (allele1 === 'Rb') return 'RbRb';
        if (allele1 === 'Fl') return 'FlFl';
        if (allele1 === 'Hq') return 'HqHq';
        if (allele1 === 'Sh') return 'ShSh';
        if (allele1 === 'Os') return 'OsOs';
        if (allele1 === 'Cu') return 'CuCu';
        if (allele1 === 'Cw') return 'CwCw';
        if (allele1 === 'P') return 'PP';
        if (allele1 === 'Sty') return 'StySty';
        if (allele1 === 'Gl') return 'GlGl';
        if (allele1 === 'Z') return 'ZZ';
        if (allele1 === 'Td') return 'TdTd';
        if (allele1 === 'V') return 'VV';
        if (allele1 === 'Lu') return 'LuLu';
        if (allele1 === 'Pr') return 'PrPr';
        if (allele1 === 'Op') return 'OpOp';

        return allele1 + allele1;
    }
    
    // Heterozygous — one of each, the genetic equivalent of ordering one of everything
    if ((allele1 === 'E' && allele2 === 'e') || (allele1 === 'e' && allele2 === 'E')) return 'Ee';
    if ((allele1 === 'A' && allele2 === 'a') || (allele1 === 'a' && allele2 === 'A')) return 'Aa';
    
    // Dilution combinations — mixing potions at the locus-level alchemy table
    if ((allele1 === 'Cr' && allele2 === 'prl') || (allele1 === 'prl' && allele2 === 'Cr')) return 'Crprl';
    if ((allele1 === 'Tp' && allele2 === 'prl') || (allele1 === 'prl' && allele2 === 'Tp')) return 'Tpprl';
    if ((allele1 === 'Tp' && allele2 === 'Cr') || (allele1 === 'Cr' && allele2 === 'Tp')) return 'TpCr';

    // Ch/er — they have their own locus and frankly prefer it that way
    if ((allele1 === 'Ch' && allele2 === 'er') || (allele1 === 'er' && allele2 === 'Ch')) return 'Cher';

    // Shared locus compounds — genetic roommate pairings that somehow work out
    if ((allele1 === 'B' && allele2 === 'Fl') || (allele1 === 'Fl' && allele2 === 'B')) return 'BFl';
    if ((allele1 === 'Cu' && allele2 === 'Cw') || (allele1 === 'Cw' && allele2 === 'Cu')) return 'CuCw';
    if ((allele1 === 'Gi' && allele2 === 'Co') || (allele1 === 'Co' && allele2 === 'Gi')) return 'GiCo';
    if ((allele1 === 'Lu' && allele2 === 'sp') || (allele1 === 'sp' && allele2 === 'Lu')) return 'Lusp';
    if ((allele1 === 'Pr' && allele2 === 'Op') || (allele1 === 'Op' && allele2 === 'Pr')) return 'PrOp';
    // KIT locus — four alleles crammed into one locus like clowns in a tiny carriage
    if ((allele1 === 'T' && allele2 === 'Rn') || (allele1 === 'Rn' && allele2 === 'T')) return 'TRn';
    if ((allele1 === 'T' && allele2 === 'Sb') || (allele1 === 'Sb' && allele2 === 'T')) return 'TSb';
    if ((allele1 === 'T' && allele2 === 'W') || (allele1 === 'W' && allele2 === 'T')) return 'TW';
    if ((allele1 === 'Rn' && allele2 === 'Sb') || (allele1 === 'Sb' && allele2 === 'Rn')) return 'RnSb';
    if ((allele1 === 'Rn' && allele2 === 'W') || (allele1 === 'W' && allele2 === 'Rn')) return 'RnW';
    if ((allele1 === 'Sb' && allele2 === 'W') || (allele1 === 'W' && allele2 === 'Sb')) return 'SbW';

    // For n + allele — one normal, one mutant, the classic odd couple
    if (allele1 === 'n') return 'n' + allele2;
    if (allele2 === 'n') return 'n' + allele1;
    
    // Shrug emoji — just mash 'em together and hope for the best
    return allele1 + allele2;
}

function inheritBaseCoat(parent1Genes, parent2Genes) {
    // Gregor Mendel did not die for us to skip this step
    const p1E = parent1Genes.find(g => g.match(/^[Ee][Ee]?$/));
    const p1A = parent1Genes.find(g => g.match(/^[Aa][Aa]?$/));
    const p2E = parent2Genes.find(g => g.match(/^[Ee][Ee]?$/));
    const p2A = parent2Genes.find(g => g.match(/^[Aa][Aa]?$/));

    const eGene = inheritGene(p1E || 'Ee', p2E || 'Ee');
    const aGene = inheritGene(p1A || 'Aa', p2A || 'Aa');

    return [eGene, aGene];
}

function generateFoal(parent1, parent2, variation) {
    const p1 = parseGenotype(parent1.genotype);
    const p2 = parseGenotype(parent2.genotype);

    const foalGenes = [];
    const foalAnomalies = [];

    // Base coat — rolling the Punnett square dice in Mendel's honor
    const [eGene, aGene] = inheritBaseCoat(p1.genes, p2.genes);
    foalGenes.push(eGene, aGene);

    // Helper to rummage through a parent's genetic saddlebag
    function findGene(genes, pattern) {
        return genes.find(g => {
            if (typeof pattern === 'string') {
                return g.includes(pattern);
            }
            return pattern.test(g);
        });
    }

    // Dilutions — two separate loci doing their own thing, like parallel dungeon corridors
    const p1Dilution1 = findGene(p1.genes, /Cr|Tp|prl/);
    const p2Dilution1 = findGene(p2.genes, /Cr|Tp|prl/);

    if (p1Dilution1 || p2Dilution1) {
        const dilutionGene = inheritGene(p1Dilution1 || 'nn', p2Dilution1 || 'nn');
        if (dilutionGene !== 'nn' && dilutionGene !== 'n') {
            foalGenes.push(dilutionGene);
        }
    }

    // Ch/er locus — the Champagne and Ether wing of the genetics dungeon
    const p1ChEr = findGene(p1.genes, /Ch|er/);
    const p2ChEr = findGene(p2.genes, /Ch|er/);

    if (p1ChEr || p2ChEr) {
        const chErGene = inheritGene(p1ChEr || 'nn', p2ChEr || 'nn');
        if (chErGene !== 'nn' && chErGene !== 'n') {
            foalGenes.push(chErGene);
        }
    }

    // Leopard complex — Lp and patn live on different floors but text each other constantly
    const p1Lp = findGene(p1.genes, 'Lp');
    const p2Lp = findGene(p2.genes, 'Lp');
    const p1patn = findGene(p1.genes, 'patn');
    const p2patn = findGene(p2.genes, 'patn');

    if (p1Lp || p2Lp) {
        const lpGene = inheritGene(p1Lp || 'nn', p2Lp || 'nn');
        if (lpGene !== 'nn' && lpGene !== 'n') {
            foalGenes.push(lpGene);
        }
    }

    if (p1patn || p2patn) {
        const patnGene = inheritGene(p1patn || 'nn', p2patn || 'nn');
        if (patnGene !== 'nn' && patnGene !== 'n') {
            foalGenes.push(patnGene);
        }
    }

    // White markings — shared loci travel in pairs like dungeon party members
    // KIT locus: T, Rn, Sb, W (max 2 per horse — there's only so much room at this inn)
    const kitPattern = /^(nT|TT|nRn|RnRn|nSb|SbSb|nW|WW|TRn|RnT|TSb|SbT|TW|WT|RnSb|SbRn|RnW|WRn|SbW|WSb)$/;
    const p1Kit = findGene(p1.genes, kitPattern);
    const p2Kit = findGene(p2.genes, kitPattern);
    if (p1Kit || p2Kit) {
        const inherited = inheritGene(p1Kit || 'nn', p2Kit || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // B/Fl locus — Blanched and False Leopard sharing a bunk
    const bFlPattern = /^(nB|BB|nFl|FlFl|BFl|FlB)$/;
    const p1BFl = findGene(p1.genes, bFlPattern);
    const p2BFl = findGene(p2.genes, bFlPattern);
    if (p1BFl || p2BFl) {
        const inherited = inheritGene(p1BFl || 'nn', p2BFl || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // Cu/Cw locus — Cuirass and Crowned, the armor-and-tiara power couple
    const cuCwPattern = /^(nCu|CuCu|nCw|CwCw|CuCw)$/;
    const p1CuCw = findGene(p1.genes, cuCwPattern);
    const p2CuCw = findGene(p2.genes, cuCwPattern);
    if (p1CuCw || p2CuCw) {
        const inherited = inheritGene(p1CuCw || 'nn', p2CuCw || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // Gi/Co locus — belt meets necklace, equine fashion week
    const giCoPattern = /^(nGi|GiGi|nCo|CoCo|GiCo|CoGi)$/;
    const p1GiCo = findGene(p1.genes, giCoPattern);
    const p2GiCo = findGene(p2.genes, giCoPattern);
    if (p1GiCo || p2GiCo) {
        const inherited = inheritGene(p1GiCo || 'nn', p2GiCo || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // These markings each get their own private suite — solo locus vibes
    const independentMarkings = ['O', 'Spl', 'Rb', 'Hq', 'Sh', 'Os'];
    independentMarkings.forEach(name => {
        const p1Gene = findGene(p1.genes, new RegExp(`^(n${name}|${name}${name})$`));
        const p2Gene = findGene(p2.genes, new RegExp(`^(n${name}|${name}${name})$`));

        if (p1Gene || p2Gene) {
            const inherited = inheritGene(p1Gene || 'nn', p2Gene || 'nn');
            if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
                foalGenes.push(inherited);
            }
        }
    });

    // Modifiers — the seasoning on this genetic stew, shared loci served first
    // Lu/sp locus — Illuminated and Sepulchered, light vs dark in one address
    const luSpPattern = /^(nLu|LuLu|nsp|spsp|Lusp)$/;
    const p1LuSp = findGene(p1.genes, luSpPattern);
    const p2LuSp = findGene(p2.genes, luSpPattern);
    if (p1LuSp || p2LuSp) {
        const inherited = inheritGene(p1LuSp || 'nn', p2LuSp || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // Pr/Op locus — Prism and Opal, the sparkle twins
    const prOpPattern = /^(nPr|PrPr|nOp|OpOp|PrOp)$/;
    const p1PrOp = findGene(p1.genes, prOpPattern);
    const p2PrOp = findGene(p2.genes, prOpPattern);
    if (p1PrOp || p2PrOp) {
        const inherited = inheritGene(p1PrOp || 'nn', p2PrOp || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // These modifiers each live alone — independent loci for independent genes
    const independentModifiers = [
        { pattern: /^(nD|DD)$/, name: 'D' },
        { pattern: /^(nP|PP)$/, name: 'P' },
        { pattern: /^(nSty|StySty)$/, name: 'Sty' },
        { pattern: /^(nG|GG)$/, name: 'G' },
        { pattern: /^(nf|ff)$/, name: 'f' },
        { pattern: /^(nZ|ZZ)$/, name: 'Z' },
        { pattern: /^(nTd|TdTd)$/, name: 'Td' },
        { pattern: /^(nGl|GlGl)$/, name: 'Gl' },
        { pattern: /^(nV|VV)$/, name: 'V' },
        { pattern: /^(nsf|sfsf)$/, name: 'sf' },
        { pattern: /^(nfe|fefe)$/, name: 'fe' },
        { pattern: /^(nlr|lrlr)$/, name: 'lr' }
    ];

    independentModifiers.forEach(({ pattern, name }) => {
        const p1Gene = findGene(p1.genes, pattern);
        const p2Gene = findGene(p2.genes, pattern);

        if (p1Gene || p2Gene) {
            const inherited = inheritGene(p1Gene || 'nn', p2Gene || 'nn');
            if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
                foalGenes.push(inherited);
            }
        }
    });
    
    // Anomalies — 25% chance each, like finding a weird mushroom in the dungeon
    [...p1.anomalies, ...p2.anomalies].forEach(anomaly => {
        if (Math.random() < 0.25) {
            if (!foalAnomalies.includes(anomaly)) {
                foalAnomalies.push(anomaly);
            }
        }
    });
    
    // 5% chance of a wild anomaly appearing — nature's loot box
    if (Math.random() < 0.05) {
        const randomAnomalies = ['Bend-or Spots', 'Birdcatcher Spots', 'Brindle', 'Chimera', 
                                'Geode', 'Ore', 'Stained Glass', 'Kintsugi', 'Swarf', 'Vitiligo',
                                'Oracle', 'Signet', 'Pennant', 'Pastiche', 'Fresco', 'Lantern'];
        const random = randomAnomalies[Math.floor(Math.random() * randomAnomalies.length)];
        if (!foalAnomalies.includes(random)) {
            foalAnomalies.push(random);
        }
    }
    
    // Variant inheritance — will the foal be a special edition? The RNG gods decide
    const p1V = parent1.variant && parent1.variant !== 'Standard' ? parent1.variant : '';
    const p2V = parent2.variant && parent2.variant !== 'Standard' ? parent2.variant : '';
    let variant = '';
    if (p1V && p1V === p2V) {
        // Both parents share the same variant — guaranteed inheritance, finally something easy
        variant = p1V;
    } else {
        // Each non-Standard parent rolls the dice independently — 25% odds, no pressure
        const variantCandidates = [];
        if (p1V && Math.random() < 0.25) variantCandidates.push(p1V);
        if (p2V && Math.random() < 0.25) variantCandidates.push(p2V);
        if (variantCandidates.length > 0) {
            variant = variantCandidates[Math.floor(Math.random() * variantCandidates.length)];
        }
    }
    // No spontaneous variants: a foal can only inherit a variant a parent actually
    // carries (25% each). The 5% random roll is for ANOMALIES, not variants.

    // Temperament — foals are contractually obligated to be nothing like their parents (relatable)
    const temperaments = ['Choleric', 'Melancholic', 'Phlegmatic', 'Sanguine'];
    const availableTemps = temperaments.filter(t => t !== parent1.temperament && t !== parent2.temperament);
    const temperament = availableTemps[Math.floor(Math.random() * availableTemps.length)];
    
    return {
        genotype: foalGenes.join(' ') + (foalAnomalies.length > 0 ? ' + ' + foalAnomalies.join(', ') : ''),
        temperament: temperament,
        variant: variant || 'Standard'
    };
}

function generateFoals() {
    const parent1 = {
        genotype: document.getElementById('parent1Geno').value.trim(),
        temperament: document.getElementById('parent1Temp').value,
        variant: document.getElementById('parent1Variant').value || 'Standard'
    };
    
    const parent2 = {
        genotype: document.getElementById('parent2Geno').value.trim(),
        temperament: document.getElementById('parent2Temp').value,
        variant: document.getElementById('parent2Variant').value || 'Standard'
    };
    
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.style.display = 'none';
    
    // Validation — you WILL fill out the form correctly or so help me
    if (!parent1.genotype || !parent2.genotype) {
        errorMsg.textContent = 'Please enter genotypes for both parents!';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (!parent1.temperament || !parent2.temperament) {
        errorMsg.textContent = 'Please select temperaments for both parents!';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (parent1.temperament === parent2.temperament) {
        // Handbook: two horses with the same Temperament can never breed, no bypass.
        errorMsg.textContent = `These two can't breed: both are ${parent1.temperament}. Parents must have different temperaments.`;
        errorMsg.style.display = 'block';
        if (window.AppShell && window.AppShell.toast) {
            window.AppShell.toast(`Both parents are ${parent1.temperament} — they can't breed.`, 'error');
        }
        return;
    }

    // Every breeding has a 5% chance of twins (handbook): two separate foals,
    // each with their own set of possibilities.
    const litters = [makeLitter(parent1, parent2)];
    if (Math.random() < 0.05) litters.push(makeLitter(parent1, parent2));

    displayFoals(litters);
}

// One foal's worth of possibilities (4 equally-likely outcomes).
function makeLitter(parent1, parent2) {
    const foals = [];
    for (let i = 0; i < 4; i++) foals.push(generateFoal(parent1, parent2, i));
    return foals;
}

function buildFoalCard(foal, index, parent1Geno, parent2Geno) {
        const card = document.createElement('div');
        card.className = 'foal-card';

        const rarityScore = calculateRarity(foal.genotype);
        const rarityClass = getRarityClass(rarityScore);
        const phenotype = genotypeToPhenotype(foal.genotype);

        // Check if this foal decided to be extra and roll Chimera
        const hasChimera = foal.genotype.toLowerCase().includes('chimera');

        let chimeraSection = '';
        if (hasChimera) {
            const chimeraPossibilities = generateChimeraPossibilities(foal.genotype, parent1Geno, parent2Geno);

            const totalOptions = chimeraPossibilities.baseCoats.length +
                                chimeraPossibilities.dilutions.length +
                                chimeraPossibilities.whiteMarkings.length +
                                chimeraPossibilities.modifiers.length +
                                chimeraPossibilities.anomalies.length;

            const locusInfo = chimeraPossibilities.locusInfo;
            const mandatoryBadge = '<span style="background: #a02b2b; color: #e0b4b4; font-size: 0.7em; padding: 1px 5px; margin-left: 6px; font-weight: 600; letter-spacing: 0.03em;">MANDATORY</span>';
            const optionalBadge = '<span style="background: #ececee; color: #8a8f98; font-size: 0.7em; padding: 1px 5px; margin-left: 6px; font-weight: 600; letter-spacing: 0.03em;">OPTIONAL</span>';

            // Build marking locus breakdown — a family tree within a family tree, we need to go deeper
            let markingLocusHtml = '';
            if (locusInfo.markingLoci.length > 0) {
                markingLocusHtml = locusInfo.markingLoci.map(locus => {
                    const badge = locus.mandatory ? mandatoryBadge : optionalBadge;
                    return `<div style="margin-top: 4px; padding-left: 8px; border-left: 2px solid ${locus.mandatory ? '#a02b2b' : '#ececee'};">
                        <span style="color: #7d6a86; font-size: 0.75em; font-weight: 600;">${locus.name}${badge}</span>
                        <div style="color: #6f6877; font-size: 0.8em;">${locus.traits.join(', ')}</div>
                    </div>`;
                }).join('');
            }

            chimeraSection = `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #dcd8de;">
                    <strong style="color: #8a4fc0; display: block; margin-bottom: 10px;">🎨 Chimera Possibilities:</strong>
                    <div style="background: #f7f5f3; padding: 12px; margin-bottom: 10px; border-left: 3px solid #8a4fc0;">
                        ${chimeraPossibilities.baseCoats.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #5d4b60; font-size: 0.85em;">Base Coats (${chimeraPossibilities.baseCoats.length})${mandatoryBadge}</strong>
                                <div style="color: #6f6877; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.baseCoats.join(', ')}</div>
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.dilutions.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #3f74b8; font-size: 0.85em;">Dilutions (${chimeraPossibilities.dilutions.length})${locusInfo.dilutionMandatory ? mandatoryBadge : optionalBadge}</strong>
                                ${locusInfo.dilutionLociNotes.length > 0 ? `<div style="color: #8a8f98; font-size: 0.7em; margin-top: 2px; font-style: italic;">Guaranteed: ${locusInfo.dilutionLociNotes.join(', ')}</div>` : ''}
                                <div style="color: #6f6877; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.dilutions.join(', ')}</div>
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.whiteMarkings.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #8a4fc0; font-size: 0.85em;">Markings (${chimeraPossibilities.whiteMarkings.length})</strong>
                                ${markingLocusHtml}
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.modifiers.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #5f8a3f; font-size: 0.85em;">Modifiers (${chimeraPossibilities.modifiers.length})${optionalBadge}</strong>
                                <div style="color: #6f6877; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.modifiers.join(', ')}</div>
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.anomalies.length > 0 ? `
                            <div>
                                <strong style="color: #c8902e; font-size: 0.85em;">Anomalies (${chimeraPossibilities.anomalies.length})${optionalBadge}</strong>
                                <div style="color: #6f6877; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.anomalies.join(', ')}</div>
                            </div>
                        ` : ''}
                    </div>
                    <button onclick='fillChimeraCalculator("${foal.genotype.replace(/'/g, "&#39;")}", "${parent1Geno.replace(/'/g, "&#39;")}", "${parent2Geno.replace(/'/g, "&#39;")}")'
                            style="margin-top: 10px; padding: 8px 12px; background: var(--dc-mauve); color: #fff; border: 1px solid var(--dc-mauve); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-stamp); text-transform: uppercase; letter-spacing: var(--tracking-stamp); font-weight: 600; width: 100%; font-size: 0.85em;">
                        View Full Chimera Breakdown
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <h3>Foal Option ${index + 1}</h3>
            <div class="foal-detail">
                <strong>Variant:</strong>
                <span>${foal.variant}</span>
            </div>
            <div class="foal-detail">
                <strong>Temperament:</strong>
                <span>${foal.temperament}</span>
            </div>
            <div class="foal-detail">
                <strong>Phenotype:</strong>
                <span>${phenotype}</span>
            </div>
            <div class="foal-detail">
                <strong>Genotype:</strong>
                <span class="geno-copy" data-geno="${foal.genotype.replace(/"/g, '&quot;')}" title="Click to copy genotype">${foal.genotype} <span class="copy-hint">⧉</span></span>
            </div>
            <span class="rarity-badge ${rarityClass}">Rarity: ${rarityScore}</span>
            ${chimeraSection}
        `;

        return card;
}

function displayFoals(litters) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsTitle = resultsContainer.querySelector('.results-title');

    resultsGrid.innerHTML = '';

    // Grab parent genotypes in case any foal has the audacity to be a Chimera
    const parent1Geno = document.getElementById('parent1Geno').value.trim();
    const parent2Geno = document.getElementById('parent2Geno').value.trim();

    const twins = litters.length > 1;
    if (resultsTitle) resultsTitle.textContent = twins ? 'Twins! Two foals 🐴🐴' : 'The possible foals';
    // For twins we stack two labelled sections; for one foal we use the grid directly.
    resultsGrid.style.display = twins ? 'block' : '';

    if (twins) {
        litters.forEach((foals, li) => {
            const section = document.createElement('div');
            const heading = document.createElement('h3');
            heading.className = 'twin-heading';
            heading.textContent = 'Twin ' + (li + 1);
            section.appendChild(heading);
            const grid = document.createElement('div');
            grid.className = 'results-grid';
            foals.forEach((foal, index) => grid.appendChild(buildFoalCard(foal, index, parent1Geno, parent2Geno)));
            section.appendChild(grid);
            resultsGrid.appendChild(section);
        });
    } else {
        litters[0].forEach((foal, index) => resultsGrid.appendChild(buildFoalCard(foal, index, parent1Geno, parent2Geno)));
    }

    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function calculateRarity(genotype) {
    let score = 0;

    // Legendary coat combos — triple dilutions so rare they have their own theme music
    if (genotype.includes('Tpprl') && genotype.includes('erer')) score += 100;
    if (genotype.includes('Tpprl') && genotype.includes('Ch')) score += 100;
    if (genotype.includes('Crprl') && genotype.includes('Ch')) score += 100;
    if (genotype.includes('Crprl') && genotype.includes('erer')) score += 100;
    if (genotype.includes('TpCr') && genotype.includes('erer')) score += 100;
    if (genotype.includes('TpCr') && genotype.includes('Ch')) score += 100;
    // Legendary markings/modifiers — the "screenshot this immediately" tier
    if (genotype.includes('fefe')) score += 100;
    if (genotype.includes('nOs')) score += 100;
    if (genotype.includes('nPr')) score += 100;
    if (genotype.includes('sfsf')) score += 100;

    // Epic coat combos — double dilutions that'll make your stablemates jealous
    if (genotype.includes('Tpprl') && score < 100) score += 50;
    if (genotype.includes('Crprl') && score < 100) score += 50;
    if (genotype.includes('nCr') && genotype.includes('nCh') && score < 100) score += 50;
    if (genotype.includes('nCr') && genotype.includes('erer') && score < 100) score += 50;
    if (genotype.includes('nTp') && genotype.includes('nCh') && score < 100) score += 50;
    if (genotype.includes('nTp') && genotype.includes('erer') && score < 100) score += 50;
    if (genotype.includes('prlprl') && genotype.includes('Ch') && score < 100) score += 50;
    if (genotype.includes('prlprl') && genotype.includes('erer') && score < 100) score += 50;
    // Epic markings/modifiers — the "ooh, shiny" genes
    if (genotype.includes('nSh')) score += 50;
    if (genotype.includes('nHq')) score += 50;
    if (genotype.includes('nOp')) score += 50;
    if (genotype.includes('LpLp patnpatn')) score += 50;
    if (genotype.includes('lrlr')) score += 50;
    // Carriers — they have it in their pocket but refuse to show anyone
    if (genotype.includes('nfe')) score += 25;
    if (genotype.includes('nsf')) score += 25;
    if (genotype.includes('nlr')) score += 25;

    // Rare coat colors — uncommon enough to brag about in the tavern
    if (genotype.includes('nCh') && score < 50) score += 25;
    if (genotype.includes('CrCr') && score < 50) score += 25;
    if (genotype.includes('prlprl') && score < 50) score += 25;
    if (genotype.includes('TpCr') && score < 50) score += 25;
    if (genotype.includes('erer') && score < 50) score += 25;
    // Rare markings/modifiers — decent dungeon loot, not quite boss-drop tier
    if (genotype.includes('nTd')) score += 25;
    if (genotype.includes('nGl')) score += 25;
    if (genotype.includes('nFl')) score += 25;
    if (genotype.includes('nW')) score += 25;
    if (genotype.includes('nRb')) score += 25;
    if (genotype.includes('nV')) score += 25;

    return score;
}

function getRarityClass(score) {
    if (score >= 100) return 'legendary';
    if (score >= 50) return 'epic';
    if (score >= 25) return 'rare';
    if (score >= 10) return 'uncommon';
    return 'common';
}

// Custom Scroll Generator — the gacha machine of horse genetics, sorted by how jealous you'll make people
const RARITY_GENES = {
    legendary: {
        coatColors: [
            // Triple dilutions — three flavors of fancy stacked like a genetics parfait
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Tpprl', 'erer'] },  // Tyrian Pearl Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Tpprl', 'erer'] }, // Phthalo Pearl Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Tpprl', 'erer'] }, // Ochre Pearl Ether
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Tpprl', 'nCh'] }, // Tyrian Pearl Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Tpprl', 'nCh'] }, // Phthalo Pearl Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Tpprl', 'nCh'] }, // Ochre Pearl Champagne
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Crprl', 'erer'] }, // Ombre Cream Pearl Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Crprl', 'erer'] }, // Classic Cream Pearl Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Crprl', 'erer'] }, // Cold Cream Pearl Ether
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Crprl', 'nCh'] }, // Amber Cream Pearl Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Crprl', 'nCh'] }, // Classic Cream Pearl Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Crprl', 'nCh'] }, // Gold Cream Pearl Champagne
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'TpCr', 'erer'] }, // Madder Cream Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'TpCr', 'erer'] }, // Woad Cream Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'TpCr', 'erer'] }, // Weld Cream Ether
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'TpCr', 'nCh'] }, // Madder Cream Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'TpCr', 'nCh'] }, // Woad Cream Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'TpCr', 'nCh'] } // Weld Cream Champagne
        ],
        markings: ['fefe', 'nOs'],
        modifiers: ['nPr', 'sfsf']
    },
    epic: {
        coatColors: [
            // Two dilutions across both loci — fancy enough to need reservations
            // Cream Champagne (Cr + Ch) — expensive tastes
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCr', 'nCh'] }, // Amber Cream Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCr', 'nCh'] }, // Classic Cream Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCr', 'nCh'] }, // Gold Cream Champagne
            // Cream Pearl (Crprl) — two different dilutions forced to share a locus
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Crprl'] }, // Buckskin Pearl
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Crprl'] }, // Smoky Black Pearl
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Crprl'] }, // Palomino Pearl
            // Pearl Champagne (prlprl + Ch) — shimmery AND bubbly at the gala
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'prlprl', 'nCh'] }, // Bay Pearl Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'prlprl', 'nCh'] }, // Black Pearl Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'prlprl', 'nCh'] }, // Gold Pearl Champagne
            // Tapestry Champagne (Tp + Ch) — a woven wall hanging at a fancy party
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nTp', 'nCh'] }, // Madder Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nTp', 'nCh'] }, // Woad Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nTp', 'nCh'] }, // Weld Champagne
            // Tapestry Pearl (Tpprl) — medieval handicraft meets oyster treasure
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Tpprl'] }, // Tyrian Pearl
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Tpprl'] }, // Phthalo Pearl
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Tpprl'] }, // Ochre Pearl
            // Cream Ether (Cr + erer) — half ghost, half cream puff
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCr', 'erer'] }, // Ombre Cream Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCr', 'erer'] }, // Classic Cream Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCr', 'erer'] }, // Cold Cream Ether
            // Tapestry Ether (Tp + erer) — a spectral tapestry you can almost see through
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nTp', 'erer'] }, // Madder Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nTp', 'erer'] }, // Woad Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nTp', 'erer'] }, // Weld Ether
            // Pearl Ether (prlprl + erer) — iridescent ghost horse, peak aesthetic
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'prlprl', 'erer'] }, // Bay Pearl Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'prlprl', 'erer'] }, // Black Pearl Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'prlprl', 'erer'] } // Gold Pearl Ether
        ],
        markings: ['nHq', 'LpLp patnpatn', 'nSh'],
        modifiers: ['nOp', 'lrlr']
    },
    rare: {
        coatColors: [
            // Champagne (nCh) — pop!
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCh'] }, // Amber Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCh'] }, // Classic Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCh'] }, // Gold Champagne
            // Double Cream (CrCr) — so creamy it's practically a dessert
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'CrCr'] }, // Perlino
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'CrCr'] }, // Smoky Cream
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'CrCr'] }, // Cremello
            // Pearl (prlprl) — recessive treasure, worth the wait
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'prlprl'] }, // Bay Pearl
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'prlprl'] }, // Black Pearl
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'prlprl'] }, // Gold Pearl
            // Tapestry Cream (TpCr) — tapestry meets cream filling, the eclair of genes
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'TpCr'] }, // Madder Buckskin
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'TpCr'] }, // Woad Smoky Black
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'TpCr'] }, // Weld Palomino
            // Ether (erer) — finally visible after lurking recessively for generations
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'erer'] }, // Ombre Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'erer'] }, // Classic Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'erer'] } // Cold Ether
        ],
        markings: ['nB', 'nLp patnpatn', 'LpLp patn', 'LpLp', 'nW', 'nRb', 'nFl'],
        modifiers: ['nTd', 'nGl', 'nV']
    },
    uncommon: {
        coatColors: [
            // Cream (nCr) — just a hint of dilution, like adding milk to dungeon coffee
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCr'] }, // Buckskin
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCr'] }, // Smoky Black
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCr'] }, // Palomino
            // Tapestry (nTp) — one dose of woven-wall-hanging energy
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nTp'] }, // Madder
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nTp'] }, // Woad
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nTp'] } // Weld
        ],
        markings: ['nCu', 'nCw', 'nO', 'nLp patn', 'nSb', 'nGi', 'nCo'],
        modifiers: ['nf', 'nZ', 'nLu', 'nsp']
    },
    common: {
        coatColors: [
            { baseCoat: 'Bay', genes: ['Ee', 'AA'] },
            { baseCoat: 'Black', genes: ['Ee', 'aa'] },
            { baseCoat: 'Chestnut', genes: ['ee', 'AA'] }
        ],
        markings: ['nSpl', 'nRn', 'nT', 'nLp'],
        modifiers: ['nD', 'nP', 'nSty', 'nG']
    }
};

const TEMPERAMENTS = ['Choleric', 'Melancholic', 'Phlegmatic', 'Sanguine'];
const VARIANTS = ['Standard', 'Heraldic', 'Puck', 'Cavedweller', 'Restored'];
const ALL_ANOMALIES = [
    'Bend-or Spots', 'Birdcatcher Spots', 'Brindle', 'Chimera',
    'Geode', 'Ore', 'Stained Glass', 'Kintsugi', 'Swarf', 'Vitiligo',
    'Oracle', 'Signet', 'Pennant', 'Pastiche', 'Fresco', 'Lantern'
];

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateCustomScroll(rarity) {
    const rarityKey = rarity.toLowerCase();
    const rarityData = RARITY_GENES[rarityKey];

    if (!rarityData) {
        alert('Invalid rarity level!');
        return null;
    }

    // Build the menu of coats available at this rarity tier (no substitutions)
    let availableCoatColors = [...rarityData.coatColors];

    // Collect markings/modifiers from this tier and below — you can always slum it
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const rarityIndex = rarityOrder.indexOf(rarityKey);

    let availableMarkings = [];
    let availableModifiers = [];

    for (let i = 0; i <= rarityIndex; i++) {
        const currentRarity = rarityOrder[i];
        availableMarkings = availableMarkings.concat(RARITY_GENES[currentRarity].markings);
        availableModifiers = availableModifiers.concat(RARITY_GENES[currentRarity].modifiers);
    }

    // Conjure forth a horse from the scroll's arcane randomness
    const genes = [];

    // 1. Spin the coat color wheel of fortune
    const selectedCoat = getRandomElement(availableCoatColors);
    genes.push(...selectedCoat.genes);

    // 2. Blindly reach into the trait grab-bag — what do we get??
    const allTraits = [...availableMarkings, ...availableModifiers];
    if (allTraits.length > 0) {
        const selectedTrait = getRandomElement(allTraits);
        // Handle multi-gene traits — some come as a package deal, like Fewspot's "LpLp patnpatn"
        if (selectedTrait.includes(' ')) {
            selectedTrait.split(' ').forEach(g => genes.push(g));
        } else {
            genes.push(selectedTrait);
        }
    }

    // 3. 10% chance the scroll throws in a bonus anomaly — dealer's choice
    const anomalies = [];
    if (Math.random() < 0.10) {
        anomalies.push(getRandomElement(ALL_ANOMALIES));
    }

    // 4. 5% chance the scroll goes "surprise! you're special now"
    let variant = 'Standard';
    if (Math.random() < 0.05) {
        const nonStandardVariants = VARIANTS.filter(v => v !== 'Standard');
        variant = getRandomElement(nonStandardVariants);
    }

    // 5. Random temperament — the horse's personality is non-negotiable
    const temperament = getRandomElement(TEMPERAMENTS);

    // Stitch the genotype string together like a scroll inscription
    let genotype = genes.join(' ');
    if (anomalies.length > 0) {
        genotype += ' + ' + anomalies.join(', ');
    }

    return {
        genotype: genotype,
        temperament: temperament,
        variant: variant,
        rarity: rarity
    };
}

function displayCustomScrollResult() {
    const raritySelect = document.getElementById('scrollRarity');
    const rarity = raritySelect.value;

    const result = generateCustomScroll(rarity);
    if (!result) return;

    const resultDiv = document.getElementById('scrollResult');
    const phenotype = genotypeToPhenotype(result.genotype);
    const rarityScore = calculateRarity(result.genotype);
    const rarityClass = getRarityClass(rarityScore);

    resultDiv.innerHTML = `
        <div class="scroll-result-card">
            <h3>Your ${rarity} Custom Scroll Creation</h3>
            <div class="result-section">
                <h4>Phenotype:</h4>
                <p class="phenotype">${phenotype}</p>
            </div>
            <div class="result-section">
                <h4>Genotype:</h4>
                <p class="geno">${result.genotype}</p>
            </div>
            <div class="result-section">
                <h4>Stats:</h4>
                <p><strong>Temperament:</strong> ${result.temperament}</p>
                <p><strong>Variant:</strong> ${result.variant}</p>
                <span class="rarity-badge ${rarityClass}">Rarity: ${rarityScore}</span>
            </div>
            <button onclick="displayCustomScrollResult()"
                    style="margin-top: 15px; padding: 10px 20px; background: #dcd8de; color: #5d4b60; border: 2px solid #5d4b60; cursor: pointer; font-weight: 600;">
                Generate Another
            </button>
        </div>
    `;

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Breeding Search — the matchmaking service for your pixel horses, swipe right on genetics
function searchBreeding() {
    const query = document.getElementById('breedingQuery').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');
    const resultsContent = document.getElementById('searchResultsContent');
    
    if (!query) {
        if (window.AppShell) window.AppShell.toast('Type a breeding question first, like "How can I make Amber Champagne?"', 'error');
        else alert('Please enter a breeding question!');
        return;
    }

    if (horseCollection.length === 0) {
        if (window.AppShell) window.AppShell.toast('Your stable is empty. Add or import horses in the Collection tab first.', 'error');
        else alert('Please upload your horse collection CSV first!');
        return;
    }
    
    resultsContent.innerHTML = '';

    // Decode the breeder's desperate plea into actual searchable traits
    const targetTraits = extractTraitsFromQuery(query);

    if (targetTraits.length === 0) {
        resultsContent.innerHTML = '<p style="color: #6f6877;">Could not identify specific traits in your query. Try asking like: "How can I make Amber Champagne?" or "Who can breed for fewspot?"</p>';
        resultsDiv.style.display = 'block';
        return;
    }

    // Send the matchmaking algorithm into the collection to find compatible pairs
    const matches = findBreedingMatches(targetTraits);

    if (matches.length === 0) {
        resultsContent.innerHTML = `<p style="color: #6f6877;">No breeding pairs found in your collection that can produce: <strong style="color: #5d4b60;">${targetTraits.join(', ')}</strong></p>`;
    } else {
        // Stash these matches for the grand reveal in the modal
        lastSearchMatches = matches;
        lastSearchTraits = targetTraits;

        resultsContent.innerHTML = `
            <p style="color: #6f6877; margin-bottom: 15px;">Found <strong style="color: #5d4b60;">${matches.length}</strong> possible breeding pair(s) for: <strong style="color: #5d4b60;">${targetTraits.join(', ')}</strong></p>
            <button onclick="openSearchModal()"
                    style="padding: 12px 24px; background: var(--dc-mauve); color: #fff; border: 1px solid var(--dc-mauve); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-stamp); text-transform: uppercase; letter-spacing: var(--tracking-stamp); font-size: 0.9em; letter-spacing: 1px; transition: all 0.2s;">
                View All Results
            </button>
        `;
    }

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Phase 4: remember this query so the shell can show recent searches.
    if (window.AppShell && window.AppShell.recordQuery) {
        window.AppShell.recordQuery(query, matches.length);
    }
}

let lastSearchMatches = [];
let lastSearchTraits = [];
const RESULTS_PER_PAGE = 10;
let currentModalPage = 0;

function openSearchModal() {
    currentModalPage = 0;
    renderModalPage();
    document.getElementById('searchModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSearchModal() {
    document.getElementById('searchModal').classList.remove('active');
    document.body.style.overflow = '';
}

function renderModalPage() {
    const modalBody = document.getElementById('modalBody');
    const modalPagination = document.getElementById('modalPagination');
    const totalPages = Math.ceil(lastSearchMatches.length / RESULTS_PER_PAGE);
    const start = currentModalPage * RESULTS_PER_PAGE;
    const end = Math.min(start + RESULTS_PER_PAGE, lastSearchMatches.length);
    const pageMatches = lastSearchMatches.slice(start, end);

    document.getElementById('modalTitle').textContent =
        `Results for: ${lastSearchTraits.join(', ')} (${lastSearchMatches.length} pairs)`;

    modalBody.innerHTML = '';
    pageMatches.forEach(match => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.style.cursor = 'pointer';
        const p1Pheno = genotypeToPhenotype(match.parent1.genotype);
        const p2Pheno = genotypeToPhenotype(match.parent2.genotype);
        item.innerHTML = `
            <h4>${match.parent1.name} &times; ${match.parent2.name}</h4>
            <p><strong>Parent 1:</strong> ${match.parent1.id} - ${match.parent1.temperament}</p>
            <p style="color: #5d4b60; font-size: 0.85em; margin: 4px 0;">${p1Pheno}</p>
            <span class="geno">${match.parent1.genotype}</span>
            <p><strong>Parent 2:</strong> ${match.parent2.id} - ${match.parent2.temperament}</p>
            <p style="color: #5d4b60; font-size: 0.85em; margin: 4px 0;">${p2Pheno}</p>
            <span class="geno">${match.parent2.genotype}</span>
            <p style="margin-top: 10px;"><strong style="color: #5d4b60;">Match Score:</strong> ${match.score} | <strong style="color: #5d4b60;">Probability:</strong> ${match.probability}</p>
        `;
        item.addEventListener('click', function() {
            fillParents(match.parent1, match.parent2);
            closeSearchModal();
        });
        modalBody.appendChild(item);
    });

    // Teleport the scroll back to the top — no one likes starting mid-page
    document.getElementById('searchModal').scrollTop = 0;

    // Pagination — because even dungeon scrolls have page numbers
    modalPagination.innerHTML = `
        <button onclick="changeModalPage(-1)" ${currentModalPage === 0 ? 'disabled' : ''}>Prev</button>
        <span class="page-info">Page ${currentModalPage + 1} of ${totalPages}</span>
        <button onclick="changeModalPage(1)" ${currentModalPage >= totalPages - 1 ? 'disabled' : ''}>Next</button>
    `;
}

function changeModalPage(delta) {
    const totalPages = Math.ceil(lastSearchMatches.length / RESULTS_PER_PAGE);
    currentModalPage = Math.max(0, Math.min(currentModalPage + delta, totalPages - 1));
    renderModalPage();
}

function extractTraitsFromQuery(query) {
    const traits = [];
    let workingQuery = query;

    // Carrier sleuthing — "carries X" / "carrying X" / "carrier of X" finds pairs whose foals
    // can carry a recessive without expressing it (great for stacking nfe → fefe down the line)
    const carrierMap = {
        'filigree': 'Carries Filigree',
        'pearl': 'Carries Pearl',
        'ether': 'Carries Ether',
        'flaxen': 'Carries Flaxen',
        'starfield': 'Carries Starfield',
        'lacquer': 'Carries Lacquer',
        'sepulchered': 'Carries Sepulchered',
        'patn': 'Carries Patn'
    };
    const carrierPattern = /(?:carries|carrier(?:\s+of)?|carrying)\s+(filigree|pearl|ether|flaxen|starfield|lacquer|sepulchered|patn)/g;
    let cMatch;
    while ((cMatch = carrierPattern.exec(query)) !== null) {
        const carrierTrait = carrierMap[cMatch[1]];
        if (carrierTrait && !traits.includes(carrierTrait)) traits.push(carrierTrait);
    }
    // Strip carrier phrases so the normal trait detector below doesn't double-count "pearl" etc.
    workingQuery = workingQuery.replace(carrierPattern, ' ');

    // Coat colors — ordered longest-first so "Amber Cream Pearl Champagne" doesn't just match "Bay"
    // One coat per query, we're not greedy
    // Format: [what you typed, what we actually meant]
    const coatColors = [
        // Legendary quad dilutions — if you can spell these you deserve the horse
        ['amber cream pearl champagne', 'Amber Cream Pearl Champagne'],
        ['classic cream pearl champagne', 'Classic Cream Pearl Champagne'],
        ['gold cream pearl champagne', 'Gold Cream Pearl Champagne'],
        ['ombre cream pearl ether', 'Ombre Cream Pearl Ether'],
        ['classic cream pearl ether', 'Classic Cream Pearl Ether'],
        ['cold cream pearl ether', 'Cold Cream Pearl Ether'],
        // Legendary triple dilutions — names that sound like paint swatches from another dimension
        ['tyrian pearl champagne', 'Tyrian Pearl Champagne'],
        ['phthalo pearl champagne', 'Phthalo Pearl Champagne'],
        ['ochre pearl champagne', 'Ochre Pearl Champagne'],
        ['tyrian pearl ether', 'Tyrian Pearl Ether'],
        ['phthalo pearl ether', 'Phthalo Pearl Ether'],
        ['ochre pearl ether', 'Ochre Pearl Ether'],
        ['madder cream champagne', 'Madder Cream Champagne'],
        ['woad cream champagne', 'Woad Cream Champagne'],
        ['weld cream champagne', 'Weld Cream Champagne'],
        ['madder cream ether', 'Madder Cream Ether'],
        ['woad cream ether', 'Woad Cream Ether'],
        ['weld cream ether', 'Weld Cream Ether'],
        // Epic double dilutions — still pretty fancy, just not "name your firstborn after it" fancy
        ['bay pearl ether', 'Bay Pearl Ether'],
        ['black pearl ether', 'Black Pearl Ether'],
        ['gold pearl ether', 'Gold Pearl Ether'],
        ['tyrian pearl', 'Tyrian Pearl'],
        ['phthalo pearl', 'Phthalo Pearl'],
        ['ochre pearl', 'Ochre Pearl'],
        ['madder ether', 'Madder Ether'],
        ['woad ether', 'Woad Ether'],
        ['weld ether', 'Weld Ether'],
        ['madder buckskin', 'Madder Buckskin'],
        ['woad smoky black', 'Woad Smoky Black'],
        ['weld palomino', 'Weld Palomino'],
        // Uncommon/Rare dilutions — the bread and butter of "ooh that's nice"
        ['amber champagne', 'Amber Champagne'], ['amber champ', 'Amber Champagne'],
        ['gold champagne', 'Gold Champagne'], ['gold champ', 'Gold Champagne'],
        ['classic champagne', 'Classic Champagne'],
        ['bay pearl', 'Bay Pearl'],
        ['black pearl', 'Black Pearl'],
        ['gold pearl', 'Gold Pearl'],
        ['smoky cream', 'Smoky Cream'],
        ['smoky black', 'Smoky Black'],
        // Generic compound dilutions — when you want a combo but aren't picky about the base
        ['tapestry pearl', 'Tapestry Pearl'],
        ['tapestry cream', 'Tapestry Cream'],
        ['cream pearl', 'Cream Pearl'], ['pearl cream', 'Cream Pearl'],
        // Single dilutions that got special nicknames — marketing, baby
        ['madder', 'Madder'],
        ['woad', 'Woad'],
        ['weld', 'Weld'],
        ['buckskin', 'Buckskin'],
        ['palomino', 'Palomino'],
        ['perlino', 'Perlino'],
        ['cremello', 'Cremello'],
        // Single Ether coats — special names plus the literal Bay/Black/Gold/Chestnut Ether forms
        // Listed here (before the generic 'ether') so the base coat doesn't get dropped on the floor
        ['ombre ether', 'Ombre Ether'],
        ['classic ether', 'Classic Ether'],
        ['cold ether', 'Cold Ether'],
        ['bay ether', 'Bay Ether'],
        ['black ether', 'Black Ether'],
        ['gold ether', 'Gold Ether'],
        ['chestnut ether', 'Chestnut Ether'],
        // Generic single dilutions — "just give me anything with this"
        ['tapestry', 'Tapestry'],
        ['champagne', 'Champagne'],
        ['cream', 'Cream'],
        ['pearl', 'Pearl'],
        ['ether', 'Ether'],
        // Base coats — the humble foundations, matched last to avoid false positives
        ['chestnut', 'Chestnut'],
        ['bay', 'Bay'],
        ['black', 'Black'],
    ];

    // Match the fanciest coat color first, then stop — greedy matching in reverse
    for (const [term, trait] of coatColors) {
        if (workingQuery.includes(term)) {
            traits.push(trait);
            break;
        }
    }

    // White markings — check the long names first or "false leopard" becomes just "leopard" and we cry
    // Multi-word traits get priority so partial matches don't ambush us
    if (workingQuery.includes('false leopard')) traits.push('False Leopard');
    if (workingQuery.includes('dominant white')) traits.push('Dominant White');
    if (workingQuery.includes('varnish roan') || workingQuery.includes('varnish')) traits.push('Varnish Roan');

    // Leopard Complex patterns — the spot spectrum, from "just a sprinkle" to "WHERE IS THE HORSE"
    if (workingQuery.includes('fewspot')) traits.push('Fewspot');
    if (workingQuery.includes('snowcap')) traits.push('Snowcap');
    if (workingQuery.includes('leopard') && !workingQuery.includes('false leopard')) traits.push('Leopard');
    if (workingQuery.includes('blanket')) traits.push('Blanket');
    if (workingQuery.includes('snowflake')) traits.push('Snowflake');

    // Other white markings — carefully dodging the "varnish roan" vs "roan" trap
    if (workingQuery.includes('tobiano')) traits.push('Tobiano');
    if (workingQuery.includes('overo')) traits.push('Overo');
    if (workingQuery.includes('splash')) traits.push('Splash');
    if (workingQuery.includes('roan') && !workingQuery.includes('varnish')) traits.push('Roan');
    if (workingQuery.includes('sabino')) traits.push('Sabino');
    if (workingQuery.includes('shroud')) traits.push('Shroud');
    if (workingQuery.includes('ossuary')) traits.push('Ossuary');
    if (workingQuery.includes('filigree')) traits.push('Filigree');
    if (workingQuery.includes('harlequin')) traits.push('Harlequin');
    if (workingQuery.includes('rabicano')) traits.push('Rabicano');

    // Modifiers — the garnish on top of your genetic masterpiece
    if (workingQuery.includes('starfield')) traits.push('Starfield');
    if (workingQuery.includes('gilt')) traits.push('Gilt');
    if (workingQuery.includes('tabard')) traits.push('Tabard');
    if (workingQuery.includes('opal')) traits.push('Opal');
    if (workingQuery.includes('prism')) traits.push('Prism');
    if (workingQuery.includes('gray') || workingQuery.includes('grey')) traits.push('Gray');
    if (workingQuery.includes('dun')) traits.push('Dun');
    if (workingQuery.includes('illuminated')) traits.push('Illuminated');
    if (workingQuery.includes('sepulchered')) traits.push('Sepulchered');
    if (workingQuery.includes('lacquer')) traits.push('Lacquer');
    if (workingQuery.includes('flaxen')) traits.push('Flaxen');
    if (workingQuery.includes('vellum')) traits.push('Vellum');
    if (workingQuery.includes('silver')) traits.push('Silver');
    if (workingQuery.includes('pangare')) traits.push('Pangare');
    if (workingQuery.includes('sooty')) traits.push('Sooty');
    if (workingQuery.includes('blanched')) traits.push('Blanched');
    if (workingQuery.includes('collar')) traits.push('Collar');
    if (workingQuery.includes('girdle')) traits.push('Girdle');
    if (workingQuery.includes('cuirass')) traits.push('Cuirass');
    if (workingQuery.includes('crowned')) traits.push('Crowned');

    return traits;
}

function findBreedingMatches(targetTraits) {
    const matches = [];
    
    for (let i = 0; i < horseCollection.length; i++) {
        for (let j = i + 1; j < horseCollection.length; j++) {
            const parent1 = horseCollection[i];
            const parent2 = horseCollection[j];
            
            // Check temperament compatibility — same vibes can't breed, those are the rules
            if (parent1.temperament === parent2.temperament) continue;
            
            // Check if this pair's genetics can actually conjure the desired foal
            const score = calculateMatchScore(parent1, parent2, targetTraits);
            
            if (score > 0) {
                matches.push({
                    parent1: parent1,
                    parent2: parent2,
                    score: score,
                    probability: estimateProbability(parent1, parent2, targetTraits)
                });
            }
        }
    }
    
    // Sort by score — best matchmakers first, like a leaderboard of love
    matches.sort((a, b) => b.score - a.score);
    
    return matches;
}

function canProduceCompoundDilution(p1Geno, p2Geno, dilution1, dilution2) {
    // Cr, Tp, and prl all share one locus — it's a studio apartment for three dilutions
    // A parent with Tpprl can toss either Tp OR prl to the foal (not both, that's not how loci work)
    // To get a compound foal (e.g. Crprl), you need BOTH parents to contribute different pieces
    // P1 = Crprl, P2 = nn → foal gets nCr or nprl (sorry, no compound for you)
    // P1 = Crprl, P2 = nCr → foal CAN get Crprl (P1 passes prl, P2 passes Cr, chef's kiss)

    const compound = dilution1 + dilution2;
    const reverseCompound = dilution2 + dilution1;

    // Figure out what dilution alleles each parent can actually yeet to their offspring
    // Hetero (nCr), homo (CrCr), or compound (Crprl) — each lets them pass different things
    // Compounds are sneaky: Crprl means the parent can pass Cr OR prl but never both at once

    function canPassDilution(geno, dilution) {
        const d = dilution.toLowerCase();
        // Has it as a standalone gene (hetero or homo)
        if (geno.includes('n' + d) || geno.includes(' ' + d + ' ') || geno.includes(d + d)) {
            return true;
        }
        // Or maybe it's hiding inside a compound — "Tpprl" contains both "Tp" and "prl" like a genetic Trojan horse
        if (geno.includes(d)) {
            return true;
        }
        return false;
    }

    const p1Can1 = canPassDilution(p1Geno, dilution1);
    const p1Can2 = canPassDilution(p1Geno, dilution2);
    const p2Can1 = canPassDilution(p2Geno, dilution1);
    const p2Can2 = canPassDilution(p2Geno, dilution2);

    // Check if either parent already has the compound — the easy path
    const p1HasCompound = p1Geno.includes(compound) || p1Geno.includes(reverseCompound);
    const p2HasCompound = p2Geno.includes(compound) || p2Geno.includes(reverseCompound);

    // If both parents have the compound, it's basically guaranteed — high five
    if (p1HasCompound && p2HasCompound) {
        return true;
    }

    // If one parent has the compound, the OTHER parent just needs to bring one matching piece
    // Like assembling IKEA furniture: P1 brings the shelves (Cr or prl), P2 brings a bracket (Cr or n)
    // Some assembly required, results may vary
    if (p1HasCompound) {
        return p2Can1 || p2Can2;
    }

    if (p2HasCompound) {
        return p1Can1 || p1Can2;
    }

    // Neither has the compound — each parent must bring a different piece to the potluck
    // P1 brings nCr, P2 brings nprl → together they can cook up Crprl
    return (p1Can1 && p2Can2) || (p1Can2 && p2Can1);
}

function calculateMatchScore(parent1, parent2, targetTraits) {
    const p1Geno = parent1.genotype.toLowerCase();
    const p2Geno = parent2.genotype.toLowerCase();
    const combinedGeno = (p1Geno + ' ' + p2Geno);

    // Track which traits this pair can actually produce — no false advertising
    let traitsScores = [];

    targetTraits.forEach(trait => {
        const traitLower = trait.toLowerCase();

        // The great trait treasure hunt — does this pair have the genes or are we just dreaming?
        // Starting with the rarest combos first because we're ambitious like that

        // Carrier traits — only ONE parent needs the recessive allele for a carrier foal,
        // so these are way easier than expressed (homozygous) versions.
        // Must be checked BEFORE the expressed cases or the substring checks below would steal them.
        if (traitLower === 'carries filigree') {
            // Need at least one fe allele in the pair — foal can be nfe (carrier) or fefe (expressed)
            if (/\bfefe\b|\bnfe\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower === 'carries pearl') {
            // prl can hide inside compounds (Tpprl, Crprl) — gotta catch 'em all
            if (/\bnprl\b|\bprlprl\b|\btpprl\b|\bcrprl\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower === 'carries ether') {
            // er can ride along inside Cher (champagne expressed but carries ether)
            if (/\berer\b|\bner\b|\bcher\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower === 'carries flaxen') {
            // \bnf\b dodges nfe (Filigree) and nfl (False Leopard) — word boundaries are our friends
            if (/\bff\b|\bnf\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower === 'carries starfield') {
            if (/\bsfsf\b|\bnsf\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower === 'carries lacquer') {
            if (/\blrlr\b|\bnlr\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower === 'carries sepulchered') {
            // Lusp expresses Illuminated but still carries sp, so we count it
            if (/\bspsp\b|\bnsp\b|\blusp\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower === 'carries patn') {
            if (/\bnpatn\b|\bpatnpatn\b/.test(combinedGeno)) traitsScores.push(60);
        } else if (traitLower.includes('cream pearl ether') || traitLower === 'ombre cream pearl ether' ||
            traitLower === 'classic cream pearl ether' || traitLower === 'cold cream pearl ether') {
            // Need Crprl + erer — both parents must carry er, or the ether stays hidden
            const hasCreamPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'cr', 'prl');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            const canMakeErer = p1HasEther && p2HasEther;
            if (hasCreamPearl && canMakeErer) traitsScores.push(150);
        } else if (traitLower.includes('cream pearl champagne')) {
            // Need Crprl + Ch — cream, pearl, AND champagne? This horse is going to prom
            const hasCreamPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'cr', 'prl');
            const hasChampagne = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(combinedGeno);
            if (hasCreamPearl && hasChampagne) traitsScores.push(150);
        } else if (traitLower.includes('tapestry pearl ether') || traitLower === 'tyrian pearl ether' ||
                   traitLower === 'phthalo pearl ether' || traitLower === 'ochre pearl ether') {
            // Need Tpprl + erer — tapestry pearl ether, a name longer than most quest descriptions
            const hasTapestryPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'prl');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            const canMakeErer = p1HasEther && p2HasEther;
            if (hasTapestryPearl && canMakeErer) traitsScores.push(150);
        } else if (traitLower.includes('tapestry pearl champagne') || traitLower === 'tyrian pearl champagne' ||
                   traitLower === 'phthalo pearl champagne' || traitLower === 'ochre pearl champagne') {
            // Need Tpprl + Ch — good news: Ch is on a separate locus so it can sneak in independently
            const hasTapestryPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'prl');
            // One parent brings the tapestry-pearl combo, someone brings champagne, everyone's happy
            const p1HasCh = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(p1Geno);
            const p2HasCh = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(p2Geno);
            if (hasTapestryPearl && (p1HasCh || p2HasCh)) traitsScores.push(150);
        } else if (traitLower.includes('tapestry cream ether') || traitLower === 'madder cream ether' ||
                   traitLower === 'woad cream ether' || traitLower === 'weld cream ether') {
            // Need TpCr + erer — both parents must carry er or no ethereal tapestry cream for you
            const hasTapestryCream = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'cr');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            const canMakeErer = p1HasEther && p2HasEther;
            if (hasTapestryCream && canMakeErer) traitsScores.push(150);
        } else if (traitLower.includes('tapestry cream champagne') || traitLower === 'madder cream champagne' ||
                   traitLower === 'woad cream champagne' || traitLower === 'weld cream champagne') {
            // Need TpCr + Ch — tapestry cream champagne, this horse is basically a dessert wine
            const hasTapestryCream = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'cr');
            const hasChampagne = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(combinedGeno);
            if (hasTapestryCream && hasChampagne) traitsScores.push(150);
        } else if (traitLower.includes('pearl ether') && !traitLower.includes('cream') && !traitLower.includes('tapestry')) {
            // Need prlprl + erer — double recessive combo, both parents must carry the goods
            const p1HasPearl = p1Geno.includes('prl');
            const p2HasPearl = p2Geno.includes('prl');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            if (p1HasPearl && p2HasPearl && p1HasEther && p2HasEther) traitsScores.push(120);
        } else if (traitLower.includes('cream pearl') && !traitLower.includes('ether') && !traitLower.includes('champagne')) {
            // Need Crprl — cream and pearl forced to share, classic locus drama
            if (canProduceCompoundDilution(p1Geno, p2Geno, 'cr', 'prl')) traitsScores.push(100);
        } else if ((traitLower.includes('tapestry pearl') ||
                    traitLower === 'tyrian pearl' ||
                    traitLower === 'phthalo pearl' ||
                    traitLower === 'ochre pearl') &&
                   !traitLower.includes('ether') && !traitLower.includes('champagne')) {
            // Need Tpprl — tapestry and pearl, another odd-couple compound
            // Tyrian/Phthalo/Ochre Pearl are just Tapestry Pearl with specific bases (Bay/Black/Chestnut)
            if (canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'prl')) {
                let baseOK = true;
                if (traitLower === 'tyrian pearl') {
                    const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                    const hasA = /\bAA\b|\bAa\b/.test(parent1.genotype) || /\bAA\b|\bAa\b/.test(parent2.genotype);
                    baseOK = hasE && hasA;
                } else if (traitLower === 'phthalo pearl') {
                    const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                    const p1HasSmallA = /\baa\b|\bAa\b/.test(parent1.genotype);
                    const p2HasSmallA = /\baa\b|\bAa\b/.test(parent2.genotype);
                    baseOK = hasE && p1HasSmallA && p2HasSmallA;
                } else if (traitLower === 'ochre pearl') {
                    const p1Hase = /\bee\b|\bEe\b/.test(parent1.genotype);
                    const p2Hase = /\bee\b|\bEe\b/.test(parent2.genotype);
                    baseOK = p1Hase && p2Hase;
                }
                if (baseOK) traitsScores.push(100);
            }
        } else if (traitLower === 'bay pearl' || traitLower === 'black pearl' || traitLower === 'gold pearl') {
            // Single Pearl + specific base — both parents must pass prl, plus the right E/A combo
            const prlPat = /\bnprl\b|\bprlprl\b|\btpprl\b|\bcrprl\b/;
            const p1HasPrl = prlPat.test(p1Geno);
            const p2HasPrl = prlPat.test(p2Geno);
            let baseOK = false;
            if (traitLower === 'bay pearl') {
                const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                const hasA = /\bAA\b|\bAa\b/.test(parent1.genotype) || /\bAA\b|\bAa\b/.test(parent2.genotype);
                baseOK = hasE && hasA;
            } else if (traitLower === 'black pearl') {
                const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                const p1HasSmallA = /\baa\b|\bAa\b/.test(parent1.genotype);
                const p2HasSmallA = /\baa\b|\bAa\b/.test(parent2.genotype);
                baseOK = hasE && p1HasSmallA && p2HasSmallA;
            } else { // gold pearl = chestnut + pearl
                const p1Hase = /\bee\b|\bEe\b/.test(parent1.genotype);
                const p2Hase = /\bee\b|\bEe\b/.test(parent2.genotype);
                baseOK = p1Hase && p2Hase;
            }
            if (p1HasPrl && p2HasPrl && baseOK) traitsScores.push(100);
        } else if (traitLower === 'madder ether' || traitLower === 'woad ether' || traitLower === 'weld ether') {
            // Tapestry + erer + base coat — the previous logic forgot the ether part entirely
            const hasTp = /\bntp\b|\btptp\b|\btpcr\b|\btpprl\b/.test(combinedGeno);
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const canMakeErer = etherPat.test(p1Geno) && etherPat.test(p2Geno);
            let baseOK = false;
            if (traitLower === 'madder ether') {
                const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                const hasA = /\bAA\b|\bAa\b/.test(parent1.genotype) || /\bAA\b|\bAa\b/.test(parent2.genotype);
                baseOK = hasE && hasA;
            } else if (traitLower === 'woad ether') {
                const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                const p1HasSmallA = /\baa\b|\bAa\b/.test(parent1.genotype);
                const p2HasSmallA = /\baa\b|\bAa\b/.test(parent2.genotype);
                baseOK = hasE && p1HasSmallA && p2HasSmallA;
            } else { // weld ether = chestnut tapestry + ether
                const p1Hase = /\bee\b|\bEe\b/.test(parent1.genotype);
                const p2Hase = /\bee\b|\bEe\b/.test(parent2.genotype);
                baseOK = p1Hase && p2Hase;
            }
            if (hasTp && canMakeErer && baseOK) traitsScores.push(120);
        } else if (traitLower === 'ombre ether' || traitLower === 'bay ether' ||
                   traitLower === 'classic ether' || traitLower === 'black ether' ||
                   traitLower === 'cold ether' || traitLower === 'gold ether' ||
                   traitLower === 'chestnut ether') {
            // Single Ether + specific base — both parents must carry er, plus the right E/A combo
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const canMakeErer = etherPat.test(p1Geno) && etherPat.test(p2Geno);
            let baseOK = false;
            if (traitLower === 'ombre ether' || traitLower === 'bay ether') {
                const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                const hasA = /\bAA\b|\bAa\b/.test(parent1.genotype) || /\bAA\b|\bAa\b/.test(parent2.genotype);
                baseOK = hasE && hasA;
            } else if (traitLower === 'classic ether' || traitLower === 'black ether') {
                const hasE = /\bEE\b|\bEe\b/.test(parent1.genotype) || /\bEE\b|\bEe\b/.test(parent2.genotype);
                const p1HasSmallA = /\baa\b|\bAa\b/.test(parent1.genotype);
                const p2HasSmallA = /\baa\b|\bAa\b/.test(parent2.genotype);
                baseOK = hasE && p1HasSmallA && p2HasSmallA;
            } else { // cold/gold/chestnut ether = chestnut + ether
                const p1Hase = /\bee\b|\bEe\b/.test(parent1.genotype);
                const p2Hase = /\bee\b|\bEe\b/.test(parent2.genotype);
                baseOK = p1Hase && p2Hase;
            }
            if (canMakeErer && baseOK) traitsScores.push(80);
        } else if (traitLower.includes('woad')) {
            if (combinedGeno.includes('tp') && (combinedGeno.includes('e') && combinedGeno.includes('aa'))) traitsScores.push(100);
        } else if (traitLower.includes('madder')) {
            if (combinedGeno.includes('tp') && (combinedGeno.includes('e') && combinedGeno.includes('a'))) traitsScores.push(100);
        } else if (traitLower.includes('weld')) {
            if (combinedGeno.includes('tp') && combinedGeno.includes('ee')) traitsScores.push(100);
        } else if (traitLower.includes('buckskin')) {
            if (combinedGeno.includes('cr') && (combinedGeno.includes('e') && combinedGeno.includes('a'))) traitsScores.push(100);
        } else if (traitLower.includes('smoky black')) {
            if (combinedGeno.includes('cr') && (combinedGeno.includes('e') && combinedGeno.includes('aa'))) traitsScores.push(100);
        } else if (traitLower.includes('palomino')) {
            if (combinedGeno.includes('cr') && combinedGeno.includes('ee')) traitsScores.push(100);
        } else if (traitLower.includes('perlino')) {
            if (combinedGeno.includes('crcr') && (combinedGeno.includes('e') && combinedGeno.includes('a'))) traitsScores.push(100);
        } else if (traitLower.includes('smoky cream')) {
            if (combinedGeno.includes('crcr') && (combinedGeno.includes('e') && combinedGeno.includes('aa'))) traitsScores.push(100);
        } else if (traitLower.includes('cremello')) {
            if (combinedGeno.includes('crcr') && combinedGeno.includes('ee')) traitsScores.push(100);
        } else if (traitLower.includes('amber champagne')) {
            if (/\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(combinedGeno) && (combinedGeno.includes('e') && combinedGeno.includes('a'))) traitsScores.push(100);
        } else if (traitLower.includes('fewspot')) {
            // Need LpLp patnpatn — BOTH parents must bring Lp AND patn or no fewspot for you
            const p1HasLp = p1Geno.includes('lp');
            const p2HasLp = p2Geno.includes('lp');
            const p1HasPatn = p1Geno.includes('patn');
            const p2HasPatn = p2Geno.includes('patn');
            if (p1HasLp && p2HasLp && p1HasPatn && p2HasPatn) traitsScores.push(100);
        } else if (traitLower.includes('snowcap')) {
            // Need LpLp npatn — two Lp carriers and at least one patn, like assembling an adventuring party
            const p1HasLp = p1Geno.includes('lp');
            const p2HasLp = p2Geno.includes('lp');
            const p1HasPatn = p1Geno.includes('patn');
            const p2HasPatn = p2Geno.includes('patn');
            if (p1HasLp && p2HasLp && (p1HasPatn || p2HasPatn)) traitsScores.push(100);
        } else if (traitLower.includes('varnish roan')) {
            // Need LpLp, no patn — both parents have Lp but no pattern gene, yielding the slow fade
            const p1HasLp = p1Geno.includes('lp');
            const p2HasLp = p2Geno.includes('lp');
            if (p1HasLp && p2HasLp && !combinedGeno.includes('patn')) traitsScores.push(100);
        } else if (traitLower.includes('leopard')) {
            // Need nLp patnpatn — at least one Lp carrier, both parents packing patn
            const hasLp = combinedGeno.includes('lp');
            const p1HasPatn = p1Geno.includes('patn');
            const p2HasPatn = p2Geno.includes('patn');
            if (hasLp && p1HasPatn && p2HasPatn) traitsScores.push(100);
        } else if (traitLower.includes('blanket')) {
            // Need nLp npatn — at least one Lp and one patn somewhere in the family
            const hasLp = combinedGeno.includes('lp');
            const hasPatn = combinedGeno.includes('patn');
            if (hasLp && hasPatn) traitsScores.push(100);
        } else if (traitLower.includes('snowflake')) {
            // Need nLp, no patn — just Lp doing its thing solo, sprinkling snowflakes
            const hasLp = combinedGeno.includes('lp');
            if (hasLp && !combinedGeno.includes('patn')) traitsScores.push(100);
        } else if (traitLower.includes('starfield')) {
            // Need sfsf — both parents must carry sf, stars don't align themselves
            const sfPattern = /\bsfsf\b|\bnsf\b/;
            const p1HasSf = sfPattern.test(p1Geno);
            const p2HasSf = sfPattern.test(p2Geno);
            if (p1HasSf && p2HasSf) traitsScores.push(100);
        } else if (traitLower.includes('sepulchered')) {
            // Need spsp — both parents carry sp; careful not to confuse nSpl (Splash) with nsp
            const spPattern = /\bspsp\b|\bnsp\b|\blusp\b/;
            const p1HasSp = spPattern.test(p1Geno);
            const p2HasSp = spPattern.test(p2Geno);
            if (p1HasSp && p2HasSp) traitsScores.push(100);
        } else if (traitLower.includes('lacquer')) {
            // Need lrlr — both parents carry lr, the lacquer doesn't apply itself
            const lrPattern = /\blrlr\b|\bnlr\b/;
            const p1HasLr = lrPattern.test(p1Geno);
            const p2HasLr = lrPattern.test(p2Geno);
            if (p1HasLr && p2HasLr) traitsScores.push(100);
        } else if (traitLower.includes('flaxen')) {
            // Need ff — both parents carry f; regex must dodge nfe (Filigree) and nfl (False Leopard)
            const fPattern = /\bff\b|\bnf\b/;
            const p1HasF = fPattern.test(p1Geno);
            const p2HasF = fPattern.test(p2Geno);
            if (p1HasF && p2HasF) traitsScores.push(100);
        } else if (traitLower.includes('ether')) {
            // Need erer — recessive ether requires both parents to carry the ghost gene
            const etherPattern = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPattern.test(p1Geno);
            const p2HasEther = etherPattern.test(p2Geno);
            if (p1HasEther && p2HasEther) traitsScores.push(80);
            else if (p1HasEther || p2HasEther) traitsScores.push(40);
        } else if (traitLower.includes('champagne')) {
            // Champagne is dominant — just one parent needs to bring the bubbly
            const hasCh = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(combinedGeno);
            if (hasCh) traitsScores.push(80);
        } else if (traitLower === 'tapestry') {
            // Dominant — one parent with Tp and you've got yourself a tapestry
            const tpPattern = /\bntp\b|\btptp\b|\btpcr\b|\btpprl\b/;
            if (tpPattern.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'cream') {
            // Dominant — at least one Cr in the mix and cream happens
            const crPattern = /\bncr\b|\bcrcr\b|\btpcr\b|\bcrprl\b/;
            if (crPattern.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'pearl') {
            // Recessive — pearl hides until BOTH parents admit they've been carrying it
            const prlPattern = /\bnprl\b|\bprlprl\b|\btpprl\b|\bcrprl\b/;
            const p1HasPrl = prlPattern.test(p1Geno);
            const p2HasPrl = prlPattern.test(p2Geno);
            if (p1HasPrl && p2HasPrl) traitsScores.push(80);
            else if (p1HasPrl || p2HasPrl) traitsScores.push(40);
        } else if (traitLower === 'tapestry cream') {
            // Need TpCr compound — two dilutions, one locus, zero chill
            if (canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'cr')) traitsScores.push(100);
        } else if (traitLower === 'chestnut') {
            // Need ee — both parents must secretly carry a lowercase e, the ginger gene of horses
            const p1HasE = /\bee\b/.test(p1Geno) || /^ee\b/i.test(p1Geno.trim()) || /\bEe\b/.test(parent1.genotype);
            const p2HasE = /\bee\b/.test(p2Geno) || /^ee\b/i.test(p2Geno.trim()) || /\bEe\b/.test(parent2.genotype);
            if (p1HasE && p2HasE) traitsScores.push(80);
        } else if (traitLower === 'bay') {
            // Need E_ A_ — the classic bay combo, at least one E and one A between them
            const hasE = /\bEe\b|\bEE\b/i.test(parent1.genotype) || /\bEe\b|\bEE\b/i.test(parent2.genotype);
            const hasA = /\bAa\b|\bAA\b|\bAa\b/i.test(parent1.genotype) || /\bAa\b|\bAA\b/i.test(parent2.genotype);
            if (hasE && hasA) traitsScores.push(80);
        } else if (traitLower === 'black') {
            // Need E_ aa — black requires E for extension but aa to banish agouti to the shadow realm
            const hasE = /\bEe\b|\bEE\b/i.test(parent1.genotype) || /\bEe\b|\bEE\b/i.test(parent2.genotype);
            const p1HasSmallA = /\baa\b|\bAa\b/.test(parent1.genotype);
            const p2HasSmallA = /\baa\b|\bAa\b/.test(parent2.genotype);
            if (hasE && p1HasSmallA && p2HasSmallA) traitsScores.push(80);
        } else if (traitLower.includes('filigree')) {
            // Need fefe — filigree is recessive and demands both parents carry fe
            const fePattern = /\bfefe\b|\bnfe\b/;
            const p1HasFe = fePattern.test(p1Geno);
            const p2HasFe = fePattern.test(p2Geno);
            if (p1HasFe && p2HasFe) traitsScores.push(100);
        } else if (traitLower.includes('ossuary')) {
            if (/\bnos\b/.test(combinedGeno)) traitsScores.push(100);
        } else if (traitLower.includes('shroud')) {
            if (/\bnsh\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'roan') {
            if (/\bnrn\b|\brnrn\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'gray' || traitLower === 'grey') {
            if (/\bng\b|\bgg\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'tobiano') {
            if (/\bnt\b|\btt\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'overo') {
            if (/\bno\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'sabino') {
            if (/\bnsb\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'splash') {
            if (/\bnspl\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'dun') {
            if (/\bnd\b|\bdd\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'silver') {
            if (/\bnz\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'vellum') {
            if (/\bnv\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'illuminated') {
            if (/\bnlu\b|\blusp\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'tabard') {
            if (/\bntd\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'gilt') {
            if (/\bngl\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'blanched') {
            if (/\bnb\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'dominant white') {
            if (/\bnw\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'rabicano') {
            if (/\bnrb\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'false leopard') {
            if (/\bnfl\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'collar') {
            if (/\bnco\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'girdle') {
            if (/\bngi\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'cuirass') {
            if (/\bncu\b|\bcucw\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'crowned') {
            if (/\bncw\b|\bcucw\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'pangare') {
            if (/\bnp\b/.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'sooty') {
            if (/\bnsty\b/.test(combinedGeno)) traitsScores.push(80);
        }
    });

    // Only count it if ALL desired traits can coexist in one foal — no Frankenstein genetics
    if (traitsScores.length === targetTraits.length) {
        return traitsScores.reduce((sum, s) => sum + s, 0);
    }
    return 0; // Can't make all those traits in one foal — even dungeon magic has limits
}

function estimateProbability(parent1, parent2, targetTraits) {
    // Probability estimation — this is vibes-based math, not a peer-reviewed paper
    const p1Geno = parent1.genotype.toLowerCase();
    const p2Geno = parent2.genotype.toLowerCase();
    
    let hasAllGenes = true;
    targetTraits.forEach(trait => {
        const traitKey = trait.toLowerCase().substring(0, 3);
        if (!p1Geno.includes(traitKey) && !p2Geno.includes(traitKey)) {
            hasAllGenes = false;
        }
    });
    
    if (!hasAllGenes) return 'Low (~5-10%)';
    
    const genesInBoth = targetTraits.filter(trait => {
        const key = trait.toLowerCase().substring(0, 3);
        return p1Geno.includes(key) && p2Geno.includes(key);
    }).length;
    
    if (genesInBoth === targetTraits.length) return 'High (~40-60%)';
    if (genesInBoth > 0) return 'Medium (~20-35%)';
    return 'Low (~10-20%)';
}

function fillParents(parent1, parent2) {
    // Yeet the user over to the Foal Generator tab with pre-filled parents
    switchTab('foals');

    document.getElementById('parent1Name').value = parent1.name || '';
    document.getElementById('parent1Geno').value = parent1.genotype;
    document.getElementById('parent1Temp').value = parent1.temperament;
    document.getElementById('parent1Variant').value = parent1.variant || 'Standard';

    document.getElementById('parent2Name').value = parent2.name || '';
    document.getElementById('parent2Geno').value = parent2.genotype;
    document.getElementById('parent2Temp').value = parent2.temperament;
    document.getElementById('parent2Variant').value = parent2.variant || 'Standard';

    // Scroll down so the user actually sees what we just filled in
    const pc = document.querySelector('#area-calculator .parents-container');
    if (pc) pc.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Chimera Functionality — for when your horse is literally two horses in a trenchcoat

// Check if a parent can pass a boring normal (n) allele at a given locus
function canPassNAtLocus(genes, locusPattern) {
    const gene = genes.find(g => locusPattern.test(g));
    if (!gene) return true; // no gene at this locus = nn, guaranteed normie allele
    return getGeneAlleles(gene).includes('n');
}

function generateChimeraPossibilities(foalGenotype, parent1Genotype, parent2Genotype) {
    const foal = parseGenotype(foalGenotype);
    const p1 = parseGenotype(parent1Genotype);
    const p2 = parseGenotype(parent2Genotype);

    const allParentAnomalies = [...p1.anomalies, ...p2.anomalies];

    // Interrogate each parent about what Extension and Agouti alleles they're hiding
    const p1EAlleles = new Set();
    const p2EAlleles = new Set();
    const p1AAlleles = new Set();
    const p2AAlleles = new Set();

    p1.genes.forEach(gene => {
        if (gene.match(/^[Ee][Ee]?$/)) getGeneAlleles(gene).forEach(a => p1EAlleles.add(a));
        if (gene.match(/^[Aa][Aa]?$/)) getGeneAlleles(gene).forEach(a => p1AAlleles.add(a));
    });
    p2.genes.forEach(gene => {
        if (gene.match(/^[Ee][Ee]?$/)) getGeneAlleles(gene).forEach(a => p2EAlleles.add(a));
        if (gene.match(/^[Aa][Aa]?$/)) getGeneAlleles(gene).forEach(a => p2AAlleles.add(a));
    });

    // Default to wildtype if no gene found — assume basic until proven fancy
    if (p1EAlleles.size === 0) p1EAlleles.add('E');
    if (p2EAlleles.size === 0) p2EAlleles.add('E');
    if (p1AAlleles.size === 0) p1AAlleles.add('A');
    if (p2AAlleles.size === 0) p2AAlleles.add('A');

    // Generate all possible base coats — Mendelian combinatorics go brrrrr
    const baseCoats = new Set();
    p1EAlleles.forEach(e1 => {
        p2EAlleles.forEach(e2 => {
            p1AAlleles.forEach(a1 => {
                p2AAlleles.forEach(a2 => {
                    const eGene = combineAlleles(e1, e2);
                    const aGene = combineAlleles(a1, a2);
                    const baseCoatKey = `${eGene}_${aGene}`;
                    const baseCoatName = COAT_COLORS[baseCoatKey];
                    if (baseCoatName) {
                        baseCoats.add(baseCoatName);
                    }
                });
            });
        });
    });

    // Dilutions — tracking what each parent can ACTUALLY pass, no more wishful thinking
    // Real Mendelian outcomes only, we're scientists now (at 3am, but still)
    const dilutionNames = new Set();

    const p1Locus1 = new Set();
    const p2Locus1 = new Set();
    const p1Locus2 = new Set();
    const p2Locus2 = new Set();

    const locus1Pattern = /^(nCr|CrCr|nTp|TpTp|nprl|prlprl|Crprl|Tpprl|TpCr)$/;
    const locus2Pattern = /^(nCh|ChCh|ner|erer|Cher)$/;

    p1.genes.forEach(gene => {
        if (locus1Pattern.test(gene)) getGeneAlleles(gene).forEach(a => p1Locus1.add(a));
        if (locus2Pattern.test(gene)) getGeneAlleles(gene).forEach(a => p1Locus2.add(a));
    });
    p2.genes.forEach(gene => {
        if (locus1Pattern.test(gene)) getGeneAlleles(gene).forEach(a => p2Locus1.add(a));
        if (locus2Pattern.test(gene)) getGeneAlleles(gene).forEach(a => p2Locus2.add(a));
    });

    // No gene on a locus = wildtype (n) — the genetic equivalent of "I didn't bring anything"
    if (p1Locus1.size === 0) p1Locus1.add('n');
    if (p2Locus1.size === 0) p2Locus1.add('n');
    if (p1Locus2.size === 0) p1Locus2.add('n');
    if (p2Locus2.size === 0) p2Locus2.add('n');

    // Generate actual possible genotypes — one allele from each parent, as Mendel intended
    const locus1Phenotypes = new Set();
    const locus2Phenotypes = new Set();
    let locus1CanBeEmpty = false;
    let locus2CanBeEmpty = false;

    p1Locus1.forEach(a1 => {
        p2Locus1.forEach(a2 => {
            const geno = combineAlleles(a1, a2);
            if (DILUTION_NAMES[geno]) locus1Phenotypes.add(DILUTION_NAMES[geno]);
            else locus1CanBeEmpty = true; // nn = invisible dilution, it's just vibes
        });
    });
    p1Locus2.forEach(a1 => {
        p2Locus2.forEach(a2 => {
            const geno = combineAlleles(a1, a2);
            if (DILUTION_NAMES[geno]) locus2Phenotypes.add(DILUTION_NAMES[geno]);
            else locus2CanBeEmpty = true; // nn or ner — dilution machine broke at this locus
        });
    });

    // Combine across both loci — mix and match like a dungeon buffet, 'none' is also a valid choice
    const l1Array = Array.from(locus1Phenotypes);
    const l2Array = Array.from(locus2Phenotypes);
    if (locus1CanBeEmpty || l1Array.length === 0) l1Array.push('none');
    if (locus2CanBeEmpty || l2Array.length === 0) l2Array.push('none');

    // Also include the "no dilution at all" option — undiluted base coats deserve love too
    const dilutionCombos = []; // every possible dilution outcome, including "nothing at all"
    l1Array.forEach(l1 => {
        l2Array.forEach(l2 => {
            if (l1 === 'none' && l2 === 'none') {
                dilutionCombos.push('none');
                return;
            }
            let combo;
            if (l1 === 'none') combo = l2;
            else if (l2 === 'none') combo = l1;
            else combo = l1 + ' ' + l2;
            dilutionNames.add(combo);
            dilutionCombos.push(combo);
        });
    });

    // Build full coat names — every base × every dilution, the combinatorial explosion of fabulousness
    const fullCoatNames = new Set();
    baseCoats.forEach(base => {
        dilutionCombos.forEach(dil => {
            if (dil === 'none') {
                fullCoatNames.add(base);
            } else {
                const key = base + '_' + dil;
                const special = SPECIAL_COAT_NAMES[key];
                fullCoatNames.add(special || (dil + ' ' + base));
            }
        });
    });

    // ── Modifiers & White Markings — now with REAL Mendelian math, not just hopes and prayers ──
    // Track which alleles each parent can pass at every locus like a suspicious customs agent
    const modifiers = new Set();
    const whiteMarkings = new Set();

    // Helper: shake down a parent for all alleles they could pass at a given locus
    function getParentLocusAlleles(parentGenes, locusPattern) {
        const gene = parentGenes.find(g => locusPattern.test(g));
        if (!gene) return ['n'];  // nothing here, move along — passes wildtype
        return getGeneAlleles(gene);
    }

    // Helper: smash parents' alleles together at a locus and see what sticks
    function possibleGenotypes(p1Genes, p2Genes, locusPattern) {
        const p1A = getParentLocusAlleles(p1Genes, locusPattern);
        const p2A = getParentLocusAlleles(p2Genes, locusPattern);
        const results = new Set();
        p1A.forEach(a1 => {
            p2A.forEach(a2 => {
                results.add(combineAlleles(a1, a2));
            });
        });
        return results;
    }

    // ── Individual modifier loci — each a simple binary: "got the mutation" or "boring" ──
    const simpleModifierLoci = [
        { pattern: /^(nD|DD)$/, allele: 'D', name: 'Dun' },
        { pattern: /^(nP|PP)$/, allele: 'P', name: 'Pangare' },
        { pattern: /^(nSty|StySty)$/, allele: 'Sty', name: 'Sooty' },
        { pattern: /^(nG|GG)$/, allele: 'G', name: 'Gray' },
        { pattern: /^(nZ|ZZ)$/, allele: 'Z', name: 'Silver' },
        { pattern: /^(nTd|TdTd)$/, allele: 'Td', name: 'Tabard' },
        { pattern: /^(nGl|GlGl)$/, allele: 'Gl', name: 'Gilt' },
        { pattern: /^(nV|VV)$/, allele: 'V', name: 'Vellum' },
    ];

    simpleModifierLoci.forEach(locus => {
        const genotypes = possibleGenotypes(p1.genes, p2.genes, locus.pattern);
        genotypes.forEach(g => {
            // Dominant: even one mutant allele means this trait shows up to the party
            if (g !== 'nn') modifiers.add(locus.name);
        });
    });

    // ── Recessive modifier loci — must have TWO copies to show, one copy = secret agent ──
    const recessiveModifierLoci = [
        { pattern: /^(nf|ff)$/, allele: 'f', expressed: 'Flaxen', carrier: 'Carrying Flaxen' },
        { pattern: /^(nsf|sfsf)$/, allele: 'sf', expressed: 'Starfield', carrier: 'Carrying Starfield' },
        { pattern: /^(nlr|lrlr)$/, allele: 'lr', expressed: 'Lacquer', carrier: 'Carrying Lacquer' },
    ];

    recessiveModifierLoci.forEach(locus => {
        const genotypes = possibleGenotypes(p1.genes, p2.genes, locus.pattern);
        genotypes.forEach(g => {
            if (g === locus.allele + locus.allele) modifiers.add(locus.expressed);
            else if (g === 'n' + locus.allele) modifiers.add(locus.carrier);
        });
    });

    // ── Lu/sp shared locus — Illuminated (dominant) vs Sepulchered (recessive), eternal rivals ──
    const luSpPattern = /^(nLu|LuLu|nsp|spsp|Lusp)$/;
    const luSpGenotypes = possibleGenotypes(p1.genes, p2.genes, luSpPattern);
    luSpGenotypes.forEach(g => {
        if (g === 'nn') return;
        const alleles = getGeneAlleles(g);
        if (alleles.includes('Lu')) modifiers.add('Illuminated');
        if (g === 'spsp') modifiers.add('Sepulchered');
        else if (alleles.includes('sp') && !alleles.includes('Lu')) modifiers.add('Carrying Sepulchered');
        // Lusp: Lu dominates (Illuminated shows), sp skulks in the shadows (carried)
        if (g === 'Lusp') modifiers.add('Carrying Sepulchered');
    });

    // ── Pr/Op shared locus — both dominant, both sparkly, best friends forever ──
    const prOpPattern = /^(nPr|PrPr|nOp|OpOp|PrOp)$/;
    const prOpGenotypes = possibleGenotypes(p1.genes, p2.genes, prOpPattern);
    prOpGenotypes.forEach(g => {
        if (g === 'nn') return;
        const alleles = getGeneAlleles(g);
        if (alleles.includes('Pr')) modifiers.add('Prism');
        if (alleles.includes('Op')) modifiers.add('Opal');
    });

    // ── Filigree (fe locus) — recessive and delicate, like a lace doily that plays hard to get ──
    const fePattern = /^(nfe|fefe)$/;
    const feGenotypes = possibleGenotypes(p1.genes, p2.genes, fePattern);
    feGenotypes.forEach(g => {
        if (g === 'fefe') whiteMarkings.add('Filigree');
        else if (g === 'nfe') whiteMarkings.add('Carrying Filigree');
    });

    // ── KIT locus — T, Rn, Sb, W all crammed in here like knights in a phone booth ──
    const kitPattern = /^(nT|TT|nRn|RnRn|nSb|SbSb|nW|WW|TRn|RnT|TSb|SbT|TW|WT|RnSb|SbRn|RnW|WRn|SbW|WSb)$/;
    const kitAlleleNames = { 'T': 'Tobiano', 'Rn': 'Roan', 'Sb': 'Sabino', 'W': 'Dominant White' };
    const kitGenotypes = possibleGenotypes(p1.genes, p2.genes, kitPattern);
    kitGenotypes.forEach(g => {
        if (g === 'nn') return;
        const alleles = getGeneAlleles(g);
        alleles.forEach(a => { if (kitAlleleNames[a]) whiteMarkings.add(kitAlleleNames[a]); });
    });

    // ── B/Fl shared locus — Blanched and False Leopard, the buddy system ──
    const bFlPattern = /^(nB|BB|nFl|FlFl|BFl|FlB)$/;
    const bFlAlleleNames = { 'B': 'Blanched', 'Fl': 'False Leopard' };
    const bFlGenotypes = possibleGenotypes(p1.genes, p2.genes, bFlPattern);
    bFlGenotypes.forEach(g => {
        if (g === 'nn') return;
        const alleles = getGeneAlleles(g);
        alleles.forEach(a => { if (bFlAlleleNames[a]) whiteMarkings.add(bFlAlleleNames[a]); });
    });

    // ── Cu/Cw shared locus — Cuirass and Crowned, the armor set ──
    const cuCwPattern = /^(nCu|CuCu|nCw|CwCw|CuCw)$/;
    const cuCwAlleleNames = { 'Cu': 'Cuirass', 'Cw': 'Crowned' };
    const cuCwGenotypes = possibleGenotypes(p1.genes, p2.genes, cuCwPattern);
    cuCwGenotypes.forEach(g => {
        if (g === 'nn') return;
        const alleles = getGeneAlleles(g);
        alleles.forEach(a => { if (cuCwAlleleNames[a]) whiteMarkings.add(cuCwAlleleNames[a]); });
    });

    // ── Gi/Co shared locus — Girdle and Collar, the accessories department ──
    const giCoPattern = /^(nGi|GiGi|nCo|CoCo|GiCo|CoGi)$/;
    const giCoAlleleNames = { 'Gi': 'Girdle', 'Co': 'Collar' };
    const giCoGenotypes = possibleGenotypes(p1.genes, p2.genes, giCoPattern);
    giCoGenotypes.forEach(g => {
        if (g === 'nn') return;
        const alleles = getGeneAlleles(g);
        alleles.forEach(a => { if (giCoAlleleNames[a]) whiteMarkings.add(giCoAlleleNames[a]); });
    });

    // Compute valid combinations for shared loci from actual possible genotypes
    const locusCombos = {};
    [
        { key: 'kit', genotypes: kitGenotypes },
        { key: 'bFl', genotypes: bFlGenotypes },
        { key: 'cuCw', genotypes: cuCwGenotypes },
        { key: 'giCo', genotypes: giCoGenotypes },
    ].forEach(({ key, genotypes }) => {
        const comboSet = new Set();
        genotypes.forEach(g => {
            if (g !== 'nn' && WHITE_MARKING_NAMES[g]) comboSet.add(WHITE_MARKING_NAMES[g]);
        });
        if (comboSet.size > 0) locusCombos[key] = Array.from(comboSet).sort();
    });

    // ── Solo white marking loci — these genes each have their own room, no roommates ──
    const simpleMarkingLoci = [
        { pattern: /^(nO|OO)$/, name: 'Overo' },
        { pattern: /^(nSpl|SplSpl)$/, name: 'Splash' },
        { pattern: /^(nRb|RbRb)$/, name: 'Rabicano' },
        { pattern: /^(nHq|HqHq)$/, name: 'Harlequin' },
        { pattern: /^(nSh|ShSh)$/, name: 'Shroud' },
        { pattern: /^(nOs|OsOs)$/, name: 'Ossuary' },
    ];

    simpleMarkingLoci.forEach(locus => {
        const genotypes = possibleGenotypes(p1.genes, p2.genes, locus.pattern);
        genotypes.forEach(g => {
            if (g !== 'nn') whiteMarkings.add(locus.name);
        });
    });

    // ── Leopard Complex — where Lp and patn combine to determine your horse's spot density ──
    const lpPattern = /^(nLp|LpLp)$/;
    const patnPattern = /^(npatn|patnpatn)$/;
    const lpGenotypes = possibleGenotypes(p1.genes, p2.genes, lpPattern);
    const patnGenotypes = possibleGenotypes(p1.genes, p2.genes, patnPattern);

    const canMakeHetLp = lpGenotypes.has('nLp') || lpGenotypes.has('LpLp');
    const canMakeHomLp = lpGenotypes.has('LpLp');
    const canMakeHetPatn = patnGenotypes.has('npatn') || patnGenotypes.has('patnpatn');
    const canMakeHomPatn = patnGenotypes.has('patnpatn');

    if (canMakeHetLp) {
        whiteMarkings.add('Snowflake');              // nLp, no patn
        if (canMakeHetPatn) whiteMarkings.add('Blanket');   // nLp + npatn
        if (canMakeHomPatn) whiteMarkings.add('Leopard');   // nLp + patnpatn
    }
    if (canMakeHomLp) {
        whiteMarkings.add('Varnish Roan');           // LpLp, no patn
        if (canMakeHetPatn) whiteMarkings.add('Snowcap');   // LpLp + npatn
        if (canMakeHomPatn) whiteMarkings.add('Fewspot');   // LpLp + patnpatn
    }

    // Collect anomalies from parents AND foal (excluding Chimera itself, that's the whole point)
    // Even spontaneous anomalies count — the chimera patch is basically a blank canvas of chaos
    const anomalies = new Set([...allParentAnomalies, ...foal.anomalies].filter(a => a !== 'Chimera'));

    // ── Mandatory vs Optional — figuring out which traits MUST appear vs which are just suggestions ──
    // Dominant: mandatory when a parent literally cannot pass wildtype (you're getting this trait, deal with it)
    // Recessive: mandatory only if NEITHER parent can pass n (both locked in)

    const locusPatterns = {
        kit: /^(nT|TT|nRn|RnRn|nSb|SbSb|nW|WW|TRn|RnT|TSb|SbT|TW|WT|RnSb|SbRn|RnW|WRn|SbW|WSb)$/,
        bFl: /^(nB|BB|nFl|FlFl|BFl|FlB)$/,
        cuCw: /^(nCu|CuCu|nCw|CwCw|CuCw)$/,
        giCo: /^(nGi|GiGi|nCo|CoCo|GiCo|CoGi)$/,
        lp: /^(nLp|LpLp)$/,
        O: /^(nO|OO)$/,
        Spl: /^(nSpl|SplSpl)$/,
        Rb: /^(nRb|RbRb)$/,
        Hq: /^(nHq|HqHq)$/,
        Sh: /^(nSh|ShSh)$/,
        Os: /^(nOs|OsOs)$/,
        fe: /^(nfe|fefe)$/,
    };

    // Marking locus groups — defining who's mandatory and who's just visiting
    const markingLocusDefs = [
        { key: 'kit', name: 'KIT', traits: ['Tobiano', 'Roan', 'Sabino', 'Dominant White'], dominant: true },
        { key: 'bFl', name: 'B/Fl', traits: ['Blanched', 'False Leopard', 'Blanched False Leopard'], dominant: true },
        { key: 'cuCw', name: 'Cu/Cw', traits: ['Cuirass', 'Crowned'], dominant: true },
        { key: 'giCo', name: 'Gi/Co', traits: ['Girdle', 'Collar'], dominant: true },
        { key: 'lp', name: 'Leopard Complex', traits: ['Snowflake', 'Blanket', 'Leopard', 'Varnish Roan', 'Snowcap', 'Fewspot', 'Carries Patn'], dominant: true },
        { key: 'O', name: 'Overo', traits: ['Overo'], dominant: true },
        { key: 'Spl', name: 'Splash', traits: ['Splash'], dominant: true },
        { key: 'Rb', name: 'Rabicano', traits: ['Rabicano'], dominant: true },
        { key: 'Hq', name: 'Harlequin', traits: ['Harlequin'], dominant: true },
        { key: 'Sh', name: 'Shroud', traits: ['Shroud'], dominant: true },
        { key: 'Os', name: 'Ossuary', traits: ['Ossuary'], dominant: true },
        { key: 'fe', name: 'Filigree', traits: ['Filigree', 'Carrying Filigree'], dominant: false },
    ];

    const markingLoci = [];
    markingLocusDefs.forEach(def => {
        const presentTraits = def.traits.filter(t => whiteMarkings.has(t));
        if (presentTraits.length === 0) return;
        const p1CanPassN = canPassNAtLocus(p1.genes, locusPatterns[def.key]);
        const p2CanPassN = canPassNAtLocus(p2.genes, locusPatterns[def.key]);
        const mandatory = def.dominant
            ? (!p1CanPassN || !p2CanPassN)   // dominant: if either parent MUST pass a mutant, it's showing up
            : (!p1CanPassN && !p2CanPassN);  // recessive: both parents stuck — this trait is inevitable
        markingLoci.push({ name: def.name, traits: presentTraits, mandatory, combos: locusCombos[def.key] || null });
    });

    // Dilution mandatory info — reusing our earlier work because we're efficient like that
    const dilutionMandatory = !locus1CanBeEmpty || !locus2CanBeEmpty;
    const dilutionLociNotes = [];
    if (!locus1CanBeEmpty) dilutionLociNotes.push('Cream/Tapestry/Pearl locus');
    if (!locus2CanBeEmpty) dilutionLociNotes.push('Champagne/Ether locus');

    return {
        baseCoats: Array.from(baseCoats).sort(),
        dilutions: Array.from(dilutionNames).sort(),
        fullCoatNames: Array.from(fullCoatNames).sort(),
        whiteMarkings: Array.from(whiteMarkings).sort(),
        modifiers: Array.from(modifiers).sort(),
        anomalies: Array.from(anomalies).sort(),
        locusInfo: {
            dilutionMandatory,
            dilutionLociNotes,
            locus1Phenotypes: Array.from(locus1Phenotypes).sort(),
            locus2Phenotypes: Array.from(locus2Phenotypes).sort(),
            locus1CanBeEmpty,
            locus2CanBeEmpty,
            markingLoci,
            anyMarkingMandatory: markingLoci.some(l => l.mandatory),
        }
    };
}

function fillChimeraCalculator(foalGeno, parent1Geno, parent2Geno) {
    // Teleport to the Chimera Calculator tab — adventure awaits
    switchTab('chimera');

    document.getElementById('chimeraFoalGeno').value = foalGeno;
    document.getElementById('chimeraParent1Geno').value = parent1Geno;
    document.getElementById('chimeraParent2Geno').value = parent2Geno;

    // Fire away — no time for hesitation, calculate immediately
    calculateChimera();
}

function calculateChimera() {
    const foalGeno = document.getElementById('chimeraFoalGeno').value.trim();
    const parent1Geno = document.getElementById('chimeraParent1Geno').value.trim();
    const parent2Geno = document.getElementById('chimeraParent2Geno').value.trim();

    if (!foalGeno || !parent1Geno || !parent2Geno) {
        alert('Please enter genotypes for the foal and both parents!');
        return;
    }

    // Sanity check — does this foal actually have Chimera or are we just here for fun?
    if (!foalGeno.toLowerCase().includes('chimera')) {
        alert('Warning: The foal genotype does not include Chimera trait. Calculating possibilities anyway...');
    }

    const possibilities = generateChimeraPossibilities(foalGeno, parent1Geno, parent2Geno);

    displayChimeraPossibilities(foalGeno, possibilities);
}

function displayChimeraPossibilities(foalGenotype, possibilities) {
    const resultsContainer = document.getElementById('chimeraResultsContainer');
    const resultsContent = document.getElementById('chimeraResultsContent');

    resultsContent.innerHTML = '';

    // Display the foal's "main character" coat — the non-chimera areas
    const foalPhenotype = genotypeToPhenotype(foalGenotype);

    const mainCoatDiv = document.createElement('div');
    mainCoatDiv.style.cssText = 'background: #ffffff; border: 2px solid #5d4b60; padding: 20px; margin-bottom: 20px;';
    mainCoatDiv.innerHTML = `
        <h4 style="color: #5d4b60; margin-bottom: 10px; font-size: 1.1em;">Main Coat (Non-Chimera Areas)</h4>
        <div style="margin-bottom: 10px;">
            <strong style="color: #6f6877;">Phenotype:</strong>
            <span style="color: #5d4b60; display: block; margin-top: 5px;">${foalPhenotype}</span>
        </div>
        <div>
            <strong style="color: #6f6877;">Genotype:</strong>
            <span style="color: #5d4b60; font-family: 'Courier New', monospace; display: block; margin-top: 5px; background: #f7f5f3; padding: 8px; border: 1px solid #dcd8de;">${foalGenotype}</span>
        </div>
    `;
    resultsContent.appendChild(mainCoatDiv);

    // Dramatic header for the chimera possibilities section
    const chimeraHeader = document.createElement('h4');
    chimeraHeader.style.cssText = 'color: #5d4b60; margin-bottom: 15px; font-size: 1.1em;';
    chimeraHeader.textContent = 'Chimera Patch Possibilities';
    resultsContent.appendChild(chimeraHeader);

    const infoBox = document.createElement('div');
    infoBox.style.cssText = 'background: #ffffff; border-left: 4px solid #8a4fc0; padding: 15px; margin-bottom: 20px; color: #6f6877; font-style: italic;';
    infoBox.textContent = 'The Chimera patch can display any combination of the traits listed below from both parents.';
    resultsContent.appendChild(infoBox);

    // Badge helpers — little labels that scream MANDATORY or whisper optional
    const mandatoryBadgeHtml = '<span style="background: #a02b2b; color: #e0b4b4; font-size: 0.75em; padding: 2px 6px; margin-left: 8px; font-weight: 600; letter-spacing: 0.03em;">MANDATORY</span>';
    const optionalBadgeHtml = '<span style="background: #ececee; color: #8a8f98; font-size: 0.75em; padding: 2px 6px; margin-left: 8px; font-weight: 600; letter-spacing: 0.03em;">OPTIONAL</span>';

    const locusInfo = possibilities.locusInfo;

    // Create a grid — organizing chaos into neat little boxes
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;';

    // Coats — the full menu of possible chimera patch colors, all properly named
    if (possibilities.fullCoatNames.length > 0) {
        const coatCard = document.createElement('div');
        coatCard.style.cssText = 'background: #ffffff; padding: 20px; border: 2px solid #dcd8de; border-left: 4px solid #5d4b60;';
        const pickNote = possibilities.fullCoatNames.length > 1
            ? '<div style="color: #8a8f98; font-size: 0.8em; margin-bottom: 10px; font-style: italic;">The chimera patch will display exactly 1 of these coats.</div>'
            : '';
        coatCard.innerHTML = `
            <h5 style="color: #5d4b60; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Coats (${possibilities.fullCoatNames.length})${mandatoryBadgeHtml}</h5>
            ${pickNote}
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.fullCoatNames.map(coat => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #f7f5f3; border-left: 3px solid #5d4b60; color: #5d4b60;">
                        ${coat}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(coatCard);
    }

    // White Markings — grouped by locus because genetics is all about who lives where
    if (possibilities.whiteMarkings.length > 0) {
        const markingsCard = document.createElement('div');
        markingsCard.style.cssText = 'background: #ffffff; padding: 20px; border: 2px solid #dcd8de; border-left: 4px solid #8a4fc0;';

        let markingsHtml = `<h5 style="color: #8a4fc0; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Markings (${possibilities.whiteMarkings.length})</h5>`;

        if (locusInfo.markingLoci.length > 0) {
            markingsHtml += locusInfo.markingLoci.map(locus => {
                const badge = locus.mandatory ? mandatoryBadgeHtml : optionalBadgeHtml;
                const borderColor = locus.mandatory ? '#a02b2b' : '#8a4fc0';
                let pickNote = '';
                let locusWarning = '';
                if (locus.combos) {
                    // Shared locus: show valid combinations computed from parent genotypes
                    pickNote = '<span style="color: #8a8f98; font-size: 0.8em; font-style: italic; margin-left: 6px;">(choose one combination)</span>';
                    if (locus.name === 'KIT' && locus.combos.some(c => c.includes('Dominant White'))) {
                        locusWarning = '<div style="color: #b23a3a; font-size: 0.8em; margin-top: 4px; margin-bottom: 4px;">WW (double Dominant White) is lethal.</div>';
                    }
                } else if (locus.traits.length > 1) {
                    if (locus.name === 'Leopard Complex') {
                        pickNote = '<span style="color: #8a8f98; font-size: 0.8em; font-style: italic; margin-left: 6px;">(pick 1)</span>';
                    } else if (locus.traits.length > 2) {
                        pickNote = '<span style="color: #8a8f98; font-size: 0.8em; font-style: italic; margin-left: 6px;">(pick up to 2)</span>';
                    } else {
                        pickNote = '<span style="color: #8a8f98; font-size: 0.8em; font-style: italic; margin-left: 6px;">(pick 1 or 2)</span>';
                    }
                }

                // Lethal white warnings
                const hasOveroLocus = locusInfo.markingLoci.some(l => l.name === 'Overo');
                const hasOssuaryLocus = locusInfo.markingLoci.some(l => l.name === 'Ossuary');
                if (locus.name === 'Overo') {
                    locusWarning += '<div style="color: #b23a3a; font-size: 0.8em; margin-top: 4px; margin-bottom: 4px;">OO (homozygous Overo) is lethal.</div>';
                    if (hasOssuaryLocus) {
                        locusWarning += '<div style="color: #b23a3a; font-size: 0.8em; margin-bottom: 4px;">Overo + Ossuary (nO nOs) is also lethal.</div>';
                    }
                }
                if (locus.name === 'Ossuary') {
                    locusWarning += '<div style="color: #b23a3a; font-size: 0.8em; margin-top: 4px; margin-bottom: 4px;">OsOs (homozygous Ossuary) is lethal.</div>';
                    if (hasOveroLocus) {
                        locusWarning += '<div style="color: #b23a3a; font-size: 0.8em; margin-bottom: 4px;">Overo + Ossuary (nO nOs) is also lethal.</div>';
                    }
                }
                const displayItems = locus.combos || locus.traits;
                return `
                    <div style="margin-bottom: 12px;">
                        <div style="color: #7d6a86; font-size: 0.85em; font-weight: 600; margin-bottom: 6px;">${locus.name}${badge}${pickNote}</div>
                        ${locusWarning}
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${displayItems.map(item => `
                                <li style="padding: 8px; margin-bottom: 4px; background: #f7f5f3; border-left: 3px solid ${borderColor}; color: #5d4b60;">
                                    ${item}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }).join('');
        }

        markingsCard.innerHTML = markingsHtml;
        grid.appendChild(markingsCard);
    }

    // Modifiers — the seasoning on the chimera's alternate-reality coat
    if (possibilities.modifiers.length > 0) {
        const modifiersCard = document.createElement('div');
        modifiersCard.style.cssText = 'background: #ffffff; padding: 20px; border: 2px solid #dcd8de; border-left: 4px solid #5f8a3f;';
        modifiersCard.innerHTML = `
            <h5 style="color: #5f8a3f; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Modifiers (${possibilities.modifiers.length})${optionalBadgeHtml}</h5>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.modifiers.map(modifier => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #f7f5f3; border-left: 3px solid #5f8a3f; color: #5d4b60;">
                        ${modifier}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(modifiersCard);
    }

    // Anomalies — the weird bonus features the chimera patch might inherit
    if (possibilities.anomalies.length > 0) {
        const anomaliesCard = document.createElement('div');
        anomaliesCard.style.cssText = 'background: #ffffff; padding: 20px; border: 2px solid #dcd8de; border-left: 4px solid #c8902e;';
        anomaliesCard.innerHTML = `
            <h5 style="color: #c8902e; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Anomalies (${possibilities.anomalies.length})${optionalBadgeHtml}</h5>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.anomalies.map(anomaly => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #f7f5f3; border-left: 3px solid #c8902e; color: #5d4b60;">
                        ${anomaly}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(anomaliesCard);
    }

    resultsContent.appendChild(grid);

    // "Roll for me" button — for when you can't decide and want the dice gods to choose
    const rollSection = document.createElement('div');
    rollSection.style.cssText = 'margin-top: 25px; text-align: center;';
    rollSection.innerHTML = `
        <button class="generate-btn" style="max-width: 400px; margin: 0 auto 20px;" onclick="rollChimeraPatch()">Roll a Chimera Patch for Me</button>
        <div id="chimeraRollResult" style="display: none;"></div>
    `;
    resultsContent.appendChild(rollSection);

    // Stash possibilities on the window like hiding loot under a floorboard
    window._chimeraPossibilities = possibilities;

    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function rollChimeraPatch() {
    const p = window._chimeraPossibilities;
    if (!p) return;

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const traits = [];

    // Coat: pick exactly 1 — the chimera patch can only BE one coat at a time, even if it wants more
    if (p.fullCoatNames.length > 0) {
        traits.push(pick(p.fullCoatNames));
    }

    // Markings: respect the sacred locus rules or face the wrath of genetics
    const singlePickLoci = ['Leopard Complex'];
    const locusInfo = p.locusInfo;

    // Track our picks for the lethal-white safety check — we're not monsters
    let pickedOvero = false;
    let pickedOssuary = false;

    if (locusInfo.markingLoci.length > 0) {
        locusInfo.markingLoci.forEach(locus => {
            if (locus.combos) {
                // Shared locus: pick one valid combination
                if (locus.mandatory || Math.random() < 0.5) {
                    traits.push(pick(locus.combos));
                }
            } else {
                const maxPicks = singlePickLoci.includes(locus.name) ? 1 : Math.min(2, locus.traits.length);

                if (locus.mandatory) {
                    // Mandatory: must pick at least 1, no wiggling out of this one
                    const count = 1 + (maxPicks > 1 && Math.random() < 0.3 ? 1 : 0);
                    const shuffled = [...locus.traits].sort(() => Math.random() - 0.5);
                    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
                        traits.push(shuffled[i]);
                        if (shuffled[i] === 'Overo') pickedOvero = true;
                        if (shuffled[i] === 'Ossuary') pickedOssuary = true;
                    }
                } else {
                    // Optional: 50% coin flip — the chimera patch might skip this entirely
                    if (Math.random() < 0.5) {
                        const count = 1 + (maxPicks > 1 && Math.random() < 0.3 ? 1 : 0);
                        const shuffled = [...locus.traits].sort(() => Math.random() - 0.5);
                        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
                            traits.push(shuffled[i]);
                            if (shuffled[i] === 'Overo') pickedOvero = true;
                            if (shuffled[i] === 'Ossuary') pickedOssuary = true;
                        }
                    }
                }
            }
        });
    }

    // Lethal white re-roll — Overo + Ossuary together is a death sentence, so we veto that combo
    if (pickedOvero && pickedOssuary) {
        // Drop one at random — sorry little guy, you're the sacrificial trait
        const dropOvero = Math.random() < 0.5;
        const idx = traits.indexOf(dropOvero ? 'Overo' : 'Ossuary');
        if (idx !== -1) traits.splice(idx, 1);
    }

    // Modifiers: each rolls a 40% chance independently — the modifier lottery
    if (p.modifiers.length > 0) {
        p.modifiers.forEach(mod => {
            if (Math.random() < 0.4) {
                traits.push(mod);
            }
        });
    }

    // Anomalies: 30% each — a little less likely than modifiers, gotta keep 'em special
    if (p.anomalies.length > 0) {
        p.anomalies.forEach(anomaly => {
            if (Math.random() < 0.3) {
                traits.push(anomaly);
            }
        });
    }

    // Drumroll please... reveal the chimera patch!
    const resultDiv = document.getElementById('chimeraRollResult');
    const coat = traits.shift(); // first item is always the coat
    const extras = traits.length > 0 ? traits.join(', ') : 'No additional traits';

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: #ffffff; border: 2px solid #8a4fc0; padding: 20px; text-align: left; box-shadow: 0 0 20px rgba(138, 79, 192, 0.3);">
            <h4 style="color: #8a4fc0; margin-bottom: 15px; font-size: 1.1em; text-align: center; font-family: 'Pirata One', serif; font-weight: 400;">Rolled Chimera Patch</h4>
            <div style="margin-bottom: 10px;">
                <strong style="color: #6f6877; font-size: 0.9em;">Coat:</strong>
                <span style="color: #5d4b60; display: block; margin-top: 5px; background: #f7f5f3; padding: 10px; border: 1px solid #dcd8de; font-size: 1.1em;">${coat}</span>
            </div>
            <div>
                <strong style="color: #6f6877; font-size: 0.9em;">Traits:</strong>
                <span style="color: #5d4b60; display: block; margin-top: 5px; background: #f7f5f3; padding: 10px; border: 1px solid #dcd8de;">${extras}</span>
            </div>
        </div>
    `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
