// Practice calls: the client's real opening line, a five-minute clock, five short written
// parts that cover the whole call (open and listen back, solve, checkpoint, advice, close),
// then a compare against the model answer and a self-score on the six call steps, 0 to 3
// each, 18 in all. Tries saved under the old four-criteria rubric were out of 12; each new
// run stores its own max and tries are compared by percentage (see runPct in js/store.js).
import { data, issueById, PARTS, callSteps, VALUES, buildDeck } from './data.js';
import { store, runPct, runMax, MASTERED_PCT } from './store.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';
import { domainForCategory } from './diagram.js';

const MINUTES = 5;
const MAX_PER_STEP = 3;
const SCORE_LABELS = ['Missed', 'Partly', 'Solid', 'Spot on'];

// What to judge at each step, and the nudge shown when it is the step to work on.
const STEP_GUIDE = {
  1: ['Read their whole line before writing, and started settled', 'Read the client\'s whole line once, slowly, before you write a word.'],
  2: ['Greeted, framed verification as protection, said their exact problem back', 'Say their exact problem back in their own words, and name the feeling, before you fix anything.'],
  3: ['Fewest questions, right rules and numbers, said what you were doing', 'Ask only the questions that pick the fix, and say out loud what you are doing as you do it.'],
  4: ['Said what was done and asked if it was sorted', 'Before the goodbye, say what is now done and ask if that sorts out what they called about. Then wait.'],
  5: ['One question on the cause, options with trade-offs, their choice', 'Ask one question about the cause, give the options with their trade-offs, and let them choose. No offer to a client in distress or in a fraud claim.'],
  6: ['Recap, what happens next and when, a warm close', 'Recap what you did, say what happens next and when, and ask "anything else?" as a real question.']
};

// The five written parts. Step 1, Be Ready, has nothing to write: it is how you start.
const FIELDS = [
  ['open', 2, 'Open and listen back', 'Greet, then say their exact problem back and what happens next',
    'e.g. Thanks for calling, you are speaking with Sam. I will verify you first so your card stays protected. Declined at the pharmacy, with people waiting. I can deal with it on this call.', 3],
  ['solve', 3, 'Solve', 'The questions that pick the fix, then the fix. Say the figures you would confirm in your systems',
    'e.g. Was the flagged purchase yours? Is the number we text still your phone? If theirs: lift the block. If not: block the card, report it, order a replacement.', 4],
  ['check', 4, 'Checkpoint', 'One line that says what is done and asks if it is sorted',
    'e.g. The block is off and the card is working. Does that sort out what you called about?', 2],
  ['advice', 5, 'Deeper discovery and advice', 'One question on the cause, then options and their choice. Leave it out if they are in distress',
    'e.g. Can I ask one thing before you go? Two options: I update the number now, or we leave it and you call each time. Which do you prefer?', 3],
  ['close', 6, 'Close', 'Recap, what happens next, and a warm goodbye',
    'e.g. To recap: the card works and you will get a message today confirming it. Is there anything else I can help with?', 2]
];

const VALUE_MARKS = {
  care: ['#fb7185', 'border-radius:50%'],
  connect: ['#4cc9f0', 'border-radius:2px'],
  expertise: ['#e5b869', 'transform:rotate(45deg)']
};

// Sample lines for the steps the issue guides do not cover, used when callflow.json is missing.
const FALLBACK_SAY = {
  4: ['The block is lifted and your card is working again. Does that sort out what you called about?', 'Is anything about this still worrying you?'],
  5: ['Before you go, can I ask one thing?', 'Two options. I can do it now, or we leave it as it is. Which do you prefer?'],
  6: ['To recap: here is what I did, and here is what happens next.', 'Is there anything else I can help with?']
};
function stepSay(n) {
  const s = data()?.callflow?.steps?.find?.(x => x && +x.n === n);
  const say = Array.isArray(s?.say) ? s.say.filter(x => typeof x === 'string' && x.trim()) : [];
  return say.length && s.sayQuoted !== false ? say : (FALLBACK_SAY[n] || []);
}

const bestLabel = b => `${b.score} of ${b.max}${b.max !== MAX_PER_STEP * 6 ? ' (earlier scoring)' : ''}`;

let timer = null;
export function stopTimers() { clearInterval(timer); timer = null; }

export function practiceView(main) {
  document.body.classList.remove('reading');
  const D = data();
  const drills = D.issues.filter(i => i.breakdown);
  const bests = new Map(drills.map(i => [i.id, store.drillBest(i.id)]));
  const completedDrills = drills.filter(i => bests.get(i.id)).length;
  const masteredDrills = drills.filter(i => bests.get(i.id)?.mastered).length;
  const firstUntried = drills.findIndex(i => !bests.get(i.id));

  let due = 0, deckSize = 0;
  try {
    const now = Date.now(), deck = buildDeck();
    deckSize = deck.length;
    due = deck.filter(c => store.card(c.id).due <= now).length;
  } catch { /* the link still works without the count */ }

  main.innerHTML = `<section class="screen screen-active"><div class="screen-inner">
    <h1 class="title">Practise a call</h1>
    <p class="subtitle">Read what the client says, write the call in ${MINUTES} minutes, then compare and score each of the six steps.</p>

    <a class="trk-row" href="#/cards" style="margin:14px 0 4px">
      <span class="trk-idx" aria-hidden="true">◇</span>
      <div>
        <div class="trk-name">Flashcards</div>
        <div class="trk-sub">The six call steps, my numbers, key figures and say this, not this lines.</div>
        ${deckSize ? `<div class="dim" style="font-size:12.5px;margin-top:6px">${due} due of ${deckSize}</div>` : ''}
      </div>
      <span class="trk-go">Open</span>
    </a>

    <p class="dim" style="font-size:13px;margin:14px 0 6px">${completedDrills} of ${drills.length} tried, ${masteredDrills} mastered. Mastered means ${MASTERED_PCT} percent or better.</p>
    <div class="trk-bar">
      <div class="trk-bar-fill" style="width:${Math.round((completedDrills / Math.max(1, drills.length)) * 100)}%"></div>
    </div>

    <div class="trk-path">
      ${drills.map((i, idx) => {
        const b = bests.get(i.id);
        const runs = b ? b.runs : 0;
        const quote = (i.quotes?.[0]?.text || i.breakdown.surfaceRequest || '').replace(/^"+|"+$/g, '');
        return `<a class="trk-row ${runs > 0 ? 'done' : ''} ${idx === firstUntried ? 'current' : ''}" href="#/drill/${i.id}" data-domain="${domainForCategory(i.category)}">
          <span class="trk-idx">${runs > 0 ? '✓' : idx + 1}</span>
          <div>
            <div class="trk-name">
              ${esc(i.title)}
              ${b?.mastered ? `<img class="enso-stamp card-stamp" src="assets/enso-gate.svg" alt="Mastered" style="margin-left:6px">` : ''}
            </div>
            <div class="trk-sub">"${esc(quote.slice(0, 105))}${quote.length > 105 ? '…' : ''}"</div>
            <div class="row" style="gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap">
              <span class="chip dom-chip">${esc(i.category)}</span>
              ${runs ? `<span class="dim" style="font-size:12.5px">Best ${b.score} of ${b.max}, ${b.pct}%, ${runs} ${runs === 1 ? 'try' : 'tries'}</span>` : ''}
            </div>
          </div>
          <span class="trk-go">${runs ? 'Try again' : 'Start'}</span>
        </a>`;
      }).join('')}
    </div>
  </div></section>`;
}

const EMPTY_PARTS = () => ({ open: '', solve: '', check: '', advice: '', close: '' });
const str = v => (typeof v === 'string' ? v : '');

// Drafts saved before the six-step layout had three parts: engage, diagnose, resolve.
function parseDraftParts(raw = '') {
  const parts = EMPTY_PARTS();
  if (!raw) return parts;
  try {
    const j = JSON.parse(raw);
    if (j && typeof j === 'object' && !Array.isArray(j)) {
      for (const k of Object.keys(parts)) parts[k] = str(j[k]);
      if (!parts.open) parts.open = str(j.engage);
      if (!parts.solve) parts.solve = [str(j.diagnose), str(j.resolve)].filter(x => x.trim()).join('\n\n');
      return parts;
    }
  } catch { /* oldest format: one plain text block */ }
  parts.open = raw;
  return parts;
}

function serializeDraftParts(parts) {
  return JSON.stringify(parts);
}

function formatReadableDraft(parts) {
  return FIELDS.map(([k, n, label]) => `${n}. ${label}:\n${parts[k] || '(blank)'}`).join('\n\n');
}

// Strongest and weakest step once all six are scored. Ties go to the earlier step.
function readTry(scores, steps) {
  const rows = steps.map(s => [s, scores[s.n]]);
  if (rows.some(([, v]) => typeof v !== 'number')) return null;
  const hi = Math.max(...rows.map(r => r[1])), lo = Math.min(...rows.map(r => r[1]));
  return {
    strongest: hi === lo ? null : rows.find(r => r[1] === hi)[0],
    workOn: lo === MAX_PER_STEP ? null : rows.find(r => r[1] === lo)[0],
    even: hi === lo
  };
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
  const steps = callSteps();
  const MAX = steps.length * MAX_PER_STEP;
  const prior = store.drillBest(id);
  const lastRun = store.drill(id)?.runs?.slice(-1)[0] || null;

  let phase = 'write';   // 'write' | 'score'
  let secs = MINUTES * 60, elapsed = 0;
  let scores = {};       // step number -> 0..3
  let values = new Set(); // 'care' | 'connect' | 'expertise'
  let parts = parseDraftParts(store.draft(id));

  const lines = list => `<ul class="b-list" style="margin:0">${list.map(x => `<li><span>"${md(x)}"</span></li>`).join('')}</ul>`;
  const models = {
    open: `<p>${md(bd.engage || '')}</p><p class="dim" style="font-size:12.5px;margin:6px 0 0">Verify first, and say it is to keep their card protected. Never ask for a one-time code.</p>`,
    solve: `${(bd.diagnose || []).length ? `<ol class="diag-steps" style="margin:6px 0">${bd.diagnose.map((q, k) => `<li><span class="diag-num">${k + 1}</span><div class="diag-body">${md(q)}</div></li>`).join('')}</ol>` : ''}<p>${md(bd.resolve || '')}</p>`,
    check: lines(stepSay(4)),
    advice: `${lines(stepSay(5))}${(bd.riskFlags || []).length ? `<p style="margin:10px 0 4px;font-size:13px"><strong>Check before you advise</strong></p><ul class="b-list" style="margin:0">${bd.riskFlags.map(r => `<li><span>${md(r)}</span></li>`).join('')}</ul>` : ''}
      <p class="dim" style="font-size:12.5px;margin:8px 0 0">Advice starts from their need. Give the options with their trade-offs and let them choose. No product offer to a client in distress or in a fraud claim.</p>`,
    close: `${lines(stepSay(6))}${bd.afterCall ? `<p style="margin:10px 0 0;font-size:13.5px"><strong>Then your notes:</strong> ${md(bd.afterCall)}</p>` : ''}`
  };
  // the issue guide writes the model for steps 2, 3 and (in part) 6; the rest are general craft
  const modelLabel = { open: 'Model answer', solve: 'Model answer', check: 'Lines that fit', advice: 'Lines that fit', close: 'Lines that fit' };

  const draw = () => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const scoredCount = Object.keys(scores).length;
    const read = readTry(scores, steps);

    const placeholder = '(nothing written)';
    main.innerHTML = `<section class="screen screen-active"><div class="screen-inner" style="max-width:820px">
      <div class="between" style="align-items:center;gap:10px">
        <a class="back-inline" href="#/practice">← Practice</a>
        ${phase === 'score' ? `<span class="mono dim" style="font-size:12px" aria-live="polite">${total} of ${MAX}</span>` : ''}
      </div>

      <h1 class="title" style="font-size:clamp(24px,3vw,34px)">${phase === 'score' ? 'Score the call, step by step' : esc(i.title)}</h1>
      ${phase === 'write'
        ? `<p style="margin:-4px 0 12px;font-size:13px"><a href="#/issue/${i.id}/r">Study this first</a>${prior ? `<span class="dim"> · Best so far ${esc(bestLabel(prior))}, ${prior.pct}%</span>` : ''}</p>`
        : `<p class="dim" style="margin:-4px 0 12px;font-size:13px">${esc(i.title)}</p>`}

      <div class="problem-card">
        <div class="pc-label">The client says</div>
        <blockquote class="step-quote">${md(opening)}</blockquote>
        ${i.emotion ? `<div style="margin-top:8px;font-size:13px;color:var(--muted)"><strong>How they feel:</strong> ${esc(i.emotion)}</div>` : ''}
      </div>

      ${phase === 'write' ? `
        <div class="timer-bar" id="timer">
          <span class="timer-num" id="timerNum">${secs < 0 ? '+' : ''}${fmt(Math.abs(secs))}</span>
        </div>

        <p class="dim" style="font-size:13px;margin:0 0 10px"><strong>1. ${esc(steps[0].name)}.</strong> Nothing to write. Read their whole line once, then start. Short lines are fine: write what you would say.</p>

        <div class="dissect-form">
          ${FIELDS.map(([k, n, label, ask, ph, rows]) => `
          <div class="gate-card" style="margin:0">
            <div class="gate-kick" style="color:var(--accent-deep)"><label for="dr-${k}">${n}. ${esc(label)}</label></div>
            <div class="gate-q" style="font-size:16px;margin-bottom:8px">${esc(ask)}</div>
            <textarea id="dr-${k}" data-part="${k}" rows="${rows}" placeholder="${esc(ph)}">${esc(parts[k])}</textarea>
          </div>`).join('')}
        </div>

        <div class="step-foot">
          <button class="big-btn step-next" id="reveal" type="button">
            <span>Compare and score</span>
            <span class="btn-ico" aria-hidden="true"><svg class="ico" viewBox="0 0 20 20"><path d="M5 10h10M11 6l4 4-4 4"/></svg></span>
          </button>
        </div>
      ` : `
        <p class="dim" style="font-size:13px;margin:0 0 10px">You took ${fmt(elapsed)}.${lastRun ? ` Last try: ${lastRun.score || 0} of ${runMax(lastRun)}, ${runPct(lastRun)}%.` : ''}</p>
        <div class="compare-steps">
          ${FIELDS.map(([k, n, label]) => `
            <div class="sd-block">
              <h3>${n}. ${esc(label)}</h3>
              <div class="your-answer">
                <div class="ya-label">You</div>
                <div class="drill-review-sec"><p>${md(parts[k].trim() || placeholder)}</p></div>
              </div>
              <div class="solution-card" style="margin:8px 0 0">
                <div class="sc-label">${modelLabel[k]}</div>
                <div class="drill-review-sec">${models[k]}</div>
                ${k === 'open' || k === 'solve' ? '<p class="dim" style="font-size:12px;margin:6px 0 0">Confirm figures in your systems before quoting.</p>' : ''}
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
          <div class="rv-type">Score each step</div>
          <p class="dim" style="font-size:13.5px;margin:0">0 to 3 for each of the six steps. Only you see these scores.</p>
          <p class="dim" style="font-size:12.5px;margin:4px 0 0">0 missed, 1 partly, 2 solid, 3 spot on</p>
          <div class="rubric-grid">
            ${steps.map(s => `
              <div class="rubric-item">
                <div class="rubric-head">
                  <strong>${s.n}. ${esc(s.name)}</strong>
                  <span class="dim">${esc(STEP_GUIDE[s.n]?.[0] || s.short || '')}</span>
                </div>
                <div class="score-row" role="group" aria-label="Score for ${esc(s.name)}" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;width:100%">
                  ${[0, 1, 2, 3].map(n => `<button type="button" class="score-btn" data-step="${s.n}" data-n="${n}" aria-pressed="${scores[s.n] === n}" aria-label="${n}: ${SCORE_LABELS[n].toLowerCase()}" style="min-height:44px;padding:8px 4px">${n}</button>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="rv-card" style="margin-top:14px">
          <div class="rv-type">Which values came through?</div>
          <p class="dim" style="font-size:12.5px;margin:0 0 10px">Tap any that showed in what you wrote. None is a fair answer.</p>
          <div role="group" aria-label="Values that came through" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
            ${VALUES.map(v => {
              const on = values.has(v.id);
              const [col, shape] = VALUE_MARKS[v.id] || ['var(--accent)', ''];
              return `<button type="button" data-value="${v.id}" aria-pressed="${on}" title="${esc(v.short)}" style="min-height:44px;min-width:0;border-radius:999px;border:${on ? `1.5px solid ${col}` : '1px solid var(--hair-strong)'};background:${on ? `color-mix(in srgb, ${col} 16%, transparent)` : 'transparent'};color:${on ? 'var(--ink)' : 'var(--muted)'};font:inherit;font-size:13px;font-weight:${on ? 700 : 600};display:flex;align-items:center;justify-content:center;gap:6px;padding:0 6px;cursor:pointer">
                <span aria-hidden="true" style="flex:none;width:9px;height:9px;background:${col};${shape}"></span>${esc(v.name)}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="rv-card" style="margin-top:14px" aria-live="polite">
          <div class="rv-type">What this try shows</div>
          ${!read ? `<p class="dim" style="font-size:13.5px;margin:0">Score all six steps to see your strongest step and the one to work on.</p>` : `
            <p style="font-size:13.5px;line-height:1.45;margin:0 0 6px"><strong>Strongest:</strong> ${read.strongest ? esc(read.strongest.name) + '.' : (read.workOn ? 'even across the six steps.' : 'all six. Nothing slipped on this try.')}</p>
            ${read.workOn ? `
              <p style="font-size:13.5px;line-height:1.45;margin:0"><strong>Work on:</strong> ${esc(read.workOn.name)}. ${esc(STEP_GUIDE[read.workOn.n]?.[1] || '')}</p>
              <a href="#/call/step/${read.workOn.n}" style="display:inline-flex;align-items:center;min-height:44px;font-size:13.5px;font-weight:600">Review the ${esc(read.workOn.name)} step</a>
            ` : `<p class="dim" style="font-size:13.5px;line-height:1.45;margin:0">Try a call type you have not practised yet.</p>`}
          `}
        </div>

        <div class="step-foot">
          <button type="button" class="gbtn ghost" id="backToEdit">← Edit your answer</button>
          <span class="step-foot-note"><strong>${total} of ${MAX}</strong>, ${scoredCount} of ${steps.length} scored</span>
          <button type="button" class="big-btn step-next" id="save" ${scoredCount < steps.length ? 'disabled' : ''}>
            <span>Save score</span>
          </button>
        </div>
      `}
    </div></section>`;

    if (phase === 'write') {
      main.querySelectorAll('[data-part]').forEach(el => {
        el.addEventListener('input', () => {
          parts[el.dataset.part] = el.value;
          store.draft(id, serializeDraftParts(parts));
        });
      });

      const num = main.querySelector('#timerNum'), bar = main.querySelector('#timer');
      if (secs < 0 && bar) bar.classList.add('over');
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
      // redraws replace the whole view, so hold the scroll position and the focus
      const redraw = sel => {
        const y = main.scrollTop, wy = window.scrollY;
        draw();
        main.scrollTop = y;
        if (window.scrollY !== wy) window.scrollTo(0, wy);
        main.querySelector(sel)?.focus({ preventScroll: true });
      };
      main.querySelector('#backToEdit')?.addEventListener('click', () => {
        phase = 'write';
        draw();
      });
      main.querySelectorAll('[data-step]').forEach(b => {
        b.onclick = () => {
          const k = +b.dataset.step, n = +b.dataset.n;
          scores[k] = n;
          redraw(`[data-step="${k}"][data-n="${n}"]`);
        };
      });
      main.querySelectorAll('[data-value]').forEach(b => {
        b.onclick = () => {
          const v = b.dataset.value;
          if (values.has(v)) values.delete(v); else values.add(v);
          redraw(`[data-value="${v}"]`);
        };
      });
      const save = main.querySelector('#save');
      if (save) {
        save.onclick = () => {
          const finalScore = Object.values(scores).reduce((a, b) => a + b, 0);
          const r = readTry(scores, steps);
          store.saveDrillRun(id, {
            at: Date.now(),
            secs: elapsed,
            text: formatReadableDraft(parts),
            scores: { ...scores },
            score: finalScore,
            max: MAX,
            values: VALUES.map(v => v.id).filter(v => values.has(v)),
            workOn: r?.workOn?.n || 0
          });
          store.touchStreak();
          toast({ msg: `Saved. ${finalScore} of ${MAX}.`, icon: '✓', timeout: 2400 });
          location.hash = '#/practice';
        };
      }
    }
  };
  draw();
}

function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
export { PARTS };
