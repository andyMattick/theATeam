# The weekly run

One run a week, by one lead session, through every project in `projects.json`. What it is for: `IMPROVEMENT.md`.
This file is the steps. Cap: about $20 for the whole run (the comparison's two jobs are $16 of it). Changes go out as pull requests; the lead merges one when
its checks are green, and leaves a change to a project's sensitive paths for the owner.

## Before starting
1. Clone or update this repo and every repo in `projects.json` (a fresh container has none of them).
2. `npm run check` here. If it fails, fix that first and stop there.

## For each project, in the order of `projects.json`
1. **Sync.** `node scripts/sync-check.mjs --project <dir>`.
   - `behind`: run it again with `--write`, then the project's own check command.
   - `edited`: undo the edit in the project, and bring the change to this repo if it was a good one.
   - A file the team added since the project joined: `--write --take <file>` when the project can use it (its
     `.team/ADAPTER.md`, "Not taken yet", says what it has put off and why).
2. **Run the project's checks on all its content** with whatever the sync brought. A bad answer a new pattern finds (a
   wrong or doubtful key, two right answers, no right answer, a giveaway, a false fact) is fixed now, by the
   project's own rules. Anything else goes on the project's known-failing list where it has one, and only where its
   rules allow that.
3. **Empty the project's outbox** (`.team/OUTBOX.md`): each line under "Waiting for the weekly run" becomes a lesson
   in `LESSONS.md` here with the next id, naming the project. Then put the outbox back to its header (in the same
   pull request as the project's sync). Then **read the project's new lessons**: its review docs, audits and cost log
   since last week, for anything a session didn't put in the outbox. A lesson that isn't about
   that project's own code goes into `LESSONS.md` here with the next id, and into a brief (bump its version, name the
   cause) when it happened twice, or once if serious.
4. **Real-use signals**, where the project has them. Counts only, never names or work. Act on what shows up twice,
   or once if serious.
   - **Pet World** already collects its own, in its own scheduled run every Sunday evening ("Weekly Pet World
     review": grown-ups' notes on a problem, heart verdicts, how often she asks her pet tutor to reword, hint or
     explain a word, and what classes got right and missed; `docs/WEEKLY-LEARNING.md` there). **Don't run its export
     again here.** Read its newest `docs/learning/<date>.md` and `docs/learning/EFFICIENCY.md`, and bring anything
     that isn't about Pet World's own code into `LESSONS.md`. If the newest report is more than 8 days old, say so in
     this run's report: that run has stopped.
   - **Planning Period**: teachers' comments in its records.
   - **AP Statistics** and **Teacher Suite** collect none yet. Say so; don't invent any.
5. **Debt.** Fix the worst items on its known-failing lists. A list is shorter at the end, never longer.

## Once a run
6. **The with-and-without comparison** (`ABTEST.md`). It is the practice job: the next **two** jobs in
   `ab/prompts.json` are each done by one plain session, by a lean team and by the full team, and judged the same way
   by fresh judges who don't know which is which. Capped at $8 a job. The measures and the rule for a win were fixed
   on Nov 14, 2026: use them as written. For each job write `ab/<date>-<job>.md`, save the sets in `ab/runs/`, add the
   row to `ab/SCOREBOARD.md`, and write what it teaches into `LESSONS.md`, whichever way it points. "No real
   difference" and "a cheaper arm did as well" are findings: they also go to `STREAMLINE.md`.
7. **Send lessons back out.** If steps 3 to 6 changed anything here, merge it, then sync every project again (step 1)
   so they all end the run on the same version.
8. **The report**: `weekly/<date>.md` here. For each project: what was synced, what the checks found, what was fixed,
   what was listed, what it cost. Then: the comparison's verdict in a line, every brief and check that changed and why, and "Left for
   next week". Under 60 lines. Also tell the owner in the session: the five lines that matter.

## On the first run of each month
9. The streamline check (`STREAMLINE.md`), after step 8. Its report: `streamline/<date>.md`.

## Rules
- The five rules in `README.md`. Never weaken a check; never change a key to pass one.
- Nothing from a real class or a real order comes into this repo: counts and findings only.
- A project's own rules come first inside that project. Read its instructions file before changing anything in it.
- If a step can't be done (a repo can't be reached, a check needs a tool that isn't there), say so in the report. Don't
  skip it silently and don't guess its result.
