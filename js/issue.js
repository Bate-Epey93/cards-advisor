// Issue bank dashboard (Vitruvian Home style) and the split-pane step-by-step
// Call Anatomy Reader with synchronized diagram, timeline scrubber, and Policy sheet.
import { data, issueById, policyById, PARTS, DEPTHS, isStale } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';
import { mountHighlighter, unmountHighlighter } from './highlight.js';
import { verifyBadge, policyCard } from './policy.js';
import { renderMiniTopo, domainForCategory, mountCallDiagram } from './diagram.js';
import { toast } from './toast.js';

const FREQ_RANK = { 'very common': 0, common: 1, occasional: 2 };
const EMOTIONS = ['angry', 'scared', 'embarrassed', 'confused', 'resigned', 'blindsided', 'anxious', 'humiliated'];

// The 4 Acts of a Call Breakdown (Vitruvian step-loop grouping over the 11 parts)
export const ACTS = [
  { id: 'act-1', label: 'I · Read the Person', short: 'I · Read', parts: [0, 1, 2, 3], tone: 'red', desc: 'Surface words, real job, emotional tell, and psychological needs' },
  { id: 'act-2', label: 'II · Guard & Engage', short: 'II · Open', parts: [4, 5], tone: 'vio', desc: 'Compliance & risk flags, then the first 15 seconds' },
  { id: 'act-3', label: 'III · Run the Call', short: 'III · Run', parts: [6, 7, 8], tone: 'teal', desc: 'Diagnostic questions in order, resolution paths, and exact phrasing' },
  { id: 'act-4', label: 'IV · Close & Fix', short: 'IV · Close', parts: [9, 10], tone: 'amber', desc: 'Documentation, written confirmation, and upstream root-cause fix' }
];

// 4 Steps for Observed-Only Issues (so every single issue has a step-by-step walkthrough)
export const OBS_STEPS = [
  ['signal', 'Client signal & verbatim quotes', 'What callers actually report in public complaints and reviews', 'red'],
  ['underneath', 'Underlying job & emotional read', 'What the client is trying to get back to, and what made it worse', 'vio'],
  ['policy', 'Applicable rules & bank pages', 'Statutory rights and bank policy figures for this category', 'teal'],
  ['playbook', 'Your call playbook & notes', 'How to run this call using the advisor framework, plus your notes', 'amber']
];

function actForPart(pi) {
  return ACTS.find(a => a.parts.includes(pi)) || ACTS[0];
}

let filters = { q: '', cat: '', freq: '', emo: '', chip: 'all' };
let activeReaderCleanup = null;

export function cleanupIssueReader() {
  if (activeReaderCleanup) {
    activeReaderCleanup();
    activeReaderCleanup = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   HOME / ISSUE BANK (Vitruvian Library + Next Steps First)
   ═══════════════════════════════════════════════════════════════════ */
export function bankView(main, cat) {
  cleanupIssueReader();
  document.body.classList.remove('reading');
  if (cat !== undefined) filters = { ...filters, cat, chip: 'all' };

  const D = data();
  const flagships = D.issues.filter(i => i.breakdown);

  // Determine the "Continue / Up Next" flagship issue
  const recentIds = store.recent(10);
  let heroIssue = recentIds.map(issueById).find(i => i && i.breakdown && store.issuePct(i.id, 11) < 100)
    || flagships.find(i => store.issuePct(i.id, 11) < 100)
    || flagships[0];

  const heroProg = store.prog(heroIssue.id);
  const heroTotal = heroIssue.breakdown ? 11 : 4;
  const heroPct = store.issuePct(heroIssue.id, heroTotal);
  const heroNextStep = typeof heroProg.pos === 'number' && heroProg.pos < heroTotal ? heroProg.pos : 0;
  const heroStepTitle = heroIssue.breakdown
    ? (PARTS[heroNextStep]?.[1] || PARTS[0][1])
    : OBS_STEPS[heroNextStep]?.[1] || OBS_STEPS[0][1];

  const completedFlagships = flagships.filter(i => store.issuePct(i.id, 11) >= 100).length;
  const streakCount = store.all.streak?.count || 0;

  main.innerHTML = `<section class="screen screen-active">
    <div class="screen-inner">
    <!-- Top Bento: Continue + Readiness -->
    <div class="home-top">
      <div class="home-card home-continue" data-domain="${domainForCategory(heroIssue.category)}">
        <div class="home-cont-text">
          <span class="eyebrow-sm">${heroPct > 0 ? 'Continue walkthrough' : 'Start here · Flagship breakdown'}</span>
          <h2 class="home-sys">${esc(heroIssue.title)}</h2>
          <div class="home-where">Step ${heroNextStep + 1} of ${heroTotal} · ${esc(heroStepTitle)}</div>
          <div class="bd-strata" aria-label="${heroPct}% complete">
            ${Array.from({ length: heroTotal }, (_, k) => `<span class="${(heroProg.read || []).includes(k) ? 'on' : ''}"></span>`).join('')}
          </div>
          <div class="row" style="gap:8px;margin-top:4px">
            <a class="big-btn" href="#/issue/${heroIssue.id}/${heroNextStep}">
              <span>${heroPct > 0 ? 'Continue step ' + (heroNextStep + 1) : 'Begin walkthrough'}</span>
              <span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>
            </a>
            <a class="gbtn" href="#/drill/${heroIssue.id}">Practise call</a>
          </div>
        </div>
        <a class="home-thumb-link" href="#/issue/${heroIssue.id}/${heroNextStep}" aria-label="Open ${esc(heroIssue.title)}">
          ${renderMiniTopo(heroIssue)}
          <div class="home-thumb-caption">
            <span class="chip dom-chip">${esc(heroIssue.category)}</span>
            <span class="bd-pct">${heroPct}% rebuilt</span>
          </div>
        </a>
      </div>

      <div class="home-card home-review">
        <span class="eyebrow-sm">Advisor readiness</span>
        <h2 class="home-sys">${completedFlagships} <span class="trk-of">of ${flagships.length}</span> flagships</h2>
        <p class="home-where">${store.totalStepsRead} steps studied · ${store.drillCount} drill runs · ${streakCount}d streak</p>
        <div class="trk-bar" style="width:100%;margin:8px 0 12px">
          <div class="trk-bar-fill" style="width:${Math.round((completedFlagships / Math.max(1, flagships.length)) * 100)}%"></div>
        </div>
        <div class="row" style="gap:8px;margin-top:auto;width:100%">
          <a class="gbtn" href="#/cards" style="flex:1">Flashcards</a>
          <a class="gbtn" href="#/practice" style="flex:1">Role-play drills</a>
        </div>
      </div>
    </div>

    <!-- Visual Progression Track: The 6 Core Call Breakdowns -->
    <div class="home-path">
      <div class="home-path-head">
        <span class="mono-label">Core call mastery path · 6 authored 11-part breakdowns</span>
        <span class="dim" style="font-size:12.5px;margin-left:auto">Tap any node to step through the call</span>
      </div>
      <div class="path-track" role="navigation" aria-label="Flagship breakdowns progression">
        ${flagships.map((f, idx) => {
          const pct = store.issuePct(f.id, 11);
          const isDone = pct >= 100;
          const isCur = f.id === heroIssue.id;
          const shortTitle = f.title.split(/[;(,]/)[0].trim().slice(0, 22);
          return `<a class="path-dot ${isDone ? 'done' : ''} ${isCur ? 'cur' : ''}" href="#/issue/${f.id}" title="${esc(f.title)} (${pct}%)">
            <span class="path-label">${idx + 1}. ${esc(shortTitle)}</span>
          </a>`;
        }).join('')}
      </div>
    </div>

    <!-- Library Hero & Search Bar -->
    <div class="lib-hero">
      <div class="kicker">Issue bank · ${D.issues.length} observed issues across ${D.categories.length} categories</div>
      <h1 class="title">Read the person. Run the call.</h1>
      <p class="subtitle">Every card issue as clients actually describe it, what they need underneath, and a stepped walkthrough of how to engage in 15 seconds, diagnose to the fork, and resolve with the exact statutory rule.</p>
    </div>

    <div class="deconstruct-bar">
      <label class="db-field" for="bankQ">
        <svg class="ico db-ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4 4"/></svg>
        <input id="bankQ" type="search" placeholder="Filter issues, client quotes, emotions, rules… (e.g. abroad, lock, $50, spouse)" value="${esc(filters.q)}" autocomplete="off" spellcheck="false">
        <button class="gbtn ghost" id="clearQBtn" ${filters.q ? '' : 'hidden'} type="button">Clear</button>
      </label>
    </div>

    <div class="lib-subbar">
      <div class="lib-filters" role="group" aria-label="Filter issues">
        ${[
          ['all', `All (${D.issues.length})`],
          ['bd', `Guided breakdowns (${flagships.length})`],
          ['progress', 'In progress'],
          ['done', 'Completed'],
          ['very-common', 'Very common']
        ].map(([k, label]) => `<button class="lib-fchip ${filters.chip === k ? 'on' : ''}" data-chip="${k}" type="button">${label}</button>`).join('')}
      </div>
      <div class="row" style="gap:8px">
        <select id="bankCat" class="sel-pill" aria-label="Filter by category">
          <option value="">All ${D.categories.length} categories</option>
          ${D.categories.map(c => `<option value="${esc(c)}"${filters.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}
        </select>
        <select id="bankEmo" class="sel-pill" aria-label="Filter by caller emotion">
          <option value="">Any caller emotion</option>
          ${EMOTIONS.map(e => `<option value="${e}"${filters.emo === e ? ' selected' : ''}>Caller: ${e}</option>`).join('')}
        </select>
      </div>
    </div>

    <div id="bankGridWrap"></div>

    <p class="fine">Not affiliated with any bank. Every figure in this app is public material with its source and verification date; confirm in your own systems before quoting to a client. Nothing typed here leaves this device.</p>
  </div></section>`;

  const gridWrap = main.querySelector('#bankGridWrap');
  const qInput = main.querySelector('#bankQ');
  const clearBtn = main.querySelector('#clearQBtn');

  function renderGrid() {
    const list = D.issues
      .filter(i => !filters.cat || i.category === filters.cat)
      .filter(i => !filters.emo || (i.emotion || '').toLowerCase().includes(filters.emo))
      .filter(i => {
        const total = i.breakdown ? 11 : 4;
        const pct = store.issuePct(i.id, total);
        if (filters.chip === 'bd') return !!i.breakdown;
        if (filters.chip === 'progress') return pct > 0 && pct < 100;
        if (filters.chip === 'done') return pct >= 100;
        if (filters.chip === 'very-common') return i.frequency === 'very common';
        return true;
      })
      .filter(i => {
        if (!filters.q) return true;
        const t = [
          i.title, i.category, i.emotion, i.underlyingJob, i.trainingPoint,
          ...(i.quotes || []).map(q => q.text),
          ...(i.breakdown ? [i.breakdown.surfaceRequest, i.breakdown.engage, i.breakdown.resolve] : [])
        ].join(' ').toLowerCase();
        return filters.q.split(/\s+/).every(w => t.includes(w));
      })
      .sort((a, b) => ((b.breakdown ? 1 : 0) - (a.breakdown ? 1 : 0)) || (FREQ_RANK[a.frequency] - FREQ_RANK[b.frequency]) || a.n - b.n);

    if (!list.length) {
      gridWrap.innerHTML = `<div class="empty-panel">
        <strong>No issues match those filters.</strong>
        <p>Try clearing a filter chip or searching for a broader term like "lock", "fraud", "dispute", or "limit".</p>
        <button class="gbtn" id="resetFiltersBtn" style="margin-top:12px" type="button">Reset all filters</button>
      </div>`;
      gridWrap.querySelector('#resetFiltersBtn')?.addEventListener('click', () => {
        filters = { q: '', cat: '', freq: '', emo: '', chip: 'all' };
        qInput.value = '';
        clearBtn.hidden = true;
        main.querySelector('#bankCat').value = '';
        main.querySelector('#bankEmo').value = '';
        main.querySelectorAll('[data-chip]').forEach(b => b.classList.toggle('on', b.dataset.chip === 'all'));
        renderGrid();
      });
      return;
    }

    const bdList = list.filter(i => i.breakdown);
    const obsList = list.filter(i => !i.breakdown);

    const renderCard = i => {
      const hasBd = !!i.breakdown;
      const total = hasBd ? 11 : 4;
      const prog = store.prog(i.id);
      const readSet = new Set(prog.read || []);
      const pct = store.issuePct(i.id, total);
      const dom = domainForCategory(i.category);
      const nextStep = typeof prog.pos === 'number' && prog.pos < total ? prog.pos : 0;

      return `<a class="bd-card" data-domain="${dom}" href="#/issue/${i.id}/${pct > 0 && pct < 100 ? nextStep : 0}">
        ${renderMiniTopo(i)}
        <div class="bd-top">
          <span class="chip dom-chip">${esc(i.category)}</span>
          <span class="chip ${i.frequency === 'very common' ? 'freq-high' : ''}">${esc(i.frequency)}</span>
          ${pct >= 100 ? `<img class="enso-stamp card-stamp" src="assets/enso-complete.svg" alt="Completed" title="All steps completed">` : ''}
          <span class="bd-go" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M6 14L14 6M8 6h6v6"/></svg></span>
        </div>
        <div class="bd-name">${esc(i.title)}</div>
        <div class="bd-essence">${esc(i.underlyingJob || i.breakdown?.underlyingJob || '')}</div>
        ${i.emotion ? `<div class="bd-meta"><span class="chip tone-ink">State: ${esc(i.emotion.split(/[.;]/)[0])}</span></div>` : ''}
        <div class="bd-strata" aria-hidden="true">
          ${Array.from({ length: total }, (_, k) => `<span class="${readSet.has(k) ? 'on' : ''}"></span>`).join('')}
        </div>
        <div class="bd-foot">
          <span class="bd-last">${hasBd ? '11-part guided breakdown' : '4-step field study'}</span>
          <span class="bd-pct">${readSet.size}/${total} · ${pct}%</span>
        </div>
      </a>`;
    };

    let html = '';
    if (bdList.length) {
      html += `<div class="lib-section-head">
        <h2 class="lib-section-title">Flagship Guided Breakdowns</h2>
        <span class="lib-section-sub">${bdList.length} authored 11-part call walkthroughs</span>
      </div>
      <div class="card-grid">${bdList.map(renderCard).join('')}</div>`;
    }
    if (obsList.length) {
      html += `<div class="lib-section-head">
        <h2 class="lib-section-title">Observed Demand Studies</h2>
        <span class="lib-section-sub">${obsList.length} real-world call patterns & playbooks</span>
      </div>
      <div class="card-grid">${obsList.map(renderCard).join('')}</div>`;
    }
    gridWrap.innerHTML = html;
  }

  renderGrid();

  qInput.addEventListener('input', e => {
    filters.q = e.target.value.trim().toLowerCase();
    clearBtn.hidden = !filters.q;
    renderGrid();
  });
  clearBtn.addEventListener('click', () => {
    filters.q = '';
    qInput.value = '';
    clearBtn.hidden = true;
    renderGrid();
    qInput.focus();
  });
  main.querySelector('#bankCat').onchange = e => { filters.cat = e.target.value; renderGrid(); };
  main.querySelector('#bankEmo').onchange = e => { filters.emo = e.target.value; renderGrid(); };
  main.querySelectorAll('[data-chip]').forEach(b => {
    b.onclick = () => {
      filters.chip = b.dataset.chip;
      main.querySelectorAll('[data-chip]').forEach(x => x.classList.toggle('on', x.dataset.chip === filters.chip));
      renderGrid();
    };
  });
}

/* ═══════════════════════════════════════════════════════════════════
   STEP-BY-STEP SPLIT READER (Vitruvian Reader Architecture)
   ═══════════════════════════════════════════════════════════════════ */
function para(v) {
  return String(v || '').split('\n\n').filter(Boolean).map(p => `<p>${md(p)}</p>`).join('');
}

// Extract psychological needs badges for Part 4
function parsePsychNeeds(text = '') {
  const needs = [
    { key: 'control', label: 'Control', icon: '⌖' },
    { key: 'fairness', label: 'Fairness', icon: '⚖' },
    { key: 'competence', label: 'Competence & Dignity', icon: '◈' },
    { key: 'safety', label: 'Safety & Security', icon: '🛡' },
    { key: 'believed', label: 'Being Believed', icon: '✓' }
  ];
  const lower = text.toLowerCase();
  return needs.map(n => ({
    ...n,
    active: lower.includes(n.key) || (n.key === 'competence' && lower.includes('dignity'))
  }));
}

function renderBreakdownPart(issue, bd, pi) {
  const [key, label, hint] = PARTS[pi];
  const val = bd[key];
  if (val == null) return '';

  // Part 0: Surface request + real quotes preview
  if (key === 'surfaceRequest') {
    const quotes = (issue.quotes || []).slice(0, 3);
    return `
      <div class="problem-card spot-card" data-spot-part="0">
        <div class="pc-label">What the caller says first <span class="trace-pill">◎ Part 01</span></div>
        <blockquote class="step-quote">${md(val)}</blockquote>
      </div>
      ${quotes.length ? `<div class="sd-block">
        <h3>Verbatim from public complaints (${issue.quotes.length} recorded)</h3>
        <div class="sd-list">
          ${quotes.map(q => `<div class="sd-item">
            <div>${md(q.text)} ${q.url ? `<a href="${esc(q.url)}" target="_blank" rel="noopener" class="mono-link">[source ↗]</a>` : ''}</div>
          </div>`).join('')}
        </div>
      </div>` : ''}
    `;
  }

  // Part 1: Underlying job
  if (key === 'underlyingJob') {
    return `
      <div class="model-card spot-card" data-spot-part="1">
        <div class="mc-kick">The real job to be done <span class="trace-pill">◎ Part 02</span></div>
        <div class="mc-name">What they are actually trying to get back to</div>
        ${para(val)}
      </div>
      ${issue.resolutionSeen ? `<div class="tradeoff-band">
        <div><strong>What usually goes wrong:</strong> ${md(issue.resolutionSeen)}</div>
      </div>` : ''}
    `;
  }

  // Part 2: Emotional read
  if (key === 'emotionalRead') {
    return `
      <div class="problem-card spot-card" data-spot-part="2">
        <div class="pc-label">Emotional state & phone tells <span class="trace-pill">◎ Part 03</span></div>
        ${para(val)}
      </div>
      <div class="analogy-box">
        <div class="ab-label">Advisor listening cue</div>
        Match the caller's urgency in your first sentence without matching their panic. Naming the specific detail they just told you proves they are not talking to a script.
      </div>
    `;
  }

  // Part 3: Psychological needs
  if (key === 'psychologicalNeeds') {
    const pills = parsePsychNeeds(val);
    return `
      <div class="model-card spot-card" data-spot-part="3">
        <div class="mc-kick">Core human needs under threat <span class="trace-pill">◎ Part 04</span></div>
        <div class="psych-grid">
          ${pills.map(p => `<div class="psych-pill ${p.active ? 'on' : 'dim'}">
            <span class="psych-ico">${p.icon}</span>
            <span>${esc(p.label)}</span>
            <span class="psych-status">${p.active ? 'Threatened' : 'Low'}</span>
          </div>`).join('')}
        </div>
        <div style="margin-top:14px">${para(val)}</div>
      </div>
    `;
  }

  // Part 4: Risk and compliance flags
  if (key === 'riskFlags') {
    const flags = Array.isArray(val) ? val : [val];
    return `
      <div class="problem-card spot-card" data-spot-part="4">
        <div class="pc-label">Risk & compliance guardrails — check before acting <span class="trace-pill">◎ Part 05</span></div>
        <p style="margin-bottom:10px;font-size:13.5px;opacity:.85">Tick each guardrail as you verify it on the call:</p>
        <div class="flag-checklist">
          ${flags.map((f, idx) => {
            const cKey = `flag-${ idx }`;
            const on = store.isChecked(issue.id, cKey);
            return `<button type="button" class="check-card ${on ? 'done' : ''}" data-check="${cKey}">
              <span class="check-box">${on ? '✓' : '!'}</span>
              <span class="check-text">${md(f)}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Part 5: Engage — the first 15 seconds (with optional Vitruvian Move / Sketch gate!)
  if (key === 'engage') {
    const sketch = store.stepSketch(issue.id);
    return `
      <details class="deeper move-gate" ${sketch ? 'open' : ''}>
        <summary>✎ Try your own 15-second opener first <span class="move-opt">(optional practice)</span></summary>
        <div class="deeper-body">
          <p class="move-prompt">Before reading the model line below, how would you acknowledge the caller's specific situation and time-box the next step in one breath?</p>
          <textarea class="move-sketch" id="stepSketchInput" rows="3" placeholder="Write what you would say in the first 15 seconds…">${esc(sketch)}</textarea>
        </div>
      </details>
      <div class="solution-card spot-card" data-spot-part="5">
        <div class="sc-label">The first fifteen seconds <span class="trace-pill">◎ Part 06</span></div>
        <div class="engage-script">${para(val)}</div>
        <div class="row" style="margin-top:12px;justify-content:flex-end">
          <button type="button" class="gbtn" data-copy-text="${esc(val)}">Copy opener</button>
        </div>
      </div>
    `;
  }

  // Part 6: Diagnose — the questions, in order
  if (key === 'diagnose') {
    const qs = Array.isArray(val) ? val : [val];
    return `
      <div class="model-card spot-card" data-spot-part="6">
        <div class="mc-kick">Shortest path to the fork <span class="trace-pill">◎ Part 07</span></div>
        <div class="mc-name">Ask in this exact order</div>
        <ol class="diag-steps">
          ${qs.map((q, i) => `<li>
            <span class="diag-num">${i + 1}</span>
            <div class="diag-body">${md(q)}</div>
          </li>`).join('')}
        </ol>
      </div>
    `;
  }

  // Part 7: Resolve — the paths
  if (key === 'resolve') {
    const refs = (bd.policyRefs || []).map(policyById).filter(Boolean);
    return `
      <div class="solution-card spot-card" data-spot-part="7">
        <div class="sc-label">Resolution decision paths <span class="trace-pill">◎ Part 08</span></div>
        ${para(val)}
      </div>
      ${refs.length ? `<div class="defends-row defends-full">
        <span class="mono-label">Backed by ${refs.length} policy rules (tap to open Policy sheet)</span>
        <div class="row" style="gap:6px;flex-wrap:wrap">
          ${refs.map(p => `<button type="button" class="inv-badge inv-tap" data-open-policy="${p.id}">
            ${esc(p.kind === 'rule' ? `${p.figure} · ${p.source.split(';')[0]}` : p.question?.slice(0, 38) + '…')}
          </button>`).join('')}
        </div>
      </div>` : ''}
    `;
  }

  // Part 8: Say this, not this
  if (key === 'sayThisNotThis') {
    const pairs = Array.isArray(val) ? val : [];
    return `
      <div class="spot-card" data-spot-part="8">
        ${pairs.map((s, idx) => `<div class="b-ge">
          <div class="hd">
            <span>Paired Phrasing ${idx + 1} of ${pairs.length}</span>
            <button type="button" class="copy-inline" data-copy-text="${esc(s.say)}">Copy "Say"</button>
          </div>
          <div class="g"><b>✓ SAY THIS</b> <div>${md(s.say)}</div></div>
          <div class="b"><b>✗ NOT THIS</b> <div>${md(s.not)}</div></div>
          <div class="w"><strong>Why:</strong> ${md(s.why)}</div>
        </div>`).join('')}
      </div>
    `;
  }

  // Part 9: After the call (interactive checklist!)
  if (key === 'afterCall') {
    const clauses = String(val).split(/[.;]\s+/).map(s => s.trim()).filter(Boolean);
    return `
      <div class="scale-band spot-card" data-spot-part="9">
        <div class="sb-label">After the call · Documentation & written confirmation <span class="trace-pill">◎ Part 10</span></div>
        ${para(val)}
      </div>
      <div class="sd-block">
        <h3>Post-call verification checklist</h3>
        <div class="flag-checklist">
          ${clauses.map((c, idx) => {
            const cKey = `after-${idx}`;
            const on = store.isChecked(issue.id, cKey);
            return `<button type="button" class="check-card ${on ? 'done' : ''}" data-check="${cKey}">
              <span class="check-box">${on ? '✓' : '○'}</span>
              <span class="check-text">${md(c)}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Part 10: Prevent and feed back
  if (key === 'preventAndFeedBack') {
    return `
      <div class="dev-box spot-card" data-spot-part="10">
        <div class="db-label">Upstream prevention & lead escalation <span class="trace-pill">◎ Part 11</span></div>
        ${para(val)}
      </div>
    `;
  }

  return para(val);
}

// Render 4-step Guided Field Study for the 38 Observed-Only Issues
function renderObservedStep(issue, stepIdx) {
  const related = relatedPolicy(issue, []);
  const rules = data().rules.mustKnow.slice(0, 3);

  if (stepIdx === 0) {
    return `
      <div class="problem-card spot-card" data-spot-part="0">
        <div class="pc-label">Observed client demand · ${esc(issue.frequency)} <span class="trace-pill">◎ Step 01</span></div>
        <p>${md(issue.frequencyEvidence || 'Documented across public consumer complaints and cardholder reviews.')}</p>
      </div>
      <div class="sd-block">
        <h3>Verbatim client quotes</h3>
        ${(issue.quotes || []).map(q => `<div class="b-quote">${md(q.text)}<cite>${q.url ? `<a href="${esc(q.url)}" target="_blank" rel="noopener">Source page ↗</a>` : ''}${q.snippetOnly ? ' · search snippet only' : ''}</cite></div>`).join('')}
      </div>
    `;
  }

  if (stepIdx === 1) {
    const pills = parsePsychNeeds((issue.emotion || '') + ' ' + (issue.underlyingJob || ''));
    return `
      <div class="model-card spot-card" data-spot-part="1">
        <div class="mc-kick">Underlying job to be done <span class="trace-pill">◎ Step 02</span></div>
        <div class="mc-name">${esc(issue.underlyingJob || 'Resolve the card issue and restore certainty')}</div>
        ${issue.emotion ? `<p style="margin-top:8px"><strong>Caller state:</strong> ${md(issue.emotion)}</p>` : ''}
      </div>
      <div class="psych-grid" style="margin:14px 0">
        ${pills.map(p => `<div class="psych-pill ${p.active ? 'on' : 'dim'}">
          <span class="psych-ico">${p.icon}</span>
          <span>${esc(p.label)}</span>
        </div>`).join('')}
      </div>
      ${issue.resolutionSeen ? `<div class="problem-card">
        <div class="pc-label">What made it worse in observed reports</div>
        ${para(issue.resolutionSeen)}
      </div>` : ''}
      ${issue.posterClaims ? `<div class="scale-band">
        <div class="sb-label">Poster claims (stored as claims, never as policy facts)</div>
        ${para(issue.posterClaims)}
      </div>` : ''}
    `;
  }

  if (stepIdx === 2) {
    return `
      <div class="solution-card spot-card" data-spot-part="2">
        <div class="sc-label">Verified context & rules <span class="trace-pill">◎ Step 03</span></div>
        <p>${issue.verifiedContext ? md(issue.verifiedContext) : `Always verify figures in-system before quoting. Below are the closest bank pages and statutory rules for <strong>${esc(issue.category)}</strong>.`}</p>
      </div>
      ${related.length ? `<div class="sd-block"><h3>Related bank pages (${related.length})</h3>${related.map(policyCard).join('')}</div>` : ''}
      <div class="sd-block"><h3>Core statutory guardrails</h3>${rules.map(r => policyCard(policyById(r.id))).join('')}</div>
    `;
  }

  // stepIdx === 3: Playbook
  return `
    <div class="solution-card spot-card" data-spot-part="3">
      <div class="sc-label">Call execution playbook <span class="trace-pill">◎ Step 04</span></div>
      ${issue.trainingPoint ? para(issue.trainingPoint) : `<p>Run the standard 4-move advisor sequence for <strong>${esc(issue.title)}</strong>:</p>`}
      <ol class="diag-steps" style="margin-top:12px">
        <li><span class="diag-num">1</span><div class="diag-body"><strong>First 15 seconds:</strong> Name the specific issue (${esc(issue.underlyingJob || issue.title)}) and time-box your check so the caller knows they won't be transferred in a loop.</div></li>
        <li><span class="diag-num">2</span><div class="diag-body"><strong>Verify & triage:</strong> Check for compliance flags (unauthorised charge vs. merchant dispute, vulnerable client, or complaint clock).</div></li>
        <li><span class="diag-num">3</span><div class="diag-body"><strong>Solve tonight + confirm in writing:</strong> Give the realistic timeline and reference number before ending the call.</div></li>
      </ol>
    </div>
  `;
}

export function issueView(main, id, partArg) {
  cleanupIssueReader();
  const D = data();
  const i = issueById(id);
  if (!i) {
    document.body.classList.remove('reading');
    main.innerHTML = `<div class="screen-inner"><div class="empty-panel">No such issue. <a href="#/">Return to Issue bank</a></div></div>`;
    return;
  }

  document.body.classList.add('reading');
  store.touchSeen(i.id);
  store.touchStreak();

  const bd = i.breakdown;
  const totalSteps = bd ? 11 : 4;
  const onePage = !!store.pref('onePage');
  const depth = store.pref('depth') || 'agent';

  // Determine current part: '0'..'10' (or '0'..'3' for observed), 'all', 'o', 'p'
  const savedPos = store.prog(i.id).pos;
  let part = partArg !== undefined ? String(partArg) : (onePage && bd ? 'all' : String(savedPos ?? 0));
  if (!bd && (part === 'all' || (+part >= 4))) part = '0';

  const isNumeric = /^\d+$/.test(part);
  const pi = isNumeric ? Math.min(totalSteps - 1, Math.max(0, +part)) : -1;
  if (pi >= 0) {
    part = String(pi);
    store.markStep(i.id, pi, totalSteps);
  }

  const prog = store.prog(i.id);
  const readSet = new Set(prog.read || []);
  const pct = store.issuePct(i.id, totalSteps);
  const splitLeft = store.pref('splitLeft') || 52;

  // Build Reader DOM (Split-pane on desktop, interactive diagram + bottom sheet on mobile)
  main.innerHTML = `<div class="reader" id="issueReader" style="--split-left:${splitLeft}%" data-domain="${domainForCategory(i.category)}">
    <!-- Left / Upper Pane: Interactive Call Anatomy Diagram & Timeline Scrubber -->
    <div class="diagram-pane" id="diagramPane">
      <div class="reg-mark tl"></div><div class="reg-mark tr"></div>
      <div class="reg-mark bl"></div><div class="reg-mark br"></div>

      <div class="dg-legend" id="dgLegend">
        <button class="dgl-tog" id="dgLegendTog" type="button">Key ▾</button>
        <span class="dgl-item"><i class="dgl-dot tone-red"></i>Read & Risk</span>
        <span class="dgl-item"><i class="dgl-dot tone-vio"></i>Guard & Open</span>
        <span class="dgl-item"><i class="dgl-dot tone-teal"></i>Run Call</span>
        <span class="dgl-item"><i class="dgl-dot tone-amber"></i>Resolve & Policy</span>
        <span class="dgl-note">Tap any node to jump to that step</span>
      </div>

      <div class="diagram-scroll" id="diagramScroll"></div>
      <div class="dg-origin" id="dgOrigin" hidden></div>

      <!-- Interactive Timeline Scrubber -->
      <div class="scrub-wrap timeline" id="timelineScrub"></div>

      <div class="diagram-cap">
        <span class="diagram-cap-state" id="diagramCapState"></span>
        <div class="cap-tools">
          <div class="dg-zoom">
            <button class="zbtn" data-zoom="out" title="Zoom out" aria-label="Zoom out">−</button>
            <button class="zbtn zfit on" data-zoom="fit" title="Reset zoom">FIT</button>
            <button class="zbtn" data-zoom="in" title="Zoom in" aria-label="Zoom in">+</button>
          </div>
          <span class="cap-sep"></span>
          <button class="gbtn sim-btn" id="openPolicyDrawerBtn" type="button" title="Open Policy & Rules Sheet (P)">
            <svg class="ico" viewBox="0 0 20 20"><rect x="4" y="2.8" width="12" height="14.4" rx="2"/><path d="M7 7h6M7 10h6M7 13h3.5"/></svg>
            <span class="btn-label">Policy sheet</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Resizable Split Divider -->
    <div class="pane-split" id="paneSplit" role="separator" tabindex="0" aria-label="Resize diagram and reading pane">
      <div class="pane-split-bar"></div>
    </div>

    <!-- Right / Mobile Bottom Sheet: Step-by-Step Prose Reader -->
    <div class="doc-sheet" id="docSheet">
      <div class="sheet-grip-row" id="sheetGrip" role="button" tabindex="0" aria-label="Drag or tap to resize reading sheet">
        <div class="sheet-grip-bar"></div>
        <div class="sheet-snap-pills">
          <button type="button" data-snap="30">Map</button>
          <button type="button" data-snap="56" class="on">Split</button>
          <button type="button" data-snap="88">Read</button>
        </div>
      </div>
      <div class="doc-pane" id="docPane">
        <div class="doc-inner">
          <div class="step-body" id="stepBody"></div>
        </div>
      </div>
    </div>
  </div>`;

  const readerEl = main.querySelector('#issueReader');
  const diagramPane = main.querySelector('#diagramPane');
  const scrubEl = main.querySelector('#timelineScrub');
  const stepBody = main.querySelector('#stepBody');
  const docPane = main.querySelector('#docPane');

  // Toggle mobile key legend
  const dgLegend = main.querySelector('#dgLegend');
  main.querySelector('#dgLegendTog')?.addEventListener('click', e => {
    e.stopPropagation();
    dgLegend.classList.toggle('open');
  });

  // Mount Call Anatomy Diagram
  const diagram = mountCallDiagram(diagramPane, i, {
    part,
    onSelectPart(targetPart) {
      navigatePart(targetPart);
    }
  });

  function navigatePart(nextPart) {
    const targetHash = `#/issue/${i.id}/${nextPart}`;
    if (location.hash === targetHash) {
      part = String(nextPart);
      if (/^\d+$/.test(part)) store.markStep(i.id, +part, totalSteps);
      renderReaderContent();
      diagram.setPart(part);
      renderTimeline();
    } else {
      location.hash = targetHash;
    }
  }

  // Render Vitruvian Timeline Scrubber with hover popover
  function renderTimeline() {
    const curProg = store.prog(i.id);
    const curRead = new Set(curProg.read || []);
    scrubEl.innerHTML = `
      <div class="tl-popover" id="tlPopover" role="tooltip">
        <div class="tl-pop-head">
          <span class="tl-pop-layer"></span>
          <span class="tl-pop-delta"></span>
        </div>
        <div class="tl-pop-title"></div>
        <div class="tl-pop-sub"></div>
      </div>
      <div class="tl-row" id="tlRow"></div>
    `;
    const row = scrubEl.querySelector('#tlRow');
    const pop = scrubEl.querySelector('#tlPopover');

    const addSeg = (pKey, label, state, title, sub, groupLabel, dotTone) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tl-seg tl-${state}`;
      if (String(pKey) === String(part)) btn.setAttribute('aria-current', 'step');
      btn.innerHTML = `<span class="tl-seg-top">${esc(label)}</span>` +
        (dotTone ? `<span class="tl-microdots"><span class="tl-dot ${state === 'done' || state === 'on' ? 'done' : ''} tone-${dotTone}"></span></span>` : '');

      btn.addEventListener('pointerenter', () => {
        pop.querySelector('.tl-pop-layer').textContent = groupLabel;
        pop.querySelector('.tl-pop-delta').textContent = state === 'done' ? '✓ Completed' : state === 'on' ? 'Current step' : 'Step';
        pop.querySelector('.tl-pop-title').textContent = title;
        pop.querySelector('.tl-pop-sub').textContent = sub;
        const sRect = scrubEl.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        const left = Math.max(8, Math.min(sRect.width - 280, bRect.left - sRect.left));
        pop.style.left = `${left}px`;
        pop.classList.add('show');
      });
      btn.addEventListener('pointerleave', () => pop.classList.remove('show'));
      btn.addEventListener('click', () => {
        pop.classList.remove('show');
        navigatePart(pKey);
      });
      row.appendChild(btn);
    };

    if (bd) {
      PARTS.forEach(([k, label, hint], idx) => {
        const act = actForPart(idx);
        const isCur = String(idx) === part;
        const isDone = curRead.has(idx);
        const state = isCur ? 'on' : isDone ? 'done' : 'todo';
        const shortLbl = isCur ? `${idx + 1} · ${label.split(':')[0]}` : String(idx + 1);
        addSeg(String(idx), shortLbl, state, `${idx + 1}. ${label}`, hint, act.label, act.tone);
      });
      addSeg('all', 'All 11', part === 'all' ? 'on' : 'todo', 'One-Page Complete View', 'Read all 11 parts top-to-bottom on a single page', 'FULL VIEW', null);
      addSeg('o', 'Quotes', part === 'o' ? 'on' : 'todo', 'Observed Client Quotes', `${(i.quotes || []).length} verbatim public complaints and context`, 'CORPUS EVIDENCE', null);
      addSeg('p', `Policy (${(bd.policyRefs || []).length})`, part === 'p' ? 'on' : 'todo', 'Linked Policy & Rules', 'Statutory caps, timelines, and bank FAQ readings', 'RULES LAYER', null);
    } else {
      OBS_STEPS.forEach(([k, label, hint, tone], idx) => {
        const isCur = String(idx) === part;
        const isDone = curRead.has(idx);
        const state = isCur ? 'on' : isDone ? 'done' : 'todo';
        addSeg(String(idx), `${idx + 1} · ${label.split('&')[0].trim()}`, state, label, hint, `STEP ${idx + 1} OF 4`, tone);
      });
    }
  }

  function renderReaderContent() {
    const curProg = store.prog(i.id);
    const curPct = store.issuePct(i.id, totalSteps);
    const curDepth = store.pref('depth') || 'agent';

    // Top issue context header + Act tabs
    let actTabsHtml = '';
    if (bd) {
      const curAct = pi >= 0 ? actForPart(pi) : null;
      actTabsHtml = `
        <div class="step-head">
          <div class="step-where">
            <span class="chip dom-chip">${esc(i.category)}</span>
            <span>${pi >= 0 ? `Part ${pi + 1} of 11 · ${curPct}% complete` : part === 'all' ? 'All 11 parts' : part === 'p' ? 'Policy & rules' : 'Observed evidence'}</span>
          </div>
          <div class="step-tabs" role="tablist" aria-label="Call acts">
            ${ACTS.map(a => {
              const isOn = curAct?.id === a.id;
              const allActDone = a.parts.every(pIdx => (curProg.read || []).includes(pIdx));
              return `<button type="button" role="tab" class="step-tab tone-${a.tone} ${isOn ? 'on' : allActDone ? 'past' : ''}" data-go-part="${a.parts[0]}" aria-selected="${isOn}">${esc(a.short)}</button>`;
            }).join('')}
            <button type="button" role="tab" class="step-tab ${part === 'all' ? 'on' : ''}" data-go-part="all" aria-selected="${part === 'all'}">All 11</button>
          </div>
        </div>
      `;
    } else {
      actTabsHtml = `
        <div class="step-head">
          <div class="step-where">
            <span class="chip dom-chip">${esc(i.category)}</span>
            <span>Step ${(pi >= 0 ? pi : 0) + 1} of 4 · ${curPct}% complete</span>
          </div>
          <div class="step-tabs" role="tablist" aria-label="Study steps">
            ${OBS_STEPS.map(([k, lbl, h, tone], idx) => `<button type="button" role="tab" class="step-tab tone-${tone} ${pi === idx ? 'on' : ''}" data-go-part="${idx}" aria-selected="${pi === idx}">Step ${idx + 1}</button>`).join('')}
          </div>
        </div>
      `;
    }

    // Depth callout bar (for breakdowns)
    const depthMeta = DEPTHS.find(d => d[0] === curDepth) || DEPTHS[0];
    const depthBanner = bd && bd.depths?.[curDepth] ? `
      <div class="depth-banner depth-${curDepth}">
        <div class="depth-banner-head">
          <span class="mono-label">${esc(depthMeta[1])} lens · ${esc(depthMeta[2])}</span>
          <div class="depth-mini-pills">
            ${DEPTHS.map(([k, l]) => `<button type="button" class="${curDepth === k ? 'on' : ''}" data-depth="${k}">${l}</button>`).join('')}
          </div>
        </div>
        <p>${md(bd.depths[curDepth])}</p>
      </div>
    ` : '';

    let mainBlockHtml = '';
    let footerHtml = '';

    if (bd && pi >= 0) {
      const [key, label, hint] = PARTS[pi];
      const act = actForPart(pi);
      const isComplete = store.issuePct(i.id, 11) >= 100;

      mainBlockHtml = `
        <div class="issue-kicker-bar">
          <a href="#/" class="back-inline">← Issue bank</a>
          <span class="dim">·</span>
          <span class="dim">${esc(i.title)}</span>
        </div>
        <div class="step-kick tone-${act.tone}">${esc(act.label)} · Part ${pi + 1} of 11</div>
        <h1 class="step-title">
          ${esc(label)}
          ${isComplete ? `<img class="enso-stamp stamped" src="assets/enso-complete.svg" alt="Completed" title="All 11 parts completed">` : ''}
        </h1>
        <p class="step-subtitle">${esc(hint)}</p>
        ${depthBanner}
        <div class="hl-bar" id="hlBar"></div>
        <div class="blocks" id="readerBlocks">
          ${renderBreakdownPart(i, bd, pi)}
        </div>
      `;

      const prevPart = pi > 0 ? String(pi - 1) : null;
      const nextLabel = pi < PARTS.length - 1
        ? `Next: ${PARTS[pi + 1][1].split(':')[0]} (${pi + 2}/11)`
        : 'Practise this call (3-min drill)';

      footerHtml = `
        <div class="step-foot">
          ${prevPart !== null
            ? `<button type="button" class="gbtn ghost step-back" data-go-part="${prevPart}">← Part ${pi}</button>`
            : `<a class="gbtn ghost step-back" href="#/">← Issue bank</a>`}
          <span class="step-foot-note">Part ${pi + 1} of 11 · Use ← / → keys</span>
          ${pi < PARTS.length - 1
            ? `<button type="button" class="big-btn step-next" data-go-part="${pi + 1}">
                <span>${esc(nextLabel)}</span>
                <span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>
              </button>`
            : `<a class="big-btn step-next" href="#/drill/${i.id}">
                <span>${esc(nextLabel)}</span>
                <span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>
              </a>`}
        </div>
      `;
    } else if (bd && part === 'all') {
      // Mark all 11 read when viewing all
      for (let k = 0; k < 11; k++) store.markStep(i.id, k, 11);
      mainBlockHtml = `
        <div class="issue-kicker-bar"><a href="#/" class="back-inline">← Issue bank</a></div>
        <div class="step-kick tone-teal">Complete 11-Part Breakdown</div>
        <h1 class="step-title">${esc(i.title)} <img class="enso-stamp stamped" src="assets/enso-complete.svg" alt="Completed"></h1>
        ${depthBanner}
        <div class="hl-bar" id="hlBar"></div>
        <div class="blocks" id="readerBlocks">
          ${PARTS.map(([key, label, hint], k) => `
            <section class="all-part-sec" data-spot-part="${k}">
              <div class="b-h"><span class="part-pill">${k + 1}</span> ${esc(label)}</div>
              ${renderBreakdownPart(i, bd, k)}
            </section>
          `).join('')}
        </div>
      `;
      footerHtml = `
        <div class="step-foot">
          <button type="button" class="gbtn ghost step-back" data-go-part="0">← Step-by-step mode</button>
          <a class="big-btn step-next" href="#/drill/${i.id}">
            <span>Practise this call →</span>
          </a>
        </div>
      `;
    } else if (part === 'p') {
      const refs = (bd?.policyRefs || []).map(policyById).filter(Boolean);
      const related = relatedPolicy(i, refs);
      mainBlockHtml = `
        <div class="issue-kicker-bar"><a href="#/issue/${i.id}/0" class="back-inline">← Back to walkthrough</a></div>
        <div class="step-kick tone-amber">Policy & Regulatory Layer</div>
        <h1 class="step-title">Rules & Figures for ${esc(i.title)}</h1>
        <p class="step-subtitle">Every figure below is public material with its source and date. ${verifyBadge()} means confirm in your systems before saying it to a client.</p>
        <div class="blocks" id="readerBlocks">
          ${refs.length ? `<div class="b-h">Directly cited in this breakdown (${refs.length})</div>${refs.map(policyCard).join('')}` : ''}
          ${related.length ? `<div class="b-h">Related bank pages for ${esc(i.category)}</div>${related.map(policyCard).join('')}` : ''}
        </div>
      `;
      footerHtml = `
        <div class="step-foot">
          <button type="button" class="gbtn ghost step-back" data-go-part="0">← Back to walkthrough</button>
          <a class="big-btn step-next" href="#/policy"><span>Full policy lookup →</span></a>
        </div>
      `;
    } else if (part === 'o') {
      mainBlockHtml = `
        <div class="issue-kicker-bar"><a href="#/issue/${i.id}/0" class="back-inline">← Back to walkthrough</a></div>
        <div class="step-kick tone-red">Observed Demand Corpus</div>
        <h1 class="step-title">What Callers Report: ${esc(i.title)}</h1>
        <div class="blocks" id="readerBlocks">
          ${renderObservedStep(i, 0)}
          ${renderObservedStep(i, 1)}
        </div>
      `;
      footerHtml = `
        <div class="step-foot">
          <button type="button" class="gbtn ghost step-back" data-go-part="0">← Back to walkthrough</button>
          <button type="button" class="big-btn step-next" data-go-part="p"><span>View linked policy →</span></button>
        </div>
      `;
    } else {
      // Observed-only 4-step walkthrough
      const stepIdx = pi >= 0 ? pi : 0;
      const [sKey, sLabel, sHint, sTone] = OBS_STEPS[stepIdx];
      const isComplete = store.issuePct(i.id, 4) >= 100;
      mainBlockHtml = `
        <div class="issue-kicker-bar">
          <a href="#/" class="back-inline">← Issue bank</a>
          <span class="dim">·</span>
          <span class="dim">${esc(i.title)}</span>
        </div>
        <div class="step-kick tone-${sTone}">Step ${stepIdx + 1} of 4 · ${esc(sLabel)}</div>
        <h1 class="step-title">
          ${esc(i.title)}
          ${isComplete ? `<img class="enso-stamp stamped" src="assets/enso-complete.svg" alt="Completed">` : ''}
        </h1>
        <p class="step-subtitle">${esc(sHint)}</p>
        <div class="hl-bar" id="hlBar"></div>
        <div class="blocks" id="readerBlocks">
          ${renderObservedStep(i, stepIdx)}
        </div>
      `;
      footerHtml = `
        <div class="step-foot">
          ${stepIdx > 0
            ? `<button type="button" class="gbtn ghost step-back" data-go-part="${stepIdx - 1}">← Step ${stepIdx}</button>`
            : `<a class="gbtn ghost step-back" href="#/">← Issue bank</a>`}
          <span class="step-foot-note">Step ${stepIdx + 1} of 4 · Use ← / → keys</span>
          ${stepIdx < 3
            ? `<button type="button" class="big-btn step-next" data-go-part="${stepIdx + 1}">
                <span>Next: ${esc(OBS_STEPS[stepIdx + 1][1].split('&')[0].trim())} →</span>
              </button>`
            : `<a class="big-btn step-next" href="#/debrief">
                <span>Log shift debrief →</span>
              </a>`}
        </div>
      `;
    }

    // Working notes block at the bottom of the step
    const notesBlock = `
      <div class="note-wrap">
        <div class="eyebrow-sm" style="margin-bottom:6px">Your working notes on this issue (pattern only, never a client)</div>
        <textarea class="note" data-note="${i.id}" placeholder="How this went when you met it; the phrasing that worked; what to check next time…">${esc(store.note(i.id))}</textarea>
      </div>
    `;

    stepBody.innerHTML = actTabsHtml + mainBlockHtml + notesBlock + footerHtml;
    docPane.scrollTop = 0;

    // Wire step navigation buttons
    stepBody.querySelectorAll('[data-go-part]').forEach(btn => {
      btn.onclick = () => navigatePart(btn.dataset.goPart);
    });

    // Wire depth switch buttons inside reader
    stepBody.querySelectorAll('[data-depth]').forEach(btn => {
      btn.onclick = () => {
        store.pref('depth', btn.dataset.depth);
        renderReaderContent();
        window.dispatchEvent(new CustomEvent('cards:depth-changed'));
      };
    });

    // Wire interactive checklists
    stepBody.querySelectorAll('[data-check]').forEach(btn => {
      btn.onclick = () => {
        const on = store.toggleCheck(i.id, btn.dataset.check);
        btn.classList.toggle('done', on);
        const box = btn.querySelector('.check-box');
        if (box) box.textContent = on ? '✓' : '○';
      };
    });

    // Wire 15-sec sketch input
    const sketchTa = stepBody.querySelector('#stepSketchInput');
    if (sketchTa) {
      sketchTa.addEventListener('input', () => store.stepSketch(i.id, sketchTa.value));
    }

    // Wire copy buttons
    stepBody.querySelectorAll('[data-copy-text]').forEach(btn => {
      btn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.copyText);
          toast({ msg: 'Copied to clipboard.', icon: '✓', timeout: 1800 });
        } catch {
          toast({ msg: 'Clipboard unavailable.', icon: '!', timeout: 2200 });
        }
      };
    });

    // Wire policy sheet badges
    stepBody.querySelectorAll('[data-open-policy]').forEach(btn => {
      btn.onclick = () => openPolicySheet(i, btn.dataset.openPolicy);
    });

    // Wire bidirectional prose ↔ diagram spotlighting
    stepBody.querySelectorAll('[data-spot-part]').forEach(card => {
      const sp = card.dataset.spotPart;
      card.addEventListener('pointerenter', () => diagram.spotlight(sp, true));
      card.addEventListener('pointerleave', () => diagram.spotlight(null, false));
    });

    // Wire working notes
    const noteTa = stepBody.querySelector('textarea.note');
    if (noteTa) noteTa.addEventListener('input', () => store.note(i.id, noteTa.value));

    // Mount highlighter
    const blocksEl = stepBody.querySelector('#readerBlocks');
    if (blocksEl) {
      mountHighlighter({
        sectionId: `${i.id}:${part}`,
        sectionTitle: `${i.title} · ${pi >= 0 && bd ? PARTS[pi][1] : part}`,
        blocksEl,
        toolbarEl: stepBody.querySelector('#hlBar')
      });
    } else {
      unmountHighlighter();
    }
  }

  renderTimeline();
  renderReaderContent();

  // Wire Policy Sheet button in diagram bar
  main.querySelector('#openPolicyDrawerBtn')?.addEventListener('click', () => openPolicySheet(i));

  // Wire desktop draggable split divider
  const splitEl = main.querySelector('#paneSplit');
  if (splitEl) {
    let dragging = false;
    splitEl.addEventListener('pointerdown', e => {
      dragging = true;
      readerEl.classList.add('split-moving');
      splitEl.setPointerCapture(e.pointerId);
    });
    splitEl.addEventListener('pointermove', e => {
      if (!dragging) return;
      const rect = readerEl.getBoundingClientRect();
      const pctLeft = Math.max(36, Math.min(66, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      readerEl.style.setProperty('--split-left', `${pctLeft}%`);
      store.pref('splitLeft', pctLeft);
    });
    const stopDrag = () => {
      dragging = false;
      readerEl.classList.remove('split-moving');
    };
    splitEl.addEventListener('pointerup', stopDrag);
    splitEl.addEventListener('pointercancel', stopDrag);
    splitEl.addEventListener('dblclick', () => {
      readerEl.style.setProperty('--split-left', '52%');
      store.pref('splitLeft', 52);
    });
  }

  // Wire Mobile Bottom Sheet Snap Controls & Touch Drag
  const gripEl = main.querySelector('#sheetGrip');
  if (gripEl) {
    const setSnap = pctVal => {
      readerEl.style.setProperty('--sheet', `${pctVal}%`);
      gripEl.querySelectorAll('[data-snap]').forEach(b => b.classList.toggle('on', +b.dataset.snap === pctVal));
    };
    gripEl.querySelectorAll('[data-snap]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        setSnap(+btn.dataset.snap);
      });
    });

    let startY = 0, startPct = 56, sheetDragging = false;
    gripEl.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      sheetDragging = true;
      startY = e.clientY;
      const cur = parseFloat(readerEl.style.getPropertyValue('--sheet') || '56');
      startPct = isNaN(cur) ? 56 : cur;
      readerEl.classList.add('sheet-moving');
      gripEl.setPointerCapture(e.pointerId);
    });
    gripEl.addEventListener('pointermove', e => {
      if (!sheetDragging) return;
      const dy = startY - e.clientY;
      const h = readerEl.getBoundingClientRect().height || window.innerHeight;
      const next = Math.max(26, Math.min(90, startPct + (dy / h) * 100));
      readerEl.style.setProperty('--sheet', `${Math.round(next)}%`);
    });
    const endSheetDrag = () => {
      if (!sheetDragging) return;
      sheetDragging = false;
      readerEl.classList.remove('sheet-moving');
      const cur = parseFloat(readerEl.style.getPropertyValue('--sheet') || '56');
      const snaps = [30, 56, 88];
      const nearest = snaps.reduce((a, b) => Math.abs(b - cur) < Math.abs(a - cur) ? b : a);
      setSnap(nearest);
    };
    gripEl.addEventListener('pointerup', endSheetDrag);
    gripEl.addEventListener('pointercancel', endSheetDrag);
  }

  // Keyboard navigation (← / → steps, P opens policy sheet)
  function onKey(ev) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target?.tagName) || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (!document.getElementById('palette')?.hidden) return;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      if (pi < 0) return;
      ev.preventDefault();
      const next = pi + (ev.key === 'ArrowRight' ? 1 : -1);
      if (next >= 0 && next < totalSteps) navigatePart(String(next));
    } else if (ev.key === 'p' || ev.key === 'P') {
      ev.preventDefault();
      openPolicySheet(i);
    }
  }
  document.addEventListener('keydown', onKey);

  // Listen for topbar depth switch or policy sheet button events
  const onTopbarDepth = () => renderReaderContent();
  const onTopbarPolicy = () => openPolicySheet(i);
  window.addEventListener('cards:topbar-depth', onTopbarDepth);
  window.addEventListener('cards:open-policy-sheet', onTopbarPolicy);

  activeReaderCleanup = () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('cards:topbar-depth', onTopbarDepth);
    window.removeEventListener('cards:open-policy-sheet', onTopbarPolicy);
    closePolicySheet();
  };
}

/* ═════════ Slide-Over Policy Sheet (Vitruvian System Sheet Pattern) ═════════ */
let sheetScrim = null;
export function closePolicySheet() {
  if (!sheetScrim) return;
  sheetScrim.remove();
  sheetScrim = null;
}

export function openPolicySheet(issue, focusPolicyId = null) {
  if (sheetScrim) {
    closePolicySheet();
    if (!focusPolicyId) return;
  }
  const bd = issue?.breakdown;
  const refs = (bd?.policyRefs || []).map(policyById).filter(Boolean);
  const related = issue ? relatedPolicy(issue, refs) : [];
  const mustKnow = data().rules.mustKnow;

  const scrim = document.createElement('div');
  scrim.className = 'sheet-scrim';
  scrim.innerHTML = `
    <aside class="sheet" role="dialog" aria-modal="true" aria-label="Policy sheet">
      <div class="sheet-head">
        <div>
          <div class="mono-label">Policy & Regulatory Sheet</div>
          <h2>${esc(issue ? issue.title : 'Must-Know Card Rules')}</h2>
        </div>
        <button type="button" class="modal-close" aria-label="Close Policy sheet">×</button>
      </div>
      <div class="sheet-body">
        <div class="narrowing-note">
          <b>Confirm in-system:</b> Statutory rules bind every Canadian issuer. Bank FAQ figures are policy and can change without notice.
        </div>
        ${refs.length ? `<div class="sd-block">
          <h3>Linked to this call (${refs.length})</h3>
          ${refs.map(p => `<div id="ps-${p.id}" class="${focusPolicyId === p.id ? 'ps-focused' : ''}">${policyCard(p)}</div>`).join('')}
        </div>` : ''}
        ${related.length ? `<div class="sd-block">
          <h3>Related bank pages for ${esc(issue.category)}</h3>
          ${related.map(policyCard).join('')}
        </div>` : ''}
        <div class="sd-block">
          <h3>10 Must-Know Statutory Figures</h3>
          ${mustKnow.map(r => policyCard(policyById(r.id))).join('')}
        </div>
      </div>
    </aside>
  `;

  scrim.querySelector('.modal-close').onclick = closePolicySheet;
  scrim.addEventListener('click', e => { if (e.target === scrim) closePolicySheet(); });
  document.body.appendChild(scrim);
  sheetScrim = scrim;
  requestAnimationFrame(() => {
    scrim.classList.add('open');
    if (focusPolicyId) {
      scrim.querySelector(`#ps-${focusPolicyId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });
}

function relatedPolicy(i, already) {
  const D = data();
  const have = new Set(already.map(p => p.id));
  const words = i.category.split(/[\s,]+/).filter(w => w.length > 3 && !/^(and|the|with|card|cards|use)$/i.test(w)).map(w => w.toLowerCase());
  return D.faq.items.filter(f => !have.has(f.id)).map(f => {
    const t = [f.question, f.section, ...(f.situations || []), ...(f.answer || []).slice(0, 1)].join(' ').toLowerCase();
    const score = words.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0);
    return [score, f];
  }).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]).slice(0, 5).map(([, f]) => policyById(f.id));
}

export { isStale };
