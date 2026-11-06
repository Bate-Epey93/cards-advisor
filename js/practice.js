// Role-play drills: the client's real opening line, a three-minute clock, structured
// response steps (15-sec Engage, Diagnostic Questions, Resolution & Figures), then
// side-by-side reveal and self-scoring against the breakdown.
import { data, issueById, PARTS } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';
import { domainForCategory } from './diagram.js';

const MINUTES = 3;
const CRITERIA = [
  ['heard', 'Empathy & Specificity', 'Proved you heard the specific thing in the first sentence + time-boxed next step'],
  ['fork', 'Diagnostic Efficiency', 'Questions reach the decision fork in the fewest steps'],
  ['accurate', 'Rule & Figure Accuracy', 'Liability and timing stated accurately, with a source you could name'],
  ['craft', 'Service Craft', 'No branch to someone who cannot use one, no "unfortunately", no policy wall']
];

const SCORE_LABELS = ['0 · Missed', '1 · Partial', '2 · Solid', '3 · Nailed it'];

let timer = null;
export function stopTimers() { clearInterval(timer); timer = null; }

export function practiceView(main) {
  document.body.classList.remove('reading');
  const D = data();
  const drills = D.issues.filter(i => i.breakdown);
  const completedDrills = drills.filter(i => store.drill(i.id)?.runs?.length > 0).length;
  const masteredDrills = drills.filter(i => (store.drill(i.id)?.best || 0) >= 10).length;

  main.innerHTML = `<div class="screen-inner">
    <div class="kicker">Practice · ${drills.length} role-play call simulations</div>
    <h1 class="title">Ten minutes between calls that feels like a call.</h1>
    <p class="subtitle">The opening is a real client's words. You get ${MINUTES} minutes to write your first fifteen seconds, your diagnostic questions in order, and the resolution. Then the breakdown is revealed side-by-side and you score yourself on four criteria.</p>

    <div class="trk-stats">
      <div class="trk-tile">
        <div class="trk-n">${completedDrills} <span class="trk-of">/ ${drills.length}</span></div>
        <div class="trk-l">Scenarios practised</div>
      </div>
      <div class="trk-tile">
        <div class="trk-n">${store.drillCount}</div>
        <div class="trk-l">Total drill runs completed</div>
      </div>
      <div class="trk-tile">
        <div class="trk-n">${masteredDrills} <span class="trk-of">/ ${drills.length}</span></div>
        <div class="trk-l">Mastered (10+ / 12 score)</div>
      </div>
    </div>

    <div class="trk-bar">
      <div class="trk-bar-fill" style="width:${Math.round((completedDrills / Math.max(1, drills.length)) * 100)}%"></div>
    </div>

    <div class="trk-path">
      ${drills.map((i, idx) => {
        const d = store.drill(i.id);
        const best = d ? d.best : null;
        const runs = d ? d.runs.length : 0;
        const isMastered = best !== null && best >= 10;
        return `<a class="trk-row ${runs > 0 ? 'done' : ''} ${idx === 0 && !runs ? 'current' : ''}" href="#/drill/${i.id}" data-domain="${domainForCategory(i.category)}">
          <span class="trk-idx">${runs > 0 ? '✓' : idx + 1}</span>
          <div>
            <div class="trk-name">
              ${esc(i.title)}
              ${isMastered ? `<img class="enso-stamp card-stamp" src="assets/enso-gate.svg" alt="Mastered" style="margin-left:6px">` : ''}
            </div>
            <div class="trk-sub">"${esc((i.quotes?.[0]?.text || i.breakdown.surfaceRequest || '').replace(/^"+|"+$/g, '').slice(0, 105))}…"</div>
            <div class="row" style="gap:6px;margin-top:6px">
              <span class="chip dom-chip">${esc(i.category)}</span>
              ${d ? `<span class="chip flagship">Best: ${best}/12 · ${runs} run${runs === 1 ? '' : 's'}</span>` : `<span class="chip">Not attempted yet</span>`}
            </div>
          </div>
          <span class="trk-go">Start →</span>
        </a>`;
      }).join('')}
    </div>
  </div>`;
}

function parseDraftParts(raw = '') {
  if (!raw) return { engage: '', diagnose: '', resolve: '' };
  try {
    const j = JSON.parse(raw);
    if (j && typeof j === 'object') return { engage: j.engage || '', diagnose: j.diagnose || '', resolve: j.resolve || '' };
  } catch { /* legacy markdown format */ }
  return { engage: raw, diagnose: '', resolve: '' };
}

function serializeDraftParts(parts) {
  return JSON.stringify(parts);
}

function formatReadableDraft(parts) {
  return [
    `1. FIRST 15 SECONDS:\n${parts.engage || '(blank)'}`,
    `2. DIAGNOSTIC QUESTIONS:\n${parts.diagnose || '(blank)'}`,
    `3. RESOLUTION & FIGURES:\n${parts.resolve || '(blank)'}`
  ].join('\n\n');
}

export function drillView(main, id) {
  document.body.classList.remove('reading');
  const i = issueById(id);
  if (!i?.breakdown) {
    main.innerHTML = `<div class="screen-inner"><div class="empty-panel">No drill for this issue yet. <a href="#/practice">Back to Practice</a></div></div>`;
    return;
  }
  const bd = i.breakdown;
  const opening = i.quotes?.[0]?.text || bd.surfaceRequest;
  const prev = store.drill(id);

  let phase = 'write';   // 'write' | 'score'
  let secs = MINUTES * 60, elapsed = 0;
  let scores = {};
  let parts = parseDraftParts(store.draft(id));

  const draw = () => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const scoredCount = Object.keys(scores).length;

    main.innerHTML = `<div class="screen-inner" style="max-width:820px">
      <a class="back-inline" href="#/practice">← All practice drills</a>

      <!-- Visual Step Progress Bar -->
      <div class="rv-progress" aria-label="Drill stage">
        <span class="${phase === 'write' ? 'on' : 'done'}"></span>
        <span class="${phase === 'score' ? 'on' : ''}"></span>
      </div>

      <div class="kicker">${MINUTES}-minute role-play drill · ${esc(i.category)}</div>
      <h1 class="title" style="font-size:clamp(24px,3vw,34px)">${esc(i.title)}</h1>

      <!-- Caller Opening Card -->
      <div class="problem-card">
        <div class="pc-label">The caller's opening words (live on the line)</div>
        <blockquote class="step-quote">${md(opening)}</blockquote>
        ${i.emotion ? `<div style="margin-top:8px;font-size:13px;color:var(--muted)"><strong>Caller state:</strong> ${esc(i.emotion)}</div>` : ''}
      </div>

      ${phase === 'write' ? `
        <div class="timer-bar" id="timer">
          <span class="timer-num" id="timerNum">${fmt(secs)}</span>
          <span class="dim" style="flex:1">Write as you would speak to the client.</span>
          ${prev ? `<span class="chip flagship">Best: ${prev.best}/12</span>` : ''}
        </div>

        <div class="dissect-form">
          <div class="gate-card" style="margin:0">
            <div class="gate-kick" style="color:var(--proposal)">Move 1 · The first fifteen seconds</div>
            <div class="gate-q" style="font-size:16px;margin-bottom:8px">Acknowledge the specific situation and time-box your check:</div>
            <textarea id="drEngage" rows="3" placeholder="e.g. Declined at the pharmacy for the prescription, and you have already waited. I can see the restriction and deal with it on this call…">${esc(parts.engage)}</textarea>
          </div>

          <div class="gate-card" style="margin:0">
            <div class="gate-kick" style="color:var(--accent)">Move 2 · Diagnostic questions, in order</div>
            <div class="gate-q" style="font-size:16px;margin-bottom:8px">What are the 2–3 shortest questions to reach the decision fork?</div>
            <textarea id="drDiagnose" rows="3" placeholder="1. Was the flagged transaction yours?\n2. Is the number we have for alerts the phone in your hand?…">${esc(parts.diagnose)}</textarea>
          </div>

          <div class="gate-card" style="margin:0">
            <div class="gate-kick" style="color:var(--money)">Move 3 · Resolution, liability & timing</div>
            <div class="gate-q" style="font-size:16px;margin-bottom:8px">State the outcome, the exact statutory liability/timing figures, and written confirmation:</div>
            <textarea id="drResolve" rows="4" placeholder="If theirs: lift restriction, update number. If not theirs: block, $0 liability after report ($50 cap before), replacement in 7–10 business days or emergency in 3…">${esc(parts.resolve)}</textarea>
          </div>
        </div>

        <div class="step-foot">
          <a class="gbtn ghost" href="#/issue/${i.id}/0">Study breakdown first</a>
          <button class="big-btn step-next" id="reveal" type="button">
            <span>Reveal breakdown & score</span>
            <span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>
          </button>
        </div>
      ` : `
        <!-- Phase 2: Reveal & Self-Score -->
        <div class="compare-grid">
          <div class="your-answer">
            <div class="ya-label">Your response (${fmt(elapsed)} elapsed)</div>
            <div class="drill-review-sec"><strong>1. First 15s:</strong><p>${esc(parts.engage || '(nothing written)')}</p></div>
            <div class="drill-review-sec"><strong>2. Questions:</strong><p>${esc(parts.diagnose || '(nothing written)')}</p></div>
            <div class="drill-review-sec"><strong>3. Resolution:</strong><p>${esc(parts.resolve || '(nothing written)')}</p></div>
          </div>

          <div class="solution-card" style="margin:0">
            <div class="sc-label">The Breakdown Benchmark</div>
            <div class="drill-review-sec"><strong>1. First 15s:</strong><p>${md(bd.engage)}</p></div>
            <div class="drill-review-sec"><strong>2. Questions in order:</strong>
              <ol class="diag-steps" style="margin:6px 0">${bd.diagnose.map((q, k) => `<li><span class="diag-num">${k + 1}</span><div class="diag-body">${md(q)}</div></li>`).join('')}</ol>
            </div>
            <div class="drill-review-sec"><strong>3. Resolution:</strong><p>${md(bd.resolve)}</p></div>
          </div>
        </div>

        <div class="sd-block">
          <h3>Say this, not this — check your phrasing</h3>
          ${bd.sayThisNotThis.map(s => `<div class="b-ge"><div class="hd">Say this, not this</div><div class="g"><b>✓ Say</b> <div>${md(s.say)}</div></div><div class="b"><b>✗ Not</b> <div>${md(s.not)}</div></div><div class="w"><strong>Why:</strong> ${md(s.why)}</div></div>`).join('')}
        </div>

        <div class="rv-card" style="margin-top:24px">
          <div class="rv-type">Honest self-scoring rubric · ${total} / 12 points</div>
          <p class="dim" style="font-size:13.5px;margin:0">Score each line from 0 to 3. Honest scores are the point; nobody else sees them.</p>
          <div class="rubric-grid">
            ${CRITERIA.map(([k, title, desc]) => `
              <div class="rubric-item">
                <div class="rubric-head">
                  <strong>${esc(title)}</strong>
                  <span class="dim">${esc(desc)}</span>
                </div>
                <div class="score-row">
                  ${[0, 1, 2, 3].map(n => `<button type="button" class="score-btn" data-crit="${k}" data-n="${n}" aria-pressed="${scores[k] === n}">${SCORE_LABELS[n]}</button>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="step-foot">
          <button type="button" class="gbtn ghost" id="backToEdit">← Edit response</button>
          <span class="step-foot-note">Score: <strong>${total} / 12</strong> (${scoredCount}/4 criteria graded)</span>
          <button type="button" class="big-btn step-next" id="save" ${scoredCount < CRITERIA.length ? 'disabled' : ''}>
            <span>Save drill run (${total}/12)</span>
          </button>
        </div>
      `}
    </div>`;

    if (phase === 'write') {
      const bindInput = (sel, key) => {
        const el = main.querySelector(sel);
        if (!el) return;
        el.addEventListener('input', () => {
          parts[key] = el.value;
          store.draft(id, serializeDraftParts(parts));
        });
      };
      bindInput('#drEngage', 'engage');
      bindInput('#drDiagnose', 'diagnose');
      bindInput('#drResolve', 'resolve');

      const num = main.querySelector('#timerNum'), bar = main.querySelector('#timer');
      stopTimers();
      timer = setInterval(() => {
        secs--; elapsed++;
        if (num) num.textContent = (secs < 0 ? '+' : '') + fmt(Math.abs(secs));
        if (secs < 0 && bar) bar.classList.add('over');
        if (secs === 0) toast({ msg: 'Three minutes up. Finish your sentence and reveal.', icon: '◷', timeout: 3200 });
      }, 1000);

      main.querySelector('#reveal').onclick = () => {
        stopTimers();
        store.draft(id, serializeDraftParts(parts));
        phase = 'score';
        draw();
        window.scrollTo(0, 0);
      };
    } else {
      main.querySelector('#backToEdit')?.addEventListener('click', () => {
        phase = 'write';
        draw();
      });
      main.querySelectorAll('[data-crit]').forEach(b => {
        b.onclick = () => {
          scores[b.dataset.crit] = +b.dataset.n;
          draw();
        };
      });
      const save = main.querySelector('#save');
      if (save) {
        save.onclick = () => {
          const finalScore = Object.values(scores).reduce((a, b) => a + b, 0);
          store.saveDrillRun(id, {
            at: Date.now(),
            secs: elapsed,
            text: formatReadableDraft(parts),
            scores,
            score: finalScore
          });
          store.touchStreak();
          toast({ msg: `Drill saved (${finalScore}/12).`, icon: '✓', timeout: 2400 });
          location.hash = '#/practice';
        };
      }
    }
  };
  draw();
}

function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
export { PARTS };
