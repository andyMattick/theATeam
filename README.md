# The A Team

One team of AI agents, and one set of checks, that every one of the owner's teaching projects uses to make and check
learning content. A lesson one project learns reaches the others at the next weekly sync.

Set up Nov 13, 2026 from a survey of four projects. Each had grown its own team; this is the best of each.

| Project | What it makes | What it brought |
|---|---|---|
| Pet World (`pet-world-2`) | A grades 4–7 learning game; units built from standards | Planted-defect tests, debt lists that only shrink, every reader's catch turned into a script |
| Planning Period (`planning-period`) | Printable packs made from a teacher's own sources and style | Measuring the source first, the no-passage gate, an auditor that rewrites briefs with a version and a cause |
| First Move: AP Statistics (`ap_stats_tutor`) | A tutor app and question bank | Rule and script before content, a pilot unit, comparing the bank to the real exam |
| Teacher Suite (`mergedCalendars`) | Planner, tracker, unit builder, content studio | The shared unit format. Its content is still written and checked by the same call, so it gains the most |

## What is here

| File | What it is |
|---|---|
| `PROCESS.md` | How a piece of content is made and checked: nine stages |
| `IMPROVEMENT.md` | What runs after every job, every week, every month, and on a new model |
| `STREAMLINE.md` | The monthly check for steps Claude no longer needs, with the evidence so far |
| `LESSONS.md` | One log of every lesson, from every project. Each has an id and says which script now catches it |
| `agents/` | The eight briefs. Each ends with `**Version N**` and a change log |
| `checks/` | Shared check code and the catalog of who has which check (`checks/README.md`) |
| `PROJECTS.md` | How each project plugs in, and what each is still missing |
| `scripts/check.mjs` | `npm run check`: the briefs, the lessons log and the shared checks are well formed |
| `scripts/sync-check.mjs` | Run from a project: fails when its copy of a team file is behind |
| `projects.json` | The projects on the team; the weekly run goes through it |
| `WEEKLY.md` | The steps of the weekly run |
| `ABTEST.md`, `ab/` | The weekly with-and-without comparison: the same job done by one plain session, a lean team and the full team, judged blind; eight jobs covering what the four apps make; reports and the scoreboard |
| `weekly/` | The weekly run's reports, one a week |
| `templates/` | What a new project copies: its check script, its adapter, the section for its instructions file |

## The team

| Agent | Brief | Job |
|---|---|---|
| 🧭 Planner | `agents/planner.md` | Measures the source, maps standards, compares with the target exam, writes the blueprint |
| 📝 Maker | `agents/maker.md` | Writes from the blueprint. Never checks its own work |
| 🤖 Wilco | `agents/wilco.md` | Scripts only: key solvers, guessing bots, giveaways across items, structure |
| 🙈 Blind solver | `agents/blind-solver.md` | Fresh. Answers the student copy with no key, then says FIX, KEEP or JUDGMENT |
| 🔎 Fact and source checker | `agents/fact-checker.md` | Fresh. Every claim against the source and against what is true |
| 🎯 Difficulty judge | `agents/difficulty-judge.md` | Fresh. Is level 3 harder in the heart of the skill? Is the set as hard as the real exam? |
| 👀 Fresh eyes | `agents/fresh-eyes.md` | Fresh. Looks at the finished pages or screens the way a student, parent or teacher would |
| 🧾 Auditor | `agents/auditor.md` | After each job and each week: changes briefs, turns catches into scripts, counts the cost |

Roles that belong to one product stay in that project: the videographer, game designer, marketer and feature keeper
(Pet World), the per-teacher style reader (Planning Period). The security reviewer already works the same way in two
projects and is not content work, so it is not here.

## The five rules that never change

1. **The maker never checks its own work.** Every check is a script or a fresh agent that didn't write it.
2. **Fix wrong choices, never keys,** to pass a check. A key changes only when an independent solve shows it is wrong.
3. **Never weaken a check** to make content pass. A check that looks wrong is written up for the owner.
4. **Never leave a bad answer:** a wrong or doubtful key, two right answers, no right answer, a giveaway or a false
   fact is fixed now. Everything else can go on a list with a reason.
5. **One pass, one fix, then get smarter:** one round of fresh agents, one fix round, and every catch a script missed
   becomes a script pattern with a self-test.

## How a project uses the team

1. It copies the team files it uses into its own repo and lists them in `.team/manifest.json` (`PROJECTS.md`).
2. Its own check command runs `scripts/check-team.mjs`: a copy that was edited in the project fails. The weekly run
   checks whether a copy is behind.
3. Its adapter (`.team/ADAPTER.md`) says how the team's steps map to its own commands.
4. Its instructions file for AI assistants says content work follows the team (`templates/INSTRUCTIONS.md`), so a
   new session uses the team without being told.
5. It never edits a copied file. A change is made here and travels to every project.

## Adding a new project

Ask Claude to "add this app to the team", or do it by hand:

1. From this repo: `node scripts/sync-check.mjs --project <the new repo> --write`. That makes `.team/` with every
   brief, the shared checks, the lessons log and the manifest.
2. Copy `templates/check-team.mjs` to the project's `scripts/` and add it to the project's check command (and its CI).
3. Copy `templates/ADAPTER.md` to `.team/ADAPTER.md` and fill it in: what each of the nine stages is called there.
   Copy `templates/OUTBOX.md` to `.team/OUTBOX.md`: where a session leaves a lesson for the team when it can't reach
   this repo.
4. Put the section from `templates/INSTRUCTIONS.md` in the project's instructions file (`CLAUDE.md` or `AGENTS.md`).
5. Add the project to `projects.json` and a column to the table in `PROJECTS.md`. From then on the weekly run
   (`WEEKLY.md`) includes it.
6. Run the project's content through the shared checks once. What they find is fixed or listed by that project's
   rules, never by loosening a check.

## The weekly run

`WEEKLY.md` is the steps; `projects.json` is the list it goes through; reports land in `weekly/`.
