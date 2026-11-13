# How content is made and checked

Nine stages. Every project runs all nine; its adapter (`PROJECTS.md`) says what each stage is called there. "Reader"
means a fresh agent that didn't write the content.

| # | Stage | Who | Costs tokens? |
|---|---|---|---|
| 1 | Rule first | Lead | no |
| 2 | Measure the source | 🧭 Planner | a little |
| 3 | Blueprint | 🧭 Planner | a little |
| 4 | Write | 📝 Maker | most of the cost |
| 5 | Scripts, every time | 🤖 Wilco | no |
| 6 | One round of readers | 🙈 🔎 🎯 👀 | about a third of the cost |
| 7 | One fix round | 📝 Maker, then Wilco | some |
| 8 | A person agrees | Owner or teacher | no |
| 9 | Learn | 🧾 Auditor | a little |

## 1. Rule first
A new kind of content, or a new rule, goes into the project's content spec **and** into a script check before anything
is written (AP Statistics). Then one pilot unit goes through every stage before the rest is written in parallel.
Writers are split by file: never two on one file.

## 2. Measure the source
- **A teacher's source or a passage:** pages (300 words a page), kind, and the number of distinct ideas. Limits: 6–10
  questions a page, about 2 an idea, math practice 12–20 a page, 4–8 a standard when only standards are given
  (Planning Period's `feasibility.json`). An order that asks for more gets a warning and at most 3 questions back.
- **Standards:** units of about equal weight, 3–6 stations a unit, 1–3 skills a station, the standard's code beside
  each skill, the likely mix-ups. The standard's wording is never copied into student text (Pet World).
- **A real exam the content prepares for:** compare with the published framework and released questions, and list
  what the exam asks that the content doesn't (AP Statistics found 4 gaps this way). A perfect blind solve shows the
  keys are right. It does not show the content is as hard as the exam.

## 3. Blueprint
Written before the first question, and checked by script after the last one.

| What | Rule | From |
|---|---|---|
| Coverage | Every item names the source idea or skill it tests. Every idea in the source is tested at least once. No idea is tested more than about twice | new; nobody enforced it |
| No repeats | No two items in one test ask for the same fact or the same move. A test never copies a practice item | Teacher Suite's prompt, AP Statistics' reviews; now a check |
| Types | The mix of kinds is set here: multiple choice, true or false, numeric, short answer, open, matching, multi-step, sets that share a prompt. At least 2 newer kinds a unit. A test ends with a written answer | Pet World, Planning Period |
| Levels | About 40% level 3 on a test (30–50%), at least 1 in 4 on a quiz. Level 3 is harder **in the heart of the skill**: no clue words, the unknown in a new place, a reason to give, or a less friendly case. Never just bigger numbers | all three |
| Keys | The key is the longest choice about 1 time in 4 and the shortest about 1 time in 4. Its position is planned or shuffled. It is never the odd one out | Pet World, AP Statistics |
| Wrong choices | Each is a real student mistake, in the same grammatical form as the key, and ruled out by the source, not just unsupported | AP Statistics, Planning Period |
| Test pool | At least 6–10 test-only questions a lesson that never appear in practice, review or games | Pet World |
| Versions | A and B match item for item in skill, level and kind. B never reuses A's choice texts, and a key never sits under the same letter in both. Number versions are made by script from one checked version | Planning Period |
| Reading | A passage question must need the passage: no pairs of questions that answer each other, topics a student can't answer from general knowledge | Planning Period |

## 4. Write
- One maker with the whole blueprint and every checklist **up front** (a late checklist cost Pet World a rebuild).
- A dollar cap for each session: one third of the budget for a first draft, one sixth for a fix round. Cost follows how
  long a session runs, so short sessions (about 40 calls) beat long ones.
- Every number is computed by code, never in the maker's head.
- The maker uses nothing outside the source, quotes at most about 300 words, and writes its own wording.
- A request from the teacher beats the style notes. The style notes beat the maker's habits.

## 5. Scripts, every time
They cost nothing, so all of them run on every change (`checks/README.md` lists each one and where it lives).
- **Structure:** one key, no two choices equal in text or value, every choice has a reason, nothing banned.
- **Keys:** an independent solver for every number (SymPy, scipy, or a second generator written without the first).
- **Guessing bots:** can a student who knows nothing beat chance by more than 10 points, or come within 15 of the
  pass mark, by picking the longest, the shortest, the odd one out, the one that echoes the prompt, and so on?
- **Giveaways across items:** a key printed in another item; an earlier answer that tells a later one.
- **Reading:** can the questions be answered without the passage?
- **Blueprint:** coverage, repeats, level share, version match. Quotations match the source word for word.

Scripts read words, not meaning. Twice they passed a reading quiz a reader then aced without the passage. That is why
stage 6 exists.

## 6. One round of readers, in parallel
Each writes its own findings file; the lead merges them.
- 🙈 **Blind solver:** the student copy only. For reading, first without the passage, then with it.
- 🔎 **Fact and source checker:** science, social studies, any nonfiction claim, any quotation.
- 🎯 **Difficulty judge:** level 3 against its level 2 twin, and a sample against the real exam where there is one.
- 👀 **Fresh eyes:** the finished page or screen.

Every finding is **FIX** (a real problem, with the direction of a fix), **KEEP** (the reader was wrong, one line why),
or **JUDGMENT** (the owner or teacher decides; both readings shown).

## 7. One fix round
- Worst first. Wrong choices are fixed, never keys.
- A reader's suggested wording is a direction. The maker never pastes it, because its facts haven't been checked.
- The scripts run again on everything.
- A fresh reader looks again **only at fixes that added new factual text or a new key**. Everything else is not read
  twice (two Pet World rechecks found nothing; one Planning Period recheck found 4 problems, all in new wording).
- Stop after round 3 and tell the owner. Stop and tell the owner when cost passes twice the budget.
- What is left that is not a bad answer goes on a list with a one-line reason.

## 8. A person agrees
The owner or teacher sees a preview and a review list with every right answer in bold, and either asks for changes or
agrees. Nothing goes to students before that.

## 9. Learn
The auditor's work: `IMPROVEMENT.md`, "After every job".
