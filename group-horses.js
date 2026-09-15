// ===========================================================================
// Group Horses
// ---------------------------------------------------------------------------
// Coursers anybody can breed to, compiled by Tower (Crowned_Ladybug) and used
// here with permission. Genotypes are converted from Tower's directory; a trait
// written there as "(Recessive)" is carried, so it appears here as a single
// hidden copy. 'cost' is the fruit that a breeding with that courser costs.
//
// Data only. Updating the roster never means touching code.
// ===========================================================================

const GROUP_HORSES = [
    { id: 'group-crispin', name: 'Crispin', genotype: 'Ee Aa nCr nD nG + Stained Glass, Vitiligo', temperament: 'Phlegmatic', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-phoebe', name: 'Phoebe', genotype: 'ee aa nTp nSty nP + Swarf', temperament: 'Sanguine', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-moritz', name: 'Moritz', genotype: 'ee aa nprl ner nf nTd + Stained Glass', temperament: 'Choleric', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-fetch', name: 'Fetch', genotype: 'Ee Aa erer nB nSty nZ + Swarf', temperament: 'Melancholic', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-logue', name: 'Logue', genotype: 'EE aa nCr nCh DmD + Brindle', temperament: 'Choleric', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-terrence', name: 'Terrence', genotype: 'Ee aa TpCr nGl + Geode, Stained Glass', temperament: 'Sanguine', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-tyffyn', name: 'Tyffyn', genotype: 'Ee Aa Crprl nRb + Swarf', temperament: 'Sanguine', variant: 'Heraldic', cost: 'Apple', group: true },
    { id: 'group-lollihops', name: 'Lollihops', genotype: 'Ee aa Tpprl nFl nSty nZ nGl + Geode, Stained Glass', temperament: 'Melancholic', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-alcyone', name: 'Alcyone', genotype: 'Ee aa TRn + Chimera, Stained Glass, Swarf', temperament: 'Choleric', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-titter', name: 'Titter', genotype: 'ee Aa TpTp nHq + Chimera', temperament: 'Phlegmatic', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-robin', name: 'Robin', genotype: 'ee aa nCr nT nGl', temperament: 'Phlegmatic', variant: 'Puck', cost: 'Berry', group: true },
    { id: 'group-calix', name: 'Calix', genotype: 'Ee aa nfe nT nCw', temperament: 'Phlegmatic', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-cerridwen', name: 'Cerridwen', genotype: 'ee Aa nCu nSb nf', temperament: 'Choleric', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-goud', name: 'Goud', genotype: 'ee aa TpTp nGl nf + Stained Glass', temperament: 'Melancholic', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-everard', name: 'Everard', genotype: 'EE aa Tpprl', temperament: 'Melancholic', variant: 'Puck', cost: 'Apple', group: true },
    { id: 'group-markas', name: 'Markas', genotype: 'ee Aa nCr nSpl nSty', temperament: 'Choleric', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-wyrm', name: 'Wyrm', genotype: 'EE aa Tpprl erer nLp patnpatn nGl + Kintsugi, Stained Glass', temperament: 'Phlegmatic', variant: 'Puck', cost: 'Apple', group: true },
    { id: 'group-wyvern', name: 'Wyvern', genotype: 'EE aa Tpprl erer nLp patnpatn nGl + Kintsugi, Stained Glass', temperament: 'Sanguine', variant: 'Puck', cost: 'Apple', group: true },
    { id: 'group-phillipa', name: 'Phillipa', genotype: 'Ee aa TpCr nO nT nD nLu nP', temperament: 'Phlegmatic', variant: 'Puck', cost: 'Berry', group: true },
    { id: 'group-grit', name: 'Grit', genotype: 'Ee aa nCr nO nSty nP nZ nD nV + Fresco, Pastiche', temperament: 'Choleric', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-inkwell', name: 'Inkwell', genotype: 'Ee aa nCr nOs nsp nP nGl + Chimera', temperament: 'Phlegmatic', variant: 'Cavedweller', cost: 'Apple', group: true },
    { id: 'group-flintfoot', name: 'Flintfoot', genotype: 'Ee Aa nCr nLp npatn nP nOp + Signet, Stained Glass', temperament: 'Sanguine', variant: 'Puck', cost: 'Apple', group: true },
    { id: 'group-lady-gray', name: 'Lady Gray', genotype: 'Ee aa nCr nRn nSh nCo nG nP + Fresco, Pastiche', temperament: 'Phlegmatic', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-tarot', name: 'Tarot', genotype: 'Ee aa nTp erer nO nLp nGl + Chimera', temperament: 'Choleric', variant: 'Cavedweller', cost: 'Apple', group: true },
    { id: 'group-douglas', name: 'Douglas', genotype: 'Ee aa nTp nCh nB nSty nZ + Birdcatcher Spots, Signet', temperament: 'Sanguine', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-rosario', name: 'Rosario', genotype: 'ee Aa CrCr GiCo nGl', temperament: 'Melancholic', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-calen', name: 'Calen', genotype: 'Ee Aa nprl erer nLp npatn nG nsp + Bend-or Spots', temperament: 'Phlegmatic', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-harlan', name: 'Harlan', genotype: 'Ee Aa nCr erer + Stained Glass', temperament: 'Sanguine', variant: 'Heraldic', cost: 'Apple', group: true },
    { id: 'group-caldera', name: 'Caldera', genotype: 'Ee aa Cher nSty nsp nP nPr + Pastiche, Stained Glass', temperament: 'Choleric', variant: 'Cavedweller', cost: 'Apple', group: true },
    { id: 'group-bastion', name: 'Bastion', genotype: 'Ee aa erer nCw nSh ff nsp + Pennant, Stained Glass', temperament: 'Sanguine', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-honey-darling', name: 'Honey Darling', genotype: 'ee Aa prlprl nT nP nV + Pastiche', temperament: 'Sanguine', variant: 'Standard', cost: 'Berry', group: true },
    { id: 'group-tiger', name: 'Tiger', genotype: 'Ee Aa + Brindle, Stained Glass', temperament: 'Sanguine', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-bold', name: 'Bold', genotype: 'ee Aa nCr ner TRn nSty + Pastiche, Signet', temperament: 'Phlegmatic', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-celestine', name: 'Celestine', genotype: 'ee Aa erer nHq nCo nSty nLu nGl + Swarf', temperament: 'Sanguine', variant: 'Cavedweller', cost: 'Apple', group: true },
    { id: 'group-belamy', name: 'Belamy', genotype: 'Ee Aa TpCr nCh nSpl + Birdcatcher Spots, Pastiche', temperament: 'Sanguine', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-mabel', name: 'Mabel', genotype: 'Ee Aa CrCr ner nW nLp npatn nOp nLu + Oracle, Signet', temperament: 'Choleric', variant: 'Cavedweller', cost: 'Apple', group: true },
    { id: 'group-aurelia', name: 'Aurelia', genotype: 'ee Aa nCr erer nW nsp nV + Pastiche', temperament: 'Sanguine', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-brian', name: 'Brian', genotype: 'Ee Aa Cher nT nSty nPr + Bend-or Spots, Pennant', temperament: 'Melancholic', variant: 'Heraldic', cost: 'Apple', group: true },
    { id: 'group-anni', name: 'Anni', genotype: 'ee aa nCr erer nW nSty nPr + Chimera, Pastiche', temperament: 'Phlegmatic', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-clio', name: 'Clio', genotype: 'Ee Aa TpCr nCo nO + Bend-or Spots, Stained Glass', temperament: 'Sanguine', variant: 'Cavedweller', cost: 'Berry', group: true },
    { id: 'group-mobberley', name: 'Mobberley', genotype: 'Ee aa nCr ner nO nT nLp nG nsp nV + Oracle, Pastiche', temperament: 'Choleric', variant: 'Heraldic', cost: 'Berry', group: true },
    { id: 'group-salvia', name: 'Salvia', genotype: 'Ee Aa Tpprl nCh nCw nT nZ nD nGl + Pastiche, Signet', temperament: 'Phlegmatic', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-yrjana', name: 'Yrjänä', genotype: 'Ee Aa Crprl erer nLp npatn + Oracle, Vitiligo', temperament: 'Phlegmatic', variant: 'Standard', cost: 'Apple', group: true },
    { id: 'group-sullivan', name: 'Sullivan', genotype: 'Ee Aa erer nRb nSb nLp', temperament: 'Choleric', variant: 'Cavedweller', cost: 'Berry', group: true }
];

// Every group horse, in the shape the collection tools expect. Kept as a
// function so callers always get a fresh copy and can never mutate the roster.
function getGroupHorses() {
    return GROUP_HORSES.map(h => Object.assign({}, h));
}
