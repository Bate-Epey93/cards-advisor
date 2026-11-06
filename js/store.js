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
  drills: {},     // issueId -> {runs:[{at, secs, text, scores}], best}
  drafts: {},     // issueId -> in-progress drill text
  debriefs: [],   // [{id, at, issue, worked, lookUp, pattern}] pattern notes only
  profile: {
    empNumber: 'EMP-84291',
    email: 'advisor.cards@bank.internal',
    phone: '+1 (555) 438-2900',
    role: 'Cards Resolution Specialist',
    name: 'Authorized Advisor',
    dept: 'Frontline Cards & Escalation Desk',
    station: 'Station 14 · Remote / Hub',
    clearance: 'Tier 2 — Cards Policy & Fee Authority',
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
    hlOn: false,
    hlPanel: false,
    lastBackup: 0,
    backupNag: 0,
    privacyAck: 0
  },
  streak: { days: [], count: 0 }
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    const merged = Object.assign(structuredClone(DEFAULTS), parsed);
    merged.prefs = Object.assign(structuredClone(DEFAULTS.prefs), parsed.prefs || {});
    merged.progress = Object.assign({}, parsed.progress || {});
    merged.profile = Object.assign(structuredClone(DEFAULTS.profile), parsed.profile || {});
    return merged;
  } catch { return structuredClone(DEFAULTS); }
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
  flushNow() { clearTimeout(pending); pending = null; flush(); },

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
    const d = state.drills[id] || { runs: [], best: 0 };
    d.runs.push(run);
    if (d.runs.length > 12) d.runs = d.runs.slice(-12);
    d.best = Math.max(d.best, run.score || 0);
    state.drills[id] = d; save(); return d;
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

  valueAtRisk() {
    return Object.keys(state.notes).length + Object.keys(state.hl).length + state.debriefs.length + this.drillCount + this.totalStepsRead;
  },
  exportAll() { return JSON.stringify(state, null, 2); },
  importAll(json) {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || !parsed) throw new Error('not cards advisor data');
    state = Object.assign(structuredClone(DEFAULTS), parsed);
    state.prefs = Object.assign(structuredClone(DEFAULTS.prefs), parsed.prefs || {});
    state.progress = Object.assign({}, parsed.progress || {});
    state.profile = Object.assign(structuredClone(DEFAULTS.profile), parsed.profile || {});
    flush(); return true;
  },
  reset() { state = structuredClone(DEFAULTS); flush(); }
};

export function countWords(s = '') { const t = String(s).trim(); return t ? t.split(/\s+/).length : 0; }
