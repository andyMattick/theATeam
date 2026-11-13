# How <project> uses the shared team

`.team/` holds unedited copies of the shared team's files (briefs, shared checks, the lessons log). The team repo is
`theATeam`; its `PROCESS.md`, `IMPROVEMENT.md` and `STREAMLINE.md` are the full method. This project's own rules
(<its instructions file>) still come first here.

## Keeping the copies fresh
- Take the team's newest files (run from the team repo): `node scripts/sync-check.mjs --project <this repo> --write`.
- Is anything behind or edited: `node scripts/sync-check.mjs --project <this repo>`. The weekly run does this.
- This project's check command runs `scripts/check-team.mjs`: a copy that no longer has the hash in
  `.team/manifest.json` fails. Never edit a copy: make the change in the team repo.

## What each stage of the team's process is called here
| Team stage | Here |
|---|---|
| 1. Rule first | <where rules live, and the script that checks them> |
| 2. Measure the source | <how the source, standards or exam is measured> |
| 3. Blueprint | <where the plan for a piece of content is written down> |
| 4. Write | <who or what writes> |
| 5. Scripts | <the check command and what it runs> |
| 6. Readers | <how the keyless student copy is made; which readers run> |
| 7. One fix round | <the rule> |
| 8. A person agrees | <what the owner or teacher sees before students do> |
| 9. Learn | <the cost log; who turns findings into rules> |

- **Keys** live in <where>; the student copy is <command>.
- **Cost log:** <where>, in dollars.
- **Paths that wait for the owner:** <list>.

## Checks that run the team's code
<which of this project's checks call `.team/checks/…`>

## Not taken yet
<what this project doesn't use yet, and why>
