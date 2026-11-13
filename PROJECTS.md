# The projects

How each project plugs into the team, and what each still lacks. Checked Nov 13, 2026.

## Plugging in
A project adds a folder `.team/` with:
- copies of the team files it uses (briefs, `test-wise-cues.mjs`, `LESSONS.md`), unedited;
- `manifest.json`: for each copy, the team file it came from and its hash, written by
  `node <team>/scripts/sync-check.mjs --project <dir> --write`;
- `ADAPTER.md`: what each stage of `PROCESS.md` is called there: the command that makes the student copy, where keys
  live, which script is its structure check, where its cost log is, which paths wait for the owner.

`node <team>/scripts/sync-check.mjs --project <dir>` fails when a copy is behind or was edited. The weekly run does
this for every project; a project may also run it in its own check command.

## Where each project stands

| | Pet World | Planning Period | AP Statistics | Teacher Suite |
|---|---|---|---|---|
| Rule and script before content | partly | partly | yes | no |
| Measures the source first | standards map | yes (`feasibility.json`) | exam compare | setup warnings only |
| Blueprint rules written down | `CONTENT-RULES.md` | `agents/maker.md`, `feasibility.json` | `docs/CONTENT_SPEC.md` | in the prompts |
| Independent key solver | yes (oracles) | yes (SymPy) | yes (scipy, chi-square re-solve) | no |
| Guessing bots | yes, the fullest | yes, the shared cues plus number bots | yes, its own | no |
| Giveaways across items | "earlier answer tells" (math); cross-item held back (L060) | yes, the shared `cross-item.mjs` | reviews only | no |
| Whole-test bots (the shared `no-passage.mjs`) | yes, in the full bot (cross-test bots) | yes, on reading documents | yes, `cross-test-bot.ts` | no |
| Blind solver | yes | yes, one for each subject | yes | no |
| Fact checker | worksheet facts only | yes | no | no |
| Difficulty judge | heart finder, hardness check | in the blind tester's brief | level 3 review, exam compare | no |
| Fresh eyes | yes, six personas | the lead's preview look | screens review | no |
| Auditor changes briefs | recommends only | yes, through a gate | no | no |
| Cost logged in dollars | yes | yes | tokens only | no |
| Weekly run | learning review, digest | Friday practice order | none | none |
| Known-failing lists that only shrink | yes | yes | no | no |
| Planted defects | yes | no | no | no |

## What each project does next
1. **Planning Period:** take the team's cue file (it lacks `inPassage` and `frameBreak`), then the difficulty judge.
2. **Pet World:** take the cross-item and no-passage checks and the fact checker; let the auditor change briefs
   through a gate.
3. **AP Statistics:** move its bot onto the shared cues, log dollars, add a weekly run and a known-failing list.
4. **Teacher Suite:** the biggest change. Its tools call Claude from the page, so they can't run the team. Either its
   assessments are exported to a project that can (its unit format already travels), or it gets a small backend. Until
   then the team's blueprint rules go into its prompts, which is free.

Each step is its own pull request in that project, because a new check can fail existing content, and then the
content is fixed or listed, never the check loosened.

## Checks nobody has yet
Listed in `checks/README.md` as "to build": every source idea covered, no repeated concept in a test, quotations match
the source, no practice item on the test.
