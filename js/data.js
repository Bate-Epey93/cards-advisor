// Loads the corpus and joins it into the shapes the views use.
// Three layers stay distinct in the data files (observed demand, official answers,
// rules) so provenance is never lost; this module only indexes them.

export const PARTS = [
  ['surfaceRequest', 'What they say', 'In their own words'],
  ['underlyingJob', 'What they need', 'What they are trying to get back to'],
  ['emotionalRead', 'How they feel', 'The main feeling, and how it sounds on the phone'],
  ['psychologicalNeeds', 'What they fear losing', 'Control, fairness, dignity, safety or being believed'],
  ['riskFlags', 'Risk checks', 'Check these before you act'],
  ['engage', 'First 15 seconds', 'Show you heard the exact problem, then say what happens next'],
  ['diagnose', 'Questions to ask', 'Ask these in order'],
  ['resolve', 'Options', 'Realistic outcomes, including no'],
  ['sayThisNotThis', 'Say this, not this', 'Lines to use and avoid, and why'],
  ['afterCall', 'After the call', 'What you note, what the client gets, what you own'],
  ['preventAndFeedBack', 'Flag the cause', 'Tell your lead what caused it']
];

export const DEPTHS = [
  ['agent', 'New advisor', 'Handle it'],
  ['specialist', 'Specialist', 'Own the edge cases'],
  ['lead', 'Team lead', 'Fix what causes it']
];

export const STALE_DAYS = 90;

// The six call steps and the three values, in the shape practice, the debrief and the
// flashcards need. data/callflow.json carries the full study notes; this short list is
// the fallback when that file is missing, so nothing here depends on load order.
export const SIX_STEPS = [
  { n: 1, name: 'Be Ready', short: 'In Ready on time, tools open, last call closed.' },
  { n: 2, name: 'Welcome and Listen', short: 'Greet, verify, then let them finish.' },
  { n: 3, name: 'Solve Immediate Need', short: 'Fix what they called about first, and say what you are doing.' },
  { n: 4, name: 'Checkpoint', short: 'Confirm it worked and that they agree.' },
  { n: 5, name: 'Deeper Discovery and Additional Advice', short: 'Ask why it happened, offer options that fit.' },
  { n: 6, name: 'Making Their Day', short: 'Recap, dates, one real personal touch.' }
];
export const VALUES = [
  { id: 'care', name: 'Care', short: 'Full attention. Their interest first.' },
  { id: 'connect', name: 'Connect', short: 'Adapt to them. Make it human.' },
  { id: 'expertise', name: 'Expertise', short: 'Guide them. Explain it clearly.' }
];

// Built-in flashcard source, used only when data/callflow.json is not loaded.
const STEP_CARDS = [
  { n: 1, you: 'Be in Ready at my scheduled start, with my usual pages open and the last call fully closed.', client: 'The call is answered quickly by someone who is present from the first word.',
    say: ['Is the last file closed?', 'Are my usual pages open?', 'Am I settled enough to listen?'], sayQuoted: false },
  { n: 2, you: 'Greet by name, frame verification as protection, let them finish, then say back what I heard in their words.', client: 'They get to tell it once, and they hear proof that it landed.',
    say: ['Thanks for calling, you are speaking with Sam. I will verify you first so your card stays protected.', 'Declined at the pharmacy, with people waiting. That is stressful, and I am glad you called.'], sayQuoted: true },
  { n: 3, you: 'Ask only the questions that pick the fix, narrate what I am doing, and ask before any hold.', client: 'The thing they called about gets fixed, and they always know what is happening.',
    say: ['I am opening the alert now, so you may hear me typing.', 'May I place you on a short hold while I confirm that? It should take about a minute.'], sayQuoted: true },
  { n: 4, you: 'Say what is now done in one sentence and ask if that sorts out what they called about. Then wait for the answer.', client: 'They get to say yes, or to say what is still open, before anything else is raised.',
    say: ['So the block is off and the card is working. Does that sort out what you called about?'], sayQuoted: true },
  { n: 5, you: 'Ask one question about the cause, then give options with their trade-offs and let them choose. No product offer to a client in distress or in a fraud claim.', client: 'They get advice that starts from their need, and the decision stays theirs.',
    say: ['Before you go, can I ask one thing?', 'Two options. I can update it now, or we leave it as it is. Which do you prefer?'], sayQuoted: true },
  { n: 6, you: 'Recap what was done, say what happens next and when, add one personal touch, and ask if there is anything else.', client: 'They leave knowing it is handled, and feeling a person took care of it.',
    say: ['To recap: the card works, and you will get a message today confirming it. Is there anything else I can help with?'], sayQuoted: true }
];
const NUMBER_CARDS = [
  ['aht', 'What does AHT stand for, and what are its three parts?', 'Average handle time = engage + hold + wrap', 'The full time one call costs, from hello to the end of my notes.'],
  ['engage', 'What is average engage time?', 'Live talk time with the client.', 'Honest lever: listen fully the first time and ask my questions in order.'],
  ['hold', 'What is average hold time?', 'How long the client waits after I press Hold.', 'Honest lever: open my usual pages before the call, and narrate short lookups.'],
  ['wrap', 'What is wrap time, also called after-call work?', 'Notes and follow-up once the client has gone.', 'Honest lever: note as I go and use the same note structure every time.'],
  ['onr', 'What is Other Not Ready?', 'Time I take away from my schedule, either doing after-call work outside wrap or leaving my station at my own discretion.', 'Honest lever: finish my notes inside wrap and use the true reason code every time.'],
  ['94', 'What is compliance, and what is the target?', '94 percent. The share of my scheduled day I am available, measured against the schedule minus breaks and lunch.', 'Confirm the target and how it is counted in your systems.'],
  ['slack', 'A 7.5 hour day with 60 minutes of breaks and lunch. How many minutes of slack does 94 percent leave?', '23.4 minutes. 390 productive minutes x 6 percent.', 'Example only. Confirm in your systems.'],
  ['ucc', 'What is UCC?', 'Universal call centre: the phone software you take calls on.', 'Ready, Not Ready, ringing, talking, hold and wrap-up. Button names vary from one setup to the next.']
];

let D = null;

async function getJSON(path) {
  const r = await fetch(path, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

export async function loadData() {
  if (D) return D;
  const [obs, faq, rules, bd, callflow] = await Promise.all([
    getJSON('data/observed.json'), getJSON('data/faq.json'), getJSON('data/rules.json'), getJSON('data/breakdowns.json'),
    // optional: a missing or broken file only means the built-in step and number cards are used
    getJSON('data/callflow.json').then(j => (j && typeof j === 'object' && !Array.isArray(j) ? j : null)).catch(() => null)
  ]);

  const breakdownByObs = new Map(bd.breakdowns.map(b => [b.observed, b]));
  // strip research-file '---' separators left at the end of observed fields
  const clean = v => typeof v === 'string' ? v.replace(/\s*\n+\s*-{3,}\s*$/, '').trim() : v;
  const issues = obs.issues.map(o => ({ ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clean(v)])), breakdown: breakdownByObs.get(o.id) || null }));

  const policy = new Map();
  faq.items.forEach(f => policy.set(f.id, { kind: 'faq', ...f }));
  rules.mustKnow.forEach(r => policy.set(r.id, { kind: 'rule', ...r }));
  rules.sections.forEach(s => policy.set(s.id, { kind: 'section', ...s }));

  const categories = [...new Set(issues.map(i => i.category))].sort();
  const faqSections = [...new Set(faq.items.map(f => f.section))];

  D = { issues, faq, rules, breakdowns: bd.breakdowns, policy, categories, faqSections, callflow, compiled: rules.compiled || '2026-10-12' };
  return D;
}

export function data() { return D; }
export function issueById(id) { return D?.issues.find(i => i.id === id) || null; }
export function policyById(id) { return D?.policy.get(id) || null; }

/* ── the six call steps ── */
// Names and one-liners for steps 1 to 6, from callflow.json when it has all six.
export function callSteps() {
  const src = D?.callflow?.steps;
  if (!Array.isArray(src)) return SIX_STEPS;
  const out = SIX_STEPS.map(f => {
    const s = src.find(x => x && +x.n === f.n);
    return s && typeof s.name === 'string' && s.name.trim() ? { n: f.n, name: s.name.trim(), short: typeof s.short === 'string' && s.short ? s.short : f.short } : f;
  });
  return out;
}
export function callStep(n) { return callSteps().find(s => s.n === +n) || null; }

/* ── staleness ── */
export function ageDays(dateStr) {
  if (!dateStr) return null;
  const m = String(dateStr).match(/\d{4}-\d{2}(-\d{2})?/);
  if (!m) return null;
  const d = new Date(m[0].length === 7 ? m[0] + '-01' : m[0]);
  return Math.floor((Date.now() - d.getTime()) / 864e5);
}
export function isStale(dateStr) { const a = ageDays(dateStr); return a !== null && a > STALE_DAYS; }

/* ── flashcard deck, derived from the corpus ── */
export function buildDeck() {
  const deck = [];
  D.rules.mustKnow.forEach(r => deck.push({
    id: 'r:' + r.id, kind: 'figure', q: r.rule, a: r.figure, note: r.source, extra: r.clientLine
  }));
  D.breakdowns.forEach(b => (b.sayThisNotThis || []).forEach((s, i) => deck.push({
    id: `s:${b.id}:${i}`, kind: 'say this', q: `Instead of: ${s.not}`, a: s.say, note: s.why, extra: b.title
  })));
  D.faq.items.forEach(f => (f.figures || []).slice(0, 2).forEach((fig, i) => {
    // the hint names the kind of value, never the value itself
    const hint = /^\+?\d[\d-]{6,}$/.test(fig) ? 'which number?' : /\$/.test(fig) ? 'how much?' : /day|hour|week|month|year/i.test(fig) ? 'how long?' : 'which figure?';
    deck.push({
      id: `f:${f.id}:${i}`, kind: 'bank figure', q: `${f.question}\n(${hint})`, a: fig, note: `${f.section} · confirm in your systems`,
      extra: /undated/i.test(f.dateTag || '') ? '' : f.dateTag
    });
  }));
  callDeck().forEach(c => deck.push(c));
  return deck;
}

// Two extra kinds: 'call step' (both sides of each step, and lines to say) and
// 'my numbers' (the parts of handle time, Other Not Ready, the 94 percent).
const strs = v => (Array.isArray(v) ? v : typeof v === 'string' ? [v] : []).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim());
const bullets = list => list.length > 1 ? list.map(x => `\u2022 ${x}`).join('\n') : (list[0] || '');
const quoted = (x, on) => (on && !/^["\u201c]/.test(x) ? `"${x}"` : x);
function callDeck() {
  const out = [];
  const cf = D?.callflow;
  const names = callSteps();
  const fromFile = Array.isArray(cf?.steps) ? cf.steps.filter(s => s && +s.n >= 1 && +s.n <= 6) : [];
  const steps = fromFile.length ? fromFile : STEP_CARDS;
  steps.forEach(s => {
    const n = +s.n;
    const name = names.find(x => x.n === n)?.name || s.name || `Step ${n}`;
    const you = strs(s.you), client = strs(s.client), say = strs(s.say);
    const watch = typeof s.watch === 'string' ? s.watch : '';
    if (you.length) out.push({ id: `cs:${n}:you`, kind: 'call step', q: `Step ${n}, ${name}.\nWhat does it mean for you?`, a: bullets(you), note: watch ? `Watch out for: ${watch}` : '', extra: '' });
    if (client.length) out.push({ id: `cs:${n}:client`, kind: 'call step', q: `Step ${n}, ${name}.\nWhat does the client experience?`, a: bullets(client), note: '', extra: '' });
    if (say.length) {
      const isLine = s.sayQuoted !== false;
      out.push({
        id: `cs:${n}:say`, kind: 'call step',
        q: `Step ${n}, ${name}.\n${isLine ? 'What could you say?' : 'What do you check first?'}`,
        a: bullets(say.map(x => quoted(x, isLine))),
        note: isLine ? 'Sample lines. Say them your own way.' : '', extra: ''
      });
    }
  });

  const nums = cf?.numbers;
  const fileNums = [];
  if (nums && typeof nums === 'object') {
    const lever = l => (typeof l === 'string' && l ? `Honest lever: ${l}` : '');
    if (nums.ahtFormula) fileNums.push(['aht', 'What does AHT stand for, and what are its three parts?', String(nums.ahtFormula), typeof nums.ahtGloss === 'string' ? nums.ahtGloss : '']);
    (Array.isArray(nums.parts) ? nums.parts : []).forEach(p => {
      if (p && p.key && p.name && p.what) fileNums.push([String(p.key), `What is ${String(p.name).replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase())}?`, String(p.what), lever(p.lever)]);
    });
    if (nums.onr) fileNums.push(['onr', 'What is Other Not Ready?', String(nums.onr), lever(nums.onrLever)]);
    if (nums.avail) fileNums.push(['94', 'What is compliance, and what is the target?', String(nums.avail), typeof nums.availNote === 'string' ? nums.availNote : 'Confirm the target and how it is counted in your systems.']);
  }
  // a file with fewer than the AHT parts plus the two definitions is treated as incomplete
  const rows = fileNums.length >= 5 ? fileNums.concat(NUMBER_CARDS.filter(([k]) => (k === 'slack' || k === 'ucc') && !fileNums.some(f => f[0] === k))) : NUMBER_CARDS;
  rows.forEach(([k, q, a, note]) => out.push({ id: `mn:${k}`, kind: 'my numbers', q, a, note: note || '', extra: '' }));
  return out;
}

/* ── full-text index for the palette ── */
export function searchIndex() {
  const idx = [];
  D.issues.forEach(i => idx.push({
    kind: 'Issue', title: i.title, sub: `${i.category} · ${i.frequency}`, href: `#/issue/${i.id}`,
    text: [i.title, i.category, i.emotion, i.underlyingJob, i.trainingPoint, ...(i.quotes || []).map(q => q.text),
      ...(i.breakdown ? Object.values(i.breakdown).flat().map(v => typeof v === 'string' ? v : JSON.stringify(v)) : [])].join(' ').toLowerCase()
  }));
  D.faq.items.forEach(f => idx.push({
    kind: 'Bank page', title: f.question, sub: f.section, href: `#/policy/${f.id}`,
    text: [f.question, f.section, ...(f.answer || []), ...(f.figures || []), ...(f.situations || [])].join(' ').toLowerCase()
  }));
  D.rules.mustKnow.forEach(r => idx.push({ kind: 'Key figure', title: `${r.figure}: ${r.rule}`, sub: r.source, href: `#/policy/${r.id}`, text: (r.figure + ' ' + r.rule + ' ' + r.source + ' ' + (r.clientLine || '')).toLowerCase() }));
  D.rules.sections.forEach(s => idx.push({ kind: 'Rules by topic', title: s.title, sub: 'Rules by topic', href: `#/policy/${s.id}`, text: (s.title + ' ' + s.summary).toLowerCase() }));
  return idx;
}
