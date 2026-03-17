# Dungeon Coursers Breeding Calculator

A web-based genetics calculator for Dungeon Coursers, built by Ook because she can't maths.

## Features

### Breeding Calculator

Generate 4 possible foal outcomes from two parent horses. Validates temperament compatibility (parents must have different temperaments). Full Mendelian inheritance for:

**Base coat colours** (E/A locus)

**Dilutions:** Cream, Tapestry, Pearl, Champagne, Ether, and compound heterozygous combos (Crprl, TpCr, Tpprl)

**White markings:** Tobiano, Overo, Splash, Roan, Sabino, Blanched, False Leopard, Harlequin, Shroud, Ossuary, Filigree, Crowned, Cuirass, Girdle, Collar, Rabicano, Dominant White, and Leopard Complex (Snowflake through Fewspot)

**Modifiers:** Dun, Pangare, Sooty, Gray, Flaxen, Silver, Illuminated, Sepulchered, Tabard, Gilt, Vellum, Opal, Prism, Lacquer, Starfield

**Anomalies** (25% inheritance + 5% random)

**Variants** (Heraldic, Puck, Cavedweller, Restored)

Shared loci are properly enforced. Genes that share a locus inherit together, not independently:

- **KIT locus:** Tobiano, Roan, Sabino, Dominant White (max 2 per horse)
- **Dilution locus 1:** Cream, Tapestry, Pearl
- **Dilution locus 2:** Champagne, Ether (Ch dominates er, so Cher = Champagne + Carries Ether)
- **Paired loci:** B/Fl, Cu/Cw, Gi/Co, Lu/sp, Pr/Op

Lethal white detection flags OO, OsOs, WW, and nO+nOs combos. Carrier traits shown where appropriate (Carries Ether, Carries Patn, Carrying Flaxen, and so on). Rarity scoring matched to the official Dungeon Coursers trait index (Common through Legendary).

### Chimera Possibility Calculator

For foals born with the Chimera anomaly. Enter the foal's genotype and both parent genotypes. Shows all possible coat patterns that could appear in the Chimera patch. Correctly handles dilution combinations across both loci and recessive carrier logic.

### Custom Scroll Generator

Generates a random design based on scroll rarity. Coat colour matches the scroll's rarity tier. One marking or modifier at that rarity or below. 10% chance of a random anomaly. 5% chance of a random variant.

### Collection Management & Smart Search

Upload your horse collection as a CSV file (with or without headers). Google Sheets template included with step-by-step instructions.

Ask breeding questions in natural language:

- "How can I make Amber Champagne?"
- "Who can breed for fewspot and starfield?"
- "Which pairs can produce false leopard?"

Smart matching finds the best breeding pairs from your collection. Search results show both phenotype and genotype for each parent. Click a result to auto-fill the breeding form. One click. Done.

## Usage

### Basic Breeding

Paste the genotype for Parent 1 (e.g., `Ee Aa nCr nT + Brindle`). Select the temperament. Optionally select a variant. Repeat for Parent 2. Click Generate Foal Possibilities.

### Collection Search

Prepare your CSV using the Google Sheets template. Make a copy, fill in your horses, download as CSV. Upload the file (headers are auto-detected). If your CSV has no header row, it assumes the column order: ID, Name, Genotype, Temperament, Variant. Search with a breeding question like "How can I make fewspot?" Review matched pairs ranked by compatibility. Click a pair to auto-fill the breeding form.

### CSV Format

```
ID,Name,Genotype,Temperament,Variant
3108,Soup,EE aa Tpprl nO LpLp patnpatn + Geode,Melancholic,Heraldic
3542,Pwnco,Ee aa erer nSh nG nOs nD + Oracle,Sanguine,Standard
9999,Example Horse,Ee Aa nCr nT + Birdcatcher Spots,Sanguine,Standard
```

Headers are optional. If they're missing, the parser figures it out. Copy genotypes directly from the Dungeon Coursers site. The parser handles `+` separators and quoted fields with commas. See `sample_horses.csv` for a complete example.

## Notes

Parents must have different temperaments to breed. Each foal is randomly generated based on genetic inheritance rules.

Champagne Ether is not a thing. Ch and er share a locus, and Ch is dominant, so Cher = Champagne + Carries Ether.

Homozygous OO, OsOs, WW, or the combo nO + nOs = lethal white.

Anomalies have a 25% chance to pass from parents plus a 5% random chance. Variants have a 25% chance to pass from each parent. Rarity tiers match the official DC trait index.

## Credits

Created for the Dungeon Coursers HARPG community by Ook.
