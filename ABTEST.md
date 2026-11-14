# The with-and-without comparison

The owner, Nov 14, 2026: compare a prompt and its output with and without the agents' checks, to verify the agents are
making a difference; log what the comparison teaches; expect that in some cases the agents aren't much better than no
agents. Then: add a lean arm, and test the different kinds of content the four apps make.

So: the same job is done three times, by one plain Claude session, by a lean team and by the full team, and all three
results are judged the same way by judges who don't know which is which. It runs once a week inside the weekly run
(`WEEKLY.md`), where it is the practice job. Reports go in `ab/`, and `ab/SCOREBOARD.md` keeps the running count.

## The measures, fixed on Nov 14, 2026 before the counted runs began
Written down first so nobody can pick the flattering number afterwards. The run of Nov 14 on `sci-water-cycle` had two
arms and came before this section: it is the **pilot** and is not counted.

**Primary measure: confirmed bad answers for every 10 items.** A bad answer is a wrong key, two right answers, no
right answer, a giveaway a judge can explain, a false or off-source claim, or a right typed or written answer that
would be marked wrong. A judge who doesn't know the arm raises it; the lead confirms it from the set itself.

**Secondary measures (three, no more):**
1. **Guessability:** the worst bot's points over chance (only on 8 or more multiple-choice questions), and the number
   of keys printed in another question.
2. **Level 3 that is truly harder:** of the items an arm labels level 3, the share the difficulty judge rates harder
   in the skill.
3. **Cost:** sessions and tokens, and dollars where a session shows them.

**What counts as a win on one run.** Arm X beats arm Y when X has at least 1 fewer bad answer for every 10 items.
Anything closer is a tie. Secondary measures are reported beside it and never turn a tie into a win.

**What counts as a result over the runs.** Ties are set aside. Of the runs that are not ties, X is "better than Y"
only with at least this many wins (a one-sided sign test at 5%):

| Runs that aren't ties | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Wins needed | 5 | 6 | 7 | 7 | 8 | 9 | 9 | 10 | 10 | 11 | 12 | 12 |

Fewer than 5 runs that aren't ties: "no difference shown", and say so.

**The questions, in this order:**
1. Is the lean arm better than the plain arm?
2. Is the full team better than the lean arm? If not, the lean arm is the default for that kind of content, and the
   extra steps are a case for the owner (`STREAMLINE.md`).
3. Does the answer change with the kind of content? Each kind is run twice so this can be seen, not proved.

**How many runs.** Sixteen counted runs: every kind of content twice, each time from a different source, two jobs a
week, so eight weekly runs from Nov 14, 2026.
If questions 1 or 2 are still "no difference shown" at sixteen, run eight more before saying anything to anyone else.

**A person checks the judges.** For at least 3 of the 16 runs, the owner or another teacher rates the same three
keyless copies with `ab/HUMAN-RATING.md`, without knowing the arms or the judges' findings. The report gives the
person's count of bad answers beside the judges'. If they disagree on which arm was best in 2 of the 3, the judges'
results are not presented to anyone as evidence.

**Changing any of this.** A change to a measure, a rule or a job is dated here with its reason, and runs before and
after it are reported apart.
- *Nov 14, 2026, before any counted run:* the second round uses a **new source of the same kind**, not the same job
  again, and the science-passage slot of round 1 uses a new passage too, because the pilot was run on the water
  cycle. Reason: the lean and team makers read `LESSONS.md`, which holds lessons from earlier runs; on a repeated
  source they would have notes about that exact assignment and the plain arm would not. Sixteen counted runs are now
  sixteen different sources, two of each kind. Lessons written from a comparison are about the kind of content,
  never about a source's details. The comparison is evidence about the checking of written content by AI judges. It is not
evidence about what students learn: only real results show that.

## The three arms
All get exactly the same words: `node scripts/ab-score.mjs --prompt <job id>` prints them (the request, the job's ask,
its source and ideas, and the output format). Nothing else.

| Arm | Sessions | What it may use |
|---|---|---|
| **Plain** | 1 | The prompt only. No briefs, no scripts, no second reader, no fix round |
| **Lean** | 3 | A maker with `agents/maker.md` and `LESSONS.md`, who runs `scripts/ab-score.mjs` on its own draft; **one** fresh blind solver (`agents/blind-solver.md`); one fix round. No blueprint step, no fact checker, no difficulty judge |
| **Team** | 5 or 6 | As `PROCESS.md` says: the planner's blueprint, the maker with its brief and the scorer, then fresh readers on the draft (a blind solver, a difficulty judge, and a fact and source checker when the job has a passage or real-world facts), then **one** fix round |

The plain arm is not made weak on purpose. It is today's Claude, asked well. The team has to beat that, and the full
team has to beat the lean one by enough to pay for its extra sessions.

## The jobs: every kind of content the four apps make
`ab/prompts.json` has seventeen made-up jobs: the pilot's, then eight for round 1 and eight for round 2. Two are used
each week, in the order they are listed, so each round takes four weeks. Each kind of content is tested twice, from
two different sources.

| Kind | Like what | Round 1 | Round 2 |
|---|---|---|---|
| A multiple-choice quiz from a science passage | Planning Period quizzes; Pet World library units | `sci-seedlings` (pilot: `sci-water-cycle`) | `sci-sound` |
| A mixed assessment: multiple choice, true or false, short answers with rubrics | Teacher Suite assessments; Planning Period tests; Pet World written answers | `hist-marrow-creek` | `hist-port-wren` |
| Math with typed number answers and multiple choice, every key worked | Pet World math shops; Planning Period math | `math-ratios` | `math-percents` |
| A reading quiz: a Part A / Part B pair, short answers that quote the text | Planning Period reading quizzes; Pet World two-part questions | `ela-lantern` | `ela-ferry-bell` |
| Exam-style statistics: stand-alone questions, a set of three on one prompt, a free response with a 10-point rubric | First Move: AP Statistics | `stats-bus-routes` | `stats-lunch-menu` |
| Lesson practice in three tiers, "who is right" questions, fill-in vocabulary | Teacher Suite lessons; Planning Period notes and worksheets | `lesson-area` | `lesson-mean-median` |
| A grammar bank where rule names and sentence forms come back as choices | Pet World English units | `gram-commas` | `gram-agreement` |
| One quiz in two matched versions | Planning Period A/B versions | `ab-fractions` | `ab-decimals` |

`npm run check` fails if the bank stops covering an item type (multiple choice, true or false, typed number, fill-in,
short answer, free response, a pair, a set, two versions) or stops having a job like each of the four apps. What the
bank does **not** cover: Pet World's generated math (problems made by code), games, videos and note sheets, and
anything that needs a screen. Those are tested in their own projects.

## The output format (all arms)
In `scripts/ab-score.mjs` (`OUTPUT_FORMAT`) and printed with the prompt: one JSON object with `items`, each with
`id`, `idea`, `level`, `type`, `prompt`, `why`, and the fields its type needs.

## The steps
1. **Pick the jobs**: the next two in `ab/prompts.json`, in the order listed, that have no report in `ab/` yet. Skip
   the pilot's job. A job is never run twice. Do steps 2 to 9 for each, one job at a time, with fresh sessions for
   everything.
2. **Run the plain arm** in one fresh session. Save its set. Note its tokens (and dollars, where the session shows them).
3. **Run the lean arm** and **the team arm**, each from fresh sessions that share nothing with the other arm. For each,
   save the draft (before the fix round) and the final. Note sessions, tokens and dollars for each step.
4. **Blind the files.** Shuffle: the three finals become `X.json`, `Y.json` and `Z.json`. Write down which is which in
   a file the judges never see.
5. **Scripts**: `node scripts/ab-score.mjs --job <id> X.json Y.json Z.json`. Also score the two drafts, to see what
   each arm's own checking changed.
6. **Judges**, fresh, and never one that worked on any arm. Each gets the three keyless copies (`--view`) and is told
   only that they are three sets on the same source:
   - a **blind solver** answers all three, works every number itself, and says for every wrong choice why it is wrong;
   - a **fact and source judge**, when the job has a passage or real-world facts;
   - a **difficulty judge**: is each set's level 3 harder in the skill?
   - a **rubric judge**, when the job has typed, fill-in or written answers: it gets `--notes` (what counts as right,
     model answers, rubrics, hints) after the blind solver is done, and says whether a right answer could be marked
     wrong, whether a rubric can be applied with yes or no, and whether a hint gives the answer away.
   Then the lead scores each judge's answers against each set's key.
7. **Count** for each arm: bad answers (a wrong key, two right answers, no right answer, a giveaway, a false or
   off-source claim, a right typed answer that would be marked wrong), other FIX items, and JUDGMENT items. A finding
   counts only if the lead can confirm it from the set itself.
8. **Unblind and write the report**: `ab/<date>-<job>.md`, from the layout below. Save the sets in
   `ab/runs/<date>-<job>/`. Add one row to `ab/SCOREBOARD.md`.
9. **Lessons.** Whatever the comparison shows goes to `LESSONS.md` with the next id, whichever way it points:
   - write it about the kind of content, never about the source's details, so a later run on another source of that
     kind is not handed the answers;
   - an arm did better at something → say which step earned it (already right in the draft, or the fix round?);
   - **no difference, or a cheaper arm did as well or better** → say so plainly. That is a finding, not a failure. It
     goes to `STREAMLINE.md` as evidence for that step, and three runs the same way make it a case for the owner;
   - a defect **every** arm had and no script saw → a pattern for the checks, with a self-test.

## The report (`ab/<date>-<job>.md`)
```
# With and without the team: <job title>, <date>

Verdict in one line: which arm was best, by how much, and at what cost.
Primary measure (bad answers for every 10 items): plain / lean / team. Lean against plain: win, tie or loss. Team against lean: win, tie or loss.

| | Plain | Lean (draft) | Lean (final) | Team (draft) | Team (final) |
| Bad answers (wrong key, two right, none right, giveaway, false claim, a right answer marked wrong) |
| Other FIX items from the judges |
| Structure problems |
| Ideas tested (of N); most items on one idea |
| Level 3 share; level 3 items the difficulty judge found truly harder |
| Key longest / shortest; worst one-question bot; worst whole-test bot (8 or more multiple choice only) |
| A key printed in another question |
| Typed and written answers: the rubric judge's findings |
| Blind judge's score against the key |
| Sessions; tokens; dollars |

What each arm's own checking changed (draft against final).
What each arm got wrong, in a line each.
Is the full team worth its extra sessions over the lean one, on this job?
What this run teaches (the lesson ids written).
Limits of this run.
```

## Reading the numbers honestly
- **These sets are small.** One question moves a bot by 10 points. A gap under 15 points on a bot, or one FIX either
  way, is "no real difference". Bots are not judged on fewer than 8 multiple-choice questions.
- **One run proves nothing.** The scoreboard is the evidence. A claim about an arm needs at least four runs, and a
  claim about a kind of content needs that kind's job run more than once.
- **Cost counts.** Give sessions and tokens for every arm, and dollars where a session shows them. Most of a
  session's tokens are its start-up context, so cost follows the number of sessions.
- **The judges are Claude too.** A defect every judge misses is invisible here. The scripts and the planted-defect
  run (`STREAMLINE.md`) are the guard against that, and real students' results are the only real proof.
- **Never tune a job to make an arm look good**, and never retire a job because the plain arm won it.

## What it costs
Three arms and four judges are about a dozen sessions a job. Cap: $8 a job, so $16 a week for two. It replaces the
weekly practice job; the weekly run's cap is $20 with it.
