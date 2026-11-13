// The call: three values, six steps (each with an advisor side and a client side), one
// annotated example call, listening cues, hold and transfers, and my numbers.
// Personal study notes and generic craft. Content lives in data/callflow.json.
import { esc } from './render.js';
import { store } from './store.js';
import { data } from './data.js';

// Static so other modules can use the step names without waiting for the fetch.
export const CALL_STEPS = [
  { n: 1, name: 'Be Ready', short: 'In Ready on time, tools open, last call closed.' },
  { n: 2, name: 'Welcome and Listen', short: 'Greet, verify, then let them finish.' },
  { n: 3, name: 'Solve Immediate Need', short: 'Fix what they called about first, and say what you are doing.' },
  { n: 4, name: 'Checkpoint', short: 'Confirm it worked and that they agree.' },
  { n: 5, name: 'Deeper Discovery and Additional Advice', short: 'Ask why it happened, offer options that fit.' },
  { n: 6, name: 'Making Their Day', short: 'Recap, dates, one real personal touch.' }
];

const VALUE_NAMES = { care: 'Care', connect: 'Connect', expertise: 'Expertise' };

/* ─────────── data ─────────── */
let cache = null;
let pending = null;

// loadData() in js/data.js fetches the same file before the first route, so use that copy when it is there.
function seeded() {
  if (!cache) {
    try { const j = data()?.callflow; if (j && Array.isArray(j.steps) && j.steps.length) cache = j; } catch { /* not loaded yet */ }
  }
  return cache;
}

function load() {
  if (seeded()) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch('data/callflow.json', { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('callflow ' + r.status); return r.json(); })
      .then(j => { cache = j; return j; })
      .catch(e => { pending = null; throw e; });
  }
  return pending;
}
// Warm the cache so the search palette has the full text early. Failure is fine.
load().catch(() => {});

/* ─────────── small helpers ─────────── */
const arr = v => (Array.isArray(v) ? v : []);
const q = s => `“${esc(s)}”`;
const fmt = sec => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
const num1 = n => (Math.round(n * 10) / 10).toLocaleString('en-CA', { maximumFractionDigits: 1 });

function shell(inner) {
  return `<section class="screen screen-active"><div class="screen-inner"><div class="cf-wrap">${inner}</div></div></section>`;
}

const back = (href = '#/call', label = 'The call') =>
  `<a class="back-inline cf-back" href="${href}"><span aria-hidden="true">←</span> ${esc(label)}</a>`;

function head(kicker, title, intro) {
  return `${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ''}
    <h1 class="title cf-title">${esc(title)}</h1>
    ${intro ? `<p class="subtitle cf-intro">${esc(intro)}</p>` : ''}`;
}

function valueTag(id) {
  const name = VALUE_NAMES[id] || id;
  return `<span class="cf-val cf-val-${esc(id)}"><i class="cf-dot" aria-hidden="true"></i>${esc(name)}</span>`;
}

function stepName(n) {
  const s = CALL_STEPS.find(x => x.n === Number(n));
  return s ? s.name : '';
}

function emptyState(main, sub, arg) {
  main.innerHTML = shell(`
    <h1 class="title cf-title">The call</h1>
    <div class="empty-panel cf-empty">
      <p>The call notes did not load. Check your connection and try again.</p>
      <button class="gbtn cf-tap" type="button" id="cfRetry">Try again</button>
    </div>`);
  main.querySelector('#cfRetry')?.addEventListener('click', () => callView(main, sub, arg));
}

/* ─────────── router entry ─────────── */
export async function callView(main, sub, arg) {
  if (!main) return;
  document.body.classList.remove('reading');
  const at = location.hash;
  let D;
  try {
    D = await load();
  } catch {
    if (location.hash === at) emptyState(main, sub, arg);
    return;
  }
  if (location.hash !== at) return; // the user moved on while the notes were loading

  try {
    switch (sub) {
      case 'step': return stepView(main, D, arg);
      case 'model': return modelView(main, D);
      case 'listen': return listenView(main, D);
      case 'transfers': return transfersView(main, D, arg);
      case 'numbers': return numbersView(main, D);
      default: return homeView(main, D);
    }
  } catch {
    emptyState(main, sub, arg);
  }
}

/* ─────────── home ─────────── */
function homeView(main, D) {
  const H = D.home || {};
  main.innerHTML = shell(`
    ${head('Cards Advisor', H.title || 'The call, start to end', H.intro)}

    <div class="cf-values" role="list" aria-label="Three values">
      ${arr(D.values).map(v => `<div class="cf-value cf-val-${esc(v.id)}" role="listitem" title="${esc(v.long || '')}">
        <span class="cf-value-name"><i class="cf-dot" aria-hidden="true"></i>${esc(v.name)}</span>
        <span class="cf-value-short">${esc(v.short)}</span>
      </div>`).join('')}
    </div>

    ${H.role ? `<p class="cf-role">${esc(H.role)}</p>` : ''}

    <ol class="cf-steps">
      ${arr(D.steps).map(s => `<li>
        <a class="cf-step" href="#/call/step/${s.n}">
          <span class="cf-step-n" aria-hidden="true">${s.n}</span>
          <span class="cf-step-body">
            <span class="cf-step-name">${esc(s.name)}</span>
            <span class="cf-step-line"><b>You:</b> ${esc(s.homeYou || s.short || '')}</span>
            <span class="cf-step-line cf-step-client"><b>Client:</b> ${esc(s.homeClient || '')}</span>
          </span>
          <span class="cf-go" aria-hidden="true">→</span>
        </a>
      </li>`).join('')}
    </ol>

    <a class="big-btn cf-primary" href="#/call/model">Walk through a full call</a>

    <nav class="cf-links" aria-label="More on the call">
      <a class="cf-link" href="#/call/listen">Listening cues</a>
      <a class="cf-link" href="#/call/transfers">Hold and transfers</a>
      <a class="cf-link" href="#/call/numbers">My numbers</a>
    </nav>

    ${D.about ? `<p class="cf-fine">${esc(D.about)}</p>` : ''}`);
}

/* ─────────── one step, two sides ─────────── */
let stepSide = 'you';

function stepView(main, D, arg) {
  const steps = arr(D.steps);
  if (!steps.length) throw new Error('no steps');
  let n = parseInt(arg, 10);
  if (!(n >= 1 && n <= steps.length)) n = 1;
  const s = steps[n - 1];
  const prev = n === 1 ? steps.length : n - 1;
  const next = n === steps.length ? 1 : n + 1;

  const points = () => arr(stepSide === 'client' ? s.client : s.you)
    .map(t => `<li>${esc(t)}</li>`).join('');

  main.innerHTML = shell(`
    ${back()}
    <span class="kicker">Step ${n} of ${steps.length}</span>

    <nav class="cf-pills" aria-label="Steps">
      ${steps.map(x => `<a class="cf-pill ${x.n === n ? 'on' : ''}" href="#/call/step/${x.n}" aria-label="Step ${x.n}: ${esc(x.name)}" ${x.n === n ? 'aria-current="step"' : ''}>${x.n}</a>`).join('')}
    </nav>

    <h1 class="title cf-title">${esc(s.name)}</h1>
    <div class="cf-vals">${arr(s.values).map(valueTag).join('')}</div>

    <div class="cf-seg" role="group" aria-label="Whose side">
      <button type="button" class="cf-seg-btn" data-side="you" aria-pressed="${stepSide === 'you'}">What it means for you</button>
      <button type="button" class="cf-seg-btn" data-side="client" aria-pressed="${stepSide === 'client'}">What the client feels</button>
    </div>

    <ul class="cf-points" id="cfPoints" aria-live="polite">${points()}</ul>

    <section class="cf-card">
      <h2 class="cf-h">${esc(s.sayLabel || 'Lines that fit this step')}</h2>
      <ul class="cf-say">
        ${arr(s.say).map(t => `<li>${s.sayQuoted === false ? esc(t) : q(t)}</li>`).join('')}
      </ul>
    </section>

    <div class="cf-duo">
      <section class="cf-card cf-card-num">
        <h2 class="cf-h">Numbers it moves</h2>
        <p>${esc(s.numbers || '')}</p>
        <a class="cf-inline-link" href="#/call/numbers">See my numbers</a>
      </section>
      <section class="cf-card cf-card-warn">
        <h2 class="cf-h">Watch out for</h2>
        <p>${esc(s.watch || '')}</p>
      </section>
    </div>

    ${s.more ? `<a class="cf-link cf-link-solo" href="${esc(s.more.href)}">${esc(s.more.label)}</a>` : ''}

    <nav class="cf-prevnext" aria-label="Previous and next step">
      <a class="gbtn ghost cf-tap" href="#/call/step/${prev}"><span aria-hidden="true">←</span> Previous step</a>
      <a class="gbtn cf-tap" href="#/call/step/${next}">Next step <span aria-hidden="true">→</span></a>
    </nav>`);

  const list = main.querySelector('#cfPoints');
  main.querySelectorAll('.cf-seg-btn').forEach(b => b.addEventListener('click', () => {
    stepSide = b.dataset.side === 'client' ? 'client' : 'you';
    main.querySelectorAll('.cf-seg-btn').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.side === stepSide)));
    if (list) list.innerHTML = points();
  }));
}

/* ─────────── the annotated full call ─────────── */
function modelLine(l) {
  const t = l.text || '';
  switch (l.who) {
    case 'you':
      return `<div class="cf-line cf-line-you">
        <p class="cf-bubble">${q(t)}</p>
        <div class="cf-line-meta"><span class="cf-who">You</span>${arr(l.values).map(valueTag).join('')}${l.tag ? `<span class="cf-tag">${esc(l.tag)}</span>` : ''}</div>
      </div>`;
    case 'client':
      return `<div class="cf-line cf-line-client">
        <p class="cf-bubble">${q(t)}</p>
        <div class="cf-line-meta"><span class="cf-who">Client</span></div>
      </div>`;
    case 'heard':
      return `<p class="cf-aside cf-heard"><b>Heard:</b> ${esc(t)}</p>`;
    case 'hold':
      return `<p class="cf-aside cf-holdmark"><span>${esc(t)}</span></p>`;
    case 'wrap':
      return `<p class="cf-aside cf-wrapnote"><b>Wrap:</b> ${esc(t)}</p>`;
    default:
      return `<p class="cf-aside">${esc(t)}</p>`;
  }
}

function modelView(main, D) {
  const M = D.model;
  if (!M) throw new Error('no model call');
  const sp = M.split || {};
  const parts = [['engage', 'Engage'], ['hold', 'Hold'], ['wrap', 'Wrap']]
    .map(([k, label]) => ({ k, label, sec: Number(sp[k]) || 0 }));
  const total = parts.reduce((a, p) => a + p.sec, 0);

  main.innerHTML = shell(`
    ${back()}
    ${head(M.kicker, M.title, M.intro)}

    <div class="cf-call">
      ${arr(M.parts).map(p => `<section class="cf-part">
        <h2 class="cf-part-head"><a href="#/call/step/${p.step}"><span class="cf-step-n" aria-hidden="true">${p.step}</span><span>${esc(stepName(p.step))}</span></a></h2>
        ${arr(p.lines).map(modelLine).join('')}
      </section>`).join('')}
    </div>

    ${total ? `<section class="cf-card cf-split">
      <h2 class="cf-h">Where the time went</h2>
      <div class="cf-bar" role="img" aria-label="${esc(parts.map(p => `${p.label} ${fmt(p.sec)}`).join(', '))}">
        ${parts.map(p => `<span class="cf-bar-seg cf-bar-${p.k}" style="flex-grow:${p.sec}"></span>`).join('')}
      </div>
      <dl class="cf-legend">
        ${parts.map(p => `<div><dt><i class="cf-key cf-bar-${p.k}" aria-hidden="true"></i>${p.label}</dt><dd>${fmt(p.sec)}</dd></div>`).join('')}
      </dl>
      <p class="cf-split-sum">Handle time for this call: <b>${fmt(total)}</b>. ${esc(M.splitNote || 'Example timings, not targets.')}</p>
      <a class="cf-inline-link" href="#/call/numbers">See my numbers</a>
    </section>` : ''}`);
}

/* ─────────── listening cues ─────────── */
function listenView(main, D) {
  const L = D.listen;
  if (!L) throw new Error('no listening notes');
  main.innerHTML = shell(`
    ${back()}
    ${head(L.kicker, L.title, L.intro)}

    ${arr(L.groups).map(g => `<section class="cf-group">
      <h2 class="cf-group-title">${esc(g.title)}${g.sub ? ` <span class="cf-group-sub">${esc(g.sub)}</span>` : ''}</h2>
      <div class="cf-cues">
        ${arr(g.cues).map(c => `<article class="cf-cue">
          <h3 class="cf-cue-name">${esc(c.cue)}</h3>
          <p><b>May mean:</b> ${esc(c.mean)}</p>
          <p class="cf-cue-do"><b>Do:</b> ${esc(c.do)}</p>
        </article>`).join('')}
      </div>
    </section>`).join('')}

    ${arr(L.show).length ? `<section class="cf-card">
      <h2 class="cf-h">${esc(L.showTitle || 'Show them you are listening')}</h2>
      <ul class="cf-chips">${arr(L.show).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    </section>` : ''}

    <nav class="cf-prevnext" aria-label="Related">
      <a class="gbtn ghost cf-tap" href="#/call/step/2">Step 2: Welcome and Listen</a>
    </nav>`);
}

/* ─────────── hold and transfers ─────────── */
let transferMode = null;

function transfersView(main, D, arg) {
  const T = D.transfers;
  if (!T || !T.modes) throw new Error('no transfer notes');
  const order = arr(T.order).filter(k => T.modes[k]);
  if (!order.length) throw new Error('no transfer modes');
  if (arg && T.modes[arg]) transferMode = arg;
  if (!transferMode || !T.modes[transferMode]) transferMode = T.modes[T.default] ? T.default : order[0];

  const panel = () => {
    const m = T.modes[transferMode];
    return `
      <section class="cf-card">
        <h2 class="cf-h">Use it when</h2>
        <p>${esc(m.when || '')}</p>
      </section>
      <ol class="cf-numlist">
        ${arr(m.steps).map((t, i) => `<li><span class="cf-step-n" aria-hidden="true">${i + 1}</span><span>${esc(t)}</span></li>`).join('')}
      </ol>
      <section class="cf-card">
        <h2 class="cf-h">What to say</h2>
        <div class="cf-saylist">
          ${arr(m.say).map(l => `<div class="cf-sayitem"><span class="cf-sayto">${esc(l.to)}</span><p>${q(l.text)}</p></div>`).join('')}
        </div>
      </section>
      <section class="cf-card cf-card-warn">
        <h2 class="cf-h">Never</h2>
        <p>${esc(m.never || '')}</p>
      </section>
      ${m.numbers ? `<p class="cf-note">${esc(m.numbers)}</p>` : ''}`;
  };

  main.innerHTML = shell(`
    ${back()}
    ${head(T.kicker, T.title, T.intro)}

    <section class="cf-card">
      <h2 class="cf-h">${esc(T.statesTitle || 'Your states on the phone')}</h2>
      <ul class="cf-states">
        ${arr(T.states).map(s => `<li class="cf-state ${s.mine ? 'mine' : ''}">${esc(s.name)}${s.mine ? '<span class="cf-state-you">you choose</span>' : ''}</li>`).join('')}
      </ul>
      <p class="cf-note">${esc(T.statesNote || '')}</p>
    </section>

    <div class="cf-seg cf-seg-3" role="group" aria-label="Hold or transfer">
      ${order.map(k => `<button type="button" class="cf-seg-btn" data-mode="${esc(k)}" aria-pressed="${k === transferMode}">${esc(T.modes[k].label)}</button>`).join('')}
    </div>

    <div id="cfMode" aria-live="polite">${panel()}</div>

    <nav class="cf-prevnext" aria-label="Related">
      <a class="gbtn ghost cf-tap" href="#/call/step/3">Step 3: Solve Immediate Need</a>
    </nav>`);

  const box = main.querySelector('#cfMode');
  main.querySelectorAll('.cf-seg-btn').forEach(b => b.addEventListener('click', () => {
    if (!T.modes[b.dataset.mode]) return;
    transferMode = b.dataset.mode;
    main.querySelectorAll('.cf-seg-btn').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.mode === transferMode)));
    if (box) box.innerHTML = panel();
  }));
}

/* ─────────── my numbers ─────────── */
const hasPref = () => store && typeof store.pref === 'function';
function getPref(k, fallback) {
  try {
    if (!hasPref()) return fallback;
    const v = Number(store.pref(k));
    return Number.isFinite(v) && store.pref(k) !== null && store.pref(k) !== undefined && store.pref(k) !== '' ? v : fallback;
  } catch { return fallback; }
}
function setPref(k, v) {
  try { if (hasPref()) store.pref(k, v); } catch { /* storage is optional */ }
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function numbersView(main, D) {
  const N = D.numbers;
  if (!N) throw new Error('no numbers notes');
  const target = Number(N.target) || 94;
  const slackShare = (100 - target) / 100;
  const def = N.defaults || {};
  const st = {
    hours: clamp(getPref('numHours', Number(def.hours) || 7.5), 1, 16),
    breaks: Math.max(0, getPref('numBreaks', Number(def.breaks) || 0)),
    used: Math.max(0, getPref('numUsed', Number(def.used) || 0))
  };

  main.innerHTML = shell(`
    ${back()}
    ${head(N.kicker, N.title, N.intro)}

    <section class="cf-card">
      <h2 class="cf-h">${esc(N.ahtTitle || 'Handle time is three parts')}</h2>
      <div class="cf-bar cf-bar-even" aria-hidden="true">
        <span class="cf-bar-seg cf-bar-engage" style="flex-grow:5"></span>
        <span class="cf-bar-seg cf-bar-hold" style="flex-grow:1"></span>
        <span class="cf-bar-seg cf-bar-wrap" style="flex-grow:2"></span>
      </div>
      <p class="cf-formula">${esc(N.ahtFormula || 'AHT = engage + hold + wrap')}</p>
      ${N.ahtGloss ? `<p class="cf-note">${esc(N.ahtGloss)}</p>` : ''}
      <div class="cf-parts">
        ${arr(N.parts).map(p => `<div class="cf-partrow">
          <h3><i class="cf-key cf-bar-${esc(p.key)}" aria-hidden="true"></i>${esc(p.name)}</h3>
          <p>${esc(p.what)}</p>
          <p class="cf-lever"><b>Honest lever:</b> ${esc(p.lever)}</p>
        </div>`).join('')}
      </div>
    </section>

    <section class="cf-card">
      <h2 class="cf-h">${esc(N.onrTitle || 'Other Not Ready')}</h2>
      <p>${esc(N.onr || '')}</p>
      ${N.onrLever ? `<p class="cf-lever"><b>Honest lever:</b> ${esc(N.onrLever)}</p>` : ''}
    </section>

    <section class="cf-card cf-calc">
      <h2 class="cf-h">${esc(N.availTitle || 'Compliance')}</h2>
      <p>${esc(N.avail || '')}</p>
      ${N.availExample ? `<p class="cf-note">${esc(N.availExample)}</p>` : ''}

      <div class="cf-field">
        <label for="cfHours">Scheduled hours</label>
        <div class="cf-quick" role="group" aria-label="Common shift lengths">
          ${arr(N.hourChoices).map(h => `<button type="button" class="cf-quick-btn" data-hours="${Number(h)}" aria-pressed="false">${Number(h)} hours</button>`).join('')}
        </div>
        <input id="cfHours" class="cf-input" type="number" inputmode="decimal" min="1" max="16" step="0.25" value="${st.hours}">
      </div>

      <div class="cf-field">
        <label for="cfBreaks">Breaks plus lunch, in minutes</label>
        <input id="cfBreaks" class="cf-input" type="number" inputmode="numeric" min="0" step="5" value="${st.breaks}">
      </div>

      <div class="cf-field">
        <label for="cfUsed">Minutes not available so far today</label>
        <div class="cf-stepper">
          <button type="button" class="cf-step-btn" id="cfLess" aria-label="One minute less">−</button>
          <input id="cfUsed" class="cf-input" type="number" inputmode="decimal" min="0" step="1" value="${st.used}">
          <button type="button" class="cf-step-btn" id="cfMore" aria-label="One minute more">+</button>
        </div>
      </div>

      <dl class="cf-out">
        <div><dt>Productive minutes</dt><dd id="cfProd"></dd></div>
        <div><dt>Slack at ${target} percent</dt><dd id="cfSlack"></dd></div>
      </dl>
      <div class="cf-result" id="cfResult" role="status" aria-live="polite">
        <span class="cf-result-pct" id="cfPct"></span>
        <span class="cf-result-txt" id="cfVerdict"></span>
      </div>
      ${N.availNote ? `<p class="cf-note">${esc(N.availNote)}</p>` : ''}
    </section>

    <section class="cf-card cf-card-warn">
      <h2 class="cf-h">${esc(N.neverTitle || 'Never buy a number with the client’s time')}</h2>
      <p>${esc(N.never || '')}</p>
    </section>`);

  const $ = id => main.querySelector('#' + id);
  const inHours = $('cfHours'), inBreaks = $('cfBreaks'), inUsed = $('cfUsed');
  const result = $('cfResult');

  const paint = () => {
    const sched = st.hours * 60;
    const prod = sched - st.breaks;
    main.querySelectorAll('.cf-quick-btn').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.hours) === st.hours)));
    if (!(prod > 0)) {
      $('cfProd').textContent = '0 min';
      $('cfSlack').textContent = '0 min';
      $('cfPct').textContent = '';
      $('cfVerdict').textContent = 'Breaks and lunch are as long as the whole day. Check the two figures above.';
      result.className = 'cf-result cf-result-bad';
      return;
    }
    const slack = prod * slackShare;
    const pct = clamp(((prod - st.used) / prod) * 100, 0, 100);
    const left = slack - st.used;
    $('cfProd').textContent = `${num1(prod)} min`;
    $('cfSlack').textContent = `${num1(slack)} min`;
    $('cfPct').textContent = `${pct.toFixed(1)}%`;
    const ok = left >= -1e-9;
    $('cfVerdict').textContent = ok
      ? `On target. ${num1(Math.max(0, left))} minutes of slack left today.`
      : `Below target. Over the slack by ${num1(Math.abs(left))} minutes.`;
    result.className = 'cf-result ' + (ok ? 'cf-result-ok' : 'cf-result-bad');
  };

  const read = (el, fallback) => {
    const v = parseFloat(String(el.value).replace(',', '.'));
    return Number.isFinite(v) ? v : fallback;
  };
  const sync = () => {
    st.hours = clamp(read(inHours, st.hours), 1, 16);
    st.breaks = clamp(read(inBreaks, st.breaks), 0, st.hours * 60);
    st.used = clamp(read(inUsed, st.used), 0, st.hours * 60);
    setPref('numHours', st.hours);
    setPref('numBreaks', st.breaks);
    setPref('numUsed', st.used);
    paint();
  };

  [inHours, inBreaks, inUsed].forEach(el => {
    el.addEventListener('input', sync);
    // tidy an out-of-range or empty entry once the field is left
    el.addEventListener('change', () => {
      inHours.value = st.hours; inBreaks.value = st.breaks; inUsed.value = st.used;
    });
  });
  main.querySelectorAll('.cf-quick-btn').forEach(b => b.addEventListener('click', () => {
    inHours.value = b.dataset.hours;
    sync();
  }));
  const bump = d => { inUsed.value = Math.max(0, Math.round((st.used + d) * 10) / 10); sync(); };
  $('cfLess').addEventListener('click', () => bump(-1));
  $('cfMore').addEventListener('click', () => bump(1));

  paint();
}

/* ─────────── search palette ─────────── */
export function callSearchIndex() {
  const D = seeded() || {};
  const flat = v => arr(v).join(' ');
  const out = [];
  const add = (title, sub, href, text) => out.push({ kind: 'Call', title, sub, href, text: [title, sub, text].filter(Boolean).join(' ') });

  add('The call, start to end', 'Three values and six steps', '#/call',
    arr(D.values).map(v => `${v.name} ${v.short} ${v.long}`).join(' ') + ' Care Connect Expertise advisor ' + ((D.home || {}).role || ''));

  CALL_STEPS.forEach(s => {
    const d = arr(D.steps).find(x => x.n === s.n) || {};
    add(`Step ${s.n}: ${s.name}`, s.short, `#/call/step/${s.n}`,
      [flat(d.you), flat(d.client), flat(d.say), d.numbers, d.watch].filter(Boolean).join(' '));
  });

  const M = D.model || {};
  add('A full call, start to end', M.title || 'Annotated example call', '#/call/model',
    arr(M.parts).map(p => arr(p.lines).map(l => `${l.text || ''} ${l.tag || ''}`).join(' ')).join(' ') + ' model call example engage hold wrap handle time');

  const L = D.listen || {};
  add('Listening cues', 'Verbal and non-verbal cues on the phone', '#/call/listen',
    arr(L.groups).map(g => `${g.title} ${arr(g.cues).map(c => `${c.cue} ${c.mean} ${c.do}`).join(' ')}`).join(' ') + ' ' + flat(L.show) + ' active listening pace volume pause sigh shaky voice background');

  const T = D.transfers || {};
  const modes = T.modes || {};
  add('Hold and transfers', 'Phone states, hold, warm and cold transfer', '#/call/transfers',
    `${T.intro || ''} ${T.statesNote || ''} ${arr(T.states).map(s => s.name).join(' ')} UCC universal call centre Ready Not Ready hold consult transfer conference`);
  [['hold', 'Hold', 'Ask, reason, time, check back, thank'],
    ['warm', 'Warm transfer', 'Brief the colleague first, then introduce'],
    ['cold', 'Cold transfer', 'Only for a simple misroute or on request']].forEach(([k, title, sub]) => {
    const m = modes[k] || {};
    add(title, sub, `#/call/transfers/${k}`,
      [m.when, flat(m.steps), arr(m.say).map(l => `${l.to} ${l.text}`).join(' '), m.never, m.numbers].filter(Boolean).join(' '));
  });

  const N = D.numbers || {};
  add('My numbers', 'AHT, Other Not Ready and the 94 percent', '#/call/numbers',
    [N.intro, N.ahtFormula, N.ahtGloss, arr(N.parts).map(p => `${p.name} ${p.what} ${p.lever}`).join(' '),
      N.onrTitle, N.onr, N.onrLever, N.availTitle, N.avail, N.availExample, N.availNote, N.never,
      'AHT average handle time engage hold wrap after call work compliance availability 94 percent slack calculator'].filter(Boolean).join(' '));

  return out;
}
