# Bloodline

A free, unofficial breeding and design toolkit for [Dungeon Coursers](https://dungeon-coursers.com), made by [Ook](https://dungeon-coursers.com/user/Ook).

**[Open Bloodline](https://ook.monster/courser-calc/)**

Bloodline is a fan project, unaffiliated with Dungeon Coursers. Use the game’s handbook and Trait Index as the final reference for breeding and design rules.

## Tools

| Tool | What it does |
| --- | --- |
| Foal Generator | Generates four example foals from two parents and lists the possible outcomes. Parents must have different temperaments. |
| Recipe | Takes a target genotype or description and suggests parents, breeding items and odds. Checks saved coursers and group horses, with a coat-only option. |
| Chimera Calculator | Shows possible coats for a Chimera patch, for both lineaged foals and Creations. |
| Scroll Generator | Generates a design at your chosen rarity, with optional extra traits, potion requirements and available shop prices. |
| Translate | Describes a courser’s coat, markings, modifiers and other traits from its genotype. |
| Layers | Arranges visible traits in drawing order, with links to the Trait Index. |
| Somatic | Shows which traits a Somatic patch could hide and the rules for drawing it. |
| Smart Search | Finds pairs in your saved stable that could produce a requested coat or trait. |
| Collection | Saves coursers in this browser, with editing, search, CSV import and export. |

Two additional tools are available by direct link:

- **[Pet Excursions](https://ook.monster/courser-calc/#pets):** assigns pets to excursions using their bonding levels and availability.
- **[Group Chat Builder](https://ook.monster/courser-calc/#chat):** turns a plain-text script into formatted chat HTML for a Dungeon Coursers post. Supports multiple chats, direct messages, themes and downloadable drafts.

## Add your coursers

Paste genotypes directly into a tool, choose a saved courser, or use the group horses in the parent pickers.

To save a stable in Collection:

- **Import from the game:** drag an import button to your bookmarks bar, then use it on your Dungeon Coursers My Characters page or an individual courser’s page. These bookmarks read the open page in your browser, without AI or requests to Dungeon Coursers.
- **Import a CSV:** use the [Google Sheets template](https://docs.google.com/spreadsheets/d/1WfCvxwtGRvoDcYXX9mAd5nryJpodRJ-g96eJ3yesQ9E/edit?usp=sharing), or supply columns for ID, Name, Genotype, Temperament and Variant. Check the import preview for warnings.
- **Add by hand:** enter a courser’s details in Collection.

Export a CSV to keep a backup or move your stable to another browser. Browser storage can be cleared; there is no account or cloud sync.

## Data and privacy

Calculations run in your browser. Collections, recent searches and chat drafts are stored locally. Anonymous usage events count tool use without sending your genotypes or other inputs. Session recording is disabled and Do Not Track is respected. If you submit feedback, the text you submit is sent.

Chat drafts are autosaved one at a time. Download separate drafts to keep multiple pieces. Linked images and the chat preview may load external resources.

## Run locally

Serve this directory with a static web server, for example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. No build step or package installation is required.

## Development

- `breeding-calculator.js`: genetics, trait data and calculator results.
- `app.js`: navigation, collections, import/export and updates.
- `group-horses.js`: group horse roster.
- `pets.js`: pet data, imports and excursion planning.
- `chat.js`: chat script parsing, previews and HTML output.
- `index.html`: page markup and styles.

Run the existing checks with:

```sh
node tests/run.js
```

See [tests/README.md](tests/README.md) for coverage and [DEPLOY.md](DEPLOY.md) for hosting. Pushes to `main` trigger the VPS deployment workflow.

## Credits

Created and maintained by Ook. Thanks to Tower (Crowned_Ladybug) for the Group Horse Directory used by the built-in roster, and to the players who report issues and suggest improvements. Try [Rev’s Group Horse Roller](https://revukan.neocities.org/code/tools/dcgrouphorse), also linked from the homepage.

## Licence

[MIT](LICENSE).
