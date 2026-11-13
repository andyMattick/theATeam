#!/usr/bin/env node
/* The shared team's files (.team/, copied from the team repo by its scripts/sync-check.mjs --write; .team/ADAPTER.md).
   Copy this file to the project as scripts/check-team.mjs and run it from the project's own check command. Every copy in .team/ still has the hash in .team/manifest.json: a copy is never edited
   here; a change is made in the team repo and arrives with the next sync. Whether a copy is behind the team is the
   weekly run's check, which has the team repo beside it.
     node scripts/check-team.mjs [--self-test] */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = (b) => createHash('sha256').update(b).digest('hex');

export function teamProblems({ manifest, read }) {
  const out = [], names = Object.keys(manifest?.files || {});
  if (!names.length) return ['.team/manifest.json lists no files'];
  for (const f of names) { const b = read(f); if (b === null) out.push(`.team/${f} is missing`); else if (sha(b) !== manifest.files[f]) out.push(`.team/${f} was edited here: undo it and make the change in the team repo`); }
  return out;
}
const real = () => ({
  manifest: existsSync(join(ROOT, '.team/manifest.json')) ? JSON.parse(readFileSync(join(ROOT, '.team/manifest.json'), 'utf8')) : null,
  read: (f) => (existsSync(join(ROOT, '.team', f)) ? readFileSync(join(ROOT, '.team', f)) : null)
});

if (process.argv.includes('--self-test')) {
  const r = real(), fails = [];
  if (teamProblems(r).length) fails.push('the real files were refused');
  if (!teamProblems({ ...r, read: (f) => (f === 'agents/maker.md' ? Buffer.from('edited') : r.read(f)) }).some((p) => /agents\/maker\.md was edited/.test(p))) fails.push('an edited copy passed');
  if (!teamProblems({ ...r, read: (f) => (f === 'LESSONS.md' ? null : r.read(f)) }).some((p) => /LESSONS\.md is missing/.test(p))) fails.push('a missing copy passed');
  if (fails.length) { console.error(fails.map((f) => `✗ check-team self-test: ${f}`).join('\n')); process.exit(1); }
  console.log('✓ check-team self-test: an edited copy and a missing copy are each caught');
  process.exit(0);
}
const r = real();
if (!r.manifest) { console.error("✗ .team/manifest.json is missing: run the team repo's scripts/sync-check.mjs --project . --write"); process.exit(1); }
const problems = teamProblems(r);
if (problems.length) { console.error(problems.map((p) => `✗ ${p}`).join('\n')); process.exit(1); }
console.log(`✓ .team/: ${Object.keys(r.manifest.files).length} files from the shared team, none edited here`);
