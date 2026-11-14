#!/usr/bin/env node
/* Scores a set of items the same way whoever made it: the with-and-without comparison (ABTEST.md).

     node scripts/ab-score.mjs --job <id> X.json [Y.json Z.json …]     the numbers for each file, side by side
     node scripts/ab-score.mjs --job <id> X.json --view X-view.md      the keyless student copy, for the fresh readers
     node scripts/ab-score.mjs --job <id> X.json Y.json --json out.json
     node scripts/ab-score.mjs --prompt <id>                           the exact words every arm is given

   A file is { "items": [ … ], "sets": [ { "id", "prompt" } ] }. Every item has "id", "idea", "level" (1 to 3), "type",
   "prompt" and "why", and by type:
     mc       "choices": [4 strings], "answer": 0 to 3
     tf       "answer": true or false
     numeric  "answer": a number or a string like "3/4", "accept": [other forms that count]
     fill     "accept": [every word or phrase that counts]
     short    "model": the model answer, "rubric": [ { "points": 1 or 2, "criterion": "…" } ]  (2 to 4 points)
     frq      "model", "rubric" (rows of 1 or 2 points that add to 10), "hint", "mistakes": [2 to 4 strings]
   Optional: "set" (the id of a shared prompt in "sets"), "version" ("A" or "B").
   The job (ab/prompts.json) gives the source, its ideas, the mix of types it asks for, and whether it wants a Part A /
   Part B pair, a set on one prompt, or two versions. Files are named X, Y, Z, never "team" or "plain": the lead keeps
   which is which until the readers are done.

   What it measures (no pass or fail: these sets are small, so they are numbers to compare, and only a gap of 15
   points or more on a bot means much; bots are not judged on fewer than 8 multiple-choice questions):
     structure   the wrong mix of types, a missing field, an answer out of range, two choices the same, an idea not in
                 the job, a rubric that doesn't add up, a set or a pair or a version that isn't as asked
     coverage    how many of the job's ideas are tested; the most items on one idea
     levels      the share of level 3
     keys        how often the key is the longest and the shortest choice; the key's letter counts; true against false
     numbers     a number key that is already printed in its own prompt; a typed answer with no other accepted form
     one-item bots, whole-test bots, a key printed in another question (the team's shared checks)
     versions    A and B: same idea, level and type item for item; no choice text reused; the key under another letter */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STRATS, CUES, pSet } from '../checks/test-wise-cues.mjs';
import { readingPicks } from '../checks/no-passage.mjs';
import { crossItemHits, quoted } from '../checks/cross-item.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ONE_ITEM = [...CUES, 'vote', 'shortest', 'middle', 'notLongest', 'general', 'frameBreak', 'inPassage'].filter((s) => typeof STRATS[s] === 'function');
export const TYPES = ['mc', 'tf', 'numeric', 'fill', 'short', 'frq'];
const MIN_MC = 8;   // fewer multiple-choice questions than this: the bots are shown but marked too few to judge
const pct = (x) => Math.round(1000 * x) / 10;
const str = (v) => typeof v === 'string' && v.trim().length > 0;

export function loadBank() { return JSON.parse(readFileSync(join(ROOT, 'ab/prompts.json'), 'utf8')); }
export function loadJob(id) {
  const bank = loadBank(), job = bank.jobs.find((j) => j.id === id);
  if (!job) throw new Error(`no job "${id}" in ab/prompts.json (${bank.jobs.map((j) => j.id).join(', ')})`);
  return { ...job, request: bank.request };
}
export const hasPassage = (job) => !/^There is no passage/.test(job.source);

export const OUTPUT_FORMAT = `OUTPUT FORMAT
Return one JSON object: { "items": [ … ], "sets": [ … ] } ("sets" only if the ASK wants a set on one shared prompt).
Every item has: "id" ("q1", "q2", …), "idea" (one of the idea ids above), "level" (1, 2 or 3), "type", "prompt", and
"why" (why the answer is right, with the working for a number). Then, by "type":
  "mc"      "choices": four strings, "answer": the index of the right one (0 to 3)
  "tf"      "answer": true or false
  "numeric" "answer": the number (or a string such as "3/4"), "accept": every other form that should count
  "fill"    "accept": every word or phrase that should count for the blank
  "short"   "model": the model answer, "rubric": [ { "points": 1 or 2, "criterion": "…" } ]
  "frq"     "model", "rubric" (rows of 1 or 2 points adding to 10), "hint", "mistakes": [2 to 4 common mistakes]
If the ASK wants a set on one prompt: "sets": [ { "id": "s1", "prompt": "…" } ] and "set": "s1" on its items.
If the ASK wants two versions: "version": "A" or "B" on every item, with the same ids in both.`;

/* the exact words every arm gets */
export function promptText(job) {
  return `${job.request}\n\nGrade: ${job.grade} (${job.subject})\nTitle: ${job.title}\n\nASK\n${job.ask}\n\nSOURCE\n${job.source}\n\nIDEAS (tag each item with one id)\n${job.ideas.map((i) => `${i.id}: ${i.idea}`).join('\n')}\n\n${OUTPUT_FORMAT}\n`;
}

const rubricPoints = (q) => (Array.isArray(q.rubric) ? q.rubric.reduce((a, r) => a + (Number(r?.points) || 0), 0) : 0);
const numbersIn = (s) => (String(s).match(/\d+(?:\.\d+)?(?:\/\d+)?/g) || []);

export function scoreQuiz(quiz, job) {
  const items = Array.isArray(quiz?.items) ? quiz.items : [];
  const sets = Array.isArray(quiz?.sets) ? quiz.sets : [];
  const structure = [];
  const ideaIds = new Set(job.ideas.map((i) => i.id));
  const want = job.mix || { mc: 10 }, total = Object.values(want).reduce((a, b) => a + b, 0);
  if (items.length !== total) structure.push(`${items.length} items, not ${total}`);
  for (const t of TYPES) { const n = items.filter((q) => q?.type === t).length; if (n !== (want[t] || 0)) structure.push(`${n} ${t} item(s), the ask is ${want[t] || 0}`); }
  const good = [];
  items.forEach((q, n) => {
    const where = `${q?.version ? `${q.version} ` : ''}${q?.id || `#${n + 1}`}`;
    if (!q || !str(q.prompt)) { structure.push(`${where}: no prompt`); return; }
    if (!TYPES.includes(q.type)) { structure.push(`${where}: type "${q.type}" is not one of ${TYPES.join(', ')}`); return; }
    if (!ideaIds.has(q.idea)) structure.push(`${where}: idea "${q.idea}" is not one of the job's`);
    if (![1, 2, 3].includes(q.level)) structure.push(`${where}: level must be 1, 2 or 3`);
    if (!str(q.why) || q.why.trim().length < 10) structure.push(`${where}: no "why"`);
    if (q.type === 'mc') {
      if (!Array.isArray(q.choices) || q.choices.length !== 4 || q.choices.some((c) => !str(c))) { structure.push(`${where}: needs 4 choices`); return; }
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) { structure.push(`${where}: answer must be 0 to 3`); return; }
      if (new Set(q.choices.map((c) => c.trim().toLowerCase().replace(/\s+/g, ' '))).size !== 4) structure.push(`${where}: two choices the same`);
    } else if (q.type === 'tf') {
      if (typeof q.answer !== 'boolean') { structure.push(`${where}: answer must be true or false`); return; }
    } else if (q.type === 'numeric') {
      if (!(typeof q.answer === 'number' || str(q.answer))) { structure.push(`${where}: no answer`); return; }
      if (q.accept != null && !Array.isArray(q.accept)) structure.push(`${where}: accept must be a list`);
    } else if (q.type === 'fill') {
      if (!Array.isArray(q.accept) || !q.accept.length || q.accept.some((a) => !str(a))) { structure.push(`${where}: accept must list what counts`); return; }
      if (!/_{2,}/.test(q.prompt)) structure.push(`${where}: the prompt has no blank (____)`);
    } else {   // short, frq
      if (!str(q.model) || q.model.trim().length < (q.type === 'frq' ? 80 : 40)) structure.push(`${where}: the model answer is missing or too short`);
      if (!Array.isArray(q.rubric) || !q.rubric.length) structure.push(`${where}: no rubric`);
      else {
        if (q.rubric.some((r) => ![1, 2].includes(r?.points) || !str(r?.criterion) || r.criterion.trim().length < 15)) structure.push(`${where}: every rubric row needs 1 or 2 points and a criterion`);
        const p = rubricPoints(q);
        if (q.type === 'frq' ? p !== 10 : p < 2 || p > 4) structure.push(`${where}: the rubric adds to ${p}, not ${q.type === 'frq' ? '10' : '2 to 4'}`);
      }
      if (q.type === 'frq') {
        if (!Array.isArray(q.mistakes) || q.mistakes.length < 2 || q.mistakes.length > 4) structure.push(`${where}: needs 2 to 4 common mistakes`);
        if (!str(q.hint)) structure.push(`${where}: no hint`);
        else if (str(q.model) && q.model.toLowerCase().includes(q.hint.trim().toLowerCase().replace(/[.!?]+$/, ''))) structure.push(`${where}: the hint repeats the model answer`);
      }
    }
    good.push({ ...q, where });
  });
  const n = good.length || 1;
  const mc = good.filter((q) => q.type === 'mc'), tf = good.filter((q) => q.type === 'tf'), num = good.filter((q) => q.type === 'numeric');

  // what the job asked for beyond the mix
  if (tf.length >= 2 && (tf.every((q) => q.answer) || tf.every((q) => !q.answer))) structure.push(`all ${tf.length} true-or-false answers are ${tf[0].answer}`);
  if (job.pair) {
    const i = mc.findIndex((q, k) => /^\s*part\s*a\b/i.test(q.prompt) && mc[k + 1] && /^\s*part\s*b\b/i.test(mc[k + 1].prompt));
    if (i < 0) structure.push('no Part A / Part B pair, one right after the other');
  }
  if (job.set) {
    const ids = [...new Set(good.map((q) => q.set).filter(Boolean))];
    if (ids.length !== 1) structure.push(`${ids.length} sets on a shared prompt, the ask is 1`);
    for (const id of ids) {
      const members = good.filter((q) => q.set === id);
      if (members.length !== job.set) structure.push(`set ${id} has ${members.length} items, not ${job.set}`);
      if (!sets.some((s) => s?.id === id && str(s.prompt))) structure.push(`set ${id} has no shared prompt in "sets"`);
    }
  }
  const versions = { pairs: 0, mismatched: [], reusedChoices: [], sameLetter: [] };
  if (job.versions) {
    const [A, B] = job.versions.map((v) => good.filter((q) => q.version === v));
    if (A.length !== B.length || A.length + B.length !== good.length) structure.push(`versions: ${A.length} in ${job.versions[0]}, ${B.length} in ${job.versions[1]}, ${good.length - A.length - B.length} with neither`);
    for (const a of A) {
      const b = B.find((q) => q.id === a.id);
      if (!b) { structure.push(`${a.where} has no twin in version ${job.versions[1]}`); continue; }
      versions.pairs++;
      if (a.idea !== b.idea || a.level !== b.level || a.type !== b.type) versions.mismatched.push(a.id);
      if (a.type === 'mc' && b.type === 'mc') {
        const an = new Set(a.choices.map((c) => c.trim().toLowerCase()));
        if (b.choices.some((c) => an.has(c.trim().toLowerCase()))) versions.reusedChoices.push(a.id);
        if (a.answer === b.answer) versions.sameLetter.push(a.id);
      }
    }
  }

  const perIdea = {};
  for (const q of good) if (ideaIds.has(q.idea)) perIdea[q.idea] = (perIdea[q.idea] || 0) + 1;
  const len = (q) => q.choices.map((c) => c.length), m = mc.length || 1;
  const longest = mc.filter((q) => { const l = len(q); return l[q.answer] === Math.max(...l) && l.filter((x) => x === l[q.answer]).length === 1; }).length;
  const shortest = mc.filter((q) => { const l = len(q); return l[q.answer] === Math.min(...l) && l.filter((x) => x === l[q.answer]).length === 1; }).length;
  const passage = hasPassage(job) ? job.source : '';
  const bots = {};
  for (const s of ONE_ITEM) bots[s] = pct(mc.reduce((a, q) => a + pSet(STRATS[s](q.choices, q.prompt, q.where, passage), q.answer), 0) / m);
  // one list for each version: what one student holds
  const groups = job.versions ? job.versions.map((v) => good.filter((q) => q.version === v)) : [good];
  const whole = { echo: 0, quoteEcho: 0, crossVote: 0 }; let played = 0; const cross = [];
  for (const g of groups) {
    const list = g.map((q) => (q.type === 'mc'
      ? { where: q.where, prompt: q.prompt, choices: q.choices, opts: q.choices, answer: q.answer, keys: [q.choices[q.answer]] }
      : { where: q.where, prompt: q.prompt, choices: [], keys: q.type === 'short' || q.type === 'frq' ? quoted(q.model) : [] }));
    for (const x of readingPicks(list.map((y) => ({ ...y })))) { played++; whole.echo += x.p.echo; whole.quoteEcho += x.p.quoteEcho; whole.crossVote += x.p.readingVote; }
    cross.push(...crossItemHits([list]).hits.map((h) => `${h.where} → ${h.other} (${h.how} ${h.what})`));
  }
  for (const k of Object.keys(whole)) whole[k] = pct(whole[k] / (played || 1));
  const worst = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0] || ['none', 0];
  return {
    items: items.length, structure,
    coverage: { tested: Object.keys(perIdea).length, of: job.ideas.length, mostOnOneIdea: Math.max(0, ...Object.values(perIdea)), untested: job.ideas.filter((i) => !perIdea[i.id]).map((i) => i.id) },
    level3Pct: pct(good.filter((q) => q.level === 3).length / n),
    mc: { count: mc.length, judged: mc.length >= MIN_MC, longestPct: pct(longest / m), shortestPct: pct(shortest / m), letters: [0, 1, 2, 3].map((i) => mc.filter((q) => q.answer === i).length) },
    tf: { true: tf.filter((q) => q.answer).length, false: tf.filter((q) => !q.answer).length },
    numbers: { count: num.length, keyPrintedInPrompt: num.filter((q) => numbersIn(q.prompt).includes(String(q.answer).trim())).map((q) => q.where), oneFormOnly: num.filter((q) => !(Array.isArray(q.accept) && q.accept.length)).map((q) => q.where) },
    chance: 25, oneItemBots: bots, worstOneItem: worst(bots), wholeTestBots: whole, worstWholeTest: worst(whole), crossItem: cross, versions
  };
}

export function studentView(quiz, job) {
  const out = [`# ${job.title} (grade ${job.grade} ${job.subject}): student copy, no key`, ''];
  if (hasPassage(job)) out.push('## Source', '', job.source, '');
  const sets = Object.fromEntries((quiz.sets || []).map((s) => [s.id, s.prompt]));
  let lastSet = null, lastVersion = null;
  (quiz.items || []).forEach((q, n) => {
    if (q.version && q.version !== lastVersion) { out.push(`## Version ${q.version}`, ''); lastVersion = q.version; }
    if (q.set && q.set !== lastSet) out.push(`**The next questions share this information.** ${sets[q.set] || '(the shared prompt is missing)'}`, '');
    lastSet = q.set || null;
    out.push(`### ${n + 1}. [${q.version ? `${q.version} ` : ''}${q.id || `#${n + 1}`}] (level ${q.level}, ${q.type})`, '', q.prompt, '');
    if (q.type === 'mc') out.push(...(q.choices || []).map((c, i) => `${'ABCD'[i]}. ${c}`), '');
    else if (q.type === 'tf') out.push('True or false?', '');
    else if (q.type === 'numeric') out.push('Type a number.', '');
    else if (q.type === 'fill') out.push('Fill in the blank.', '');
    else out.push(`Write your answer. (${rubricPoints(q)} points)`, '');
  });
  return out.join('\n');
}

/* the teacher's side of the written items (model answers, rubrics, hints, accepted forms): judged by a reader after
   the blind solve, never shown with the student copy */
export function teacherNotes(quiz, job) {
  const out = [`# ${job.title}: what counts (for the rubric judge; keys to choice questions are not here)`, ''];
  for (const q of quiz.items || []) {
    const where = `${q.version ? `${q.version} ` : ''}${q.id}`;
    if (q.type === 'numeric' || q.type === 'fill') out.push(`### ${where} (${q.type})`, q.prompt, '', `Counts as right: ${[q.answer, ...(q.accept || [])].filter((x) => x != null).join(' | ')}`, '');
    if (q.type === 'short' || q.type === 'frq') out.push(`### ${where} (${q.type})`, q.prompt, '', `Model answer: ${q.model}`, '', 'Rubric:', ...(q.rubric || []).map((r) => `- (${r.points}) ${r.criterion}`), ...(q.hint ? ['', `Hint: ${q.hint}`] : []), ...(q.mistakes ? ['', 'Common mistakes:', ...q.mistakes.map((x) => `- ${x}`)] : []), '');
  }
  return out.join('\n');
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : null; };
  if (opt('prompt')) { process.stdout.write(promptText(loadJob(opt('prompt')))); process.exit(0); }
  const files = a.filter((x, i) => !x.startsWith('--') && !['--job', '--view', '--json', '--notes'].includes(a[i - 1]));
  if (!opt('job') || !files.length) { console.error('usage: node scripts/ab-score.mjs --job <id> X.json [Y.json …] [--view out.md] [--notes out.md] [--json out.json]   |   --prompt <id>'); process.exit(2); }
  const job = loadJob(opt('job'));
  const read = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return { items: [], parseError: e.message }; } };
  if (opt('view') || opt('notes')) {
    if (opt('view')) { writeFileSync(opt('view'), studentView(read(files[0]), job)); console.log(`wrote ${opt('view')}`); }
    if (opt('notes')) { writeFileSync(opt('notes'), teacherNotes(read(files[0]), job)); console.log(`wrote ${opt('notes')}`); }
    process.exit(0);
  }
  const res = files.map((f) => ({ file: f.split('/').pop().replace(/\.json$/, ''), ...scoreQuiz(read(f), job) }));
  const row = (label, f) => `| ${label} | ${res.map(f).join(' | ')} |`;
  const few = (r) => (r.mc.judged ? '' : ` (only ${r.mc.count} multiple choice: too few to judge)`);
  console.log(`Job ${job.id}: ${job.title} (${job.kind}). Chance on multiple choice is 25%.\n`);
  console.log(`| | ${res.map((r) => r.file).join(' | ')} |\n|---|${res.map(() => '---').join('|')}|`);
  console.log(row('Structure problems', (r) => (r.structure.length ? `${r.structure.length}: ${r.structure.slice(0, 3).join('; ')}` : 'none')));
  console.log(row('Ideas tested', (r) => `${r.coverage.tested} of ${r.coverage.of}${r.coverage.untested.length ? ` (missing ${r.coverage.untested.join(', ')})` : ''}`));
  console.log(row('Most items on one idea', (r) => r.coverage.mostOnOneIdea));
  console.log(row('Level 3 share', (r) => `${r.level3Pct}%`));
  if (res.some((r) => r.mc.count)) {
    console.log(row('Key is the longest choice', (r) => `${r.mc.longestPct}%`));
    console.log(row('Key is the shortest choice', (r) => `${r.mc.shortestPct}%`));
    console.log(row('Key letters A B C D', (r) => r.mc.letters.join(' ')));
    console.log(row('Worst one-question bot', (r) => `${r.worstOneItem[0]} ${r.worstOneItem[1]}%${few(r)}`));
    console.log(row('Worst whole-test bot', (r) => `${r.worstWholeTest[0]} ${r.worstWholeTest[1]}%${few(r)}`));
    console.log(row('A key printed in another question', (r) => (r.crossItem.length ? `${r.crossItem.length}: ${r.crossItem.slice(0, 2).join('; ')}` : 'none')));
  }
  if (res.some((r) => r.tf.true + r.tf.false)) console.log(row('True / false', (r) => `${r.tf.true} / ${r.tf.false}`));
  if (res.some((r) => r.numbers.count)) {
    console.log(row('Number key already printed in its prompt', (r) => (r.numbers.keyPrintedInPrompt.length ? r.numbers.keyPrintedInPrompt.join(', ') : 'none')));
    console.log(row('Typed answers with only one accepted form', (r) => (r.numbers.oneFormOnly.length ? r.numbers.oneFormOnly.join(', ') : 'none')));
  }
  if (job.versions) {
    console.log(row('A and B: twins that differ in idea, level or type', (r) => (r.versions.mismatched.length ? r.versions.mismatched.join(', ') : 'none')));
    console.log(row('A and B: a choice text reused', (r) => (r.versions.reusedChoices.length ? r.versions.reusedChoices.join(', ') : 'none')));
    console.log(row('A and B: the key under the same letter', (r) => (r.versions.sameLetter.length ? r.versions.sameLetter.join(', ') : 'none')));
  }
  if (opt('json')) writeFileSync(opt('json'), JSON.stringify(res, null, 1));
}
