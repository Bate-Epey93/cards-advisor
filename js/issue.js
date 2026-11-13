// Issues home (Card issues) and the split-pane step reader with the call map,
// the steps bar, and the Policy for this issue sheet.
import { data, issueById, policyById, PARTS, DEPTHS, isStale } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';
import { mountHighlighter, unmountHighlighter } from './highlight.js';
import { verifyBadge, policyCard } from './policy.js';
import { renderMiniTopo, domainForCategory, mountCallDiagram, CALL_STEPS, TONE_VAR, PANELS, callSequence, stepForKey } from './diagram.js';
import { toast } from './toast.js';

const FREQ_RANK = { 'very common': 0, common: 1, occasional: 2 };
const EMOTIONS = ['angry', 'scared', 'embarrassed', 'confused', 'resigned', 'blindsided', 'anxious', 'humiliated'];

// The six call steps as the groups of a full guide. `parts` lists the numbered
// parts inside each step; steps 1, 4 and 5 hold a panel and no numbered part.
export const ACTS = CALL_STEPS.map(st => ({
  id: st.id, n: st.n, label: st.label, short: st.short, tone: st.tone, desc: st.desc,
  keys: st.full,
  parts: st.full.filter(k => /^\d+$/.test(k)).map(Number)
}));

// 4 steps for short guides. They sit in call steps 2 and 3; the tone follows the call step.
export const OBS_STEPS = [
  ['signal', 'What callers report', 'What clients say in public complaints and reviews', 'red', 'Reports'],
  ['underneath', 'What they need and feel', 'What they are trying to get back to, and what made it worse', 'red', 'Needs'],
  ['policy', 'Policy to check', 'Laws and bank pages for this kind of call', 'teal', 'Policy'],
  ['playbook', 'How to handle it', 'The steps for this call, plus your notes', 'teal', 'Handle it']
];

const PANEL_KEYS = Object.keys(PANELS);
const isPanelKey = k => PANEL_KEYS.includes(String(k));
const toneStyle = (tone, prop = 'background') => TONE_VAR[tone] ? ` style="${prop}:${TONE_VAR[tone]}"` : '';

// Title and hint of any screen in the call sequence, part or panel
function screenMeta(key, hasBd) {
  if (isPanelKey(key)) return { label: PANELS[key].label, hint: PANELS[key].hint };
  const row = (hasBd ? PARTS : OBS_STEPS)[+key];
  return row ? { label: row[1], hint: row[2] } : { label: String(key), hint: '' };
}

let filters = { q: '', cat: '', emo: '', chip: 'all' };
let catFromRoute = false;
let activeReaderCleanup = null;

export function cleanupIssueReader() {
  if (activeReaderCleanup) {
    activeReaderCleanup();
    activeReaderCleanup = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   HOME: CARD ISSUES
   ═══════════════════════════════════════════════════════════════════ */
export function bankView(main, cat) {
  cleanupIssueReader();
  document.body.classList.remove('reading');
  const D = data();
  if (cat !== undefined) {
    const nextCat = D.categories.includes(cat) ? cat : '';
    if (nextCat !== filters.cat) filters = { ...filters, cat: nextCat, chip: 'all' };
    catFromRoute = !!nextCat;
  } else if (catFromRoute) {
    filters = { ...filters, cat: '' };
    catFromRoute = false;
  }

  const flagships = D.issues.filter(i => i.breakdown);

  // Determine the "Continue / Up Next" flagship issue
  const recentIds = store.recent(10);
  let heroIssue = recentIds.map(issueById).find(i => i && i.breakdown && store.issuePct(i.id, 11) < 100)
    || flagships.find(i => store.issuePct(i.id, 11) < 100)
    || flagships[0];

  const heroProg = store.prog(heroIssue.id);
  const heroTotal = heroIssue.breakdown ? 11 : 4;
  const heroPct = store.issuePct(heroIssue.id, heroTotal);
  const heroDone = heroPct >= 100;
  const heroNextStep = !heroDone && typeof heroProg.pos === 'number' && heroProg.pos < heroTotal ? heroProg.pos : 0;
  const heroStepTitle = heroIssue.breakdown
    ? (PARTS[heroNextStep]?.[1] || PARTS[0][1])
    : OBS_STEPS[heroNextStep]?.[1] || OBS_STEPS[0][1];

  const completedFlagships = flagships.filter(i => store.issuePct(i.id, 11) >= 100).length;
  const streakCount = store.currentStreak ?? 0;

  main.innerHTML = `<section class="screen screen-active">
    <div class="screen-inner">
    <!-- Continue card -->
    <div class="home-top">
      <div class="home-card home-continue" data-domain="${domainForCategory(heroIssue.category)}">
        <div class="home-cont-text">
          <span class="eyebrow-sm">${heroDone ? 'Finished' : heroPct > 0 ? 'Pick up where you left off' : 'Start here'}</span>
          <h2 class="home-sys">${esc(heroIssue.title)}</h2>
          <div class="home-where">${heroPct > 0 ? `${heroIssue.breakdown ? 'Part' : 'Step'} ${heroNextStep + 1} of ${heroTotal}: ${esc(heroStepTitle)}` : `Step 1 of 6: ${esc(CALL_STEPS[0].label)}`}</div>
          <div class="bd-strata" aria-label="${(heroProg.read || []).length} of ${heroTotal} ${heroIssue.breakdown ? 'parts' : 'steps'} read">
            ${Array.from({ length: heroTotal }, (_, k) => `<span class="${(heroProg.read || []).includes(k) ? 'on' : ''}"></span>`).join('')}
          </div>
          <div class="row" style="gap:12px;margin-top:4px;align-items:center">
            <a class="big-btn" href="#/issue/${heroIssue.id}/${heroPct > 0 && !heroDone ? heroNextStep : 'r'}">
              <span>${heroDone ? 'Review' : heroPct > 0 ? 'Continue' : 'Start'}</span>
              <span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>
            </a>
            <a class="gbtn ghost home-practise-link" href="#/drill/${heroIssue.id}">Practise this call</a>
          </div>
          <p class="home-where dim">${completedFlagships} of ${flagships.length} full guides done${streakCount > 0 ? `, ${streakCount}-day streak` : ''}</p>
        </div>
        <div class="home-thumb-link" aria-hidden="true">
          ${renderMiniTopo(heroIssue)}
        </div>
      </div>
    </div>

    <!-- Library Hero & Search Bar -->
    <div class="lib-hero">
      <h1 class="title">Card issues</h1>
    </div>

    <div class="deconstruct-bar">
      <label class="db-field" for="bankQ">
        <svg class="ico db-ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4 4"/></svg>
        <input id="bankQ" type="search" placeholder="Search ${D.issues.length} card issues" value="${esc(filters.q)}" autocomplete="off" spellcheck="false">
        <button class="gbtn ghost" id="clearQBtn" ${filters.q ? '' : 'hidden'} type="button">Clear</button>
      </label>
    </div>

    <div class="lib-subbar">
      <div class="lib-filters" role="group" aria-label="Filter issues">
        ${[
          ['all', 'All'],
          ['progress', 'In progress'],
          ['done', 'Done']
        ].map(([k, label]) => `<button class="lib-fchip ${filters.chip === k ? 'on' : ''}" data-chip="${k}" type="button" aria-pressed="${filters.chip === k}">${label}</button>`).join('')}
      </div>
      <div class="row" style="gap:8px">
        <select id="bankCat" class="sel-pill" aria-label="Filter by category">
          <option value="">All categories</option>
          ${D.categories.map(c => `<option value="${esc(c)}"${filters.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}
        </select>
      </div>
      <details class="more-filters"${filters.emo || filters.chip === 'very-common' ? ' open' : ''}>
        <summary>More filters</summary>
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">
          <select id="bankEmo" class="sel-pill" aria-label="Filter by how the caller feels">
            <option value="">How the caller feels</option>
            ${EMOTIONS.map(e => `<option value="${e}"${filters.emo === e ? ' selected' : ''}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join('')}
          </select>
          <button class="lib-fchip ${filters.chip === 'very-common' ? 'on' : ''}" data-chip="very-common" type="button" aria-pressed="${filters.chip === 'very-common'}">Very common</button>
        </div>
      </details>
    </div>

    <div id="bankGridWrap"></div>

    <p class="fine">Not affiliated with any bank. Public sources only: confirm in your systems before quoting a client. Nothing you type leaves this device.</p>
  </div></section>`;

  const gridWrap = main.querySelector('#bankGridWrap');
  const qInput = main.querySelector('#bankQ');
  const clearBtn = main.querySelector('#clearQBtn');
  let qTimer = 0;

  function renderGrid() {
    const list = D.issues
      .filter(i => !filters.cat || i.category === filters.cat)
      .filter(i => !filters.emo || (i.emotion || '').toLowerCase().includes(filters.emo))
      .filter(i => {
        const total = i.breakdown ? 11 : 4;
        const pct = store.issuePct(i.id, total);
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
        <strong>No matches.</strong>
        <p>Try a broader word like lock, fraud, dispute or limit.</p>
        <button class="gbtn" id="resetFiltersBtn" style="margin-top:12px" type="button">Clear filters</button>
      </div>`;
      gridWrap.querySelector('#resetFiltersBtn')?.addEventListener('click', () => {
        filters = { q: '', cat: '', emo: '', chip: 'all' };
        qInput.value = '';
        clearBtn.hidden = true;
        main.querySelector('#bankCat').value = '';
        main.querySelector('#bankEmo').value = '';
        main.querySelectorAll('[data-chip]').forEach(b => { b.classList.toggle('on', b.dataset.chip === 'all'); b.setAttribute('aria-pressed', String(b.dataset.chip === 'all')); });
        catFromRoute = false;
        if (location.hash.startsWith('#/cat/')) history.replaceState(null, '', '#/');
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
      const essence = i.underlyingJob || i.breakdown?.underlyingJob || i.trainingPoint || '';

      return `<a class="bd-card" data-domain="${dom}" href="#/issue/${i.id}/${pct > 0 && pct < 100 ? nextStep : 'r'}">
        <div class="bd-top">
          <span class="chip dom-chip">${esc(i.category)}</span>
          ${i.frequency === 'very common' ? `<span class="chip freq-high">Very common</span>` : ''}
          ${pct >= 100 ? `<img class="enso-stamp card-stamp" src="assets/enso-complete.svg" alt="Done" title="All ${hasBd ? 'parts' : 'steps'} read">` : ''}
        </div>
        <div class="bd-name">${esc(i.title)}</div>
        ${essence ? `<div class="bd-essence">${esc(essence)}</div>` : ''}
        ${i.emotion ? `<div class="bd-meta dim">Caller feels ${esc(i.emotion.split(/[\s,(.;]/)[0])}</div>` : ''}
        ${pct > 0 ? `<div class="bd-strata" aria-hidden="true">
          ${Array.from({ length: total }, (_, k) => `<span class="${readSet.has(k) ? 'on' : ''}"></span>`).join('')}
        </div>` : ''}
        <div class="bd-foot">
          <span class="bd-last">${hasBd ? 'Six steps, 11 parts' : 'Six steps, short guide'}</span>
          ${pct > 0 ? `<span class="bd-pct">${readSet.size} of ${total}</span>` : ''}
        </div>
      </a>`;
    };

    let html = '';
    if (bdList.length) {
      html += `<div class="lib-section-head">
        <h2 class="lib-section-title">Full guides (${bdList.length})</h2>
      </div>
      <div class="card-grid">${bdList.map(renderCard).join('')}</div>`;
    }
    if (obsList.length) {
      html += `<div class="lib-section-head">
        <h2 class="lib-section-title">Short guides (${obsList.length})</h2>
      </div>
      <div class="card-grid">${obsList.map(renderCard).join('')}</div>`;
    }
    gridWrap.innerHTML = html;
  }

  renderGrid();

  qInput.addEventListener('input', e => {
    filters.q = e.target.value.trim().toLowerCase();
    clearBtn.hidden = !filters.q;
    clearTimeout(qTimer);
    qTimer = setTimeout(renderGrid, 120);
  });
  clearBtn.addEventListener('click', () => {
    filters.q = '';
    qInput.value = '';
    clearBtn.hidden = true;
    clearTimeout(qTimer);
    renderGrid();
    qInput.focus();
  });
  main.querySelector('#bankCat').onchange = e => {
    filters.cat = e.target.value;
    const onCatRoute = location.hash.startsWith('#/cat/');
    // On a #/cat/ route the hash follows the select, so the category stays route-supplied
    catFromRoute = onCatRoute && !!filters.cat;
    if (onCatRoute) history.replaceState(null, '', filters.cat ? '#/cat/' + encodeURIComponent(filters.cat) : '#/');
    renderGrid();
  };
  main.querySelector('#bankEmo').onchange = e => { filters.emo = e.target.value; renderGrid(); };
  main.querySelectorAll('[data-chip]').forEach(b => {
    b.onclick = () => {
      filters.chip = b.dataset.chip;
      main.querySelectorAll('[data-chip]').forEach(x => { x.classList.toggle('on', x.dataset.chip === filters.chip); x.setAttribute('aria-pressed', String(x.dataset.chip === filters.chip)); });
      renderGrid();
    };
  });
}

/* ═══════════════════════════════════════════════════════════════════
   STEP READER
   ═══════════════════════════════════════════════════════════════════ */
function para(v) {
  return String(v || '').split('\n\n').filter(Boolean).map(p => `<p>${md(p)}</p>`).join('');
}

// The needs behind step 4 ("What they fear losing")
function parsePsychNeeds(text = '') {
  const needs = [
    { key: 'control', label: 'Control', icon: '⌖' },
    { key: 'fairness', label: 'Fairness', icon: '⚖' },
    { key: 'competence', label: 'Dignity', icon: '◈' },
    { key: 'safety', label: 'Safety', icon: '🛡' },
    { key: 'believed', label: 'Being believed', icon: '✓' }
  ];
  const lower = text.toLowerCase();
  return needs.map(n => ({
    ...n,
    active: lower.includes(n.key) || (n.key === 'competence' && lower.includes('dignity'))
  }));
}

function needChips(pills, style = '') {
  const on = pills.filter(p => p.active);
  if (!on.length) return '';
  return `<div class="psych-grid"${style ? ` style="${style}"` : ''}>
    ${on.map(p => `<div class="psych-pill on">
      <span class="psych-ico" aria-hidden="true">${p.icon}</span>
      <span>${esc(p.label)}</span>
    </div>`).join('')}
  </div>`;
}

function renderBreakdownPart(issue, bd, pi) {
  const [key] = PARTS[pi];
  const val = bd[key];
  if (val == null) return '';

  // Step 1: What they say, plus real quotes
  if (key === 'surfaceRequest') {
    const quotes = (issue.quotes || []).slice(0, 3);
    return `
      <div class="problem-card spot-card" data-spot-part="0">
        <blockquote class="step-quote">${md(val)}</blockquote>
      </div>
      ${quotes.length ? `<div class="sd-block">
        <h3>What callers said (${issue.quotes.length})</h3>
        <div class="sd-list">
          ${quotes.map(q => `<div class="sd-item">
            <div>${md(q.text)} ${q.url ? `<a href="${esc(q.url)}" target="_blank" rel="noopener" class="mono-link">Source ↗</a>` : ''}</div>
          </div>`).join('')}
        </div>
      </div>` : ''}
    `;
  }

  // Step 2: What they need
  if (key === 'underlyingJob') {
    return `
      <div class="model-card spot-card" data-spot-part="1">
        ${para(val)}
      </div>
      ${issue.resolutionSeen ? `<div class="tradeoff-band">
        <div><strong>What usually goes wrong:</strong> ${md(issue.resolutionSeen)}</div>
      </div>` : ''}
    `;
  }

  // Step 3: How they feel
  if (key === 'emotionalRead') {
    return `
      <div class="problem-card spot-card" data-spot-part="2">
        ${para(val)}
      </div>
    `;
  }

  // Step 4: What they fear losing
  if (key === 'psychologicalNeeds') {
    const chips = needChips(parsePsychNeeds(val));
    return `
      <div class="model-card spot-card" data-spot-part="3">
        ${chips}
        <div${chips ? ' style="margin-top:14px"' : ''}>${para(val)}</div>
      </div>
    `;
  }

  // Step 5: Risk checks
  if (key === 'riskFlags') {
    const flags = Array.isArray(val) ? val : [val];
    return `
      <div class="problem-card spot-card" data-spot-part="4">
        <div class="flag-checklist">
          ${flags.map((f, idx) => {
            const cKey = `flag-${ idx }`;
            const on = store.isChecked(issue.id, cKey);
            return `<button type="button" class="check-card ${on ? 'done' : ''}" data-check="${cKey}">
              <span class="check-box">${on ? '✓' : '○'}</span>
              <span class="check-text">${md(f)}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Step 6: First 15 seconds (with an optional try-it-first box)
  if (key === 'engage') {
    const sketch = store.stepSketch(issue.id);
    return `
      <details class="deeper move-gate" ${sketch ? 'open' : ''}>
        <summary>✎ Try your own first 15 seconds <span class="move-opt">(optional)</span></summary>
        <div class="deeper-body">
          <p class="move-prompt">Before you read the model line, how would you show you heard this caller and say how long the next step will take, in one breath?</p>
          <textarea class="move-sketch" id="stepSketchInput" rows="3" placeholder="What you would say in the first 15 seconds">${esc(sketch)}</textarea>
        </div>
      </details>
      <div class="solution-card spot-card" data-spot-part="5">
        <div class="engage-script">${para(val)}</div>
        <div class="row" style="margin-top:12px;justify-content:flex-end">
          <button type="button" class="gbtn" data-copy-text="${esc(val)}">Copy</button>
        </div>
      </div>
    `;
  }

  // Step 7: Questions to ask
  if (key === 'diagnose') {
    const qs = Array.isArray(val) ? val : [val];
    return `
      <div class="model-card spot-card" data-spot-part="6">
        <ol class="diag-steps">
          ${qs.map((q, i) => `<li>
            <span class="diag-num">${i + 1}</span>
            <div class="diag-body">${md(q)}</div>
          </li>`).join('')}
        </ol>
      </div>
    `;
  }

  // Step 8: Options
  if (key === 'resolve') {
    const refs = (bd.policyRefs || []).map(policyById).filter(Boolean);
    return `
      <div class="solution-card spot-card" data-spot-part="7">
        ${para(val)}
      </div>
      ${refs.length ? `<div class="defends-row defends-full">
        <span class="mono-label">Sources (${refs.length})</span>
        <div class="row" style="gap:6px;flex-wrap:wrap">
          ${refs.map(p => {
            const t = p.kind === 'rule' ? `${p.figure} (${String(p.source || '').split(';')[0]})` : String(p.question || p.title || p.id);
            const label = p.kind !== 'rule' && t.length > 38 ? t.slice(0, 38).trimEnd() + '…' : t;
            return `<button type="button" class="inv-badge inv-tap" data-open-policy="${p.id}" title="Open in policy for this issue">${esc(label)}</button>`;
          }).join('')}
        </div>
      </div>` : ''}
    `;
  }

  // Step 9: Say this, not this
  if (key === 'sayThisNotThis') {
    const pairs = Array.isArray(val) ? val : [];
    return `
      <div class="spot-card" data-spot-part="8">
        ${pairs.map(s => `<div class="b-ge">
          <div class="g"><b>✓ Say</b> <div>${md(s.say)}</div> <button type="button" class="copy-inline" data-copy-text="${esc(s.say)}">Copy</button></div>
          <div class="b"><b>✗ Don't say</b> <div>${md(s.not)}</div></div>
          <div class="w"><strong>Why:</strong> ${md(s.why)}</div>
        </div>`).join('')}
      </div>
    `;
  }

  // Step 10: After the call (tap-through checklist)
  if (key === 'afterCall') {
    const clauses = String(val).split(/[.;]\s+/).map(s => s.trim()).filter(Boolean);
    return `
      <div class="sd-block" data-spot-part="9">
        <h3>Before you close the file</h3>
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

  // Step 11: Flag the cause
  if (key === 'preventAndFeedBack') {
    return `
      <div class="dev-box spot-card" data-spot-part="10">
        ${para(val)}
      </div>
    `;
  }

  return para(val);
}

// The 4 steps of a short guide
function renderObservedStep(issue, stepIdx) {
  const related = relatedPolicy(issue, []);
  const rules = data().rules.mustKnow.slice(0, 3);

  if (stepIdx === 0) {
    return `
      <div class="problem-card spot-card" data-spot-part="0">
        <div class="pc-label">How often callers raise this: ${esc(issue.frequency)}</div>
        <p>${md(issue.frequencyEvidence || 'Documented across public consumer complaints and cardholder reviews.')}</p>
      </div>
      <div class="sd-block">
        <h3>What callers said</h3>
        ${(issue.quotes || []).length
          ? issue.quotes.map(q => `<div class="b-quote">${md(q.text)}<cite>${q.url ? `<a href="${esc(q.url)}" target="_blank" rel="noopener">Source ↗</a>` : ''}${q.snippetOnly ? ' (search snippet only)' : ''}</cite></div>`).join('')
          : `<p class="dim">No quotes were saved for this issue. The pattern comes from the frequency note above.</p>`}
      </div>
    `;
  }

  if (stepIdx === 1) {
    const chips = needChips(parsePsychNeeds((issue.emotion || '') + ' ' + (issue.underlyingJob || '')), 'margin:14px 0');
    return `
      <div class="model-card spot-card" data-spot-part="1">
        <div class="mc-kick">What they need</div>
        <div class="mc-name">${esc(issue.underlyingJob || 'Resolve the card issue and restore certainty')}</div>
        ${issue.emotion ? `<p style="margin-top:8px"><strong>How they feel:</strong> ${md(issue.emotion)}</p>` : ''}
      </div>
      ${chips}
      ${issue.resolutionSeen ? `<div class="problem-card">
        <div class="pc-label">What made it worse</div>
        ${para(issue.resolutionSeen)}
      </div>` : ''}
      ${issue.posterClaims ? `<div class="scale-band">
        <div class="sb-label">What posters claimed (claims, not policy facts)</div>
        ${para(issue.posterClaims)}
      </div>` : ''}
    `;
  }

  if (stepIdx === 2) {
    return `
      <div class="solution-card spot-card" data-spot-part="2">
        <div class="sc-label">What applies here</div>
        <p>${issue.verifiedContext ? md(issue.verifiedContext) : `Always verify figures in your systems before quoting. Below are the closest bank pages and rules set by law for <strong>${esc(issue.category)}</strong>.`}</p>
      </div>
      ${related.length ? `<div class="sd-block"><h3>Related bank pages (${related.length})</h3>${related.map(policyCard).join('')}</div>` : ''}
      <div class="sd-block"><h3>Key figures</h3><p class="dim">Set by law or card network rules</p>${rules.map(r => policyCard(policyById(r.id))).join('')}</div>
    `;
  }

  // stepIdx === 3: How to handle it
  return `
    <div class="solution-card spot-card" data-spot-part="3">
      <div class="sc-label">How to handle the call</div>
      ${issue.trainingPoint ? para(issue.trainingPoint) : `<p>Use these 3 steps for <strong>${esc(issue.title)}</strong>:</p>`}
      <ol class="diag-steps" style="margin-top:12px">
        <li><span class="diag-num">1</span><div class="diag-body"><strong>First 15 seconds:</strong> Name the exact problem (${esc(issue.underlyingJob || issue.title)}) and say how long your check will take, so the caller knows they will not be passed around.</div></li>
        <li><span class="diag-num">2</span><div class="diag-body"><strong>Check for risk:</strong> is it an unauthorised charge or a merchant dispute, is the client vulnerable, is the complaint clock running?</div></li>
        <li><span class="diag-num">3</span><div class="diag-body"><strong>Fix it now and confirm in writing:</strong> give the realistic timeline and a reference number before you end the call.</div></li>
      </ol>
    </div>
  `;
}

/* ═════════ The four panels of the call: r, c, a, m ═════════
   Full guides carry authored content (callReady, callCheckpoint, callAdvice,
   callClose). Any guide without a field gets a general version built from the
   issue's own fields, so every panel renders for every issue. */
const asList = v => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v])
  .filter(x => typeof x === 'string' && x.trim());
const lowerFirst = s => String(s || '').replace(/^[A-Z](?![A-Z])/, c => c.toLowerCase()).replace(/[.\s]+$/, '');

function callContent(issue) {
  const bd = issue.breakdown || {};
  const job = issue.underlyingJob || bd.underlyingJob || '';
  const feel = issue.emotion || '';

  const rd = bd.callReady && typeof bd.callReady === 'object' && !Array.isArray(bd.callReady) ? bd.callReady : { open: bd.callReady };
  const cp = bd.callCheckpoint && typeof bd.callCheckpoint === 'object' && !Array.isArray(bd.callCheckpoint) ? bd.callCheckpoint : { lines: bd.callCheckpoint };
  const ad = bd.callAdvice && typeof bd.callAdvice === 'object' ? bd.callAdvice : {};
  const cl = bd.callClose && typeof bd.callClose === 'object' && !Array.isArray(bd.callClose) ? bd.callClose : { lines: bd.callClose };

  const or = (list, fallback) => (list.length ? list : fallback);

  return {
    authored: !!(bd.callReady || bd.callCheckpoint || bd.callAdvice || bd.callClose),
    ready: {
      open: or(asList(rd.open), [
        'The client profile, so you can verify before you say anything about the account',
        'The card in question: its status, any lock or restriction, and the last few transactions',
        `The policy pages for ${issue.category || 'this kind of call'} (Policy for this issue, below)`,
        'Notes from earlier contacts, so they do not have to tell it twice'
      ]),
      know: or(asList(rd.know), [
        job ? `What they are usually trying to do: ${lowerFirst(job)}.` : '',
        feel ? `How they tend to sound: ${lowerFirst(feel)}.` : '',
        'Verification protects the client. Say it that way: "Before I open the account I am going to confirm it is you, so nobody else can do this in your name."'
      ].filter(Boolean))
    },
    checkpoint: {
      confirm: or(asList(cp.confirm), [
        'Say back what you did in one plain sentence',
        'Where you can, test it while they are on the line, or tell them exactly how they will see that it worked',
        'Ask, then wait. Let them say it is sorted in their own words',
        'If they hesitate, go back to Solve. Do not move on to advice with the first problem still open'
      ]),
      lines: or(asList(cp.lines), [
        '"Before I move on: is the thing you called about sorted from your side?"',
        '"Is there anything about it that is still worrying you?"'
      ])
    },
    advice: {
      ask: or(asList(ad.ask), [
        '"Is the mobile number we have for you the one you carry?"',
        '"Has this happened before, or is this the first time?"',
        '"Is there anything coming up, like a trip or a large purchase, that this card needs to work for?"'
      ]),
      options: (Array.isArray(ad.options) ? ad.options.filter(o => o && typeof o.do === 'string' && o.do.trim()) : []).length
        ? ad.options.filter(o => o && typeof o.do === 'string' && o.do.trim())
        : [
          { do: 'Keep the contact details current', why: 'Alerts and codes reach them, so a question about a purchase is one reply and not a declined card. The trade-off: it has to be updated again whenever the number changes.' },
          { do: 'Add the card to their phone wallet', why: 'A backup if the plastic is declined, lost or late. The trade-off: it only helps where tap is accepted.' },
          { do: 'Show where the lock is in the app', why: 'Instant if the card is misplaced. The trade-off: a lock is not a report, so a lost or stolen card still needs a call.' }
        ],
      notNow: (typeof ad.notNow === 'string' && ad.notNow.trim()) ||
        'Limit increases, balance protection or any other product while they are upset or in a fraud claim.'
    },
    close: {
      recap: or(asList(cl.recap), [
        'What was done on this call, in one sentence',
        'What happens next, who does it, and by when',
        'The reference or confirmation they can quote',
        'What to do, and which number to use, if it does not go as said'
      ]),
      lines: or(asList(cl.lines), [
        '"To recap: [what was done]. Next, [what happens and by when]. Your reference is [reference]."',
        '"Is there anything else I can help you with today?"',
        '"Thank you for your patience today. Take care."'
      ])
    }
  };
}

// Every step is dual: what it means for me, and what the client experiences.
function dualStrip(st) {
  if (!st) return '';
  return `<div class="scale-band step-dual">
    <div class="sb-label">Step ${st.n} of 6: ${esc(st.label)}</div>
    <p style="margin:0 0 6px"><strong>For me:</strong> ${esc(st.me)}</p>
    <p style="margin:0"><strong>For the client:</strong> ${esc(st.client)}</p>
  </div>`;
}

function sayLines(lines, label, spotKey) {
  if (!lines.length) return '';
  return `<div class="solution-card spot-card" data-spot-part="${spotKey}">
    <div class="sc-label">${esc(label)}</div>
    ${lines.map(l => `<div style="display:flex;align-items:flex-start;gap:10px;margin:10px 0 0">
      <blockquote class="step-quote" style="flex:1 1 auto;min-width:0;margin:0">${md(l)}</blockquote>
      <button type="button" class="gbtn" style="flex:0 0 auto" data-copy-text="${esc(l)}">Copy</button>
    </div>`).join('')}
  </div>`;
}

function plainList(items, heading) {
  if (!items.length) return '';
  return `<div class="sd-block">
    <h3>${esc(heading)}</h3>
    <div class="sd-list">${items.map(t => `<div class="sd-item">${md(t)}</div>`).join('')}</div>
  </div>`;
}

function renderCallPanel(issue, key) {
  const C = callContent(issue);
  const general = C.authored ? '' : `<p class="dim" style="font-size:13px;margin:10px 0 0">General version, built from what callers report about this issue. Adjust it to the call in front of you.</p>`;

  if (key === 'r') {
    return `
      <div class="model-card spot-card" data-spot-part="r">
        <div class="mc-kick">Have open</div>
        <div class="flag-checklist">
          ${C.ready.open.map((t, idx) => {
            const cKey = `ready-${idx}`;
            const on = store.isChecked(issue.id, cKey);
            return `<button type="button" class="check-card ${on ? 'done' : ''}" data-check="${cKey}">
              <span class="check-box">${on ? '✓' : '○'}</span>
              <span class="check-text">${md(t)}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="row" style="margin-top:12px;justify-content:flex-end">
          <button type="button" class="gbtn" data-open-policy="">Policy for this issue</button>
        </div>
      </div>
      ${plainList(C.ready.know, 'Know before you pick up')}
      ${general}
    `;
  }

  if (key === 'c') {
    return `
      ${plainList(C.checkpoint.confirm, 'How to confirm it is sorted')}
      ${sayLines(C.checkpoint.lines, 'Ask it out loud, then wait for the answer', 'c')}
      ${general}
    `;
  }

  if (key === 'a') {
    return `
      <div class="model-card spot-card" data-spot-part="a">
        <div class="mc-kick">Ask</div>
        ${C.advice.ask.map(q => `<blockquote class="step-quote" style="margin:8px 0 0">${md(q)}</blockquote>`).join('')}
      </div>
      <div class="sd-block">
        <h3>Advise: give options, they choose</h3>
        <div class="sd-list">
          ${C.advice.options.map(o => `<div class="sd-item"><strong>${md(String(o.do).replace(/[.\s]+$/, ''))}.</strong> ${md(o.why || '')}</div>`).join('')}
        </div>
      </div>
      <div class="problem-card">
        <div class="pc-label">Not on this call</div>
        <p style="margin:0">${md(C.advice.notNow)}</p>
        <p class="dim" style="font-size:13px;margin:8px 0 0">Advice starts from a need the client has told you about. A product is offered only when it fits that need, and only with their clear yes (Bank Act s. 627.06 and the express consent rule). Confirm in your systems.</p>
      </div>
      ${general}
    `;
  }

  // key === 'm'
  return `
    ${plainList(C.close.recap, 'Recap before you close')}
    ${sayLines(C.close.lines, 'Closing lines', 'm')}
    ${general}
  `;
}

export function issueView(main, id, partArg) {
  cleanupIssueReader();
  const D = data();
  const i = issueById(id);
  if (!i) {
    document.body.classList.remove('reading');
    main.innerHTML = `<div class="screen-inner"><div class="empty-panel">No such issue. <a href="#/">Back to issues</a></div></div>`;
    return;
  }

  document.body.classList.add('reading');
  store.touchSeen(i.id);
  store.touchStreak();

  const bd = i.breakdown;
  const totalSteps = bd ? 11 : 4;
  const onePage = !!store.pref('onePage');
  const depth = store.pref('depth') || 'agent';

  // The guide in call order: panels and parts on the six steps
  const hasBd = !!bd;
  const seq = callSequence(hasBd);
  const seqIndex = key => seq.findIndex(s => s.key === String(key));
  const markSeen = key => { if (!store.isChecked(i.id, `seen-${key}`)) store.toggleCheck(i.id, `seen-${key}`); };

  // Determine current part: '0'..'10' (or '0'..'3' for observed), a panel 'r' 'c' 'a' 'm', 'all', 'o', 'p'
  const savedProg = store.prog(i.id);
  const savedPos = savedProg.pos;
  const started = (savedProg.read || []).length > 0;
  if (partArg !== undefined && !/^(\d+|all|o|p|r|c|a|m)$/.test(String(partArg))) partArg = undefined;
  // A guide nobody has started opens on step 1, Be Ready
  let part = partArg !== undefined ? String(partArg) : (onePage && bd ? 'all' : started ? String(savedPos ?? 0) : 'r');
  if (!bd && (part === 'all' || (+part >= 4))) part = '0';

  const isNumeric = /^\d+$/.test(part);
  const pi = isNumeric ? Math.min(totalSteps - 1, Math.max(0, +part)) : -1;
  if (pi >= 0) {
    part = String(pi);
    store.markStep(i.id, pi, totalSteps);
  } else if (isPanelKey(part)) {
    markSeen(part);
  }

  const prog = store.prog(i.id);
  const readSet = new Set(prog.read || []);
  const pct = store.issuePct(i.id, totalSteps);
  const splitLeft = store.pref('splitLeft') || 52;
  const sheetSnap = [30, 56, 88].includes(+store.pref('sheetSnap')) ? +store.pref('sheetSnap') : 56;

  // Build Reader DOM (Split-pane on desktop, interactive diagram + bottom sheet on mobile)
  main.innerHTML = `<div class="reader" id="issueReader" style="--split-left:${splitLeft}%;--sheet:${sheetSnap}%" data-domain="${domainForCategory(i.category)}">
    <!-- Left / upper pane: call map and steps bar -->
    <div class="diagram-pane" id="diagramPane">
      <div class="dg-legend" id="dgLegend">
        <button class="dgl-tog" id="dgLegendTog" type="button" aria-expanded="false" aria-controls="dgLegendItems">
          <span class="dgl-tog-dots" aria-hidden="true">${CALL_STEPS.map(st => `<i class="tone-${st.tone}"${toneStyle(st.tone)}></i>`).join('')}</span>
          <span class="dgl-tog-lbl">Six steps</span>
          <svg class="dgl-chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5"/></svg>
        </button>
        <span class="dgl-items" id="dgLegendItems">
          ${CALL_STEPS.map(st => `<span class="dgl-item"><i class="dgl-dot tone-${st.tone}"${toneStyle(st.tone)}></i>${st.n} ${esc(st.label)}</span>`).join('')}
        </span>
        <span class="dgl-note">Tap a box to open that part of the call</span>
      </div>

      <div class="diagram-scroll" id="diagramScroll"></div>

      <!-- Steps bar -->
      <div class="scrub-wrap timeline" id="timelineScrub"></div>

      <div class="diagram-cap">
        <span class="diagram-cap-state" id="diagramCapState"></span>
        <div class="cap-tools">
          <div class="dg-zoom">
            <button class="zbtn" data-zoom="out" title="Zoom out" aria-label="Zoom out">−</button>
            <button class="zbtn zfit on" data-zoom="fit" title="Fit to screen">Fit</button>
            <button class="zbtn" data-zoom="in" title="Zoom in" aria-label="Zoom in">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Resizable Split Divider -->
    <div class="pane-split" id="paneSplit" role="separator" tabindex="0" aria-label="Resize map and reading pane" aria-orientation="vertical" aria-valuemin="36" aria-valuemax="66" aria-valuenow="${splitLeft}">
      <div class="pane-split-bar"></div>
    </div>

    <!-- Right / Mobile Bottom Sheet: Step-by-Step Prose Reader -->
    <div class="doc-sheet" id="docSheet">
      <div class="sheet-grip-row" id="sheetGrip">
        <div class="sheet-grip-bar"></div>
        <div class="sheet-snap-pills" role="group" aria-label="Reading sheet size">
          <button type="button" data-snap="30" ${sheetSnap === 30 ? 'class="on"' : ''}>Map</button>
          <button type="button" data-snap="56" ${sheetSnap === 56 ? 'class="on"' : ''}>Split</button>
          <button type="button" data-snap="88" ${sheetSnap === 88 ? 'class="on"' : ''}>Read</button>
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

  // Toggle the phone legend
  const dgLegend = main.querySelector('#dgLegend');
  const dgTog = main.querySelector('#dgLegendTog');
  dgTog?.addEventListener('click', e => {
    e.stopPropagation();
    const open = dgLegend.classList.toggle('open');
    dgTog.setAttribute('aria-expanded', String(open));
  });

  // Mount the call map
  const diagram = mountCallDiagram(diagramPane, i, {
    part,
    onSelectPart(t) {
      if (t === 'p') openPolicySheet(i);
      else navigatePart(t);
    }
  });

  function navigatePart(nextPart) {
    const targetHash = `#/issue/${i.id}/${nextPart}`;
    if (location.hash === targetHash) {
      part = String(nextPart);
      if (/^\d+$/.test(part)) store.markStep(i.id, +part, totalSteps);
      else if (isPanelKey(part)) markSeen(part);
      renderReaderContent();
      diagram.setPart(part);
      renderTimeline();
    } else {
      location.hash = targetHash;
    }
  }

  // Steps bar with hover popover
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
        (dotTone ? `<span class="tl-microdots"><span class="tl-dot ${state === 'done' || state === 'on' ? 'done' : ''} tone-${dotTone}"${toneStyle(dotTone)}></span></span>` : '');

      btn.addEventListener('pointerenter', () => {
        pop.querySelector('.tl-pop-layer').textContent = groupLabel;
        pop.querySelector('.tl-pop-delta').textContent = state === 'done' ? 'Done' : state === 'on' ? 'You are here' : '';
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

    // One segment per screen, in call order. The code is the call step, plus a
    // letter when the step holds more than one screen (2a, 2b, ...).
    seq.forEach(({ key, step, code }) => {
      const { label, hint } = screenMeta(key, hasBd);
      const isCur = key === part;
      const isDone = isPanelKey(key) ? store.isChecked(i.id, `seen-${key}`) : curRead.has(+key);
      const state = isCur ? 'on' : isDone ? 'done' : 'todo';
      addSeg(key, isCur ? `${code}. ${label}` : code, state, `${code}. ${label}`, hint, `Step ${step.n} of 6: ${step.label}`, step.tone);
    });
    if (bd) {
      addSeg('all', 'Whole call', part === 'all' ? 'on' : 'todo', 'The whole call', 'Every step on one page, in call order', '', null);
      addSeg('o', 'Quotes', part === 'o' ? 'on' : 'todo', 'What callers report', `${(i.quotes || []).length} quotes from public complaints`, '', null);
    }
    const cur = row.querySelector('[aria-current]');
    if (cur) {
      const c = cur.getBoundingClientRect(), r = row.getBoundingClientRect();
      row.scrollLeft = Math.max(0, row.scrollLeft + (c.left + c.width / 2) - (r.left + r.width / 2));
    }
  }

  function renderReaderContent() {
    const curProg = store.prog(i.id);
    const curDepth = store.pref('depth') || 'agent';
    const stamp = `<img class="enso-stamp stamped" src="assets/enso-complete.svg" alt="Done" title="All steps done">`;

    // Where we are in the call: the screen, its step, and its neighbours
    const curIdx = seqIndex(part);
    const curItem = curIdx >= 0 ? seq[curIdx] : null;
    const curStep = curItem ? curItem.step : null;
    const numPi = /^\d+$/.test(part) ? +part : -1;
    const stepKeys = st => (hasBd ? st.full : st.brief);
    const keyDone = k => isPanelKey(k) ? store.isChecked(i.id, `seen-${k}`) : (curProg.read || []).includes(+k);

    // Context line (issue name and position) plus the six step tabs
    const pos = curStep
      ? `Step ${curStep.n} of 6${stepKeys(curStep).length > 1 ? `, ${stepKeys(curStep).indexOf(part) + 1} of ${stepKeys(curStep).length}` : ''}`
      : part === 'all' ? 'Whole call' : '';
    const actTabsHtml = `
      <div class="step-head">
        <div class="step-where">
          <span class="step-issue">${esc(i.title)}</span>${pos ? `<span class="dim">${pos}</span>` : ''}
        </div>
        <div class="step-tabs" role="tablist" aria-label="The six steps of the call">
          ${CALL_STEPS.map(st => {
            const isOn = curStep?.id === st.id;
            const allDone = stepKeys(st).every(keyDone);
            return `<button type="button" role="tab" class="step-tab tone-${st.tone} ${isOn ? 'on' : allDone ? 'past' : ''}" data-go-part="${stepKeys(st)[0]}" aria-selected="${isOn}" title="${st.n} ${esc(st.label)}" aria-label="Step ${st.n}: ${esc(st.label)}">${esc(st.short)}</button>`;
          }).join('')}
          ${bd ? `<button type="button" role="tab" class="step-tab ${part === 'all' ? 'on' : ''}" data-go-part="all" aria-selected="${part === 'all'}" title="The whole call on one page">All</button>` : ''}
        </div>
      </div>
    `;

    // Detail-level notes for full guides, closed by default, below the content
    const depthMeta = DEPTHS.find(d => d[0] === curDepth) || DEPTHS[0];
    const depthBanner = bd && bd.depths?.[curDepth] ? `
      <details class="depth-banner depth-${curDepth}">
        <summary>${esc(depthMeta[1])} notes</summary>
        <div class="depth-mini-pills" role="group" aria-label="Detail level">
          ${DEPTHS.map(([k, l]) => `<button type="button" class="${curDepth === k ? 'on' : ''}" data-depth="${k}" aria-pressed="${curDepth === k}">${esc(l)}</button>`).join('')}
        </div>
        <p>${md(bd.depths[curDepth])}</p>
      </details>
    ` : '';

    const arrow = `<span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>`;
    let mainBlockHtml = '';
    let footerHtml = '';

    // Back and Next walk the call in six-step order, through panels and parts
    const walkFooter = () => {
      const prev = curIdx > 0 ? seq[curIdx - 1] : null;
      const next = curIdx < seq.length - 1 ? seq[curIdx + 1] : null;
      const lastHref = bd ? `#/drill/${i.id}` : '#/debrief';
      const lastLabel = bd ? 'Practise this call (3 min)' : 'Write shift debrief';
      return `
        <div class="step-foot">
          ${prev
            ? `<button type="button" class="gbtn ghost step-back" data-go-part="${prev.key}" title="Keyboard: ← and →">← Back</button>`
            : `<a class="gbtn ghost step-back" href="#/">← Issues</a>`}
          ${next
            ? `<button type="button" class="big-btn step-next" data-go-part="${next.key}" title="Keyboard: ← and →">
                <span>${esc(`Next: ${screenMeta(next.key, hasBd).label}`)}</span>
                ${arrow}
              </button>`
            : `<a class="big-btn step-next" href="${lastHref}">
                <span>${esc(lastLabel)}</span>
                ${arrow}
              </a>`}
        </div>
      `;
    };
    // The first screen of each step opens with what the step means for me and for the client
    const dualIfFirst = () => (curStep && stepKeys(curStep)[0] === part ? dualStrip(curStep) : '');

    if (bd && numPi >= 0) {
      const [key, label, hint] = PARTS[numPi];
      const isComplete = store.issuePct(i.id, 11) >= 100;

      mainBlockHtml = `
        <h1 class="step-title">
          ${esc(label)}
          ${isComplete ? stamp : ''}
        </h1>
        <p class="step-subtitle">${esc(hint)}</p>
        <div class="hl-bar" id="hlBar"></div>
        <div class="blocks" id="readerBlocks">
          ${dualIfFirst()}
          ${renderBreakdownPart(i, bd, numPi)}
        </div>
        ${depthBanner}
      `;
      footerHtml = walkFooter();
    } else if (isPanelKey(part)) {
      const { label, hint } = PANELS[part];
      mainBlockHtml = `
        <h1 class="step-title">${esc(label)}</h1>
        <p class="step-subtitle">${esc(hint)}</p>
        <div class="hl-bar" id="hlBar"></div>
        <div class="blocks" id="readerBlocks">
          ${dualIfFirst()}
          ${renderCallPanel(i, part)}
        </div>
      `;
      footerHtml = walkFooter();
    } else if (bd && part === 'all') {
      // Viewing the whole call counts as reading all 11 parts and opening the four panels
      for (let k = 0; k < 11; k++) store.markStep(i.id, k, 11);
      PANEL_KEYS.forEach(markSeen);
      mainBlockHtml = `
        <h1 class="step-title">${esc(i.title)} ${stamp}</h1>
        <p class="step-subtitle">The whole call on one page, in the order you run it.</p>
        <div class="hl-bar" id="hlBar"></div>
        <div class="blocks" id="readerBlocks">
          ${CALL_STEPS.map(st => `
            ${dualStrip(st)}
            ${stepKeys(st).map(k => {
              const item = seq[seqIndex(k)];
              const meta = screenMeta(k, true);
              return `
                <section class="all-part-sec" data-spot-part="${k}">
                  <div class="b-h"><span class="part-pill">${esc(item.code)}</span> ${esc(meta.label)}</div>
                  ${isPanelKey(k) ? renderCallPanel(i, k) : renderBreakdownPart(i, bd, +k)}
                </section>
              `;
            }).join('')}
          `).join('')}
        </div>
        ${depthBanner}
      `;
      footerHtml = `
        <div class="step-foot">
          <button type="button" class="gbtn ghost step-back" data-go-part="r">← One step at a time</button>
          <a class="big-btn step-next" href="#/drill/${i.id}">
            <span>Practise this call</span>
            ${arrow}
          </a>
        </div>
      `;
    } else if (part === 'p') {
      const refs = (bd?.policyRefs || []).map(policyById).filter(Boolean);
      const related = relatedPolicy(i, refs);
      mainBlockHtml = `
        <h1 class="step-title">Policy for this issue</h1>
        <p class="step-subtitle">Every figure below is public material with its source and date. ${verifyBadge()} means confirm in your systems before saying it to a client.</p>
        <div class="blocks" id="readerBlocks">
          ${refs.length ? `<div class="b-h">Linked to this call (${refs.length})</div>${refs.map(policyCard).join('')}` : ''}
          ${related.length ? `<div class="b-h">Related bank pages</div>${related.map(policyCard).join('')}` : ''}
        </div>
      `;
      footerHtml = `
        <div class="step-foot">
          <button type="button" class="gbtn ghost step-back" data-go-part="r">← Back to the guide</button>
          <a class="big-btn step-next" href="#/policy"><span>All policy</span>${arrow}</a>
        </div>
      `;
    } else if (part === 'o') {
      mainBlockHtml = `
        <h1 class="step-title">What callers report</h1>
        <div class="blocks" id="readerBlocks">
          ${renderObservedStep(i, 0)}
          ${renderObservedStep(i, 1)}
        </div>
      `;
      footerHtml = `
        <div class="step-foot">
          <button type="button" class="gbtn ghost step-back" data-go-part="0">← Back to the guide</button>
          <button type="button" class="big-btn step-next" id="openIssuePolicyBtn"><span>Policy for this issue</span>${arrow}</button>
        </div>
      `;
    } else {
      // Short guide, its 4 steps sit in call steps 2 and 3
      const stepIdx = numPi >= 0 ? Math.min(3, numPi) : 0;
      const [sKey, sLabel, sHint] = OBS_STEPS[stepIdx];
      const isComplete = store.issuePct(i.id, 4) >= 100;
      mainBlockHtml = `
        <h1 class="step-title">
          ${esc(sLabel)}
          ${isComplete ? stamp : ''}
        </h1>
        <p class="step-subtitle">${esc(sHint)}</p>
        <div class="hl-bar" id="hlBar"></div>
        <div class="blocks" id="readerBlocks">
          ${dualIfFirst()}
          ${renderObservedStep(i, stepIdx)}
        </div>
      `;
      footerHtml = walkFooter();
    }

    // Your notes, at the bottom of the step
    const notesBlock = `
      <div class="note-wrap">
        <div class="eyebrow-sm" style="margin-bottom:6px">Your notes. Patterns only, never client details.</div>
        <textarea class="note" data-note="${i.id}" placeholder="What worked, what to check next time" aria-label="Your notes">${esc(store.note(i.id))}</textarea>
      </div>
    `;

    stepBody.innerHTML = actTabsHtml + mainBlockHtml + notesBlock + footerHtml;
    docPane.scrollTop = 0;

    // Six tabs can be wider than a phone: keep the current one in view without moving the page
    const tabsEl = stepBody.querySelector('.step-tabs');
    const onTab = tabsEl?.querySelector('.step-tab.on');
    if (tabsEl && onTab && tabsEl.scrollWidth > tabsEl.clientWidth) {
      tabsEl.scrollLeft = Math.max(0, onTab.offsetLeft - (tabsEl.clientWidth - onTab.offsetWidth) / 2);
    }

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
          toast({ msg: 'Copied.', icon: '✓', timeout: 1800 });
        } catch {
          toast({ msg: 'Clipboard unavailable.', icon: '!', timeout: 2200 });
        }
      };
    });

    // Wire policy sheet badges
    stepBody.querySelectorAll('[data-open-policy]').forEach(btn => {
      btn.onclick = () => openPolicySheet(i, btn.dataset.openPolicy);
    });
    stepBody.querySelector('#openIssuePolicyBtn')?.addEventListener('click', () => openPolicySheet(i));

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
        sectionTitle: `${i.title}: ${seqIndex(part) >= 0 ? screenMeta(part, hasBd).label : ({ all: 'The whole call', o: 'What callers report', p: 'Policy for this issue' })[part] || part}`,
        blocksEl,
        toolbarEl: stepBody.querySelector('#hlBar')
      });
    } else {
      unmountHighlighter();
    }
  }

  renderTimeline();
  renderReaderContent();

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
      splitEl.setAttribute('aria-valuenow', pctLeft);
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
      splitEl.setAttribute('aria-valuenow', 52);
    });
    splitEl.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      e.stopPropagation();
      const cur = parseFloat(readerEl.style.getPropertyValue('--split-left')) || 52;
      const v = Math.max(36, Math.min(66, cur + (e.key === 'ArrowRight' ? 2 : -2)));
      readerEl.style.setProperty('--split-left', `${v}%`);
      store.pref('splitLeft', v);
      splitEl.setAttribute('aria-valuenow', v);
    });
  }

  // Wire Mobile Bottom Sheet Snap Controls & Touch Drag
  const gripEl = main.querySelector('#sheetGrip');
  if (gripEl) {
    const setSnap = pctVal => {
      readerEl.style.setProperty('--sheet', `${pctVal}%`);
      store.pref('sheetSnap', pctVal);
      gripEl.querySelectorAll('[data-snap]').forEach(b => b.classList.toggle('on', +b.dataset.snap === pctVal));
    };
    gripEl.querySelectorAll('[data-snap]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        setSnap(+btn.dataset.snap);
      });
    });

    let startY = 0, startPct = sheetSnap, sheetDragging = false;
    gripEl.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      sheetDragging = true;
      startY = e.clientY;
      const cur = parseFloat(readerEl.style.getPropertyValue('--sheet') || String(sheetSnap));
      startPct = isNaN(cur) ? sheetSnap : cur;
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
      const cur = parseFloat(readerEl.style.getPropertyValue('--sheet') || String(sheetSnap));
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
    if (sheetScrim) {
      if (ev.key === 'Escape') { ev.preventDefault(); closePolicySheet(); return; }
      if (ev.key !== 'p' && ev.key !== 'P') return;
    }
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      // Arrows walk the call in six-step order, through panels and parts
      const at = seqIndex(part);
      if (at < 0) return;
      ev.preventDefault();
      const next = seq[at + (ev.key === 'ArrowRight' ? 1 : -1)];
      if (next) navigatePart(next.key);
    } else if (ev.key === 'p' || ev.key === 'P') {
      ev.preventDefault();
      openPolicySheet(i);
    }
  }
  document.addEventListener('keydown', onKey);

  // Listen for topbar depth switch or policy sheet button events
  const onTopbarDepth = () => renderReaderContent();
  const onTopbarPolicy = () => openPolicySheet(i);
  document.addEventListener('cards:topbar-depth', onTopbarDepth);
  document.addEventListener('cards:open-policy-sheet', onTopbarPolicy);

  activeReaderCleanup = () => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('cards:topbar-depth', onTopbarDepth);
    document.removeEventListener('cards:open-policy-sheet', onTopbarPolicy);
    closePolicySheet();
  };
}

/* ═════════ Policy for this issue (slide-over sheet) ═════════ */
let sheetScrim = null;
export function closePolicySheet() {
  if (!sheetScrim) return;
  const o = sheetScrim._opener;
  const app = document.getElementById('app');
  if (app) app.inert = false;
  sheetScrim.remove();
  sheetScrim = null;
  if (o && document.contains(o)) o.focus({ preventScroll: true });
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
    <aside class="sheet" role="dialog" aria-modal="true" aria-label="${issue ? 'Policy for this issue' : 'Policy'}">
      <div class="sheet-head">
        <div>
          <div class="mono-label">${issue ? 'Policy for this issue' : 'Policy'}</div>
          <h2>${esc(issue ? issue.title : 'Key figures')}</h2>
        </div>
        <button type="button" class="modal-close" aria-label="Close">×</button>
      </div>
      <div class="sheet-body">
        <div class="narrowing-note">
          <b>Confirm in your systems.</b> Laws apply to every Canadian card issuer. Bank pages are bank policy and can change without notice. Confirm either one in your systems before you quote it.
        </div>
        ${refs.length ? `<div class="sd-block">
          <h3>Linked to this call (${refs.length})</h3>
          ${refs.map(p => `<div id="ps-${p.id}" class="${focusPolicyId === p.id ? 'ps-focused' : ''}">${policyCard(p)}</div>`).join('')}
        </div>` : ''}
        ${related.length ? `<div class="sd-block">
          <h3>Related bank pages</h3>
          ${related.map(policyCard).join('')}
        </div>` : ''}
        <details class="sd-block">
          <summary><h3>Key figures (${mustKnow.length})</h3></summary>
          <p class="dim">Set by law or card network rules</p>
          ${mustKnow.map(r => policyCard(policyById(r.id))).join('')}
        </details>
      </div>
    </aside>
  `;

  scrim.querySelector('.modal-close').onclick = closePolicySheet;
  scrim.addEventListener('click', e => { if (e.target === scrim) closePolicySheet(); });
  scrim._opener = document.activeElement;
  const app = document.getElementById('app');
  if (app) app.inert = true;
  document.body.appendChild(scrim);
  sheetScrim = scrim;
  requestAnimationFrame(() => {
    scrim.classList.add('open');
    scrim.querySelector('.modal-close')?.focus({ preventScroll: true });
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
