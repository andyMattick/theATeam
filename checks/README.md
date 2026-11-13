# The checks

Scripts cost nothing, so every one runs on every change. This is the catalog: what each check catches, where the best
copy lives today, and whether it is shared yet.

"Shared" means the code is in this folder and projects copy it. "In project" means it still lives in one project,
tied to that project's file format; it moves here when a second project needs it.

| Check | Catches | Best copy today | Status |
|---|---|---|---|
| Guessing cues | Longest, shortest, middle length, overlap, absolute words, grammar, odd one out, all of the above, position, in the passage, broken frame | `test-wise-cues.mjs` here (from Pet World, Nov 12) | **shared** |
| Guessing bot runner | Plays the cues on a unit; fails above chance + 10 points or within 15 of the pass mark | Pet World `scripts/test-wise-bot.mjs`, Planning Period `checks/test-wise.mjs`, AP Statistics `scripts/test-wise-bot.ts` | in project: each reads its own format |
| Number bots | Largest, smallest, middle, round, one operation on the givens | Planning Period `checks/test-wise.mjs`, Pet World `check-math-fairness.mjs` | in project |
| Structure | One key, no equal choices, a reason on every choice, banned words | every project has its own | in project |
| Key solver | A wrong number | Pet World `scripts/math-oracles/`, Planning Period `checks/math_check.py`, AP Statistics `scripts/chi.ts` | in project |
| Across items | A key printed in another item; an earlier answer that tells a later one | Planning Period `checks/cross-item.mjs`, Pet World `check-math` | in project; **move here next** |
| No passage | Reading questions answerable without reading | Planning Period `checks/no-passage.mjs` | in project; **move here next** |
| Hardness and heart | Level 3 no harder than level 2; an item that misses the skill's heart | Pet World `check-math` check 8, `heart-check.mjs` | in project |
| Level share and version match | About 40% level 3; A and B the same skill, level and kind | Planning Period `checks/keys.mjs` | in project |
| Planted defects | A check that has stopped catching what it should | Pet World `scripts/seed-defects.mjs` | in project; **move here next** |
| Coverage | A source idea never tested; an idea tested too often | — | **to build** |
| Repeats in a test | Two items that ask for the same fact or move | — | **to build** |
| Quotations | A quoted line that doesn't match the source | — | **to build** |
| Practice and test overlap | A practice item on the test | — | **to build** |

## Rules for a shared check
- Pure functions where possible: content in, findings out. The project's runner reads its own format and calls them.
- A new pattern comes with a case in `scripts/check.mjs` that fails without it.
- Nobody edits a check to pass content. Thresholds are the owner's.
- A project never edits its copy. `scripts/sync-check.mjs` fails when a copy differs from the team's.
