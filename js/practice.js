// Practice calls: the client's real opening line, a three-minute clock, three written
// steps (first 15 seconds, questions to ask, options), then a compare against the
// model answer and a self-score.
import { data, issueById, PARTS } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';
import { domainForCategory } from './diagram.js';

const MINUTES = 3;
const CRITERIA = [
  ['heard', 'Showed you heard them', 'Named their exact problem in your first sentence and said how long you would take'],
  ['fork', 'Fewest questions', 'Asked only what you needed to pick the option'],
  ['accurate', 'Right rules and numbers', 'Liability and timing stated correctly, with a source you could name'],
  ['craft', 'Kept it client-friendly', 'Did not send them to a branch they cannot reach, did not say unfortunately, did not hide behind policy']
];

const SCORE_LABELS = ['Missed', 'Partly', 'Solid', 'Spot on'];

let timer = null;
export function stopTimers() { clearInterval(timer); timer = null; }

export function practiceView(main) {
  document.body.classList.remove('reading');
  const D = data();
  const drills = D.issues.filter(i => i.breakdown);
  const completedDrills = drills.filter(i => store.drill(i.id)?.runs?.length > 0).length;
  const masteredDrills = drills.filter(i => (store.drill(i.id)?.best || 0) >= 10).length;

  const firstUntried = drills.findIndex(i => !(store.drill(i.id)?.runs?.length > 0));

  main.innerHTML = `<section class="screen screen-active"><div class="screen-inner">
    <h1 class="title">Practise a call</h1>
    <p class="subtitle">Read what the client says, write your reply in ${MINUTES} minutes, then compare and score.</p>

    <p class="dim" style="font-size:13px;margin:14px 0 6px">${completedDrills} of ${drills.length} tried, ${masteredDrills} mastered</p>
    <div class="trk-bar">
      <div class="trk-bar-fill" style="width:${Math.round((completedDrills / Math.max(1, drills.length)) * 100)}%"></div>
    </div>

    <div class="trk-path">
      ${drills.map((i, idx) => {
        const d = store.drill(i.id);
        const runs = d?.runs?.length || 0;
        const best = runs ? d.best : null;
        const isMastered = best !== null && best >= 10;
        const quote = (i.quotes?.[0]?.text || i.breakdown.surfaceRequest || '').replace(/^"+|"+$/g, '');
        return `<a class="trk-row ${runs > 0 ? 'done' : ''} ${idx === firstUntried ? 'current' : ''}" href="#/drill/${i.id}" data-domain="${domainForCategory(i.category)}">
          <span class="trk-idx">${runs > 0 ? '✓' : idx + 1}</span>
          <div>
            <div class="trk-name">
              ${esc(i.title)}
              ${isMastered ? `<img class="enso-stamp card-stamp" src="assets/enso-gate.svg" alt="Mastered" style="margin-left:6px">` : ''}
            </div>
            <div class="trk-sub">"${esc(quote.slice(0, 105))}${quote.length > 105 ? '…' : ''}"</div>
            <div class="row" style="gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap">
              <span class="chip dom-chip">${esc(i.category)}</span>
              ${runs ? `<span class="dim" style="font-size:12.5px">Best ${best} of 12, ${runs} ${runs === 1 ? 'try' : 'tries'}</span>` : ''}
            </div>
          </div>
          <span class="trk-go">${runs ? 'Try again' : 'Start'}</span>
        </a>`;
      }).join('')}
    </div>
  </div></section>`;
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
    `1. First 15 seconds:\n${parts.engage || '(blank)'}`,
    `2. Questions to ask:\n${parts.diagnose || '(blank)'}`,
    `3. Options:\n${parts.resolve || '(blank)'}`
  ].join('\n\n');
}

export function drillView(main, id) {
  document.body.classList.remove('reading');
  const i = issueById(id);
  if (!i?.breakdown) {
    main.innerHTML = `<div class="screen-inner"><div class="empty-panel">No practice call for this issue yet. <a href="#/practice">← Practice</a></div></div>`;
    return;
  }
  const bd = i.breakdown;
  const opening = i.quotes?.[0]?.text || bd.surfaceRequest || i.title;

  let phase = 'write';   // 'write' | 'score'
  let secs = MINUTES * 60, elapsed = 0;
  let scores = {};
  let parts = parseDraftParts(store.draft(id));

  const draw = () => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const scoredCount = Object.keys(scores).length;

    const placeholder = '(nothing written)';
    main.innerHTML = `<section class="screen screen-active"><div class="screen-inner" style="max-width:820px">
      <a class="back-inline" href="#/practice">← Practice</a>

      <h1 class="title" style="font-size:clamp(24px,3vw,34px)">${esc(i.title)}</h1>
      ${phase === 'write' ? `<p style="margin:-4px 0 12px;font-size:13px"><a href="#/issue/${i.id}/0">Study this first</a></p>` : ''}

      <div class="problem-card">
        <div class="pc-label">The client says</div>
        <blockquote class="step-quote">${md(opening)}</blockquote>
        ${i.emotion ? `<div style="margin-top:8px;font-size:13px;color:var(--muted)"><strong>How they feel:</strong> ${esc(i.emotion)}</div>` : ''}
      </div>

      ${phase === 'write' ? `
        <div class="timer-bar" id="timer">
          <span class="timer-num" id="timerNum">${fmt(secs)}</span>
        </div>

        <div class="dissect-form">
          <div class="gate-card" style="margin:0">
            <div class="gate-kick" style="color:var(--accent-deep)"><label for="drEngage">1. First 15 seconds</label></div>
            <div class="gate-q" style="font-size:16px;margin-bottom:8px">Name their exact problem and say how long you will take</div>
            <textarea id="drEngage" rows="3" placeholder="e.g. Declined at the pharmacy for the prescription, and you have already waited. I can see the restriction and deal with it on this call…">${esc(parts.engage)}</textarea>
          </div>

          <div class="gate-card" style="margin:0">
            <div class="gate-kick" style="color:var(--accent-deep)"><label for="drDiagnose">2. Questions to ask</label></div>
            <div class="gate-q" style="font-size:16px;margin-bottom:8px">Only until you know which option applies</div>
            <textarea id="drDiagnose" rows="3" placeholder="1. Was the flagged transaction yours?\n2. Is the number we have for alerts the phone in your hand?…">${esc(parts.diagnose)}</textarea>
          </div>

          <div class="gate-card" style="margin:0">
            <div class="gate-kick" style="color:var(--accent-deep)"><label for="drResolve">3. Options</label></div>
            <div class="gate-q" style="font-size:16px;margin-bottom:8px">The fix, the exact liability and timing figures, and how you will confirm in writing</div>
            <textarea id="drResolve" rows="4" placeholder="If theirs: lift restriction, update number. If not theirs: block, $0 liability after report ($50 cap before), replacement in 7–10 business days or emergency in 3…">${esc(parts.resolve)}</textarea>
          </div>
        </div>

        <div class="step-foot">
          <button class="big-btn step-next" id="reveal" type="button">
            <span>Compare and score</span>
            <span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>
          </button>
        </div>
      ` : `
        <p class="dim" style="font-size:13px;margin:0 0 10px">You took ${fmt(elapsed)}.</p>
        <div class="compare-steps">
          ${[
            ['1. First 15 seconds', esc(parts.engage || placeholder), `<p>${md(bd.engage)}</p>`],
            ['2. Questions to ask', esc(parts.diagnose || placeholder), `<ol class="diag-steps" style="margin:6px 0">${(bd.diagnose || []).map((q, k) => `<li><span class="diag-num">${k + 1}</span><div class="diag-body">${md(q)}</div></li>`).join('')}</ol>`],
            ['3. Options', esc(parts.resolve || placeholder), `<p>${md(bd.resolve)}</p>`]
          ].map(([label, mine, model]) => `
            <div class="sd-block">
              <h3>${label}</h3>
              <div class="your-answer">
                <div class="ya-label">You</div>
                <div class="drill-review-sec"><p>${mine}</p></div>
              </div>
              <div class="solution-card" style="margin:8px 0 0">
                <div class="sc-label">Model answer</div>
                <div class="drill-review-sec">${model}</div>
                <p class="dim" style="font-size:12px;margin:6px 0 0">Confirm figures in-system before quoting.</p>
              </div>
            </div>
          `).join('')}
        </div>

        ${(bd.sayThisNotThis || []).length ? `
          <details class="disc" style="margin-top:16px">
            <summary>Better phrasing (${bd.sayThisNotThis.length})</summary>
            <div class="body">
              ${bd.sayThisNotThis.map(s => `<div class="b-ge"><div class="g"><b>Say</b> <div>${md(s.say)}</div></div><div class="b"><b>Don't say</b> <div>${md(s.not)}</div></div><div class="w"><strong>Why:</strong> ${md(s.why)}</div></div>`).join('')}
            </div>
          </details>
        ` : ''}

        <div class="rv-card" style="margin-top:24px">
          <div class="rv-type">Score yourself</div>
          <p class="dim" style="font-size:13.5px;margin:0">0 to 3 for each. Only you see these scores.</p>
          <p class="dim" style="font-size:12.5px;margin:4px 0 0">0 missed, 1 partly, 2 solid, 3 spot on</p>
          <div class="rubric-grid">
            ${CRITERIA.map(([k, title, desc]) => `
              <div class="rubric-item">
                <div class="rubric-head">
                  <strong>${esc(title)}</strong>
                  <span class="dim">${esc(desc)}</span>
                </div>
                <div class="score-row" role="group" aria-label="${esc(title)}">
                  ${[0, 1, 2, 3].map(n => `<button type="button" class="score-btn" data-crit="${k}" data-n="${n}" aria-pressed="${scores[k] === n}" aria-label="${n}: ${SCORE_LABELS[n].toLowerCase()}">${n}</button>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="step-foot">
          <button type="button" class="gbtn ghost" id="backToEdit">← Edit your answer</button>
          <span class="step-foot-note"><strong>${total} of 12</strong>, ${scoredCount} of 4 scored</span>
          <button type="button" class="big-btn step-next" id="save" ${scoredCount < CRITERIA.length ? 'disabled' : ''}>
            <span>Save score</span>
          </button>
        </div>
      `}
    </div></section>`;

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
        if (secs === 0) toast({ msg: "Time's up. Finish your thought, then compare.", icon: '◷', timeout: 3200 });
      }, 1000);

      main.querySelector('#reveal').onclick = () => {
        stopTimers();
        store.draft(id, serializeDraftParts(parts));
        phase = 'score';
        draw();
        main.scrollTo({ top: 0, behavior: 'instant' });
      };
    } else {
      main.querySelector('#backToEdit')?.addEventListener('click', () => {
        phase = 'write';
        draw();
      });
      main.querySelectorAll('[data-crit]').forEach(b => {
        b.onclick = () => {
          const k = b.dataset.crit, n = b.dataset.n;
          scores[k] = +n;
          draw();
          main.querySelector(`[data-crit="${k}"][data-n="${n}"]`)?.focus({ preventScroll: true });
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
          toast({ msg: `Saved. ${finalScore} of 12.`, icon: '✓', timeout: 2400 });
          location.hash = '#/practice';
        };
      }
    }
  };
  draw();
}

function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
export { PARTS };
