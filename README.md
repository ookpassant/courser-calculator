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

### Recipe
- The Foal Generator run backwards: give it the foal you want and it works out
  what the parents would have to be, and how often that pairing would throw it.
- Takes **plain English or a genotype** in the same box. "A cerulean bay nacre
  with tobiano" is built into the genotype it means, and the genotype it built is
  always shown so you can correct it. Name a coat family without a base ("cream
  ether") and it offers the three coats as buttons.
- Works per locus, because every pair in a genotype takes one allele from each
  side. That makes the inverse exact rather than a guess.
- Prices the **Breeding Roll Add-On items** and always picks the cheapest route,
  weighing single roots against the Tome by the rarity of the genes involved.
- Refuses targets that can't exist, so a lethal white combination is explained
  rather than costed.
- Checks your collection for pairs that already work, ranks the free ones first,
  and shows near misses when nothing is an exact fit, with the items it would
  take to block whatever a parent carries in excess.
- Names each ideal parent in words as well as genotype, so you know what to look
  for.

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

### Layers
- Paste a genotype (or pick one from your collection) and it lays the traits out
  in the official visual hierarchy, so you can design in layers from the base
  coat up.
- Within each column the top layer covers the ones below it, and traits on the
  same line sit on the same level. Only the traits the horse actually has are
  shown, so it reads as a paint order.
- Links the Trait Index page for each trait it lists.

### Smart Search
- Ask a breeding goal in plain language ("How can I make Amber Champagne?",
  "Who can breed for fewspot and starfield?", "Which pairs can produce false
  leopard?").
- Searches the pairs in **your collection** and ranks them.
- Understands exact coat names, **coat families** ("cream ether", "nacre"), bare
  base colours, traits, and carriers. A coat is judged by asking the engine
  whether the pair can really produce it, so a match is never a name collision.
- Uses the same carrier wording Translate prints, and accepts either spelling, so
  a phrase copied off a translated genotype searches for the trait it described.
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
  Two Cream genes with Champagne or Ether make the Legendary Double Cream
  Champagne and Ash Ether coats, and two Pearl genes with a Cher pair make
  Nacre; Recipe, Smart Search and the Scroll Generator all know the nine names.
- **White markings**: Tobiano, Overo, Splash, Roan, Sabino, Blanched, False
  Leopard, Harlequin, Shroud, Ossuary, Filigree, Crowned, Cuirass, Girdle,
  Collar, Greaves, Apron, Rabicano, Dominant White, and Leopard Complex
  (Snowflake to Fewspot). Greaves and Apron share a locus, as do Girdle and
  Collar.
  KIT locus allows max two of Tobiano/Roan/Sabino/Dominant White.
- **Modifiers**: Dun, Pangare, Sooty, Gray, Pitch, Flaxen, Silver, Illuminated,
  Sepulchered, Tabard, Gilt, Vellum, Opal, Prism, Lacquer, Starfield, Ingot,
  Mithril, Damascus. Pitch shares Gray's locus and blackens with age where Gray
  whitens; a horse with both goes a true mid gray. Mithril is recessive (mtmt).
  Damascus shares Dun's locus and only shows paired with it (DmD), so a horse
  holding Dm without a D carries it unseen.
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
Action that SSHes in and fast-forwards a clone. The same Action stamps the
deployed commit onto the script tags as `?v=<sha>`, so a browser can never serve
yesterday's JavaScript against today's HTML; if the stamp fails to apply, the
deploy fails loudly rather than shipping a stale page. See
[`DEPLOY.md`](DEPLOY.md) and [`deploy/`](deploy/) for the one-time setup.

## Credits

Created for the [Dungeon Coursers](https://dungeon-coursers.com) HARPG community
by [Ook](https://dungeon-coursers.com/user/Ook).

The landing page also links other players' fan tools, hosted on their own sites.
Thanks to Rev for the [Group Horse Roller](https://revukan.neocities.org/code/tools/dcgrouphorse).
