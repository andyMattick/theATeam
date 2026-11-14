# How the team gets better

Writing is half the work. The other half runs on a clock. The team improves by changing its briefs and its scripts
from evidence, in pull requests that pass the checks. It never loosens a rule by itself (`CLAUDE.md`).

| When | What | Cap |
|---|---|---|
| After every job | The auditor's pass | about $1.50 |
| Every week | Sync, the with-and-without comparison (`ABTEST.md`), real-use signals, debt, one report | about $12 across all projects |
| Every month | The streamline check (`STREAMLINE.md`) | about $10 |
| On a new Claude model, and once a term | The benchmark compare and the baseline again | about $10 |

## After every job (🧾 Auditor)
1. **Sort every finding by cause:** which agent should have prevented it, and which line of its brief, or which
   missing line, let it through. Something a teacher or the owner had to ask for is a miss even when every check passed.
2. **Change the brief** for anything that happened twice, or once if it was serious (a wrong key, a false fact). Bump
   the version, name the cause.
3. **Turn the catch into a script.** When a reader found what a script missed, add a pattern for it to the shared
   check, with a self-test that fails without it. When no script can catch it, say "reader only" in the lesson.
4. **Write the lesson** in `LESSONS.md`, once, with its id. A session working in one project that can't reach this
   repo writes it in that project's `.team/OUTBOX.md`; the weekly run brings it here.
5. **Count the cost:** dollars for each step, and dollars for each confirmed FIX. This is what the monthly streamline
   check reads. A project that logs only tokens (AP Statistics today) logs dollars from now on.

## Every week
One run, one project after another, in this order.

1. **Sync.** Each project takes the team's newest briefs, checks and lessons (`scripts/sync-check.mjs` shows what is
   behind). Then the project's scripts run on **all its existing content** with the new patterns. This is how a lesson
   from one project reaches the others. A bad answer the new pattern finds is fixed now. Anything else goes on the
   project's known-failing list, which can only shrink.
2. **The with-and-without comparison** (`ABTEST.md`). One made-up job, a different kind each week, done by one plain
   session, a lean team and the full team, and judged blind, with an $8 cap. It is the practice job (it grew out of
   Planning Period's Friday test), and what it shows goes to the auditor like any job, including when a cheaper arm
   does as well.
3. **Real-use signals.** Student miss rates, what grown-ups and teachers asked for, what the tutor was asked: counts
   only, never names or work. A signal counts when it shows up twice, or once if serious. Items most students miss or
   nobody misses change the level they are filed under (Pet World's weekly learning review; the idea behind Teacher
   Suite's planned analyzer).
4. **Debt.** The worst items on each known-failing list are fixed. The lists are shorter at the end than at the start.
5. **One report** for the owner, across all projects: what was synced, the comparison's verdict, what changed in
   which brief and why, what is left for next week, what it cost.

Fixes go out as pull requests that merge when the project's own checks pass. A change to a project's sensitive paths
waits for the owner there, as it does today.

## Every month
The streamline check: `STREAMLINE.md`.

## On a new Claude model, and once a term
- **Benchmark compare.** A sample of each project's hardest content against the real exam or the standards it
  prepares for (AP Statistics' compare review). Gaps go to the planner's brief and the blueprint rules.
- **Baseline again.** The streamline check's plain-Claude run, because a new model can make a step unnecessary, or
  make a cheaper tier good enough for a reader.

## What keeps this honest
- **Planted defects.** Once a month known defects are put into clean content to see which step catches each (Pet
  World: 21 of 21). A check that no longer catches its planted defect is broken, not passing.
- **Lists that only shrink.** A known-failing list can lose entries and never gain an old unit; a new unit never joins.
- **The gate.** A brief change that removes or softens a hard rule is refused and kept as a patch for the owner
  (Planning Period's auditor gate). `npm run check` here does the same for the shared briefs.
- **A person stays in the loop** for anything that goes to students, any price, any threshold, and any sensitive path.
