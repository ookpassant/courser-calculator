# Bloodline: Dungeon Coursers Breeding Calculator

An unofficial, client-side genetics calculator for [Dungeon Coursers](https://dungeon-coursers.com),
built by [Ook](https://dungeon-coursers.com/user/Ook) because she can't maths.
Everything runs in the browser. There is no account, no backend, and no data
leaves your machine.

**Live:** https://ook.monster/courser-calc

> Bloodline is a fan-made tool. It is not affiliated with, endorsed by, or run
> by Dungeon Coursers.

## Tools

### Foal Generator
- Generates four possible foals from two parent horses, each one a random roll.
- Below the four, lists **every possible foal** the pairing can produce (coats,
  white markings, modifiers, anomalies, temperaments, variants), the same way
  the Chimera breakdown does.
- Same-temperament pairs are **hard-blocked** (the handbook rule: two horses of
  the same temperament can never breed).
- 5% chance of **twins**: two separate foals, each shown with its own set of
  possibilities.
- Parents can be typed in by hand or picked from your saved collection.

### Chimera Calculator
- For a foal born with the Chimera anomaly.
- Enter the foal's genotype and both parents' to see what coats could appear in
  the Chimera patch, including dilution combinations across both loci and
  recessive carrier logic.
- Reachable on its own from the nav, or from a foal card.

### Somatic Calculator
- For the Somatic free marking, which hides one of a horse's own traits inside
  irregular patches.
- Takes **one genotype, no parents** — a Somatic patch can only ever show what
  the horse already has, so unlike Chimera there is nothing to inherit.
- Lists every trait Somatic could switch off and what the horse reads as *inside
  the patch*, plus the alternative of showing different base colour genes (E/A)
  with everything else left in place.
- The genotype never changes. Somatic switches a trait off in that area, it
  doesn't remove the gene: the horse still carries it, still passes it to foals,
  and still writes it in its genotype. So no altered genotype is ever shown.
- White markings and leopard patterns only cover part of the horse to begin
  with, so switching one off shows only where the patch and the marking overlap.
  Those are flagged; whole-coat traits change anywhere the patch lands.
- Enforces the handbook rules: one trait at a time, never a trait *and* a base
  change, the whole trait rather than one allele (Fewspot can't be knocked down
  to Leopard), Double Cream → Cream as the one documented exception, and no
  touching anomalies, which aren't attached to genes.
- Hidden carriers are never offered, since switching one off shows nothing.
- Shows the skin/hoof-only option for Gilt and Illuminated, the interaction
  rules for the traits this horse actually has (Chimera, Pastiche, Fresco,
  Harlequin, Shroud, Kintsugi), and the drawing rules no genotype can decide.

### Scroll Generator
- Rolls a random design for a custom scroll by rarity.
- A coat colour at that rarity, one marking/modifier/carrier at that rarity or
  below, a 10% chance of an anomaly, and a 5% chance of a variant.

### Translate
- Paste a genotype (or pick one from your collection) and get a plain-English
  description of what the horse actually looks like, in visual order: body
  colour, shading, white markings, leopard spotting, anomalies, variant, and
  any hidden carriers.
- Reads its trait data from the same engine that names the phenotype, so the
  description can never disagree with the short phenotype it shows alongside.
- An optional variant picker factors the four breed variants in.

### Smart Search
- Ask a breeding goal in plain language ("How can I make Amber Champagne?",
  "Who can breed for fewspot and starfield?", "Which pairs can produce false
  leopard?").
- Searches the pairs in **your collection** and ranks them.
- "Breed These" auto-fills the Foal Generator.
- Recent searches are remembered.

### Collection
- Your stable is saved in the browser (localStorage), so it persists between
  visits. Nothing is uploaded.
- Add, edit, and delete horses by hand, with live genotype validation.
- Search, sort, and export the whole collection back to CSV.

## Importing your coursers

Two ways to get horses in:

1. **CSV import wizard** (Collection tab): upload a file, preview and validate
   the rows, then import. A [Google Sheets template](https://docs.google.com/spreadsheets/d/1WfCvxwtGRvoDcYXX9mAd5nryJpodRJ-g96eJ3yesQ9E/edit?usp=sharing)
   is linked in-app.
2. **Bookmarklet** (Collection tab): drag a button to your bookmarks bar, then
   click it on one of your courser pages. "Add to Collection" saves the courser;
   "Parent 1" / "Parent 2" drop it straight into the Foal Generator.

   **The bookmarklet uses no AI.** It runs a tiny script in your own browser that
   reads the genotype and temperament off the page you are already viewing (the
   same text the site's copy button gives you) and sends it to Bloodline.
   Nothing is sent to Dungeon Coursers' servers, so it respects the site's
   bot-block and `noai` directives.

## Genetics

Full Mendelian inheritance with shared loci enforced (genes that share a locus
inherit together):

- **Base coat** (E/A locus) and **dilutions**: Cream, Tapestry, Pearl (locus 1),
  Champagne, Ether (locus 2, where Ch dominates er, so Cher = Champagne +
  Carries Ether), plus compound combos.
- **White markings**: Tobiano, Overo, Splash, Roan, Sabino, Blanched, False
  Leopard, Harlequin, Shroud, Ossuary, Filigree, Crowned, Cuirass, Girdle,
  Collar, Rabicano, Dominant White, and Leopard Complex (Snowflake to Fewspot).
  KIT locus allows max two of Tobiano/Roan/Sabino/Dominant White.
- **Modifiers**: Dun, Pangare, Sooty, Gray, Flaxen, Silver, Illuminated,
  Sepulchered, Tabard, Gilt, Vellum, Opal, Prism, Lacquer, Starfield.
- **Anomalies**: 25% chance to pass each from a parent, plus a flat 5% chance of
  a random one on any foal.
- **Variants** (Heraldic, Puck, Cavedweller, Restored): 25% chance to pass from
  each parent. There is no random variant roll.
- **Lethal White** is flagged for OO, OsOs, WW, and nO + nOs.
- Carrier traits are shown where appropriate (Carries Ether, Carries Patn,
  Carrying Flaxen, etc.).
- **Free markings** (Somatic) are written after the `+` like an anomaly, but any
  player can add one to any horse for nothing. They are deliberately kept out of
  the anomaly pool, so they are never rolled, never inherited, and never scored
  for rarity — they are only recognised, described and calculated.
- Rarity is scored against the official Dungeon Coursers trait index.

These rules are matched to the official breeding handbook.

> **Stained Glass and Ore are now one trait, called Stained Glass.** Older
> coursers may still list "Ore" (or both); the parser reads any "Ore" as
> "Stained Glass" and de-duplicates. New foals only ever roll Stained Glass.

## CSV format

```csv
ID,Name,Genotype,Temperament,Variant
3108,Soup,EE aa Tpprl nO LpLp patnpatn + Geode,Melancholic,Heraldic
3542,Pwnco,Ee aa erer nSh nG nOs nD + Oracle,Sanguine,Standard
9999,Example Horse,Ee Aa nCr nT + Birdcatcher Spots,Sanguine,Standard
```

Headers are optional. If they are missing, the parser assumes the column order
above (ID, Name, Genotype, Temperament, Variant). Copy genotypes directly from
the Dungeon Coursers site. The parser handles `+` separators and quoted fields
with commas. See `sample_horses.csv` for a complete example.

## Project layout

A static site, no build step:

- `index.html`: markup, styles, and all the views.
- `breeding-calculator.js`: the genetics engine and the existing tools (source
  of truth for inheritance).
- `app.js`: the app shell: routing, landing page, toasts, the
  localStorage-backed collection, import wizard, the courser-import bookmarklets,
  and recent searches. It talks to the engine through small optional hooks.
- `manifest.webmanifest`, `icon.svg`: basic install metadata.
- `sw.js`: a retired service worker (kill-switch). Offline support was removed
  because it served stale cached versions; this file just unregisters any old
  worker and clears its caches.
- `ook_horses.csv`, `sample_horses.csv`: example collections.

The design follows the dungeon-coursers.com look (mauve chrome, crimson
blackletter wordmark, moss accents, white panels on a dungeon-stone backdrop),
ported from a design system.

## Deploying

Served on a VPS behind Apache. Every push to `main` auto-deploys via a GitHub
Action that SSHes in and fast-forwards a clone. See [`DEPLOY.md`](DEPLOY.md) and
[`deploy/`](deploy/) for the one-time setup.

## Credits

Created for the [Dungeon Coursers](https://dungeon-coursers.com) HARPG community
by [Ook](https://dungeon-coursers.com/user/Ook).
