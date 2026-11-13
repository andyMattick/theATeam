# Instructions for AI coding assistants

This repo is the shared team for the owner's teaching projects (`README.md`). It holds briefs, shared checks and the
lessons log. It holds no product code and no student or teacher data.

## Rules
1. The five rules in `README.md` apply to every change here and in every project that uses the team.
2. **A brief changes only with a cause.** Bump `**Version N**` by exactly one and add a change-log line that names the
   project, the job and the finding: `- v3, Nov 20, 2026 (ap_stats_tutor, unit 4 blind solve, FIX ×2): …`. Earlier
   change-log lines stay as they are.
3. **No hard rule is removed or reworded** (a sentence with never, always, must, only, at most, at least, every, or a
   number). To sharpen one, add the sharper sentence and leave the old one. A rule that should go is written up for the
   owner.
4. **A new check comes with a self-test** that fails without it: a case in `scripts/check.mjs`, or in the project's own
   tests when the check lives there.
5. **Every lesson goes in `LESSONS.md`** with the next id, the project it came from, and the script that now catches
   it, or "reader only" when no script can.
6. Samples and examples use made-up teachers and students only. Nothing from a real class or a real order comes here:
   counts and findings only.
7. Plain words, short sentences, the way the projects' own docs are written.

## Before every commit
`npm run check`. Commit messages are plain and specific.

## Pull requests
Work on a branch and open a pull request. A change to `CLAUDE.md`, `.github/`, `scripts/` or the five rules in
`README.md` waits for the owner.
