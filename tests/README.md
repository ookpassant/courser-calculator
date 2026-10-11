# Tests

```bash
node tests/run.js           # everything
node tests/run.js chat      # just the files whose name contains "chat"
node tests/test-group.js    # or one on its own
```

No dependencies, no build step, nothing to install. Each file runs in its own
process and exits non-zero if anything fails.

## How they work

The site has no modules: `index.html` loads five scripts into one global
scope. So `harness.js` does the same, with a small stand-in for the page, and
hands back the names a test asks for:

```js
const { load, suite } = require('./harness');
const A = load(['group-horses.js', 'breeding-calculator.js'], '{ resolveTraits }');
```

Nothing is mocked or reimplemented. A test that passes here is running the
code that ships, which is the only reason to trust it.

## What is covered

| file | what it holds the line on |
|---|---|
| `test-group.js` | the 44 group horses: every gene token known to the engine, every genotype resolving, and the specific facts checked against the Group Horse Masterlist, including the ten that express a recessive rather than carrying it |
| `test-mirrors.js` | shared loci written the other way round, `prlCr` for `Crprl` and the rest, which the engine used to throw away as typos |
| `test-rootlist.js` | Recipe's item list: grouped by force and block, folded, and never offering to force an allele neither parent has |
| `test-chat.js` | the chat builder: parsing, every tag, both kinds of section, all four themes, and the escaping |

## What is not

The engine's own maths is thinner here than it should be. There was a larger
suite covering coat resolution, the search, the scroll pricing, the potion
and item costs, Somatic, the English translations and a breeding regression
run, and it was kept in a scratch directory outside the repo. A container
restart took it. That is why this directory exists at all, and the gap is
worth filling in rather than leaving.
