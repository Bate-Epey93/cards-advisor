// Persistence layer. Everything lives in localStorage and nothing leaves the device.
// There is deliberately no field anywhere in this app for a client's name, card or
// account number; the debrief guard in js/debrief.js refuses them.
const KEY = 'cards-advisor:v1';
const DEFAULTS = {
  notes: {},      // issueId -> working notes
  hl: {},         // sectionId -> highlighter clippings
  seen: {},       // issueId -> last opened timestamp
  progress: {},   // issueId -> { pos: 0, read: [0,1,...], sketch: '', checks: {}, completedAt: 0 }
  cards: {},      // flashcard id -> {box:1..5, seen, due}
  drills: {},     // issueId -> {runs:[{at, secs, text, scores, score, max, values}], best, bestMax, bestPct}
  drafts: {},     // issueId -> in-progress drill text
  debriefs: [],   // [{id, at, issue, worked, lookUp, pattern, step}] pattern notes only; step is 1..6 or absent
  profile: {
    empNumber: 'EMP-84291',
    email: 'advisor.cards@bank.internal',
    phone: '+1 (555) 438-2900',
    role: 'Cards Resolution Specialist',
    name: 'Authorized Advisor',
    dept: 'Frontline Cards & Escalation Desk',
    station: 'Station 14 · Remote / Hub',
    clearance: 'Tier 2, Cards Policy & Fee Authority',
    badgeTheme: 'gold', // 'gold' | 'cyan' | 'sapphire' | 'emerald'
    photo: '',
    updatedAt: 0
  },
  prefs: {
    theme: 'dark',
    depth: 'agent',
    onePage: false,
    gateMode: false,
    splitLeft: 52,
    sheetSnap: 56,
    hlOn: false,
    hlPanel: false,
    lastBackup: 0,
    backupNag: 0,
    privacyAck: 0,
    // My numbers calculator (Call tab): scheduled hours, break and lunch minutes, minutes not available so far
    numHours: 7.5,
    numBreaks: 60,
    numUsed: 0
  },
  streak: { days: [], count: 0 }
};

const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);

// Practice scoring moved from four criteria (12 max) to the six call steps (18 max).
// Runs saved before that carry no max, so they are read as out of 12, and every
// comparison between tries is done by percentage.
export const OLD_DRILL_MAX = 12;
export const MASTERED_PCT = 80;
export function runMax(run) { return run && run.max > 0 ? run.max : OLD_DRILL_MAX; }
export function runPct(run) {
  if (!run) return 0;
  return Math.max(0, Math.min(100, Math.round(((+run.score || 0) / runMax(run)) * 100)));
}
// Fills best, bestMax and bestPct from the saved runs (or from a bare legacy best).
function rebest(d) {
  // the stored best counts too: its run may have been trimmed from the last twelve
  let top = typeof d.best === 'number' && d.best > 0 ? { score: d.best, max: d.bestMax > 0 ? d.bestMax : OLD_DRILL_MAX } : null;
  for (const r of d.runs) if (isObj(r) && (!top || runPct(r) > runPct(top))) top = r;
  if (top) {
    d.best = +top.score || 0; d.bestMax = runMax(top); d.bestPct = runPct(top);
  } else {
    d.best = typeof d.best === 'number' ? d.best : 0;
    d.bestMax = d.bestMax > 0 ? d.bestMax : OLD_DRILL_MAX;
    d.bestPct = Math.max(0, Math.min(100, Math.round((d.best / d.bestMax) * 100)));
  }
  return d;
}
const numOr = (v, dflt, lo, hi) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : dflt);
// Coerce stored or imported state into the shapes the rest of the app relies on.
function normalize(p) {
  p = isObj(p) ? p : {};
  const s = Object.assign(structuredClone(DEFAULTS), p);
  for (const k of ['notes', 'hl', 'seen', 'progress', 'cards', 'drills', 'drafts']) if (!isObj(s[k])) s[k] = {};
  if (!Array.isArray(s.debriefs)) s.debriefs = [];
  s.prefs = Object.assign(structuredClone(DEFAULTS.prefs), isObj(p.prefs) ? p.prefs : {});
  s.profile = Object.assign(structuredClone(DEFAULTS.profile), isObj(p.profile) ? p.profile : {});
  if (!isObj(s.streak) || !Array.isArray(s.streak.days)) s.streak = { days: [], count: 0 };
  for (const [k, v] of Object.entries(s.progress)) {
    if (!isObj(v)) { delete s.progress[k]; continue; }
    if (!Array.isArray(v.read)) v.read = [];
    if (!isObj(v.checks)) v.checks = {};
  }
  for (const [k, v] of Object.entries(s.hl)) if (!Array.isArray(v)) delete s.hl[k];
  for (const [k, v] of Object.entries(s.drills)) {
    if (!isObj(v) || !Array.isArray(v.runs)) { delete s.drills[k]; continue; }
    v.runs = v.runs.filter(isObj);
    rebest(v);
  }
  s.debriefs = s.debriefs.filter(isObj);
  for (const d of s.debriefs) {
    const n = Math.round(+d.step);
    if (n >= 1 && n <= 6) d.step = n; else delete d.step;
  }
  s.prefs.numHours = numOr(s.prefs.numHours, DEFAULTS.prefs.numHours, 0, 24);
  s.prefs.numBreaks = numOr(s.prefs.numBreaks, DEFAULTS.prefs.numBreaks, 0, 600);
  s.prefs.numUsed = numOr(s.prefs.numUsed, DEFAULTS.prefs.numUsed, 0, 1440);
  for (const [k, v] of Object.entries(s.cards)) if (!isObj(v)) delete s.cards[k];
  return s;
}
// One-time key migration: the topbar and Settings used to store 'spec'.
function migrate(s) {
  if (s.prefs.depth === 'spec') s.prefs.depth = 'specialist';
  return s;
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    return migrate(normalize(JSON.parse(raw)));
  } catch {
    // keep the unreadable value so the next save does not destroy it for good
    try { const r = localStorage.getItem(KEY); if (r) localStorage.setItem(KEY + ':corrupt', r); } catch {}
    return structuredClone(DEFAULTS);
  }
}

let pending = null;
function flush() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (err) { if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('cards:storage-error', { detail: err })); }
  pending = null;
}
function save() { if (!pending) pending = setTimeout(flush, 220); }

export const store = {
  get all() { return state; },
  // only writes when a save is queued, so page-hide events do not rewrite (or re-raise a quota error) for nothing
  flushNow() { if (!pending) return; clearTimeout(pending); pending = null; flush(); },

  note(id, val) {
    if (val === undefined) return state.notes[id] || '';
    if (val && val.trim()) state.notes[id] = val; else delete state.notes[id];
    save(); return val;
  },

  touchSeen(id) { state.seen[id] = Date.now(); save(); },
  seenAt(id) { return state.seen[id] || 0; },
  get seenCount() { return Object.keys(state.seen).length; },
  recent(n = 5) {
    return Object.entries(state.seen).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => id);
  },

  /* ── step-by-step issue progress (Vitruvian model) ── */
  prog(id) {
    if (!state.progress[id]) {
      state.progress[id] = { pos: 0, read: [], sketch: '', checks: {}, completedAt: 0 };
    }
    return state.progress[id];
  },
  markStep(id, stepIdx, totalSteps = 11) {
    const p = this.prog(id);
    p.pos = stepIdx;
    if (typeof stepIdx === 'number' && stepIdx >= 0 && stepIdx < totalSteps) {
      if (!p.read.includes(stepIdx)) p.read.push(stepIdx);
      if (p.read.length >= totalSteps && !p.completedAt) {
        p.completedAt = Date.now();
      }
    }
    save();
    return p;
  },
  stepSketch(id, val) {
    const p = this.prog(id);
    if (val === undefined) return p.sketch || '';
    p.sketch = val;
    save();
    return val;
  },
  toggleCheck(id, key) {
    const p = this.prog(id);
    p.checks = p.checks || {};
    p.checks[key] = !p.checks[key];
    save();
    return !!p.checks[key];
  },
  isChecked(id, key) {
    return !!(state.progress[id]?.checks?.[key]);
  },
  issuePct(id, totalSteps = 11) {
    const p = state.progress[id];
    if (!p || !Array.isArray(p.read) || !totalSteps) return 0;
    const valid = p.read.filter(x => x >= 0 && x < totalSteps);
    return Math.min(100, Math.round((valid.length / totalSteps) * 100));
  },
  get totalStepsRead() {
    return Object.values(state.progress).reduce((sum, p) => sum + (p.read ? p.read.length : 0), 0);
  },
  get completedIssuesCount() {
    return Object.values(state.progress).filter(p => p.completedAt > 0).length;
  },

  /* ── highlighter clippings (contract used by js/highlight.js) ── */
  highlights(sectionId) { return state.hl[sectionId] || []; },
  addHighlight(sectionId, clip) { (state.hl[sectionId] = state.hl[sectionId] || []).push(clip); save(); return clip; },
  removeHighlight(sectionId, id) {
    state.hl[sectionId] = (state.hl[sectionId] || []).filter(h => h.id !== id);
    if (!state.hl[sectionId].length) delete state.hl[sectionId];
    save();
  },
  clearHighlights(sectionId) { delete state.hl[sectionId]; save(); },
  get highlightCount() { return Object.values(state.hl).reduce((a, l) => a + l.length, 0); },

  /* ── flashcards (Leitner) ── */
  card(id) { return state.cards[id] || { box: 1, seen: 0, due: 0 }; },
  gradeCard(id, ok) {
    const c = this.card(id);
    c.box = ok ? Math.min(5, c.box + 1) : 1;
    c.seen++;
    c.due = Date.now() + [0, 1, 2, 4, 8, 16][c.box] * 864e5;
    state.cards[id] = c; save(); return c;
  },
  get weakCards() { return Object.entries(state.cards).filter(([, c]) => c.seen > 0 && c.box <= 2).map(([id]) => id); },

  /* ── role-play drills ── */
  drill(id) { return state.drills[id] || null; },
  draft(id, val) {
    if (val === undefined) return state.drafts[id] || '';
    if (val && val.trim()) state.drafts[id] = val; else delete state.drafts[id];
    save(); return val;
  },
  saveDrillRun(id, run) {
    delete state.drafts[id];
    const d = state.drills[id] || { runs: [], best: 0, bestMax: OLD_DRILL_MAX, bestPct: 0 };
    // keep the best so far even after its run is trimmed from the last twelve
    const prev = { score: d.best || 0, max: d.bestMax || OLD_DRILL_MAX };
    d.runs.push(run);
    if (d.runs.length > 12) d.runs = d.runs.slice(-12);
    if (runPct(run) >= runPct(prev)) { d.best = +run.score || 0; d.bestMax = runMax(run); d.bestPct = runPct(run); }
    else { d.best = prev.score; d.bestMax = prev.max; d.bestPct = runPct(prev); }
    state.drills[id] = d; save(); return d;
  },
  // { score, max, pct, runs, mastered } for one practice call, or null if never tried
  drillBest(id) {
    const d = state.drills[id];
    if (!d || !d.runs.length) return null;
    const max = d.bestMax || OLD_DRILL_MAX;
    const pct = typeof d.bestPct === 'number' ? d.bestPct : runPct({ score: d.best, max });
    return { score: d.best || 0, max, pct, runs: d.runs.length, mastered: pct >= MASTERED_PCT };
  },
  get drillCount() { return Object.values(state.drills).reduce((a, d) => a + d.runs.length, 0); },

  /* ── shift debriefs: pattern notes, never client data ── */
  get debriefs() { return state.debriefs; },
  addDebrief(d) {
    state.debriefs.unshift(Object.assign({ id: 'd' + Date.now().toString(36), at: Date.now() }, d));
    if (state.debriefs.length > 500) state.debriefs = state.debriefs.slice(0, 500);
    save(); return state.debriefs[0];
  },
  removeDebrief(id) { state.debriefs = state.debriefs.filter(d => d.id !== id); save(); },
  restoreDebrief(d, idx) {
    if (!d || state.debriefs.some(x => x.id === d.id)) return;
    state.debriefs.splice(Math.max(0, Math.min(idx, state.debriefs.length)), 0, d);
    save();
  },

  /* ── employee ID profile & credential badge ── */
  get profile() {
    return state.profile || (state.profile = structuredClone(DEFAULTS.profile));
  },
  setProfile(patch) {
    if (!state.profile) state.profile = structuredClone(DEFAULTS.profile);
    Object.assign(state.profile, patch, { updatedAt: Date.now() });
    save();
    return state.profile;
  },
  resetProfile() {
    state.profile = structuredClone(DEFAULTS.profile);
    save();
    return state.profile;
  },

  /* ── prefs, streak, data ── */
  pref(k, v) { if (v === undefined) return state.prefs[k]; state.prefs[k] = v; save(); return v; },

  touchStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const s = state.streak;
    if (s.days[s.days.length - 1] === today) return s;
    const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    s.count = s.days[s.days.length - 1] === yest ? (s.count || 0) + 1 : 1;
    s.days.push(today);
    if (s.days.length > 400) s.days = s.days.slice(-400);
    save(); return s;
  },
  // streak.count only while it is still alive (last day today or yesterday, UTC like touchStreak)
  get currentStreak() {
    const s = state.streak || {};
    const last = s.days?.[s.days.length - 1];
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    return (last === today || last === yest) ? (s.count || 0) : 0;
  },

  valueAtRisk() {
    return Object.keys(state.notes).length + Object.keys(state.hl).length + state.debriefs.length + this.drillCount + this.totalStepsRead;
  },
  exportAll() { return JSON.stringify(state, null, 2); },
  importAll(json) {
    const parsed = JSON.parse(json);
    if (!isObj(parsed) || !['prefs', 'progress', 'notes', 'hl', 'debriefs', 'drills', 'cards', 'profile', 'streak'].some(k => k in parsed)) {
      throw new Error('not cards advisor data');
    }
    state = migrate(normalize(parsed));
    flush(); return true;
  },
  reset() { state = structuredClone(DEFAULTS); flush(); }
};

export function countWords(s = '') { const t = String(s).trim(); return t ? t.split(/\s+/).length : 0; }
