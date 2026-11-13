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
| Across items | A key printed in another item of the same test (its phrase, or most of its distinctive words) | `cross-item.mjs` here (from Planning Period, Nov 13) | **shared** |
| Earlier answer tells | In generated math, an earlier answer that gives a later one | Pet World `check-math` | in project |
| Same data set | A key printed as a choice or in a prompt of another question on the same table or graph | Planning Period `checks/cross-item.mjs` (`stimulusHits`) | in project |
| No passage | Reading questions answerable without reading: Part A / Part B pairs, echoes of other items, reused quotes; a short answer whose only evidence is a paragraph number | `no-passage.mjs` here (from Planning Period, Nov 13) | **shared** |
| Hardness and heart | Level 3 no harder than level 2; an item that misses the skill's heart | Pet World `check-math` check 8, `heart-check.mjs` | in project |
| Level share and version match | About 40% level 3; A and B the same skill, level and kind | Planning Period `checks/keys.mjs` | in project |
| Planted defects | A check that has stopped catching what it should | Pet World `scripts/seed-defects.mjs` | in project; **move here next** |
| Coverage | A source idea never tested; an idea tested too often | — | **to build** |
| Repeats in a test | Two items that ask for the same fact or move | — | **to build** |
| Quotations | A quoted line that doesn't match the source | — | **to build** |
| Practice and test overlap | A practice item on the test | — | **to build** |

## The shape shared checks read
A shared check never opens a project's files. The project's own runner turns its content into plain items and calls
the check:

`{ where, prompt, choices?: string[], answer?: number, type?: 'mc' | 'short' | …, keys?: string[] }`

- `where` names the item in reports.
- One **list** is everything a student holds at once: a version of a test, a unit test, a worksheet.
- `cross-item.mjs` reads `keys`: the right choice for multiple choice; `quoted(modelAnswer)` for a written answer.
- `no-passage.mjs` plays items that have `opts` (the choices as strings) and an integer `answer`.

## Rules for a shared check
- Pure functions where possible: content in, findings out. The project's runner reads its own format and calls them.
- A new pattern comes with a case in `scripts/check.mjs` that fails without it.
- Nobody edits a check to pass content. Thresholds are the owner's.
- A project never edits its copy. `scripts/sync-check.mjs` fails when a copy differs from the team's.
