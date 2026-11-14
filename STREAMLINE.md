# The streamline check

Once a month, and again on a new Claude model: is any step doing work Claude now does by itself? The aim is the same
quality for less, never less quality.

## The three measures
1. **Cost for each confirmed finding.** From the cost logs of the month's jobs: for every step, dollars spent, FIX
   items it found, and how many of those **no other step found**.
2. **Planted defects.** Known defects are put into clean content: a wrong key, two right answers, a false fact, a
   misquoted line, a giveaway by length, a giveaway from another item, a level 3 that is level 2 with bigger numbers,
   a reading question answerable without the passage, a repeated concept, a source idea never tested. Record which
   step catches each one.
3. **The plain-Claude baseline.** One fresh session gets the same source and the blueprint rules (`PROCESS.md`
   stage 3) and makes the same content alone: no team, no fix round. All the scripts and one blind solve score it.
   Compare its defects with what the team's version had before its fix round, and after.

## The verdicts
| Verdict | When | What happens |
|---|---|---|
| **Keep** | The step had a unique catch in the last three runs, or is the only one that catches a planted defect | Nothing |
| **Make it a script** | Everything it caught could be matched by a pattern | The auditor writes the pattern and its self-test; the agent step stops when the script catches the planted defect |
| **Sample it** | No unique catch in three runs, but its planted defect is caught by nothing cheaper | Runs on 1 job in 3 |
| **Cut** | No unique catch in three runs, and every planted defect it catches is caught by something cheaper | Written up for the owner, who decides |

A step that has ever caught a wrong key or a false fact is never cut on cost alone: the planted-defect run must show
something cheaper catches the same thing. The owner decides every cut. The report goes in `streamline/<date>.md`.

## Where things stand (Nov 13, 2026, from the projects' own logs)

| Step | Evidence | Verdict |
|---|---|---|
| A separate agent that re-checks keys | AP Statistics: readers matched the key on 349 of 349, 284 of 285 and 170 of 170. Pet World's worksheet pilot: the key checker ($1.86) found no wrong key. Planning Period: the solver agreed with every key | **Cut.** A solver script plus the blind solve's mismatches cover it |
| A solver for generated math | Pet World grade 7 unit 2: 35 wrong keys in generator code | **Keep, as a script** |
| The reporter as an agent session | 9% of Planning Period's cost ($5.21 of $57.34). Pet World replaced it with a script | **Make it a script** (done in Pet World) |
| A browser-test agent session | Pet World: nothing in 710 checks ($1.12) | **Make it a script** |
| Wilco as an agent session | Planning Period dropped it ($0.15 a run); it only ran scripts | **Make it a script** (done) |
| A fresh recheck of every fix | Pet World: $0.36 and $1.56, nothing found. Planning Period: a $0.55 recheck found 4 problems, all in newly written wording | **Sample it:** only fixes with new factual text or a new key |
| An open "review this" pass with the key in view | Pet World: flagged 19 of 77 clean items | **Cut.** Readers get blind tasks |
| The blind solve | Pet World: $1.20 for 8 FIX and $1.22 for 7 FIX, on units every script had passed. Planning Period: both FIX in the first real order | **Keep.** Best value of any step |
| The fact and source checker | Planning Period: a history myth in 4 places and 3 false science figures no other step saw | **Keep** |
| The no-passage probe | Planning Period: 20 of 20 without the passages on a quiz the bots passed | **Keep** for reading; two probes a version at 8 items, because chance alone reaches the line 11–26% of the time |
| Fresh eyes | Pet World: the only step that found one giveaway (1,000 of 1,000) and two right answers the solver passed | **Keep**, trimmed |
| The benchmark compare | AP Statistics: 4 gaps that a 100% blind solve had hidden | **Keep**, once a term |
| Multiple choice on reading passages | Planning Period: three tries cost about $35 and still leaked | Retired there; other projects keep theirs only while the gate passes |

**What this says about Claude today.** It writes correct keys and follows format rules when it has them up front, so a
second agent that only re-confirms them is wasted money. It still can't see its own giveaways, its own factual myths
or its own drift in difficulty, so an independent reader is still worth paying for. Independence is not the overkill.
Paying an agent to do a script's job is.

**First comparison, Nov 14, 2026** (`ab/2026-11-14-sci-water-cycle.md`; one run, so not yet a case): a plain session
matched the team on keys, facts, structure, coverage and level share. The team was ahead only on guessability (key
longest 20% against 50%; no key printed in another question against 3), and that gap was already in its draft, from
the maker's cue rules. Its level 3 was no harder than the plain arm's. Watch over the next runs: the blueprint's
structure rules, and the fact checker on jobs where the maker stays inside the source.

**The baseline now runs every week** as the with-and-without comparison (`ABTEST.md`; scoreboard in
`ab/SCOREBOARD.md`). Before Nov 14, 2026 the plain-Claude baseline had never been run in any project, and planted defects have only been
run in Pet World. The first monthly check does both.
