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

let D = null;

async function getJSON(path) {
  const r = await fetch(path, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

export async function loadData() {
  if (D) return D;
  const [obs, faq, rules, bd] = await Promise.all([
    getJSON('data/observed.json'), getJSON('data/faq.json'), getJSON('data/rules.json'), getJSON('data/breakdowns.json')
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

  D = { issues, faq, rules, breakdowns: bd.breakdowns, policy, categories, faqSections, compiled: rules.compiled || '2026-10-12' };
  return D;
}

export function data() { return D; }
export function issueById(id) { return D?.issues.find(i => i.id === id) || null; }
export function policyById(id) { return D?.policy.get(id) || null; }

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
      id: `f:${f.id}:${i}`, kind: 'bank figure', q: `${f.question}\n(${hint})`, a: fig, note: `${f.section} · confirm in-system`,
      extra: /undated/i.test(f.dateTag || '') ? '' : f.dateTag
    });
  }));
  return deck;
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
