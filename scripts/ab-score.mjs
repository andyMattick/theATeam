#!/usr/bin/env node
/* Scores a quiz the same way whoever made it: the with-and-without comparison (ABTEST.md).

     node scripts/ab-score.mjs --job <id> X.json [Y.json …]            the numbers for each file, side by side
     node scripts/ab-score.mjs --job <id> X.json --view X-view.md      the keyless student copy, for the fresh readers
     node scripts/ab-score.mjs --job <id> X.json Y.json --json out.json

   A quiz file is { "items": [ { "id", "idea", "level", "prompt", "choices": [4 strings], "answer": 0-3, "why" } ] }.
   The job (ab/prompts.json) gives the source and its list of ideas. Files are named X and Y, not "team" and "plain":
   the lead keeps which is which until the readers are done.

   What it measures (no pass or fail: a 10-question quiz is small, so these are numbers to compare, and only a gap of
   15 points or more on a bot means much):
     structure   wrong count, a missing field, an answer out of range, two choices the same, an idea not in the job
     coverage    how many of the job's ideas are tested; the most questions on one idea
     levels      the share of level 3
     keys        how often the key is the longest and the shortest choice; the key's letter counts
     one-item bots   each of the team's cues on each question, against chance
     whole-test bots echo, quoteEcho and their vote on the whole quiz
     across items    a key printed in another question (cross-item) */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STRATS, CUES, pSet } from '../checks/test-wise-cues.mjs';
import { readingPicks } from '../checks/no-passage.mjs';
import { crossItemHits } from '../checks/cross-item.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ONE_ITEM = [...CUES, 'vote', 'shortest', 'middle', 'notLongest', 'general', 'frameBreak'].filter((s) => typeof STRATS[s] === 'function');
const pct = (x) => Math.round(1000 * x) / 10;

export function loadJob(id) {
  const bank = JSON.parse(readFileSync(join(ROOT, 'ab/prompts.json'), 'utf8'));
  const job = bank.jobs.find((j) => j.id === id);
  if (!job) throw new Error(`no job "${id}" in ab/prompts.json (${bank.jobs.map((j) => j.id).join(', ')})`);
  return { ...job, request: bank.request };
}

export function scoreQuiz(quiz, job) {
  const items = Array.isArray(quiz?.items) ? quiz.items : [];
  const structure = [];
  if (items.length !== 10) structure.push(`${items.length} questions, not 10`);
  const ideaIds = new Set(job.ideas.map((i) => i.id));
  const good = [];
  items.forEach((q, n) => {
    const where = q?.id || `#${n + 1}`;
    if (!q || typeof q.prompt !== 'string' || !q.prompt.trim()) { structure.push(`${where}: no prompt`); return; }
    if (!Array.isArray(q.choices) || q.choices.length !== 4 || q.choices.some((c) => typeof c !== 'string' || !c.trim())) { structure.push(`${where}: needs 4 choices`); return; }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) { structure.push(`${where}: answer must be 0 to 3`); return; }
    const norm = q.choices.map((c) => c.trim().toLowerCase().replace(/\s+/g, ' '));
    if (new Set(norm).size !== 4) structure.push(`${where}: two choices the same`);
    if (!ideaIds.has(q.idea)) structure.push(`${where}: idea "${q.idea}" is not one of the job's`);
    if (![1, 2, 3].includes(q.level)) structure.push(`${where}: level must be 1, 2 or 3`);
    if (typeof q.why !== 'string' || q.why.trim().length < 10) structure.push(`${where}: no "why"`);
    good.push({ ...q, where });
  });
  const n = good.length || 1;
  const perIdea = {};
  for (const q of good) if (ideaIds.has(q.idea)) perIdea[q.idea] = (perIdea[q.idea] || 0) + 1;
  const len = (q) => q.choices.map((c) => c.length);
  const longest = good.filter((q) => { const l = len(q); return l[q.answer] === Math.max(...l) && l.filter((x) => x === l[q.answer]).length === 1; }).length;
  const shortest = good.filter((q) => { const l = len(q); return l[q.answer] === Math.min(...l) && l.filter((x) => x === l[q.answer]).length === 1; }).length;
  const passage = job.subject === 'reading' ? job.source : '';
  const bots = {};
  for (const s of ONE_ITEM) bots[s] = pct(good.reduce((a, q) => a + pSet(STRATS[s](q.choices, q.prompt, q.where, passage), q.answer), 0) / n);
  const list = good.map((q) => ({ where: q.where, prompt: q.prompt, choices: q.choices, opts: q.choices, answer: q.answer, keys: [q.choices[q.answer]] }));
  const played = readingPicks(list.map((x) => ({ ...x })));
  const whole = {};
  for (const [name, key] of [['echo', 'echo'], ['quoteEcho', 'quoteEcho'], ['crossVote', 'readingVote']]) whole[name] = pct(played.reduce((a, x) => a + x.p[key], 0) / (played.length || 1));
  const cross = crossItemHits([list]).hits;
  const worst = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0] || ['none', 0];
  return {
    questions: items.length, structure,
    coverage: { tested: Object.keys(perIdea).length, of: job.ideas.length, mostOnOneIdea: Math.max(0, ...Object.values(perIdea)), untested: job.ideas.filter((i) => !perIdea[i.id]).map((i) => i.id) },
    level3Pct: pct(good.filter((q) => q.level === 3).length / n),
    keys: { longestPct: pct(longest / n), shortestPct: pct(shortest / n), letters: [0, 1, 2, 3].map((i) => good.filter((q) => q.answer === i).length) },
    chance: 25, oneItemBots: bots, worstOneItem: worst(bots), wholeTestBots: whole, worstWholeTest: worst(whole),
    crossItem: cross.map((h) => `${h.where} → ${h.other} (${h.how} ${h.what})`)
  };
}

export function studentView(quiz, job) {
  const out = [`# ${job.title} (grade ${job.grade} ${job.subject}): student copy, no key`, ''];
  if (!/^There is no passage/.test(job.source)) out.push('## Source', '', job.source, '');
  out.push('## Questions', '');
  (quiz.items || []).forEach((q, n) => { out.push(`### ${n + 1}. [${q.id || `#${n + 1}`}] (level ${q.level})`, '', q.prompt, '', ...(q.choices || []).map((c, i) => `${'ABCD'[i]}. ${c}`), ''); });
  return out.join('\n');
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : null; };
  const files = a.filter((x, i) => !x.startsWith('--') && !['--job', '--view', '--json'].includes(a[i - 1]));
  if (!opt('job') || !files.length) { console.error('usage: node scripts/ab-score.mjs --job <id> X.json [Y.json …] [--view out.md] [--json out.json]'); process.exit(2); }
  const job = loadJob(opt('job'));
  const read = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return { items: [], parseError: e.message }; } };
  if (opt('view')) { writeFileSync(opt('view'), studentView(read(files[0]), job)); console.log(`wrote ${opt('view')}`); process.exit(0); }
  const res = files.map((f) => ({ file: f.split('/').pop().replace(/\.json$/, ''), ...scoreQuiz(read(f), job) }));
  const row = (label, f) => `| ${label} | ${res.map(f).join(' | ')} |`;
  console.log(`Job ${job.id}: ${job.title}. Chance is 25%.\n`);
  console.log(`| | ${res.map((r) => r.file).join(' | ')} |\n|---|${res.map(() => '---').join('|')}|`);
  console.log(row('Structure problems', (r) => (r.structure.length ? `${r.structure.length}: ${r.structure.slice(0, 3).join('; ')}` : 'none')));
  console.log(row('Ideas tested', (r) => `${r.coverage.tested} of ${r.coverage.of}${r.coverage.untested.length ? ` (missing ${r.coverage.untested.join(', ')})` : ''}`));
  console.log(row('Most questions on one idea', (r) => r.coverage.mostOnOneIdea));
  console.log(row('Level 3 share', (r) => `${r.level3Pct}%`));
  console.log(row('Key is the longest choice', (r) => `${r.keys.longestPct}%`));
  console.log(row('Key is the shortest choice', (r) => `${r.keys.shortestPct}%`));
  console.log(row('Key letters A B C D', (r) => r.keys.letters.join(' ')));
  console.log(row('Worst one-question bot', (r) => `${r.worstOneItem[0]} ${r.worstOneItem[1]}%`));
  console.log(row('Worst whole-test bot', (r) => `${r.worstWholeTest[0]} ${r.worstWholeTest[1]}%`));
  console.log(row('A key printed in another question', (r) => (r.crossItem.length ? `${r.crossItem.length}: ${r.crossItem.slice(0, 2).join('; ')}` : 'none')));
  if (opt('json')) writeFileSync(opt('json'), JSON.stringify(res, null, 1));
}
