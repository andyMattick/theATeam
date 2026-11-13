#!/usr/bin/env node
/* npm run check: the briefs, the lessons log and the shared checks are well formed. Each part has a self-test that
   proves it bites: a broken sample must fail. */
import { readFileSync, readdirSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { STRATS } from '../checks/test-wise-cues.mjs';
import { syncCheck } from './sync-check.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const bad = msg => problems.push(msg);

/* ---------- briefs: one **Version N**, a change log whose lines run v1…vN with a date and a cause ---------- */
export function briefProblems(name, text) {
  const out = [];
  const vs = [...text.matchAll(/^\*\*Version (\d+)\*\*\s*$/gm)].map(m => +m[1]);
  if (vs.length !== 1) return [`${name}: needs exactly one "**Version N**" line (found ${vs.length})`];
  const log = text.split(/^## Change log\s*$/m)[1];
  if (log === undefined) return [`${name}: no "## Change log" section`];
  const entries = [...log.matchAll(/^- v(\d+), ([A-Z][a-z]{2} \d{1,2}, \d{4}) \(([^)]+)\): \S/gm)].map(m => +m[1]);
  if (!entries.length) out.push(`${name}: change log has no line like "- v1, Nov 13, 2026 (cause): …"`);
  entries.forEach((v, i) => { if (v !== i + 1) out.push(`${name}: change log lines must run v1, v2, … in order (line ${i + 1} is v${v})`); });
  if (entries.length && entries.at(-1) !== vs[0]) out.push(`${name}: Version ${vs[0]} but the newest change-log line is v${entries.at(-1)}`);
  return out;
}
const briefs = readdirSync(join(ROOT, 'agents')).filter(f => f.endsWith('.md')).sort();
if (briefs.length < 8) bad(`agents/: expected the 8 briefs, found ${briefs.length}`);
for (const f of briefs) briefProblems(`agents/${f}`, readFileSync(join(ROOT, 'agents', f), 'utf8')).forEach(bad);
for (const m of readFileSync(join(ROOT, 'README.md'), 'utf8').matchAll(/`(agents\/[a-z-]+\.md)`/g))
  if (!existsSync(join(ROOT, m[1]))) bad(`README.md names ${m[1]}, which doesn't exist`);
// self-test
const GOOD = '# x\n\n**Version 2**\n\n## Change log\n- v1, Nov 13, 2026 (team set-up): a\n- v2, Nov 20, 2026 (pet-world-2, unit 4, FIX ×2): b\n';
if (briefProblems('t', GOOD).length) bad('self-test: a good brief was refused');
if (!briefProblems('t', GOOD.replace('Version 2', 'Version 3')).length) bad('self-test: a version bump with no change-log line passed');
if (!briefProblems('t', GOOD.replace(' (team set-up)', '')).length) bad('self-test: a change-log line with no cause passed');

/* ---------- lessons: "- L001 | date | project | what went wrong | what catches it", ids unique ---------- */
export function lessonProblems(text) {
  const out = [], seen = new Set();
  for (const line of text.split('\n').filter(l => /^- L/.test(l))) {
    const parts = line.slice(2).split(' | ');
    const id = parts[0];
    if (!/^L\d{3}$/.test(id)) { out.push(`LESSONS.md: bad id in "${line.slice(0, 40)}…"`); continue; }
    if (seen.has(id)) out.push(`LESSONS.md: ${id} is used twice`);
    seen.add(id);
    if (parts.length !== 5 || parts.some(p => !p.trim())) out.push(`LESSONS.md: ${id} needs 5 parts: id | date | project | what went wrong | what catches it now`);
  }
  if (!seen.size) out.push('LESSONS.md: no lessons found');
  return out;
}
lessonProblems(readFileSync(join(ROOT, 'LESSONS.md'), 'utf8')).forEach(bad);
if (!lessonProblems('- L001 | a | b | c | d\n- L001 | a | b | c | d\n').length) bad('self-test: a repeated lesson id passed');
if (!lessonProblems('- L001 | a | b | c\n').length) bad('self-test: a lesson with no "what catches it" passed');

/* ---------- shared cues: each cue picks out the giveaway it was written for ---------- */
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const cases = [
  ['longest', ['A cat', 'A dog', 'A long answer that says a great deal more than the others', 'A hen'], '', '', [2]],
  ['inPassage', ['the pot fell and broke in two', 'the pot was dropped by the boy', 'the old pot split apart', 'a pot was smashed'],
    'Which line?', 'x', 'Then the pot fell and broke in two, and Mira cried.', [0]],
  ['frameBreak', ['Nora wants to play piano, but she is tired', 'Nora wants to play piano, but it is late', 'Nora decides to quit'], '', '', [2]]
];
for (const [name, opts, prompt, id, ...rest] of cases) {
  const want = rest.pop(), passage = rest[0];
  if (typeof STRATS[name] !== 'function') { bad(`checks/test-wise-cues.mjs: the ${name} cue is missing`); continue; }
  const got = STRATS[name](opts, prompt, id, passage);
  if (!same(got, want)) bad(`checks/test-wise-cues.mjs: ${name} picked [${got}] where it should pick [${want}]`);
}

/* ---------- sync-check: a fresh copy passes, an edited copy and a stale copy fail ---------- */
{
  const proj = mkdtempSync(join(tmpdir(), 'team-sync-'));
  try {
    if (syncCheck(proj).ok) bad('self-test: sync-check passed a project with no manifest');
    syncCheck(proj, { write: true });
    if (!syncCheck(proj).ok) bad('self-test: sync-check refused a fresh copy');
    const copy = join(proj, '.team', 'agents', 'maker.md'), orig = readFileSync(copy, 'utf8');
    writeFileSync(copy, orig + '\nedited in the project\n');
    const r = syncCheck(proj);
    if (r.ok || !r.lines.some(l => /^edited\s+agents\/maker\.md/.test(l))) bad('self-test: sync-check missed an edited copy');
    writeFileSync(copy, orig);
    const man = join(proj, '.team', 'manifest.json'), m = JSON.parse(readFileSync(man, 'utf8'));
    writeFileSync(copy, 'an older version\n'); m.files['agents/maker.md'] = (await import('node:crypto')).createHash('sha256').update('an older version\n').digest('hex');
    writeFileSync(man, JSON.stringify(m));
    const s = syncCheck(proj);
    if (s.ok || !s.lines.some(l => /^behind\s+agents\/maker\.md/.test(l))) bad('self-test: sync-check missed a copy that is behind');
  } finally { rmSync(proj, { recursive: true, force: true }); }
}

if (problems.length) { console.error(problems.map(p => '✗ ' + p).join('\n')); console.error(`\n${problems.length} problem(s).`); process.exit(1); }
console.log(`✓ ${briefs.length} briefs, the lessons log, the shared cues and sync-check are in order.`);
