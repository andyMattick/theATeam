#!/usr/bin/env node
/* npm run check: the briefs, the lessons log and the shared checks are well formed. Each part has a self-test that
   proves it bites: a broken sample must fail. */
import { readFileSync, readdirSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { STRATS } from '../checks/test-wise-cues.mjs';
import { syncCheck } from './sync-check.mjs';
import { crossItemHits, quoted } from '../checks/cross-item.mjs';
import { readingPicks, judge, numberOnly } from '../checks/no-passage.mjs';
import { outboxProblems, outboxEntries } from '../checks/outbox.mjs';
import { scoreQuiz, studentView, loadJob } from './ab-score.mjs';

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

/* ---------- cross-item and no-passage: a clean test passes, a leaky one is caught (Planning Period's self-tests,
   in the team's neutral shape) ---------- */
{
  const W = 'amber birch cobalt dune ember fjord garnet heron indigo juniper kestrel lagoon marble nectar orchid pewter quartz russet sable tundra umber velvet willow yarrow zephyr alder bramble cinder delta egret fennel glacier hazel iris jasper kelpie larch moss nutmeg ochre pine quill reed saffron thistle'.split(' ');
  const maker = () => { let k = 0; const w = () => W[k++ % W.length] + (k > W.length ? 'x'.repeat(Math.floor(k / W.length)) : ''); return () => `${w()} ${w()} ${w()}`; };
  // cross-item: 8 multiple-choice items and one written answer
  const test = (leaky) => {
    const phrase = maker(), qs = [];
    for (let n = 1; n <= 8; n++) { const choices = [phrase(), phrase(), phrase(), phrase()], answer = n % 4; qs.push({ where: `q${n}`, prompt: `Question ${n}: what about ${phrase()}?`, choices, answer }); }
    const model = `It says "${phrase()} ${phrase()}" [2]`;
    qs.push({ where: 'q9', prompt: `Quote a line about ${phrase()}.`, model });
    if (leaky) {
      qs[5].choices[(qs[5].answer + 1) % 4] = qs[1].choices[qs[1].answer];                                    // a wrong choice repeats another key
      qs[6].prompt += ` (${qs[2].choices[qs[2].answer].split(' ').slice(0, 2).join(' and ')} matter here.)`;  // a prompt names a key's words
      qs[3].choices[(qs[3].answer + 2) % 4] = `"${quoted(model)[0]}" [3]`;                                    // a written answer's line printed as a choice
    }
    return qs.map((q) => ({ ...q, keys: q.model ? quoted(q.model) : [q.choices[q.answer]] }));
  };
  if (crossItemHits([test(false)]).hits.length) bad('checks/cross-item.mjs flagged a test whose items never print each other\'s keys');
  const leak = crossItemHits([test(true)]).hits;
  for (const [how, from, to] of [['keyPhrase', 'q2', 'q6'], ['keyWords', 'q3', 'q7'], ['keyPhrase', 'q9', 'q4']])
    if (!leak.some((h) => h.how === how && h.where === from && h.other === to)) bad(`checks/cross-item.mjs missed ${how}: ${from}'s key in ${to}`);
  if (crossItemHits([test(true).slice(0, 3)]).checked) bad('checks/cross-item.mjs judged a list with fewer than 4 keyed items');

  // no-passage: 10 reading items with Part A / Part B pairs
  const reading = (leaky) => {
    const phrase = maker(), qs = [];
    for (let n = 1; n <= 10; n++) {
      const pairA = n % 3 === 1 && n < 10, pairB = n % 3 === 2;
      const prompt = `${pairA ? 'Part A: ' : pairB ? 'Part B: Which quotation BEST supports the answer to Part A?' : ''}${pairB ? '' : `Question ${n} about ${phrase()}?`}`;
      const choices = [phrase(), phrase(), phrase(), phrase()].map((c) => (pairB ? `"${c}." [${n}]` : c));
      qs.push({ where: `q${n}`, type: 'mc', prompt, choices, answer: n % 4 });
    }
    if (leaky) qs.forEach((q, i) => {
      const key = q.choices[q.answer];
      if (/^Part B/.test(q.prompt)) { const a = qs[i - 1], ak = a.choices[a.answer].split(' '); q.choices[q.answer] = `"${ak[0]} and ${ak[1]} ${ak[2]} again." [${i}]`; }   // Part B's key quote shares Part A's key words
      else if (!/^Part A/.test(q.prompt)) { const later = qs.find((x, j) => j > i && !/^Part B/.test(x.prompt)); if (later) later.prompt += ` (Remember: ${key}.)`; }      // a later prompt names this key
    });
    return qs.map((q) => ({ ...q, opts: q.choices.map(String) }));
  };
  if (judge(readingPicks(reading(false))).fails.length) bad('checks/no-passage.mjs failed a reading test with no cues between items');
  if (!judge(readingPicks(reading(true))).fails.length) bad('checks/no-passage.mjs missed Part B quotes that echo Part A keys and prompts that name earlier keys');
  if (judge(readingPicks(reading(true)).slice(0, 7)).fails.length) bad('checks/no-passage.mjs judged a group of fewer than 8 items');
  const sa = (prompt) => numberOnly([{ where: 's1', type: 'short', prompt }]).length;
  if (!sa('Why did it take so long? Give the reason and the paragraph number that shows it.')) bad('checks/no-passage.mjs missed a short answer whose evidence is only a paragraph number');
  if (sa('Why did it take so long? Quote the words that show it and give the paragraph number.')) bad('checks/no-passage.mjs failed a short answer that asks for the quoted words too');
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
    delete m.files['checks/cross-item.mjs']; writeFileSync(man, JSON.stringify(m));
    syncCheck(proj, { write: true, take: ['checks/cross-item.mjs'] });
    if (!JSON.parse(readFileSync(man, 'utf8')).files['checks/cross-item.mjs'] || !syncCheck(proj).ok) bad('self-test: --take did not add a team file to an existing manifest');
  } finally { rmSync(proj, { recursive: true, force: true }); }
}

/* ---------- the outbox rule: a fresh line passes; a stale, undated, short or future line fails; the template is clean ---------- */
{
  const now = new Date('2026-12-01T12:00:00Z');
  const ok = '# Outbox\n\n## Waiting for the weekly run\n- 2026-11-28 | keys echoed the unit (41.5% against 25%) | whole-test bots\n';
  if (outboxProblems(ok, now).length) bad('checks/outbox.mjs refused a fresh, well-formed line');
  if (outboxEntries(ok).length !== 1 || outboxEntries(ok)[0].catches !== 'whole-test bots') bad('checks/outbox.mjs did not read a line\'s three parts');
  if (!outboxProblems('- 2026-11-01 | a | b\n', now).some((p) => /waited 30 days/.test(p))) bad('checks/outbox.mjs passed a line that waited a month');
  if (outboxProblems('- 2026-11-17 | a | b\n', now).length) bad('checks/outbox.mjs failed a line 14 days old');
  if (!outboxProblems('- a lesson with no date | b | c\n', now).length) bad('checks/outbox.mjs passed a line with no date');
  if (!outboxProblems('- 2026-11-28 | only two parts\n', now).length) bad('checks/outbox.mjs passed a line with two parts');
  if (!outboxProblems('- 2026-12-25 | a | b\n', now).length) bad('checks/outbox.mjs passed a line dated in the future');
  if (!outboxProblems(null, now).length) bad('checks/outbox.mjs passed a missing outbox');
  const tpl = existsSync(join(ROOT, 'templates/OUTBOX.md')) ? readFileSync(join(ROOT, 'templates/OUTBOX.md'), 'utf8') : null;
  if (tpl === null) bad('templates/OUTBOX.md is missing');
  else if (outboxProblems(tpl, now).length || outboxEntries(tpl).length) bad('templates/OUTBOX.md must be an empty outbox (its example line must not start a line with "- ")');
}

/* ---------- the with-and-without comparison (ABTEST.md): the job bank is well formed, and the scorer tells a careless
   quiz from a careful one ---------- */
{
  let bank = null;
  try { bank = JSON.parse(readFileSync(join(ROOT, 'ab/prompts.json'), 'utf8')); } catch (e) { bad(`ab/prompts.json: ${e.message}`); }
  if (bank) {
    if (typeof bank.request !== 'string' || bank.request.length < 100) bad('ab/prompts.json: no "request"');
    const ids = new Set();
    for (const j of bank.jobs || []) {
      for (const k of ['id', 'subject', 'title', 'source']) if (typeof j[k] !== 'string' || !j[k].trim()) bad(`ab/prompts.json: job ${j.id || '?'} has no "${k}"`);
      if (ids.has(j.id)) bad(`ab/prompts.json: job ${j.id} is listed twice`); ids.add(j.id);
      if (!Array.isArray(j.ideas) || j.ideas.length < 5 || j.ideas.length > 10) bad(`ab/prompts.json: job ${j.id} needs 5 to 10 ideas, so 10 questions can cover them`);
      if (new Set((j.ideas || []).map((i) => i.id)).size !== (j.ideas || []).length) bad(`ab/prompts.json: job ${j.id} repeats an idea id`);
    }
    if ((bank.jobs || []).length < 4) bad('ab/prompts.json: fewer than 4 jobs');
    const job = loadJob(bank.jobs[0].id), ideas = job.ideas.map((i) => i.id);
    const W = 'amber birch cobalt dune ember fjord garnet heron indigo juniper kestrel lagoon marble nectar orchid pewter quartz russet sable tundra umber velvet willow yarrow zephyr alder bramble cinder delta egret fennel glacier hazel iris jasper kelpie larch moss nutmeg ochre pine quill reed saffron thistle'.split(' ');
    let k = 0; const w = () => W[k++ % W.length] + (k > W.length ? 'x'.repeat(Math.floor(k / W.length)) : ''); const phrase = () => `${w()} ${w()} ${w()}`;
    const careful = { items: Array.from({ length: 10 }, (_, n) => ({ id: `q${n + 1}`, idea: ideas[n % ideas.length], level: n % 5 < 2 ? 3 : 2, prompt: `What about ${phrase()}?`, choices: [phrase(), phrase(), phrase(), phrase()], answer: n % 4, why: 'Because the source says so.' })) };
    const careless = { items: Array.from({ length: 10 }, (_, n) => ({ id: `q${n + 1}`, idea: ideas[0], level: 1, prompt: `What about ${phrase()}?`, choices: [`${phrase()} and that is why the water keeps moving through the cycle`, w(), w(), w()], answer: 0, why: 'Because the source says so.' })) };
    careless.items[3].choices[2] = careless.items[3].choices[1];
    const a = scoreQuiz(careful, job), b = scoreQuiz(careless, job);
    if (a.structure.length) bad(`scripts/ab-score.mjs found structure problems in a careful quiz: ${a.structure[0]}`);
    if (a.coverage.tested !== ideas.length) bad('scripts/ab-score.mjs did not count every idea as tested in a quiz that tests them all');
    if (!b.structure.some((x) => /two choices the same/.test(x))) bad('scripts/ab-score.mjs missed two choices the same');
    if (b.coverage.tested !== 1 || b.coverage.mostOnOneIdea !== 10) bad('scripts/ab-score.mjs missed a quiz that tests one idea ten times');
    if (b.keys.longestPct !== 100 || b.oneItemBots.longest !== 100) bad('scripts/ab-score.mjs missed keys that are always the longest choice');
    if (!(b.wholeTestBots.echo >= 90)) bad('scripts/ab-score.mjs missed keys that all reuse one phrase (whole-test echo)');
    if (b.keys.letters[0] !== 10 || b.level3Pct !== 0) bad('scripts/ab-score.mjs miscounted key letters or level 3');
    const lifted = { items: careful.items.map((q, n) => ({ ...q, choices: q.choices.map((c, i) => (i === q.answer ? ['an invisible gas called water vapor', 'tiny drops of liquid water', 'rain, snow, sleet and hail', 'soaks into the soil'][n % 4] : c)) })) };
    if (!(scoreQuiz(lifted, job).oneItemBots.inPassage >= 90)) bad('scripts/ab-score.mjs missed keys lifted word for word from the source (inPassage)');
    if (a.oneItemBots.inPassage > 40) bad('scripts/ab-score.mjs flagged inPassage on a quiz that lifts nothing from the source');
    if (!(a.worstOneItem[1] < 60 && a.wholeTestBots.echo < 60)) bad('scripts/ab-score.mjs scored a quiz of unrelated made-up words as guessable');
    if (/answer|why/i.test(studentView(careful, job).split('## Questions')[1].replace(/What about[^\n]*/g, ''))) bad('scripts/ab-score.mjs --view leaks the key or the reasons');
  }
  for (const f of ['ABTEST.md', 'ab/SCOREBOARD.md']) if (!existsSync(join(ROOT, f))) bad(`${f} is missing`);
}

/* ---------- the project list and what a new project copies ---------- */
{
  let list = null;
  try { list = JSON.parse(readFileSync(join(ROOT, 'projects.json'), 'utf8')).projects; } catch (e) { bad(`projects.json: ${e.message}`); }
  if (list) {
    if (!Array.isArray(list) || !list.length) bad('projects.json lists no projects');
    const seen = new Set();
    for (const p of list || []) {
      for (const k of ['name', 'repo', 'check', 'instructions', 'practiceJob', 'joined']) if (typeof p[k] !== 'string' || !p[k].trim()) bad(`projects.json: ${p.name || p.repo || '?'} has no "${k}"`);
      if (!/^[\w.-]+\/[\w.-]+$/.test(p.repo || '')) bad(`projects.json: "${p.repo}" is not owner/name`);
      if (seen.has((p.repo || '').toLowerCase())) bad(`projects.json: ${p.repo} is listed twice`);
      seen.add((p.repo || '').toLowerCase());
    }
  }
  for (const f of ['templates/check-team.mjs', 'templates/ADAPTER.md', 'templates/INSTRUCTIONS.md', 'WEEKLY.md']) if (!existsSync(join(ROOT, f))) bad(`${f} is missing: a new project and the weekly run need it`);
}

if (problems.length) { console.error(problems.map(p => '✗ ' + p).join('\n')); console.error(`\n${problems.length} problem(s).`); process.exit(1); }
console.log(`✓ ${briefs.length} briefs, the lessons log, the shared cues, cross-item, no-passage, the outbox rule, the comparison's scorer and sync-check are in order.`);
