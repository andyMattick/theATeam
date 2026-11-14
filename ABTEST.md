# The with-and-without comparison

The owner, Nov 14, 2026: compare a prompt and its output with and without the agents' checks, to verify the agents are
making a difference; log what the comparison teaches; expect that in some cases the agents aren't much better than no
agents.

So: the same job is done twice, once by one plain Claude session and once by the team, and both results are judged
the same way by judges who don't know which is which. It runs once a week inside the weekly run (`WEEKLY.md`), where
it is the practice job. Reports go in `ab/`, and `ab/SCOREBOARD.md` keeps the running count.

## The two arms
Both get exactly the same words: the `request` in `ab/prompts.json`, the job's source and ideas, and the output format
below. Nothing else.

| Arm | Who | What it may use |
|---|---|---|
| **Plain** | One fresh session, one go | The prompt only. No briefs, no scripts, no second reader, no fix round |
| **Team** | The team, as `PROCESS.md` says | The planner's blueprint, the maker with its brief, every script (`scripts/ab-score.mjs` on its own draft), one fresh blind solve and, for a source with facts, one fact and source check, then **one** fix round |

The plain arm is not made weak on purpose. It is today's Claude, asked well. That is the point: the team has to beat
that, not a straw man.

## The output format (both arms)
```json
{ "items": [ { "id": "q1", "idea": "i3", "level": 2, "prompt": "…", "choices": ["…", "…", "…", "…"], "answer": 0, "why": "…" } ] }
```
`answer` is the index of the right choice (0 to 3). `idea` is one of the job's idea ids. `why` says why the key is
right, with the working for a number.

## The steps
1. **Pick the job**: the next one in `ab/prompts.json` after the last report in `ab/`.
2. **Run the plain arm** in a fresh session. Save its quiz. Note its tokens and dollars.
3. **Run the team arm.** Save its quiz **before** the fix round (the draft) and after it (the final). Note tokens and
   dollars for each step.
4. **Blind the files.** Flip a coin: the plain quiz and the team's final quiz become `X.json` and `Y.json`. Write down
   which is which in a file the judges never see.
5. **Scripts**: `node scripts/ab-score.mjs --job <id> X.json Y.json`. Also score the team's draft, to see what its own
   checking changed.
6. **Readers**, fresh, and never one that worked on either arm. Each gets the two keyless copies
   (`--view`) and is told only that they are two quizzes on the same source:
   - a **blind solver** answers both and says, for every wrong choice, why it is wrong (`agents/blind-solver.md`);
   - a **fact and source checker** on both, when the job has a passage (`agents/fact-checker.md`);
   - a **difficulty judge** says, for each quiz, whether its level 3 questions are harder in the skill
     (`agents/difficulty-judge.md`).
   Then the lead scores each reader's answers against each quiz's key.
7. **Count** for each arm: bad answers (a wrong key, two right answers, no right answer, a giveaway, a false or
   off-source claim), other FIX items, and JUDGMENT items. A finding counts only if the lead can confirm it from the
   quiz itself.
8. **Unblind and write the report**: `ab/<date>-<job>.md`, from the layout below. Add one row to `ab/SCOREBOARD.md`.
9. **Lessons.** Whatever the comparison shows goes to `LESSONS.md` with the next id, whichever way it points:
   - the team did better at something → say which step earned it (was it already right in the draft, or did the fix
     round do it?);
   - **no difference, or the plain arm did better** → say so plainly. That is a finding, not a failure. It goes to
     `STREAMLINE.md` as evidence for that step, and three runs the same way make it a case for the owner.
   - a defect **both** arms had and no judge's script saw → a pattern for the checks, with a self-test.

## The report (`ab/<date>-<job>.md`)
```
# With and without the team: <job title>, <date>

Verdict in one line: team better / no real difference / plain better, and at what cost.

| | Plain | Team (draft) | Team (final) |
| Bad answers (wrong key, two right, none right, giveaway, false claim) |
| Other FIX items from the readers |
| Structure problems |
| Ideas tested (of N); most questions on one idea |
| Level 3 share; readers agree level 3 is harder? |
| Key longest / shortest |
| Worst one-question bot; worst whole-test bot |
| A key printed in another question |
| Blind solver's score against the key |
| Cost: tokens and dollars |

What the team's fix round changed (draft against final).
What each arm got wrong, in a line each.
What this run teaches (the lesson ids written).
Limits of this run.
```

## Reading the numbers honestly
- **Ten questions is a small quiz.** One question moves a bot by 10 points. A gap under 15 points on a bot, or one
  FIX either way, is "no real difference". Say that, and don't dress it up.
- **One run proves nothing.** The scoreboard is the evidence. A claim about the team needs at least four runs, and
  runs across more than one subject.
- **Cost counts.** "Team better" with nothing about cost is half a verdict. Give dollars for each bad answer avoided.
- **The judges are Claude too.** A defect every reader misses is invisible here. The scripts and the planted-defect
  run (`STREAMLINE.md`) are the guard against that, and real students' results are the only real proof.
- **Never tune a job to make the team look good**, and never retire a job because the plain arm won it.

## What it costs
About $3 to $5 a run: the plain arm is cheap, the team arm is most of it, and the three readers judge both quizzes in
one sitting each. It replaces the weekly practice job, so the weekly run's cap doesn't change.
