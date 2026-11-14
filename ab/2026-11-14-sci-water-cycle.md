# With and without the team: Where the Puddle Went (grade 5 science), Nov 14, 2026

**Verdict: the team's quiz is harder to guess; on everything else there is no real difference, and on how hard the
hard questions are the plain quiz was slightly better. The team used four sessions where the plain arm used one.**

This was the first run, done by hand to prove the procedure before the weekly run takes it over. The three quizzes and
the team's blueprint are in `ab/runs/2026-11-14-sci-water-cycle/`.

| | Plain (one session) | Team (draft) | Team (final) |
|---|---|---|---|
| Bad answers: wrong key, two right, none right, false or off-source claim | 0 | 0 wrong keys; 5 questions with an off-source step or a wrong choice a student could defend (the team's own readers) | 0 |
| Giveaways the judges confirmed | 2 (q3: the key is the passage's list and every wrong list has two intruders; q9: the key is the longest and the only choice on the topic) | 3 (the team's own blind solver) | 0 |
| Other FIX items from the judges | 3: q4 only finishes the passage sentence; q6 and q7 test the same sentence, so one question adds nothing; several keys are close to the passage's words | not judged | 1: q9 falls to test sense (two throwaway choices) |
| Structure problems | none | none | none |
| Ideas tested (of 8); most questions on one idea | 8; 2 | 8; 2 | 8; 2 |
| Level 3 share | 40% | 40% | 40% |
| Level 3 questions the difficulty judge found truly harder in the science | **3 of 4** | not judged | **2 of 4 clearly, 2 partly** |
| Key is the longest choice / the shortest | 50% / 10% | 20% / 20% | 20% / 20% |
| Worst one-question bot (chance 25%) | longest 50% | inPassage 32.5% | overlap 33.3% |
| Worst whole-test bot | crossVote 43.3% | quoteEcho 34.2% | quoteEcho 20% |
| A key printed in another question | 3 | 0 | 0 |
| Blind judge's score against the key | 10 of 10 | (team's own solver: 10 of 10) | 10 of 10 |
| Fact and source judge: questions with no problem | 10 of 10 | (team's own checker: 5 of 10) | 10 of 10 |
| Sessions; tokens | 1; about 85,000 | | 4 (maker, blind solver, fact checker, fix round); about 374,000 |

Dollars were not measured: sub-agent sessions report tokens only, and most of each session's count is its start-up
context, not the work. The three judges (about 270,000 tokens) are the cost of the comparison, not of either arm.

The blind judge, asked which quiz it would give a class, chose the team's: "its wrong choices need the science to
rule out, it has no repeated question, and fewer answers can be found by matching passage words", and added that the
plain quiz's q10 and q6 "are better than anything at the top of" the team's.

## What the team's steps did, one at a time
- **The blueprint and the maker's brief (before any reader).** The draft already had what separates the two arms on
  the scripts: the key longest in 2 of 10 questions against 5 of 10, and no key printed in another question against 3.
  The plain arm got structure, coverage of all 8 ideas, the 40% level 3 share and an even spread of key letters right
  with no blueprint at all.
- **The team's blind solver and fact checker.** They found problems in 7 of the draft's 10 questions that the scripts
  had passed: an off-source warm glass, wrong choices that describe things that really happen, a stem that asked what
  was "true" where a wrong choice was a true sentence from the passage, three giveaways.
- **The fix round.** It cleared them: the fact judge then found 10 of 10 clean, and the blind judge found no giveaway.
  It did not make the level 3 questions harder in the science, though that was on its list: two of them were rewritten
  and the difficulty judge still rated them level 2.

## What each arm got wrong
- **Plain:** right answers are too easy to find without the science (longest, on-topic, or the passage's own words),
  and two of ten questions test the same sentence.
- **Team:** it reached for harder questions by leaving the passage, then needed its readers to bring it back; and
  after that, its hard questions were no harder than the plain arm's.

## What this run teaches (LESSONS.md)
- L062: a plain session matched the team on correct keys, facts, structure, coverage and level share.
- L063: the guessing-cue rules earned their place before any reader: the gap was already in the draft.
- L064: the team's level 3 was no harder than the plain arm's, even after a fix round aimed at it.
- L065: half the team's draft problems were ones the plain quiz never had; the readers cleaned up what the maker's
  reach for difficulty brought in.
- L066: two questions on one sentence passed the "no idea more than twice" count.
- L067: `inPassage` is now played on every job with a passage; on this run it did not separate the arms.

For `STREAMLINE.md`: one run is not a case. If three runs show the same, the planner's blueprint is a candidate for a
shorter form (its cue rules kept, its structure rules dropped), and the fact checker a candidate for sampling on jobs
where the maker stays inside the source.

## Limits of this run
- Ten questions, one subject, one run. A gap under 15 points on a bot, or one FIX either way, is no real difference.
- The lead wrote the team's FIX list from its readers' reports and ran every step by hand. The weekly run does it
  unattended, and may do it differently.
- The team arm had no difficulty judge of its own. That is how `PROCESS.md` reads for a source with no exam behind it,
  and it may be why its level 3 was not fixed.
- The judges are Claude, like both arms. What all of them miss is invisible here.
- The first judge to report described the questions closely enough that the lead could tell which quiz was which
  before the other two reported. The judges themselves never knew.
- This run had two arms. The lean arm (maker with the brief and scripts, one blind solver, one fix round) was added
  the same day, with seven more jobs; from the next run every comparison has three arms.
