// Dungeon Coursers Breeding Calculator
// Because doing genetics by hand is suffering

// Store user's horse collection
let horseCollection = [];

// CSV Upload Handler
document.addEventListener('DOMContentLoaded', function() {
    const csvInput = document.getElementById('csvUpload');
    if (csvInput) {
        csvInput.addEventListener('change', handleCSVUpload);
    }

    // Close modal on Escape key or overlay click
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

function parseCSV(text) {
    const lines = text.split('\n');
    const firstLineValues = parseCSVLine(lines[0]);
    const firstLineLower = firstLineValues.map(v => v.trim().toLowerCase());

    // Figure out if the CSV has headers or if someone just dumped data in
    const knownHeaders = ['genotype', 'temperament', 'name', 'id', 'variant'];
    const hasHeaders = firstLineLower.some(h => knownHeaders.includes(h));

    let headers;
    let startLine;
    if (hasHeaders) {
        headers = firstLineLower;
        startLine = 1;
    } else {
        // Assume standard column order
        headers = ['id', 'name', 'genotype', 'temperament', 'variant'];
        startLine = 0;
    }

    horseCollection = [];

    for (let i = startLine; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = parseCSVLine(lines[i]);
        const horse = {};

        headers.forEach((header, index) => {
            horse[header] = values[index] ? values[index].trim() : '';
        });

        if (horse.genotype && horse.temperament) {
            horseCollection.push({
                id: horse.id || horse.name || `Horse ${i}`,
                name: horse.name || `Horse ${i}`,
                genotype: horse.genotype,
                temperament: horse.temperament,
                variant: horse.variant || 'Standard'
            });
        }
    }
    
    document.getElementById('collectionStatus').style.display = 'block';
    document.getElementById('horseCount').textContent = horseCollection.length;
    
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

// All the coat color lookups — if it's wrong blame the trait index
const COAT_COLORS = {
    'EE_AA': 'Bay', 'Ee_AA': 'Bay', 'EE_Aa': 'Bay', 'Ee_Aa': 'Bay',
    'EE_aa': 'Black', 'Ee_aa': 'Black',
    'ee_AA': 'Chestnut', 'ee_Aa': 'Chestnut', 'ee_aa': 'Chestnut'
};

// Special coat names — base + dilution combos that get their own fancy names
const SPECIAL_COAT_NAMES = {
    // Single Cream dilutions
    'Bay_Cream': 'Buckskin',
    'Black_Cream': 'Smoky Black',
    'Chestnut_Cream': 'Palomino',

    // Double Cream dilutions
    'Bay_Double Cream': 'Perlino',
    'Black_Double Cream': 'Smoky Cream',
    'Chestnut_Double Cream': 'Cremello',

    // Single Tapestry dilutions
    'Bay_Tapestry': 'Madder',
    'Black_Tapestry': 'Woad',
    'Chestnut_Tapestry': 'Weld',

    // Pearl dilutions
    'Bay_Pearl': 'Bay Pearl',
    'Black_Pearl': 'Black Pearl',
    'Chestnut_Pearl': 'Gold Pearl',

    // Champagne dilutions
    'Bay_Champagne': 'Amber Champagne',
    'Black_Champagne': 'Classic Champagne',
    'Chestnut_Champagne': 'Gold Champagne',

    // Ether dilutions
    'Bay_Ether': 'Ombre Ether',
    'Black_Ether': 'Classic Ether',
    'Chestnut_Ether': 'Cold Ether',

    // Tapestry + Cream combinations
    'Bay_Tapestry Cream': 'Madder Buckskin',
    'Black_Tapestry Cream': 'Woad Smoky Black',
    'Chestnut_Tapestry Cream': 'Weld Palomino',

    // Tapestry Ether combinations
    'Bay_Tapestry Ether': 'Madder Ether',
    'Black_Tapestry Ether': 'Woad Ether',
    'Chestnut_Tapestry Ether': 'Weld Ether',

    // Pearl Ether combinations
    'Bay_Pearl Ether': 'Bay Pearl Ether',
    'Black_Pearl Ether': 'Black Pearl Ether',
    'Chestnut_Pearl Ether': 'Gold Pearl Ether',

    // Pearl Champagne combinations
    'Bay_Pearl Champagne': 'Bay Pearl Champagne',
    'Black_Pearl Champagne': 'Black Pearl Champagne',
    'Chestnut_Pearl Champagne': 'Gold Pearl Champagne',

    // Cream Champagne combinations
    'Bay_Cream Champagne': 'Amber Cream Champagne',
    'Black_Cream Champagne': 'Classic Cream Champagne',
    'Chestnut_Cream Champagne': 'Gold Cream Champagne',

    // Cream Ether combinations
    'Bay_Cream Ether': 'Ombre Cream Ether',
    'Black_Cream Ether': 'Classic Cream Ether',
    'Chestnut_Cream Ether': 'Cold Cream Ether',

    // Tapestry Champagne combinations
    'Bay_Tapestry Champagne': 'Madder Champagne',
    'Black_Tapestry Champagne': 'Woad Champagne',
    'Chestnut_Tapestry Champagne': 'Weld Champagne',

    // Cream Pearl Champagne (triple dilution)
    'Bay_Cream Pearl Champagne': 'Amber Cream Pearl Champagne',
    'Black_Cream Pearl Champagne': 'Classic Cream Pearl Champagne',
    'Chestnut_Cream Pearl Champagne': 'Gold Cream Pearl Champagne',

    // Cream Pearl Ether (triple dilution)
    'Bay_Cream Pearl Ether': 'Ombre Cream Pearl Ether',
    'Black_Cream Pearl Ether': 'Classic Cream Pearl Ether',
    'Chestnut_Cream Pearl Ether': 'Cold Cream Pearl Ether',

    // Tapestry Cream Ether (triple dilution)
    'Bay_Tapestry Cream Ether': 'Madder Cream Ether',
    'Black_Tapestry Cream Ether': 'Woad Cream Ether',
    'Chestnut_Tapestry Cream Ether': 'Weld Cream Ether',

    // Tapestry Pearl (base double dilution)
    'Bay_Tapestry Pearl': 'Tyrian Pearl',
    'Black_Tapestry Pearl': 'Phthalo Pearl',
    'Chestnut_Tapestry Pearl': 'Ochre Pearl',

    // Tapestry Pearl Champagne (triple dilution)
    'Bay_Tapestry Pearl Champagne': 'Tyrian Pearl Champagne',
    'Black_Tapestry Pearl Champagne': 'Phthalo Pearl Champagne',
    'Chestnut_Tapestry Pearl Champagne': 'Ochre Pearl Champagne',

    // Tapestry Pearl Ether (triple dilution)
    'Bay_Tapestry Pearl Ether': 'Tyrian Pearl Ether',
    'Black_Tapestry Pearl Ether': 'Phthalo Pearl Ether',
    'Chestnut_Tapestry Pearl Ether': 'Ochre Pearl Ether',

    // Tapestry Cream Champagne (triple dilution)
    'Bay_Tapestry Cream Champagne': 'Madder Cream Champagne',
    'Black_Tapestry Cream Champagne': 'Woad Cream Champagne',
    'Chestnut_Tapestry Cream Champagne': 'Weld Cream Champagne'
};

const DILUTION_NAMES = {
    // Locus 1: Cr, Tp, prl — these three share a locus
    'nCr': 'Cream', 'Cr': 'Cream', 'CrCr': 'Double Cream',
    'nTp': 'Tapestry', 'Tp': 'Tapestry', 'TpTp': 'Tapestry',
    'nprl': 'Pearl', 'prl': 'Pearl', 'prlprl': 'Pearl',
    'Crprl': 'Cream Pearl',
    'TpCr': 'Tapestry Cream',
    'Tpprl': 'Tapestry Pearl',

    // Locus 2: Ch, er — same locus, Ch is dominant so Cher = just Champagne
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
    'nZ': 'Silver',
    'nLu': 'Illuminated', 'LuLu': 'Illuminated',
    'nsp': 'Sepulchered', 'spsp': 'Sepulchered',
    'Lusp': 'Illuminated Sepulchered',
    'nTd': 'Tabard',
    'nGl': 'Gilt', 'GlGl': 'Gilt',
    'nV': 'Vellum',
    'nOp': 'Opal', 'OpOp': 'Opal',
    'nPr': 'Prism', 'PrPr': 'Prism',
    'PrOp': 'Prism Opal',
    'nsf': 'Starfield', 'sfsf': 'Starfield',
    'nlr': 'Lacquer', 'lrlr': 'Lacquer'
};

// Traits that go BEFORE the coat color in the phenotype string
const TRAITS_BEFORE_COAT = [
    'Dominant White', 'Crowned', 'Flaxen', 'Carrying Flaxen', 'Pangare',
    'Sooty', 'Gray', 'Silver', 'Illuminated', 'Gilt', 'Opal', 'Prism',
    'Starfield', 'Carrying Starfield', 'Vellum', 'Lacquer', 'Carrying Lacquer'
];

// Traits that go AFTER the coat color in the phenotype string
const TRAITS_AFTER_COAT = [
    'Dun', 'Tabard', 'Cuirass', 'Sepulchered', 'Carrying Sepulchered',
    // White markings generally go after
    'Tobiano', 'Overo', 'Splash', 'Roan', 'Sabino', 'Blanket', 'Snowcap',
    'Varnish Roan', 'Leopard', 'Fewspot', 'Snowflake', 'Ossuary',
    'Shroud', 'Filigree', 'Carrying Filigree', 'Harlequin', 'Rabicano', 'False Leopard',
    'Girdle', 'Collar', 'Blanched',
    // KIT compound phenotypes
    'Tobiano Roan', 'Tobiano Sabino', 'Tobiano Dominant White',
    'Roan Sabino', 'Roan Dominant White', 'Sabino Dominant White',
    // B/Fl compound
    'Blanched False Leopard',
    // Gi/Co compound
    'Girdle Collar',
    // Carrier traits
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
    // KIT locus compounds (both orderings)
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
    const allTraits = []; // Collect all traits with their category

    // Find base coat (E and A genes)
    const eGene = genes.find(g => g.match(/^[Ee][Ee]?$/));
    const aGene = genes.find(g => g.match(/^[Aa][Aa]?$/));

    if (eGene && aGene) {
        const key = `${eGene}_${aGene}`;
        baseCoat = COAT_COLORS[key] || 'Unknown';
    }

    // Grab dilutions from both loci
    // Locus 1: Cr/Tp/prl — Locus 2: Ch/er

    const locus1Gene = genes.find(g => /Cr|Tp|prl/.test(g) && !/(Ch|er)/.test(g));
    const locus2Gene = genes.find(g => /Ch|er/.test(g) && !/(Cr|Tp|prl)/.test(g));

    if (locus1Gene && DILUTION_NAMES[locus1Gene]) {
        dilutions.push(DILUTION_NAMES[locus1Gene]);
    }
    if (locus2Gene && DILUTION_NAMES[locus2Gene]) {
        dilutions.push(DILUTION_NAMES[locus2Gene]);
    }

    // Ether is recessive — you only see it at erer, otherwise it's just carried
    if (locus2Gene === 'ner' || locus2Gene === 'Cher') {
        allTraits.push('Carries Ether');
    }

    // Build special coat color name
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

    // White markings — handle compounds by splitting into individual traits
    genes.forEach(gene => {
        if (WHITE_MARKING_NAMES[gene]) {
            // nfe = carries Filigree, fefe = actual Filigree
            if (gene === 'nfe') {
                allTraits.push('Carrying Filigree');
            // Compound locus genes — split into their individual traits
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

    // Leopard Complex — Lp + patn determines the pattern
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
        // patn without Lp does nothing visible, just carried
        allTraits.push('Carries Patn');
    }

    // Modifiers — compounds get split, carriers get labeled
    genes.forEach(gene => {
        if (MODIFIER_NAMES[gene]) {
            // Compound genes get split into their visible traits
            if (gene === 'PrOp') {
                allTraits.push('Prism');
                allTraits.push('Opal');
            } else if (gene === 'Lusp') {
                allTraits.push('Illuminated');
                allTraits.push('Sepulchered');
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

    // Sort traits into before/after coat color for proper phenotype order
    const traitsBeforeCoat = allTraits.filter(trait => TRAITS_BEFORE_COAT.includes(trait));
    const traitsAfterCoat = allTraits.filter(trait => TRAITS_AFTER_COAT.includes(trait));

    // Build phenotype string in in-game format
    const phenotypeParts = [];
    if (traitsBeforeCoat.length > 0) phenotypeParts.push(traitsBeforeCoat.join(' '));
    phenotypeParts.push(coatColor);
    if (traitsAfterCoat.length > 0) phenotypeParts.push(traitsAfterCoat.join(' '));

    let phenotype = phenotypeParts.join(' ');

    // Add anomalies with "with" instead of "+"
    if (anomalies.length > 0) {
        phenotype += ' with ' + anomalies.join(', ');
    }

    return phenotype.trim();
}

function getGeneAlleles(gene) {
    // Break a gene into its two alleles
    if (gene === 'EE' || gene === 'Ee' || gene === 'ee') {
        return gene.split('');
    }
    if (gene === 'AA' || gene === 'Aa' || gene === 'aa') {
        return gene.split('');
    }
    
    // n-prefix = heterozygous (one copy)
    if (gene.startsWith('n')) {
        return ['n', gene.substring(1)];
    }
    
    // Compound dilutions — two different alleles at the same locus
    if (gene.includes('Cr') && gene.includes('prl')) {
        return ['Cr', 'prl'];  // Crprl
    }
    if (gene.includes('Tp') && gene.includes('prl')) {
        return ['Tp', 'prl'];  // Tpprl
    }
    if (gene.includes('Tp') && gene.includes('Cr')) {
        return ['Tp', 'Cr'];  // TpCr
    }

    // Ch and er share their own locus (separate from Cr/Tp/prl)
    if (gene.includes('Ch') && gene.includes('er')) {
        return ['Ch', 'er'];  // Cher
    }

    // Homozygous versions
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
    // White marking homozygous
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
    
    // Modifier homozygous
    if (gene === 'PP') return ['P', 'P'];
    if (gene === 'StySty') return ['Sty', 'Sty'];
    if (gene === 'GlGl') return ['Gl', 'Gl'];
    if (gene === 'ZZ') return ['Z', 'Z'];
    if (gene === 'TdTd') return ['Td', 'Td'];
    if (gene === 'VV') return ['V', 'V'];
    // Shared locus homozygous
    if (gene === 'LuLu') return ['Lu', 'Lu'];
    if (gene === 'PrPr') return ['Pr', 'Pr'];
    if (gene === 'OpOp') return ['Op', 'Op'];
    // Compound heterozygous genes (shared loci)
    if (gene === 'Lusp') return ['Lu', 'sp'];
    if (gene === 'PrOp') return ['Pr', 'Op'];
    if (gene === 'CuCw') return ['Cu', 'Cw'];
    if (gene === 'BFl' || gene === 'FlB') return ['B', 'Fl'];
    if (gene === 'GiCo' || gene === 'CoGi') return ['Gi', 'Co'];
    // KIT locus compounds (both orderings)
    if (gene === 'TRn' || gene === 'RnT') return ['T', 'Rn'];
    if (gene === 'TSb' || gene === 'SbT') return ['T', 'Sb'];
    if (gene === 'TW' || gene === 'WT') return ['T', 'W'];
    if (gene === 'RnSb' || gene === 'SbRn') return ['Rn', 'Sb'];
    if (gene === 'RnW' || gene === 'WRn') return ['Rn', 'W'];
    if (gene === 'SbW' || gene === 'WSb') return ['Sb', 'W'];

    // Complex patterns
    if (gene === 'patnpatn') return ['patn', 'patn'];
    if (gene === 'patn') return ['patn'];

    return [gene];
}

function inheritGene(parent1Gene, parent2Gene, probability = 0.5) {
    const alleles1 = getGeneAlleles(parent1Gene);
    const alleles2 = getGeneAlleles(parent2Gene);
    
    // Randomly select one allele from each parent
    const from1 = alleles1[Math.random() < 0.5 ? 0 : Math.min(1, alleles1.length - 1)];
    const from2 = alleles2[Math.random() < 0.5 ? 0 : Math.min(1, alleles2.length - 1)];
    
    return combineAlleles(from1, from2);
}

function combineAlleles(allele1, allele2) {
    // Smash two alleles together into proper gene notation
    if (allele1 === allele2) {
        // Homozygous
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
        // White marking homozygous
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
    
    // Heterozygous
    if ((allele1 === 'E' && allele2 === 'e') || (allele1 === 'e' && allele2 === 'E')) return 'Ee';
    if ((allele1 === 'A' && allele2 === 'a') || (allele1 === 'a' && allele2 === 'A')) return 'Aa';
    
    // Dilution combinations
    if ((allele1 === 'Cr' && allele2 === 'prl') || (allele1 === 'prl' && allele2 === 'Cr')) return 'Crprl';
    if ((allele1 === 'Tp' && allele2 === 'prl') || (allele1 === 'prl' && allele2 === 'Tp')) return 'Tpprl';
    if ((allele1 === 'Tp' && allele2 === 'Cr') || (allele1 === 'Cr' && allele2 === 'Tp')) return 'TpCr';

    // Ch/er — their own locus, separate from Cr/Tp/prl
    if ((allele1 === 'Ch' && allele2 === 'er') || (allele1 === 'er' && allele2 === 'Ch')) return 'Cher';

    // Shared locus compounds — allelic genes that can combine
    if ((allele1 === 'B' && allele2 === 'Fl') || (allele1 === 'Fl' && allele2 === 'B')) return 'BFl';
    if ((allele1 === 'Cu' && allele2 === 'Cw') || (allele1 === 'Cw' && allele2 === 'Cu')) return 'CuCw';
    if ((allele1 === 'Gi' && allele2 === 'Co') || (allele1 === 'Co' && allele2 === 'Gi')) return 'GiCo';
    if ((allele1 === 'Lu' && allele2 === 'sp') || (allele1 === 'sp' && allele2 === 'Lu')) return 'Lusp';
    if ((allele1 === 'Pr' && allele2 === 'Op') || (allele1 === 'Op' && allele2 === 'Pr')) return 'PrOp';
    // KIT locus — T, Rn, Sb, W all live here
    if ((allele1 === 'T' && allele2 === 'Rn') || (allele1 === 'Rn' && allele2 === 'T')) return 'TRn';
    if ((allele1 === 'T' && allele2 === 'Sb') || (allele1 === 'Sb' && allele2 === 'T')) return 'TSb';
    if ((allele1 === 'T' && allele2 === 'W') || (allele1 === 'W' && allele2 === 'T')) return 'TW';
    if ((allele1 === 'Rn' && allele2 === 'Sb') || (allele1 === 'Sb' && allele2 === 'Rn')) return 'RnSb';
    if ((allele1 === 'Rn' && allele2 === 'W') || (allele1 === 'W' && allele2 === 'Rn')) return 'RnW';
    if ((allele1 === 'Sb' && allele2 === 'W') || (allele1 === 'W' && allele2 === 'Sb')) return 'SbW';

    // For n + allele combinations
    if (allele1 === 'n') return 'n' + allele2;
    if (allele2 === 'n') return 'n' + allele1;
    
    // Default
    return allele1 + allele2;
}

function inheritBaseCoat(parent1Genes, parent2Genes) {
    // Find E and A genes
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

    // Base coat - use proper Mendelian inheritance
    const [eGene, aGene] = inheritBaseCoat(p1.genes, p2.genes);
    foalGenes.push(eGene, aGene);

    // Helper to find gene in parent's genes
    function findGene(genes, pattern) {
        return genes.find(g => {
            if (typeof pattern === 'string') {
                return g.includes(pattern);
            }
            return pattern.test(g);
        });
    }

    // Dilutions — two separate loci, inherited independently
    const p1Dilution1 = findGene(p1.genes, /Cr|Tp|prl/);
    const p2Dilution1 = findGene(p2.genes, /Cr|Tp|prl/);

    if (p1Dilution1 || p2Dilution1) {
        const dilutionGene = inheritGene(p1Dilution1 || 'nn', p2Dilution1 || 'nn');
        if (dilutionGene !== 'nn' && dilutionGene !== 'n') {
            foalGenes.push(dilutionGene);
        }
    }

    // Ch/er locus
    const p1ChEr = findGene(p1.genes, /Ch|er/);
    const p2ChEr = findGene(p2.genes, /Ch|er/);

    if (p1ChEr || p2ChEr) {
        const chErGene = inheritGene(p1ChEr || 'nn', p2ChEr || 'nn');
        if (chErGene !== 'nn' && chErGene !== 'n') {
            foalGenes.push(chErGene);
        }
    }

    // Leopard complex — Lp and patn are separate loci
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

    // White markings — shared loci inherit together, not independently
    // KIT locus: T, Rn, Sb, W (max 2 KIT mutations per horse)
    const kitPattern = /^(nT|TT|nRn|RnRn|nSb|SbSb|nW|WW|TRn|RnT|TSb|SbT|TW|WT|RnSb|SbRn|RnW|WRn|SbW|WSb)$/;
    const p1Kit = findGene(p1.genes, kitPattern);
    const p2Kit = findGene(p2.genes, kitPattern);
    if (p1Kit || p2Kit) {
        const inherited = inheritGene(p1Kit || 'nn', p2Kit || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // B/Fl locus
    const bFlPattern = /^(nB|BB|nFl|FlFl|BFl|FlB)$/;
    const p1BFl = findGene(p1.genes, bFlPattern);
    const p2BFl = findGene(p2.genes, bFlPattern);
    if (p1BFl || p2BFl) {
        const inherited = inheritGene(p1BFl || 'nn', p2BFl || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // Cu/Cw locus
    const cuCwPattern = /^(nCu|CuCu|nCw|CwCw|CuCw)$/;
    const p1CuCw = findGene(p1.genes, cuCwPattern);
    const p2CuCw = findGene(p2.genes, cuCwPattern);
    if (p1CuCw || p2CuCw) {
        const inherited = inheritGene(p1CuCw || 'nn', p2CuCw || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // Gi/Co locus
    const giCoPattern = /^(nGi|GiGi|nCo|CoCo|GiCo|CoGi)$/;
    const p1GiCo = findGene(p1.genes, giCoPattern);
    const p2GiCo = findGene(p2.genes, giCoPattern);
    if (p1GiCo || p2GiCo) {
        const inherited = inheritGene(p1GiCo || 'nn', p2GiCo || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // These markings are each on their own locus
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

    // Modifiers — shared loci first
    // Lu/sp locus
    const luSpPattern = /^(nLu|LuLu|nsp|spsp|Lusp)$/;
    const p1LuSp = findGene(p1.genes, luSpPattern);
    const p2LuSp = findGene(p2.genes, luSpPattern);
    if (p1LuSp || p2LuSp) {
        const inherited = inheritGene(p1LuSp || 'nn', p2LuSp || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // Pr/Op locus
    const prOpPattern = /^(nPr|PrPr|nOp|OpOp|PrOp)$/;
    const p1PrOp = findGene(p1.genes, prOpPattern);
    const p2PrOp = findGene(p2.genes, prOpPattern);
    if (p1PrOp || p2PrOp) {
        const inherited = inheritGene(p1PrOp || 'nn', p2PrOp || 'nn');
        if (inherited !== 'nn' && inherited !== 'n' && !foalGenes.includes(inherited)) {
            foalGenes.push(inherited);
        }
    }

    // These modifiers are each on their own locus
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
    
    // Anomalies (25% chance each)
    [...p1.anomalies, ...p2.anomalies].forEach(anomaly => {
        if (Math.random() < 0.25) {
            if (!foalAnomalies.includes(anomaly)) {
                foalAnomalies.push(anomaly);
            }
        }
    });
    
    // 5% random anomaly
    if (Math.random() < 0.05) {
        const randomAnomalies = ['Bend-or Spots', 'Birdcatcher Spots', 'Brindle', 'Chimera', 
                                'Geode', 'Ore', 'Stained Glass', 'Kintsugi', 'Swarf', 'Vitiligo',
                                'Oracle', 'Signet', 'Pennant', 'Pastiche', 'Fresco', 'Lantern'];
        const random = randomAnomalies[Math.floor(Math.random() * randomAnomalies.length)];
        if (!foalAnomalies.includes(random)) {
            foalAnomalies.push(random);
        }
    }
    
    // Variant inheritance (25% chance from each parent)
    let variant = '';
    if (parent1.variant && parent1.variant !== 'Standard' && Math.random() < 0.25) {
        variant = parent1.variant;
    } else if (parent2.variant && parent2.variant !== 'Standard' && Math.random() < 0.25) {
        variant = parent2.variant;
    }
    
    // Temperament — can't match either parent
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
    
    // Validation
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
        errorMsg.textContent = 'Cannot breed! Both parents have the same Temperament (' + parent1.temperament + '). Parents must have different Temperaments.';
        errorMsg.style.display = 'block';
        return;
    }
    
    // Generate 4 foals
    const foals = [];
    for (let i = 0; i < 4; i++) {
        foals.push(generateFoal(parent1, parent2, i));
    }
    
    // Display results
    displayFoals(foals);
}

function displayFoals(foals) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsGrid = document.getElementById('resultsGrid');

    resultsGrid.innerHTML = '';

    // Get parent genotypes for Chimera calculation
    const parent1Geno = document.getElementById('parent1Geno').value.trim();
    const parent2Geno = document.getElementById('parent2Geno').value.trim();

    foals.forEach((foal, index) => {
        const card = document.createElement('div');
        card.className = 'foal-card';

        const rarityScore = calculateRarity(foal.genotype);
        const rarityClass = getRarityClass(rarityScore);
        const phenotype = genotypeToPhenotype(foal.genotype);

        // Check if foal has Chimera
        const hasChimera = foal.genotype.toLowerCase().includes('chimera');

        let chimeraSection = '';
        if (hasChimera) {
            const chimeraPossibilities = generateChimeraPossibilities(foal.genotype, parent1Geno, parent2Geno);

            const totalOptions = chimeraPossibilities.baseCoats.length +
                                chimeraPossibilities.dilutions.length +
                                chimeraPossibilities.whiteMarkings.length +
                                chimeraPossibilities.modifiers.length +
                                chimeraPossibilities.anomalies.length;

            chimeraSection = `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #543954;">
                    <strong style="color: #c084fc; display: block; margin-bottom: 10px;">🎨 Chimera Possibilities:</strong>
                    <div style="background: #1d181d; padding: 12px; margin-bottom: 10px; border-left: 3px solid #a855f7;">
                        ${chimeraPossibilities.baseCoats.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #d4af37; font-size: 0.85em;">Base Coats (${chimeraPossibilities.baseCoats.length}):</strong>
                                <div style="color: #b8a89f; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.baseCoats.join(', ')}</div>
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.dilutions.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #60a5fa; font-size: 0.85em;">Dilutions (${chimeraPossibilities.dilutions.length}):</strong>
                                <div style="color: #b8a89f; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.dilutions.join(', ')}</div>
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.whiteMarkings.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #c084fc; font-size: 0.85em;">Markings (${chimeraPossibilities.whiteMarkings.length}):</strong>
                                <div style="color: #b8a89f; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.whiteMarkings.join(', ')}</div>
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.modifiers.length > 0 ? `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #4ade80; font-size: 0.85em;">Modifiers (${chimeraPossibilities.modifiers.length}):</strong>
                                <div style="color: #b8a89f; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.modifiers.join(', ')}</div>
                            </div>
                        ` : ''}
                        ${chimeraPossibilities.anomalies.length > 0 ? `
                            <div>
                                <strong style="color: #fbbf24; font-size: 0.85em;">Anomalies (${chimeraPossibilities.anomalies.length}):</strong>
                                <div style="color: #b8a89f; font-size: 0.8em; margin-top: 4px;">${chimeraPossibilities.anomalies.join(', ')}</div>
                            </div>
                        ` : ''}
                    </div>
                    <button onclick='fillChimeraCalculator("${foal.genotype.replace(/'/g, "&#39;")}", "${parent1Geno.replace(/'/g, "&#39;")}", "${parent2Geno.replace(/'/g, "&#39;")}")'
                            style="margin-top: 10px; padding: 8px 12px; background: linear-gradient(135deg, #6b4f6b 0%, #543954 100%); color: #c084fc; border: 2px solid #a855f7; cursor: pointer; font-weight: 600; width: 100%; font-size: 0.85em;">
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
                <span>${foal.genotype}</span>
            </div>
            <span class="rarity-badge ${rarityClass}">Rarity: ${rarityScore}</span>
            ${chimeraSection}
        `;

        resultsGrid.appendChild(card);
    });

    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function calculateRarity(genotype) {
    let score = 0;

    // Legendary coat combinations (3 dilutions across both loci)
    if (genotype.includes('Tpprl') && genotype.includes('erer')) score += 100;
    if (genotype.includes('Tpprl') && genotype.includes('Ch')) score += 100;
    if (genotype.includes('Crprl') && genotype.includes('Ch')) score += 100;
    if (genotype.includes('Crprl') && genotype.includes('erer')) score += 100;
    if (genotype.includes('TpCr') && genotype.includes('erer')) score += 100;
    if (genotype.includes('TpCr') && genotype.includes('Ch')) score += 100;
    // Legendary markings/modifiers
    if (genotype.includes('fefe')) score += 100;
    if (genotype.includes('nOs')) score += 100;
    if (genotype.includes('nPr')) score += 100;
    if (genotype.includes('sfsf')) score += 100;

    // Epic coat combinations (2 dilutions across both loci, or compound within locus)
    if (genotype.includes('Tpprl') && score < 100) score += 50;
    if (genotype.includes('Crprl') && score < 100) score += 50;
    if (genotype.includes('nCr') && genotype.includes('nCh') && score < 100) score += 50;
    if (genotype.includes('nCr') && genotype.includes('erer') && score < 100) score += 50;
    if (genotype.includes('nTp') && genotype.includes('nCh') && score < 100) score += 50;
    if (genotype.includes('nTp') && genotype.includes('erer') && score < 100) score += 50;
    if (genotype.includes('prlprl') && genotype.includes('Ch') && score < 100) score += 50;
    if (genotype.includes('prlprl') && genotype.includes('erer') && score < 100) score += 50;
    // Epic markings/modifiers
    if (genotype.includes('nSh')) score += 50;
    if (genotype.includes('nHq')) score += 50;
    if (genotype.includes('nOp')) score += 50;
    if (genotype.includes('LpLp patnpatn')) score += 50;
    if (genotype.includes('lrlr')) score += 50;
    // Carriers score lower than expressed forms
    if (genotype.includes('nfe')) score += 25;
    if (genotype.includes('nsf')) score += 25;
    if (genotype.includes('nlr')) score += 25;

    // Rare coat colors
    if (genotype.includes('nCh') && score < 50) score += 25;
    if (genotype.includes('CrCr') && score < 50) score += 25;
    if (genotype.includes('prlprl') && score < 50) score += 25;
    if (genotype.includes('TpCr') && score < 50) score += 25;
    if (genotype.includes('erer') && score < 50) score += 25;
    // Rare markings/modifiers
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

// Custom Scroll Generator — genes sorted by rarity tier
const RARITY_GENES = {
    legendary: {
        coatColors: [
            // Triple dilution combinations (Locus 1 compound + Locus 2 homozygous/heterozygous)
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
            // Two dilutions across both loci, or compound within locus
            // Cream Champagne (Cr + Ch)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCr', 'nCh'] }, // Amber Cream Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCr', 'nCh'] }, // Classic Cream Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCr', 'nCh'] }, // Gold Cream Champagne
            // Cream Pearl (Crprl)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Crprl'] }, // Buckskin Pearl
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Crprl'] }, // Smoky Black Pearl
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Crprl'] }, // Palomino Pearl
            // Pearl Champagne (prlprl + Ch)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'prlprl', 'nCh'] }, // Bay Pearl Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'prlprl', 'nCh'] }, // Black Pearl Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'prlprl', 'nCh'] }, // Gold Pearl Champagne
            // Tapestry Champagne (Tp + Ch)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nTp', 'nCh'] }, // Madder Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nTp', 'nCh'] }, // Woad Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nTp', 'nCh'] }, // Weld Champagne
            // Tapestry Pearl (Tpprl)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'Tpprl'] }, // Tyrian Pearl
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'Tpprl'] }, // Phthalo Pearl
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'Tpprl'] }, // Ochre Pearl
            // Cream Ether (Cr + erer)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCr', 'erer'] }, // Ombre Cream Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCr', 'erer'] }, // Classic Cream Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCr', 'erer'] }, // Cold Cream Ether
            // Tapestry Ether (Tp + erer)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nTp', 'erer'] }, // Madder Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nTp', 'erer'] }, // Woad Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nTp', 'erer'] }, // Weld Ether
            // Pearl Ether (prlprl + erer)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'prlprl', 'erer'] }, // Bay Pearl Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'prlprl', 'erer'] }, // Black Pearl Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'prlprl', 'erer'] } // Gold Pearl Ether
        ],
        markings: ['nHq', 'LpLp patnpatn', 'nSh'],
        modifiers: ['nOp', 'lrlr']
    },
    rare: {
        coatColors: [
            // Champagne (nCh)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCh'] }, // Amber Champagne
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCh'] }, // Classic Champagne
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCh'] }, // Gold Champagne
            // Double Cream (CrCr)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'CrCr'] }, // Perlino
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'CrCr'] }, // Smoky Cream
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'CrCr'] }, // Cremello
            // Pearl (prlprl)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'prlprl'] }, // Bay Pearl
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'prlprl'] }, // Black Pearl
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'prlprl'] }, // Gold Pearl
            // Tapestry Cream (TpCr)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'TpCr'] }, // Madder Buckskin
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'TpCr'] }, // Woad Smoky Black
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'TpCr'] }, // Weld Palomino
            // Ether (erer)
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'erer'] }, // Ombre Ether
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'erer'] }, // Classic Ether
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'erer'] } // Cold Ether
        ],
        markings: ['nB', 'nLp patnpatn', 'LpLp patn', 'LpLp', 'nW', 'nRb', 'nFl'],
        modifiers: ['nTd', 'nGl', 'nV']
    },
    uncommon: {
        coatColors: [
            // Cream (nCr) - visible single dilution
            { baseCoat: 'Bay', genes: ['Ee', 'AA', 'nCr'] }, // Buckskin
            { baseCoat: 'Black', genes: ['Ee', 'aa', 'nCr'] }, // Smoky Black
            { baseCoat: 'Chestnut', genes: ['ee', 'AA', 'nCr'] }, // Palomino
            // Tapestry (nTp) - visible single dilution
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

    // Build list of available coat colors (this rarity level)
    let availableCoatColors = [...rarityData.coatColors];

    // Build list of available markings/modifiers (this rarity and lower)
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const rarityIndex = rarityOrder.indexOf(rarityKey);

    let availableMarkings = [];
    let availableModifiers = [];

    for (let i = 0; i <= rarityIndex; i++) {
        const currentRarity = rarityOrder[i];
        availableMarkings = availableMarkings.concat(RARITY_GENES[currentRarity].markings);
        availableModifiers = availableModifiers.concat(RARITY_GENES[currentRarity].modifiers);
    }

    // Generate the horse
    const genes = [];

    // 1. Select random coat color
    const selectedCoat = getRandomElement(availableCoatColors);
    genes.push(...selectedCoat.genes);

    // 2. Select 1 marking, modifier, or carrier (50/50 split between marking and modifier)
    const allTraits = [...availableMarkings, ...availableModifiers];
    if (allTraits.length > 0) {
        const selectedTrait = getRandomElement(allTraits);
        // Handle multi-gene traits (e.g. "LpLp patnpatn" for Fewspot)
        if (selectedTrait.includes(' ')) {
            selectedTrait.split(' ').forEach(g => genes.push(g));
        } else {
            genes.push(selectedTrait);
        }
    }

    // 3. 10% chance of random anomaly
    const anomalies = [];
    if (Math.random() < 0.10) {
        anomalies.push(getRandomElement(ALL_ANOMALIES));
    }

    // 4. 5% chance of random variant (non-Standard)
    let variant = 'Standard';
    if (Math.random() < 0.05) {
        const nonStandardVariants = VARIANTS.filter(v => v !== 'Standard');
        variant = getRandomElement(nonStandardVariants);
    }

    // 5. Random temperament
    const temperament = getRandomElement(TEMPERAMENTS);

    // Build genotype string
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
                    style="margin-top: 15px; padding: 10px 20px; background: #543954; color: #d4af37; border: 2px solid #d4af37; cursor: pointer; font-weight: 600;">
                Generate Another
            </button>
        </div>
    `;

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Breeding Search — "how do I make X?" answered with your actual horses
function searchBreeding() {
    const query = document.getElementById('breedingQuery').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');
    const resultsContent = document.getElementById('searchResultsContent');
    
    if (!query) {
        alert('Please enter a breeding question!');
        return;
    }
    
    if (horseCollection.length === 0) {
        alert('Please upload your horse collection CSV first!');
        return;
    }
    
    resultsContent.innerHTML = '';

    // Extract target traits from query
    const targetTraits = extractTraitsFromQuery(query);

    if (targetTraits.length === 0) {
        resultsContent.innerHTML = '<p style="color: #b8a89f;">Could not identify specific traits in your query. Try asking like: "How can I make Amber Champagne?" or "Who can breed for fewspot?"</p>';
        resultsDiv.style.display = 'block';
        return;
    }

    // Find breeding pairs that could produce these traits
    const matches = findBreedingMatches(targetTraits);

    if (matches.length === 0) {
        resultsContent.innerHTML = `<p style="color: #b8a89f;">No breeding pairs found in your collection that can produce: <strong style="color: #d4af37;">${targetTraits.join(', ')}</strong></p>`;
    } else {
        // Store matches for the modal
        lastSearchMatches = matches;
        lastSearchTraits = targetTraits;

        resultsContent.innerHTML = `
            <p style="color: #b8a89f; margin-bottom: 15px;">Found <strong style="color: #d4af37;">${matches.length}</strong> possible breeding pair(s) for: <strong style="color: #d4af37;">${targetTraits.join(', ')}</strong></p>
            <button onclick="openSearchModal()"
                    style="padding: 12px 24px; background: linear-gradient(135deg, #543954 0%, #6b4f6b 100%); color: #d4af37; border: 2px solid #d4af37; cursor: pointer; font-family: 'Silkscreen', serif; font-size: 0.9em; letter-spacing: 1px; transition: all 0.2s;">
                View All Results
            </button>
        `;
    }

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            <p style="color: #d4af37; font-size: 0.85em; margin: 4px 0;">${p1Pheno}</p>
            <span class="geno">${match.parent1.genotype}</span>
            <p><strong>Parent 2:</strong> ${match.parent2.id} - ${match.parent2.temperament}</p>
            <p style="color: #d4af37; font-size: 0.85em; margin: 4px 0;">${p2Pheno}</p>
            <span class="geno">${match.parent2.genotype}</span>
            <p style="margin-top: 10px;"><strong style="color: #d4af37;">Match Score:</strong> ${match.score} | <strong style="color: #d4af37;">Probability:</strong> ${match.probability}</p>
        `;
        item.addEventListener('click', function() {
            fillParents(match.parent1, match.parent2);
            closeSearchModal();
        });
        modalBody.appendChild(item);
    });

    // Scroll modal to top on page change
    document.getElementById('searchModal').scrollTop = 0;

    // Pagination controls
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

    // Coat colors - ordered from most specific (longest) to least specific
    // Only ONE coat color trait should be matched per query
    // Each entry: [search term, trait name]
    const coatColors = [
        // Legendary quad dilutions
        ['amber cream pearl champagne', 'Amber Cream Pearl Champagne'],
        ['classic cream pearl champagne', 'Classic Cream Pearl Champagne'],
        ['gold cream pearl champagne', 'Gold Cream Pearl Champagne'],
        ['ombre cream pearl ether', 'Ombre Cream Pearl Ether'],
        ['classic cream pearl ether', 'Classic Cream Pearl Ether'],
        ['cold cream pearl ether', 'Cold Cream Pearl Ether'],
        // Legendary triple dilutions
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
        // Epic double dilutions
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
        // Uncommon/Rare specific dilutions
        ['amber champagne', 'Amber Champagne'], ['amber champ', 'Amber Champagne'],
        ['gold champagne', 'Gold Champagne'], ['gold champ', 'Gold Champagne'],
        ['classic champagne', 'Classic Champagne'],
        ['bay pearl', 'Bay Pearl'],
        ['black pearl', 'Black Pearl'],
        ['gold pearl', 'Gold Pearl'],
        ['smoky cream', 'Smoky Cream'],
        ['smoky black', 'Smoky Black'],
        // Generic compound dilutions
        ['tapestry pearl', 'Tapestry Pearl'],
        ['tapestry cream', 'Tapestry Cream'],
        ['cream pearl', 'Cream Pearl'], ['pearl cream', 'Cream Pearl'],
        // Single dilutions with base coat names
        ['madder', 'Madder'],
        ['woad', 'Woad'],
        ['weld', 'Weld'],
        ['buckskin', 'Buckskin'],
        ['palomino', 'Palomino'],
        ['perlino', 'Perlino'],
        ['cremello', 'Cremello'],
        // Generic single dilutions
        ['tapestry', 'Tapestry'],
        ['champagne', 'Champagne'],
        ['cream', 'Cream'],
        ['pearl', 'Pearl'],
        ['ether', 'Ether'],
        // Base coats
        ['chestnut', 'Chestnut'],
        ['bay', 'Bay'],
        ['black', 'Black'],
    ];

    // Match the most specific coat color first, then stop
    for (const [term, trait] of coatColors) {
        if (query.includes(term)) {
            traits.push(trait);
            break;
        }
    }
    
    // White markings
    // Check multi-word traits FIRST to avoid partial matches
    if (query.includes('false leopard')) traits.push('False Leopard');
    if (query.includes('dominant white')) traits.push('Dominant White');
    if (query.includes('varnish roan') || query.includes('varnish')) traits.push('Varnish Roan');

    // Leopard Complex patterns (exclude "false leopard" from "leopard" match)
    if (query.includes('fewspot')) traits.push('Fewspot');
    if (query.includes('snowcap')) traits.push('Snowcap');
    if (query.includes('leopard') && !query.includes('false leopard')) traits.push('Leopard');
    if (query.includes('blanket')) traits.push('Blanket');
    if (query.includes('snowflake')) traits.push('Snowflake');

    // Other white markings (exclude "varnish roan" from "roan" match)
    if (query.includes('tobiano')) traits.push('Tobiano');
    if (query.includes('overo')) traits.push('Overo');
    if (query.includes('splash')) traits.push('Splash');
    if (query.includes('roan') && !query.includes('varnish')) traits.push('Roan');
    if (query.includes('sabino')) traits.push('Sabino');
    if (query.includes('shroud')) traits.push('Shroud');
    if (query.includes('ossuary')) traits.push('Ossuary');
    if (query.includes('filigree')) traits.push('Filigree');
    if (query.includes('harlequin')) traits.push('Harlequin');
    if (query.includes('rabicano')) traits.push('Rabicano');

    // Modifiers
    if (query.includes('starfield')) traits.push('Starfield');
    if (query.includes('gilt')) traits.push('Gilt');
    if (query.includes('tabard')) traits.push('Tabard');
    if (query.includes('opal')) traits.push('Opal');
    if (query.includes('prism')) traits.push('Prism');
    if (query.includes('gray') || query.includes('grey')) traits.push('Gray');
    if (query.includes('dun')) traits.push('Dun');
    if (query.includes('illuminated')) traits.push('Illuminated');
    if (query.includes('sepulchered')) traits.push('Sepulchered');
    if (query.includes('lacquer')) traits.push('Lacquer');
    if (query.includes('flaxen')) traits.push('Flaxen');
    if (query.includes('vellum')) traits.push('Vellum');
    if (query.includes('silver')) traits.push('Silver');
    if (query.includes('pangare')) traits.push('Pangare');
    if (query.includes('sooty')) traits.push('Sooty');
    if (query.includes('blanched')) traits.push('Blanched');
    if (query.includes('collar')) traits.push('Collar');
    if (query.includes('girdle')) traits.push('Girdle');
    if (query.includes('cuirass')) traits.push('Cuirass');
    if (query.includes('crowned')) traits.push('Crowned');

    return traits;
}

function findBreedingMatches(targetTraits) {
    const matches = [];
    
    for (let i = 0; i < horseCollection.length; i++) {
        for (let j = i + 1; j < horseCollection.length; j++) {
            const parent1 = horseCollection[i];
            const parent2 = horseCollection[j];
            
            // Check temperament compatibility
            if (parent1.temperament === parent2.temperament) continue;
            
            // Check if this pair can produce the target traits
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
    
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    
    return matches;
}

function canProduceCompoundDilution(p1Geno, p2Geno, dilution1, dilution2) {
    // Cr, Tp, and prl are allelic - they share a locus
    // A parent with Tpprl can pass either Tp OR prl (they're on separate alleles)
    // A parent with Crprl can pass either Cr OR prl
    // To produce compound offspring, we need BOTH alleles available from the pair
    // - If P1 has Crprl and P2 has nothing: foal gets (Cr or prl) + n = nCr or nprl (NOT Crprl)
    // - If P1 has Crprl and P2 has nCr: foal can get Crprl (P1 passes prl, P2 passes Cr)

    const compound = dilution1 + dilution2;
    const reverseCompound = dilution2 + dilution1;

    // Check what dilution alleles each parent can pass
    // A parent can pass a dilution if they have it as:
    // - heterozygous: nCr, nTp, nprl, ner
    // - homozygous: CrCr, TpTp, prlprl, erer
    // - compound: Crprl, TpCr, Tpprl, etc. (can pass EITHER component)

    function canPassDilution(geno, dilution) {
        const d = dilution.toLowerCase();
        // Has it standalone (hetero or homo)
        if (geno.includes('n' + d) || geno.includes(' ' + d + ' ') || geno.includes(d + d)) {
            return true;
        }
        // Check if it's part of any compound dilution
        // Since Cr, Tp, prl, er, Ch are allelic, a compound like Tpprl means parent can pass either Tp or prl
        if (geno.includes(d)) {
            return true;
        }
        return false;
    }

    const p1Can1 = canPassDilution(p1Geno, dilution1);
    const p1Can2 = canPassDilution(p1Geno, dilution2);
    const p2Can1 = canPassDilution(p2Geno, dilution1);
    const p2Can2 = canPassDilution(p2Geno, dilution2);

    // Check if either parent has the compound
    const p1HasCompound = p1Geno.includes(compound) || p1Geno.includes(reverseCompound);
    const p2HasCompound = p2Geno.includes(compound) || p2Geno.includes(reverseCompound);

    // If both parents have the compound, can definitely produce it
    if (p1HasCompound && p2HasCompound) {
        return true;
    }

    // If one parent has the compound, the OTHER parent must have at least one component
    // Example: P1 has Crprl (can pass Cr or prl), P2 has nCr (can pass Cr or n)
    // Foal can get: Cr+Cr=CrCr, Cr+prl=Crprl, prl+Cr=Crprl, prl+n=nprl
    if (p1HasCompound) {
        return p2Can1 || p2Can2;
    }

    if (p2HasCompound) {
        return p1Can1 || p1Can2;
    }

    // Neither has compound - need different parents to provide each component
    // Example: P1 has nCr, P2 has nprl → can make Crprl
    return (p1Can1 && p2Can2) || (p1Can2 && p2Can1);
}

function calculateMatchScore(parent1, parent2, targetTraits) {
    const p1Geno = parent1.genotype.toLowerCase();
    const p2Geno = parent2.genotype.toLowerCase();
    const combinedGeno = (p1Geno + ' ' + p2Geno);

    // Track which traits are possible
    let traitsScores = [];

    targetTraits.forEach(trait => {
        const traitLower = trait.toLowerCase();

        // Check for specific genes that create this trait
        // Compound dilutions with Cream Pearl + Ether
        if (traitLower.includes('cream pearl ether') || traitLower === 'ombre cream pearl ether' ||
            traitLower === 'classic cream pearl ether' || traitLower === 'cold cream pearl ether') {
            // Need Crprl + erer (each parent must carry at least one er allele)
            const hasCreamPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'cr', 'prl');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            const canMakeErer = p1HasEther && p2HasEther;
            if (hasCreamPearl && canMakeErer) traitsScores.push(150);
        } else if (traitLower.includes('cream pearl champagne')) {
            // Need Crprl + Ch
            const hasCreamPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'cr', 'prl');
            const hasChampagne = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(combinedGeno);
            if (hasCreamPearl && hasChampagne) traitsScores.push(150);
        } else if (traitLower.includes('tapestry pearl ether') || traitLower === 'tyrian pearl ether' ||
                   traitLower === 'phthalo pearl ether' || traitLower === 'ochre pearl ether') {
            // Need Tpprl + erer (each parent must carry at least one er allele)
            const hasTapestryPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'prl');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            const canMakeErer = p1HasEther && p2HasEther;
            if (hasTapestryPearl && canMakeErer) traitsScores.push(150);
        } else if (traitLower.includes('tapestry pearl champagne') || traitLower === 'tyrian pearl champagne' ||
                   traitLower === 'phthalo pearl champagne' || traitLower === 'ochre pearl champagne') {
            // Need Tpprl + Ch - both parents must contribute so foal gets Tp, prl, AND Ch
            const hasTapestryPearl = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'prl');
            // Ch must come from a parent that can spare it (not on the same locus as Tp/prl)
            // Ch is on a DIFFERENT locus, so just need at least one parent with Ch
            const p1HasCh = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(p1Geno);
            const p2HasCh = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(p2Geno);
            if (hasTapestryPearl && (p1HasCh || p2HasCh)) traitsScores.push(150);
        } else if (traitLower.includes('tapestry cream ether') || traitLower === 'madder cream ether' ||
                   traitLower === 'woad cream ether' || traitLower === 'weld cream ether') {
            // Need TpCr + erer (each parent must carry at least one er allele)
            const hasTapestryCream = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'cr');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            const canMakeErer = p1HasEther && p2HasEther;
            if (hasTapestryCream && canMakeErer) traitsScores.push(150);
        } else if (traitLower.includes('tapestry cream champagne') || traitLower === 'madder cream champagne' ||
                   traitLower === 'woad cream champagne' || traitLower === 'weld cream champagne') {
            // Need TpCr + Ch
            const hasTapestryCream = canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'cr');
            const hasChampagne = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(combinedGeno);
            if (hasTapestryCream && hasChampagne) traitsScores.push(150);
        } else if (traitLower.includes('pearl ether') && !traitLower.includes('cream') && !traitLower.includes('tapestry')) {
            // Need prlprl + erer (each parent carries at least one prl and one er)
            const p1HasPearl = p1Geno.includes('prl');
            const p2HasPearl = p2Geno.includes('prl');
            const etherPat = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPat.test(p1Geno);
            const p2HasEther = etherPat.test(p2Geno);
            if (p1HasPearl && p2HasPearl && p1HasEther && p2HasEther) traitsScores.push(120);
        } else if (traitLower.includes('cream pearl') && !traitLower.includes('ether') && !traitLower.includes('champagne')) {
            // Need Crprl (cream pearl compound)
            if (canProduceCompoundDilution(p1Geno, p2Geno, 'cr', 'prl')) traitsScores.push(100);
        } else if (traitLower.includes('tapestry pearl') && !traitLower.includes('ether') && !traitLower.includes('champagne')) {
            // Need Tpprl (tapestry pearl compound)
            if (canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'prl')) traitsScores.push(100);
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
            // Need LpLp patnpatn - BOTH parents must have Lp AND patn
            const p1HasLp = p1Geno.includes('lp');
            const p2HasLp = p2Geno.includes('lp');
            const p1HasPatn = p1Geno.includes('patn');
            const p2HasPatn = p2Geno.includes('patn');
            if (p1HasLp && p2HasLp && p1HasPatn && p2HasPatn) traitsScores.push(100);
        } else if (traitLower.includes('snowcap')) {
            // Need LpLp npatn - BOTH parents must have Lp, at least one has patn, but not both homozygous
            const p1HasLp = p1Geno.includes('lp');
            const p2HasLp = p2Geno.includes('lp');
            const p1HasPatn = p1Geno.includes('patn');
            const p2HasPatn = p2Geno.includes('patn');
            if (p1HasLp && p2HasLp && (p1HasPatn || p2HasPatn)) traitsScores.push(100);
        } else if (traitLower.includes('varnish roan')) {
            // Need LpLp npatn - BOTH parents must have Lp, neither has patn
            const p1HasLp = p1Geno.includes('lp');
            const p2HasLp = p2Geno.includes('lp');
            if (p1HasLp && p2HasLp && !combinedGeno.includes('patn')) traitsScores.push(100);
        } else if (traitLower.includes('leopard')) {
            // Need nLp patnpatn - at least one parent has Lp, BOTH have patn
            const hasLp = combinedGeno.includes('lp');
            const p1HasPatn = p1Geno.includes('patn');
            const p2HasPatn = p2Geno.includes('patn');
            if (hasLp && p1HasPatn && p2HasPatn) traitsScores.push(100);
        } else if (traitLower.includes('blanket')) {
            // Need nLp npatn - at least one parent has Lp, at least one has patn
            const hasLp = combinedGeno.includes('lp');
            const hasPatn = combinedGeno.includes('patn');
            if (hasLp && hasPatn) traitsScores.push(100);
        } else if (traitLower.includes('snowflake')) {
            // Need nLp npatn - at least one parent has Lp, neither has patn
            const hasLp = combinedGeno.includes('lp');
            if (hasLp && !combinedGeno.includes('patn')) traitsScores.push(100);
        } else if (traitLower.includes('starfield')) {
            // Need sfsf - each parent must carry at least one sf allele
            const sfPattern = /\bsfsf\b|\bnsf\b/;
            const p1HasSf = sfPattern.test(p1Geno);
            const p2HasSf = sfPattern.test(p2Geno);
            if (p1HasSf && p2HasSf) traitsScores.push(100);
        } else if (traitLower.includes('sepulchered')) {
            // Need spsp - each parent must carry at least one sp allele
            // Use word boundaries to avoid matching nSpl (Splash) as nsp
            const spPattern = /\bspsp\b|\bnsp\b|\blusp\b/;
            const p1HasSp = spPattern.test(p1Geno);
            const p2HasSp = spPattern.test(p2Geno);
            if (p1HasSp && p2HasSp) traitsScores.push(100);
        } else if (traitLower.includes('lacquer')) {
            // Need lrlr - each parent must carry at least one lr allele
            const lrPattern = /\blrlr\b|\bnlr\b/;
            const p1HasLr = lrPattern.test(p1Geno);
            const p2HasLr = lrPattern.test(p2Geno);
            if (p1HasLr && p2HasLr) traitsScores.push(100);
        } else if (traitLower.includes('flaxen')) {
            // Need ff - each parent must carry at least one f allele
            // Use word boundaries to avoid matching nfe (Filigree) or nfl (False Leopard) as nf
            const fPattern = /\bff\b|\bnf\b/;
            const p1HasF = fPattern.test(p1Geno);
            const p2HasF = fPattern.test(p2Geno);
            if (p1HasF && p2HasF) traitsScores.push(100);
        } else if (traitLower.includes('ether')) {
            // Need erer - each parent must carry at least one er allele
            const etherPattern = /\berer\b|\bner\b|\bcher\b/;
            const p1HasEther = etherPattern.test(p1Geno);
            const p2HasEther = etherPattern.test(p2Geno);
            if (p1HasEther && p2HasEther) traitsScores.push(80);
            else if (p1HasEther || p2HasEther) traitsScores.push(40);
        } else if (traitLower.includes('champagne')) {
            // For champagne, at least one parent needs Ch gene
            const hasCh = /\bnch\b|\bchch\b|\bcher\b|\bch\b/.test(combinedGeno);
            if (hasCh) traitsScores.push(80);
        } else if (traitLower === 'tapestry') {
            // Dominant - at least one parent needs Tp
            const tpPattern = /\bntp\b|\btptp\b|\btpcr\b|\btpprl\b/;
            if (tpPattern.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'cream') {
            // Dominant - at least one parent needs Cr
            const crPattern = /\bncr\b|\bcrcr\b|\btpcr\b|\bcrprl\b/;
            if (crPattern.test(combinedGeno)) traitsScores.push(80);
        } else if (traitLower === 'pearl') {
            // Recessive - each parent must carry at least one prl allele
            const prlPattern = /\bnprl\b|\bprlprl\b|\btpprl\b|\bcrprl\b/;
            const p1HasPrl = prlPattern.test(p1Geno);
            const p2HasPrl = prlPattern.test(p2Geno);
            if (p1HasPrl && p2HasPrl) traitsScores.push(80);
            else if (p1HasPrl || p2HasPrl) traitsScores.push(40);
        } else if (traitLower === 'tapestry cream') {
            // Need TpCr compound
            if (canProduceCompoundDilution(p1Geno, p2Geno, 'tp', 'cr')) traitsScores.push(100);
        } else if (traitLower === 'chestnut') {
            // Need ee - each parent must carry at least one e allele
            // Every horse has E locus, so check for lowercase e
            const p1HasE = /\bee\b/.test(p1Geno) || /^ee\b/i.test(p1Geno.trim()) || /\bEe\b/.test(parent1.genotype);
            const p2HasE = /\bee\b/.test(p2Geno) || /^ee\b/i.test(p2Geno.trim()) || /\bEe\b/.test(parent2.genotype);
            if (p1HasE && p2HasE) traitsScores.push(80);
        } else if (traitLower === 'bay') {
            // Need E_ A_ - at least one E allele and at least one A allele between parents
            const hasE = /\bEe\b|\bEE\b/i.test(parent1.genotype) || /\bEe\b|\bEE\b/i.test(parent2.genotype);
            const hasA = /\bAa\b|\bAA\b|\bAa\b/i.test(parent1.genotype) || /\bAa\b|\bAA\b/i.test(parent2.genotype);
            if (hasE && hasA) traitsScores.push(80);
        } else if (traitLower === 'black') {
            // Need E_ aa - at least one E allele, and each parent carries at least one a allele
            const hasE = /\bEe\b|\bEE\b/i.test(parent1.genotype) || /\bEe\b|\bEE\b/i.test(parent2.genotype);
            const p1HasSmallA = /\baa\b|\bAa\b/.test(parent1.genotype);
            const p2HasSmallA = /\baa\b|\bAa\b/.test(parent2.genotype);
            if (hasE && p1HasSmallA && p2HasSmallA) traitsScores.push(80);
        } else if (traitLower.includes('filigree')) {
            // Need fefe - each parent must carry at least one fe allele
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

    // Only return total score if ALL traits can be produced in a single foal
    if (traitsScores.length === targetTraits.length) {
        return traitsScores.reduce((sum, s) => sum + s, 0);
    }
    return 0; // Can't make all traits in one foal
}

function estimateProbability(parent1, parent2, targetTraits) {
    // Simple probability estimation
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
    document.getElementById('parent1Name').value = parent1.name || '';
    document.getElementById('parent1Geno').value = parent1.genotype;
    document.getElementById('parent1Temp').value = parent1.temperament;
    document.getElementById('parent1Variant').value = parent1.variant || 'Standard';

    document.getElementById('parent2Name').value = parent2.name || '';
    document.getElementById('parent2Geno').value = parent2.genotype;
    document.getElementById('parent2Temp').value = parent2.temperament;
    document.getElementById('parent2Variant').value = parent2.variant || 'Standard';

    // Scroll to the parents section
    document.querySelector('.parents-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Chimera Functionality
function generateChimeraPossibilities(foalGenotype, parent1Genotype, parent2Genotype) {
    const foal = parseGenotype(foalGenotype);
    const p1 = parseGenotype(parent1Genotype);
    const p2 = parseGenotype(parent2Genotype);

    // Combine all genes available from both parents
    const allParentGenes = [...p1.genes, ...p2.genes];
    const allParentAnomalies = [...p1.anomalies, ...p2.anomalies];

    // Get all possible alleles from parents
    const eAlleles = new Set();
    const aAlleles = new Set();

    allParentGenes.forEach(gene => {
        if (gene.match(/^[Ee][Ee]?$/)) {
            const alleles = getGeneAlleles(gene);
            alleles.forEach(a => eAlleles.add(a));
        }
        if (gene.match(/^[Aa][Aa]?$/)) {
            const alleles = getGeneAlleles(gene);
            alleles.forEach(a => aAlleles.add(a));
        }
    });

    const eArray = Array.from(eAlleles);
    const aArray = Array.from(aAlleles);

    // Generate all possible base coats
    const baseCoats = new Set();
    for (let i = 0; i < eArray.length; i++) {
        for (let j = i; j < eArray.length; j++) {
            for (let k = 0; k < aArray.length; k++) {
                for (let l = k; l < aArray.length; l++) {
                    const eGene = combineAlleles(eArray[i], eArray[j]);
                    const aGene = combineAlleles(aArray[k], aArray[l]);
                    const baseCoatKey = `${eGene}_${aGene}`;
                    const baseCoatName = COAT_COLORS[baseCoatKey];
                    if (baseCoatName) {
                        baseCoats.add(baseCoatName);
                    }
                }
            }
        }
    }

    // Get all available dilutions from parents - combine across both loci properly
    const dilutionNames = new Set();

    // Collect all possible locus 1 dilutions (Cr, Tp, prl and compounds)
    const locus1Options = new Set();
    // Collect all possible locus 2 dilutions (Ch, er and compounds)
    const locus2Options = new Set();

    // Always possible to have no dilution at either locus
    locus1Options.add('none');
    locus2Options.add('none');

    allParentGenes.forEach(gene => {
        if (/^(nCr|CrCr|nTp|TpTp|nprl|prlprl|Crprl|Tpprl|TpCr)$/.test(gene)) {
            locus1Options.add(DILUTION_NAMES[gene]);
            // If compound, each component could also appear separately via inheritance
            const alleles = getGeneAlleles(gene);
            alleles.forEach(a => {
                if (a !== 'n') {
                    const hetForm = 'n' + a.charAt(0).toUpperCase() + a.slice(1);
                    // Check for lowercase recessive forms like prl
                    const possibleHet = DILUTION_NAMES['n' + a] || DILUTION_NAMES[hetForm];
                    if (possibleHet) locus1Options.add(possibleHet);
                    const possibleHom = DILUTION_NAMES[a + a];
                    if (possibleHom) locus1Options.add(possibleHom);
                }
            });
        }
        if (/^(nCh|ChCh|ner|erer|Cher)$/.test(gene)) {
            locus2Options.add(DILUTION_NAMES[gene]);
            const alleles = getGeneAlleles(gene);
            alleles.forEach(a => {
                if (a !== 'n') {
                    const possibleHet = DILUTION_NAMES['n' + a] || DILUTION_NAMES['n' + a.charAt(0).toUpperCase() + a.slice(1)];
                    if (possibleHet) locus2Options.add(possibleHet);
                    const possibleHom = DILUTION_NAMES[a + a];
                    if (possibleHom) locus2Options.add(possibleHom);
                }
            });
        }
    });

    // Generate all combined dilution names across both loci
    locus1Options.forEach(l1 => {
        locus2Options.forEach(l2 => {
            if (l1 === 'none' && l2 === 'none') return;
            if (l1 === 'none') {
                dilutionNames.add(l2);
            } else if (l2 === 'none') {
                dilutionNames.add(l1);
            } else {
                dilutionNames.add(l1 + ' ' + l2);
            }
        });
    });

    // Get all available modifiers
    const modifiers = new Set();

    // For recessive genes, check if both parents carry the allele
    const recessiveGenes = ['f', 'sp', 'sf', 'fe', 'lr']; // Flaxen, Sepulchered, Starfield, Filigree, Lacquer
    const parent1Alleles = new Set();
    const parent2Alleles = new Set();

    p1.genes.forEach(gene => {
        const alleles = getGeneAlleles(gene);
        alleles.forEach(a => parent1Alleles.add(a));
    });

    p2.genes.forEach(gene => {
        const alleles = getGeneAlleles(gene);
        alleles.forEach(a => parent2Alleles.add(a));
    });

    // Handle recessive modifiers with carrier logic for chimera
    const recessiveModifierMap = {
        'f': { expressed: 'Flaxen', carrier: 'Carrying Flaxen' },
        'sp': { expressed: 'Sepulchered', carrier: 'Carrying Sepulchered' },
        'sf': { expressed: 'Starfield', carrier: 'Carrying Starfield' },
        'lr': { expressed: 'Lacquer', carrier: 'Carrying Lacquer' }
    };

    Object.entries(recessiveModifierMap).forEach(([allele, names]) => {
        const p1Has = parent1Alleles.has(allele);
        const p2Has = parent2Alleles.has(allele);
        if (p1Has && p2Has) {
            // Both parents carry - can express AND carry
            modifiers.add(names.expressed);
            modifiers.add(names.carrier);
        } else if (p1Has || p2Has) {
            // Only one parent - can only carry
            modifiers.add(names.carrier);
        }
    });

    allParentGenes.forEach(gene => {
        if (MODIFIER_NAMES[gene]) {
            const name = MODIFIER_NAMES[gene];

            // Skip recessive genes - handled above
            if (gene.startsWith('n') && gene.length > 2) {
                const allele = gene.substring(1);
                if (recessiveGenes.includes(allele)) return;
            } else if (recessiveGenes.some(r => gene === r + r)) {
                return;
            }

            // For compound heterozygous (like Lusp), extract what actually shows
            if (gene === 'Lusp') {
                modifiers.add('Illuminated'); // Lu is dominant
                // sp handled by recessive logic above
                return;
            }

            if (gene === 'PrOp') {
                modifiers.add('Prism'); // Pr is dominant
                modifiers.add('Opal'); // Op is dominant
                return;
            }

            // All other modifiers (dominant or already filtered)
            modifiers.add(name);
        }
    });

    // Similar check for white markings with recessive genes
    const whiteMarkings = new Set();

    // Check Filigree separately - recessive, needs fefe to express
    if (parent1Alleles.has('fe') && parent2Alleles.has('fe')) {
        // Both parents carry fe - check if fefe (expressed) is possible
        // fefe requires both parents to pass fe allele
        const p1CanPassFe = p1.genes.some(g => g === 'fefe' || g === 'nfe');
        const p2CanPassFe = p2.genes.some(g => g === 'fefe' || g === 'nfe');
        if (p1CanPassFe && p2CanPassFe) {
            // Can potentially make fefe - but also might only carry
            whiteMarkings.add('Filigree');
            whiteMarkings.add('Carrying Filigree');
        }
    } else if (parent1Alleles.has('fe') || parent2Alleles.has('fe')) {
        // Only one parent has fe - can only carry
        whiteMarkings.add('Carrying Filigree');
    }

    allParentGenes.forEach(gene => {
        if (WHITE_MARKING_NAMES[gene]) {
            // Skip Filigree - handled above
            if (gene === 'nfe' || gene === 'fefe') return;

            // All other white markings (dominant)
            whiteMarkings.add(WHITE_MARKING_NAMES[gene]);
        }
    });

    // Generate Leopard Complex patterns from Lp and patn combinations
    // Check if we can make nLp (need at least one parent with Lp)
    const canMakeHetLp = (parent1Alleles.has('Lp') || parent2Alleles.has('Lp'));

    // Check if we can make LpLp (need both parents with Lp)
    const canMakeHomLp = parent1Alleles.has('Lp') && parent2Alleles.has('Lp');

    // Check if patn can be inherited (both parents must have it for it to show as homozygous)
    const canShowPatn = parent1Alleles.has('patn') && parent2Alleles.has('patn');

    // Generate all possible Leopard Complex patterns (only if at least one parent has Lp)
    if (canMakeHetLp) {
        const leopardPatterns = new Set();

        // Patterns WITH patn (only if both parents carry patn)
        if (canMakeHetLp && canShowPatn) {
            // nLp patnpatn = Leopard
            leopardPatterns.add('Leopard');
            // nLp patn = Blanket
            leopardPatterns.add('Blanket');
        }

        if (canMakeHomLp && canShowPatn) {
            // LpLp patnpatn = Fewspot
            leopardPatterns.add('Fewspot');
            // LpLp patn = Snowcap
            leopardPatterns.add('Snowcap');
        }

        // Patterns WITHOUT patn (always possible - patch might not inherit patn)
        if (canMakeHetLp) {
            // nLp (no patn) = Snowflake
            leopardPatterns.add('Snowflake');
        }

        if (canMakeHomLp) {
            // LpLp (no patn) = Varnish Roan
            leopardPatterns.add('Varnish Roan');
        }

        // Add all possible patterns to white markings
        leopardPatterns.forEach(pattern => whiteMarkings.add(pattern));
    }

    // Get parent anomalies (excluding Chimera)
    const anomalies = new Set(allParentAnomalies.filter(a => a !== 'Chimera'));

    return {
        baseCoats: Array.from(baseCoats).sort(),
        dilutions: Array.from(dilutionNames).sort(),
        whiteMarkings: Array.from(whiteMarkings).sort(),
        modifiers: Array.from(modifiers).sort(),
        anomalies: Array.from(anomalies).sort()
    };
}

function fillChimeraCalculator(foalGeno, parent1Geno, parent2Geno) {
    document.getElementById('chimeraFoalGeno').value = foalGeno;
    document.getElementById('chimeraParent1Geno').value = parent1Geno;
    document.getElementById('chimeraParent2Geno').value = parent2Geno;

    // Scroll to the Chimera calculator
    document.getElementById('chimeraResultsContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Automatically calculate
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

    // Check if foal has Chimera
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

    // Display main foal coat
    const foalPhenotype = genotypeToPhenotype(foalGenotype);

    const mainCoatDiv = document.createElement('div');
    mainCoatDiv.style.cssText = 'background: #2a232a; border: 2px solid #d4af37; padding: 20px; margin-bottom: 20px;';
    mainCoatDiv.innerHTML = `
        <h4 style="color: #d4af37; margin-bottom: 10px; font-size: 1.1em;">Main Coat (Non-Chimera Areas)</h4>
        <div style="margin-bottom: 10px;">
            <strong style="color: #b8a89f;">Phenotype:</strong>
            <span style="color: #d4af37; display: block; margin-top: 5px;">${foalPhenotype}</span>
        </div>
        <div>
            <strong style="color: #b8a89f;">Genotype:</strong>
            <span style="color: #d4af37; font-family: 'Courier New', monospace; display: block; margin-top: 5px; background: #1d181d; padding: 8px; border: 1px solid #543954;">${foalGenotype}</span>
        </div>
    `;
    resultsContent.appendChild(mainCoatDiv);

    // Display Chimera possibilities header
    const chimeraHeader = document.createElement('h4');
    chimeraHeader.style.cssText = 'color: #d4af37; margin-bottom: 15px; font-size: 1.1em;';
    chimeraHeader.textContent = 'Chimera Patch Possibilities';
    resultsContent.appendChild(chimeraHeader);

    const infoBox = document.createElement('div');
    infoBox.style.cssText = 'background: #3a2f3a; border-left: 4px solid #a855f7; padding: 15px; margin-bottom: 20px; color: #b8a89f; font-style: italic;';
    infoBox.textContent = 'The Chimera patch can display any combination of the traits listed below from both parents.';
    resultsContent.appendChild(infoBox);

    // Create grid for categories
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;';

    // Base Coats
    if (possibilities.baseCoats.length > 0) {
        const baseCoatCard = document.createElement('div');
        baseCoatCard.style.cssText = 'background: #3a2f3a; padding: 20px; border: 2px solid #543954; border-left: 4px solid #d4af37;';
        baseCoatCard.innerHTML = `
            <h5 style="color: #d4af37; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Base Coats (${possibilities.baseCoats.length})</h5>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.baseCoats.map(coat => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #1d181d; border-left: 3px solid #d4af37; color: #d4af37;">
                        ${coat}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(baseCoatCard);
    }

    // Dilutions
    if (possibilities.dilutions.length > 0) {
        const dilutionCard = document.createElement('div');
        dilutionCard.style.cssText = 'background: #3a2f3a; padding: 20px; border: 2px solid #543954; border-left: 4px solid #60a5fa;';
        dilutionCard.innerHTML = `
            <h5 style="color: #60a5fa; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Dilutions (${possibilities.dilutions.length})</h5>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.dilutions.map(dilution => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #1d181d; border-left: 3px solid #60a5fa; color: #d4af37;">
                        ${dilution}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(dilutionCard);
    }

    // White Markings
    if (possibilities.whiteMarkings.length > 0) {
        const markingsCard = document.createElement('div');
        markingsCard.style.cssText = 'background: #3a2f3a; padding: 20px; border: 2px solid #543954; border-left: 4px solid #c084fc;';
        markingsCard.innerHTML = `
            <h5 style="color: #c084fc; margin-bottom: 15px; font-size: 1em; font-weight: 600;">White Markings (${possibilities.whiteMarkings.length})</h5>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.whiteMarkings.map(marking => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #1d181d; border-left: 3px solid #c084fc; color: #d4af37;">
                        ${marking}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(markingsCard);
    }

    // Modifiers
    if (possibilities.modifiers.length > 0) {
        const modifiersCard = document.createElement('div');
        modifiersCard.style.cssText = 'background: #3a2f3a; padding: 20px; border: 2px solid #543954; border-left: 4px solid #4ade80;';
        modifiersCard.innerHTML = `
            <h5 style="color: #4ade80; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Modifiers (${possibilities.modifiers.length})</h5>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.modifiers.map(modifier => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #1d181d; border-left: 3px solid #4ade80; color: #d4af37;">
                        ${modifier}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(modifiersCard);
    }

    // Anomalies
    if (possibilities.anomalies.length > 0) {
        const anomaliesCard = document.createElement('div');
        anomaliesCard.style.cssText = 'background: #3a2f3a; padding: 20px; border: 2px solid #543954; border-left: 4px solid #fbbf24;';
        anomaliesCard.innerHTML = `
            <h5 style="color: #fbbf24; margin-bottom: 15px; font-size: 1em; font-weight: 600;">Anomalies (${possibilities.anomalies.length})</h5>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${possibilities.anomalies.map(anomaly => `
                    <li style="padding: 8px; margin-bottom: 6px; background: #1d181d; border-left: 3px solid #fbbf24; color: #d4af37;">
                        ${anomaly}
                    </li>
                `).join('')}
            </ul>
        `;
        grid.appendChild(anomaliesCard);
    }

    resultsContent.appendChild(grid);

    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
