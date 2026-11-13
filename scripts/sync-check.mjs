#!/usr/bin/env node
/* Is a project's copy of the team's files up to date?

   node scripts/sync-check.mjs --project <dir>            check; exit 1 when a copy is behind, edited or missing
   node scripts/sync-check.mjs --project <dir> --write    copy the team's files in and write .team/manifest.json

   The project keeps its copies under .team/ at the same paths as here (.team/agents/maker.md, .team/LESSONS.md, …).
   .team/manifest.json lists each copy with the hash it had when it was taken:
     { "files": { "agents/maker.md": "<sha256>", … } }
   With --write and no manifest, the default set is taken: every brief, the shared cue file and the lessons log.
   A project that wants fewer files deletes lines from its manifest; --write then refreshes only what is listed. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEAM = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = buf => createHash('sha256').update(buf).digest('hex');
const defaultSet = () => [
  ...readdirSync(join(TEAM, 'agents')).filter(f => f.endsWith('.md')).sort().map(f => `agents/${f}`),
  'checks/test-wise-cues.mjs',
  'LESSONS.md'
];

/* Returns { ok, lines }. status per file: ok | behind | edited | missing | gone (no longer in the team). */
export function syncCheck(project, { write = false, team = TEAM } = {}) {
  const dir = join(project, '.team'), manPath = join(dir, 'manifest.json');
  const lines = [];
  let man = existsSync(manPath) ? JSON.parse(readFileSync(manPath, 'utf8')) : null;
  if (!man && !write) return { ok: false, lines: [`no ${manPath}: run with --write to take the team's files`] };
  const files = man ? Object.keys(man.files) : defaultSet();
  if (write) {
    const out = { team: 'theATeam', files: {} };
    for (const f of files) {
      const src = join(team, f);
      if (!existsSync(src)) { lines.push(`gone     ${f} (not in the team any more; dropped from the manifest)`); continue; }
      const buf = readFileSync(src), dest = join(dir, f);
      const had = existsSync(dest) ? sha(readFileSync(dest)) : null;
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      out.files[f] = sha(buf);
      lines.push(`${had === out.files[f] ? 'ok      ' : 'updated '} ${f}`);
    }
    writeFileSync(manPath, JSON.stringify(out, null, 2) + '\n');
    return { ok: true, lines };
  }
  let ok = true;
  for (const f of files) {
    const src = join(team, f), dest = join(dir, f);
    let status = 'ok';
    if (!existsSync(src)) status = 'gone';
    else if (!existsSync(dest)) status = 'missing';
    else {
      const mine = sha(readFileSync(dest)), theirs = sha(readFileSync(src));
      if (mine !== man.files[f]) status = 'edited';        // the copy was changed in the project: never allowed
      else if (mine !== theirs) status = 'behind';         // the team moved on
    }
    if (status !== 'ok') ok = false;
    lines.push(`${status.padEnd(8)} ${f}`);
  }
  return { ok, lines };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), i = a.indexOf('--project');
  if (i < 0 || !a[i + 1]) { console.error('usage: node scripts/sync-check.mjs --project <dir> [--write]'); process.exit(2); }
  const { ok, lines } = syncCheck(resolve(a[i + 1]), { write: a.includes('--write') });
  console.log(lines.join('\n'));
  if (!ok) { console.error('\nNot in sync. "behind": run with --write. "edited": undo the edit, and make the change in the team repo.'); process.exit(1); }
}
