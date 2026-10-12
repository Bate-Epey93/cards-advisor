// Role-play drills: the client's real opening line, a three-minute clock, you write the
// first fifteen seconds, the questions and the resolution, then score yourself against
// the breakdown. Only issues with an authored breakdown have a drill.
import { data, issueById, PARTS } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';

const MINUTES = 3;
const CRITERIA = [
  ['heard', 'Proved you heard the specific thing in the first sentence'],
  ['fork', 'Questions reach the fork in the fewest steps'],
  ['accurate', 'Liability and timing stated accurately, with a source you could name'],
  ['craft', 'No branch to someone who cannot use one, no "unfortunately", no policy wall']
];
const STARTER = `## First fifteen seconds\n\n\n## Questions, in order\n\n\n## Resolution, including liability and timing\n\n`;

let timer = null;
export function stopTimers() { clearInterval(timer); timer = null; }

export function practiceView(main) {
  const D = data();
  const drills = D.issues.filter(i => i.breakdown);
  main.innerHTML = `<div class="wrap">
    <div class="eyebrow">Practice · ${drills.length} role-play drills · ${store.drillCount} runs</div>
    <h1 class="h-lg">Ten minutes between calls that feels like a call</h1>
    <p class="lede">The opening is a real client's words. You get ${MINUTES} minutes to write the first fifteen seconds, the questions in order and the resolution. Then the breakdown is revealed and you score yourself on four lines. Honest scores are the point; nobody else sees them.</p>
    ${drills.map(i => {
      const d = store.drill(i.id);
      return `<a class="card issue-row" href="#/drill/${i.id}">
        <span class="issue-main"><span class="issue-title">${esc(i.title)}</span>
          <span class="dim issue-sub">${esc((i.quotes?.[0]?.text || '').slice(0, 110))}</span>
          <span class="row" style="gap:6px;margin-top:6px"><span class="tag">${esc(i.category)}</span>${d ? `<span class="tag bd">best ${d.best}/12 · ${d.runs.length} run${d.runs.length === 1 ? '' : 's'}</span>` : ''}</span></span>
        <span class="mono dim">→</span></a>`;
    }).join('')}
    <p class="dim" style="font-size:12.4px;margin-top:18px">Want a longer exercise? The three-call cards simulation and the leadership ops review live in Praxis, tracks 16 and 20.</p>
  </div>`;
}

export function drillView(main, id) {
  const i = issueById(id);
  if (!i?.breakdown) { main.innerHTML = `<div class="wrap"><div class="empty">No drill for this issue yet.</div></div>`; return; }
  const bd = i.breakdown;
  const opening = i.quotes?.[0]?.text || bd.surfaceRequest;
  const prev = store.drill(id);
  let phase = 'write';   // write | score
  let secs = MINUTES * 60, elapsed = 0;
  let scores = {};

  const draw = () => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    main.innerHTML = `<div class="wrap">
      <a class="dim" href="#/practice" style="font-size:12.6px">← Practice</a>
      <div class="eyebrow" style="margin-top:10px">${MINUTES} minute drill · ${esc(i.category)}</div>
      <h1 class="h-md">${esc(i.title)}</h1>
      <div class="b-quote">${md(opening)}<cite>the client's opening, from the corpus</cite></div>
      ${phase === 'write' ? `
        <div class="timer-bar" id="timer"><span class="timer-num" id="timerNum">${fmt(secs)}</span><span class="dim">Write as you would speak. Headings are there to keep you honest.</span></div>
        <textarea class="note" id="drillText" rows="14" placeholder="${esc(STARTER)}">${esc(store.draft(id) || STARTER)}</textarea>
        <div class="pager"><span class="dim" style="font-size:12.4px">${prev ? `Best ${prev.best}/12 over ${prev.runs.length} run${prev.runs.length === 1 ? '' : 's'}` : 'First run'}</span><button class="btn" id="reveal">Reveal and score →</button></div>`
      : `
        <div class="b-key"><span class="lbl">The breakdown's first fifteen seconds</span><p>${md(bd.engage)}</p></div>
        <div class="b-h">Questions, in order</div><ol class="b-steps">${bd.diagnose.map((q, k) => `<li><span class="num">${k + 1}</span><span>${md(q)}</span></li>`).join('')}</ol>
        <div class="b-h">Resolve</div><p>${md(bd.resolve)}</p>
        ${bd.sayThisNotThis.map(s => `<div class="b-ge"><div class="hd">Say this, not this</div><div class="g"><b>Say</b> ${md(s.say)}</div><div class="b"><b>Not</b> ${md(s.not)}</div><div class="w">${md(s.why)}</div></div>`).join('')}
        <div class="b-h">Your version (${fmt(elapsed)} used)</div>
        <pre class="b-code">${esc(store.draft(id) || '')}</pre>
        <div class="b-h">Score yourself, 0 to 3 each</div>
        ${CRITERIA.map(([k, label]) => `<div class="score-row"><span>${label}</span><span>${[0, 1, 2, 3].map(n => `<button class="score-btn" data-crit="${k}" data-n="${n}" aria-pressed="${scores[k] === n}">${n}</button>`).join('')}</span></div>`).join('')}
        <div class="pager"><span class="mono">${total} / 12</span><button class="btn" id="save" ${Object.keys(scores).length < CRITERIA.length ? 'disabled' : ''}>Save run</button></div>
        <p class="dim" style="font-size:12.4px">Read the full breakdown: <a href="#/issue/${i.id}/all">${esc(i.title)}</a>.</p>`}
    </div>`;

    if (phase === 'write') {
      const ta = main.querySelector('#drillText');
      ta.addEventListener('input', () => store.draft(id, ta.value));
      ta.focus();
      const num = main.querySelector('#timerNum'), bar = main.querySelector('#timer');
      stopTimers();
      timer = setInterval(() => {
        secs--; elapsed++;
        num.textContent = fmt(Math.abs(secs));
        if (secs < 0) bar.classList.add('over');
        if (secs === 0) toast({ msg: 'Time. Finish the sentence and reveal.', icon: '◷', timeout: 3000 });
      }, 1000);
      main.querySelector('#reveal').onclick = () => { stopTimers(); store.draft(id, ta.value); phase = 'score'; draw(); window.scrollTo(0, 0); };
    } else {
      main.querySelectorAll('[data-crit]').forEach(b => b.onclick = () => { scores[b.dataset.crit] = +b.dataset.n; draw(); });
      const save = main.querySelector('#save');
      if (save) save.onclick = () => {
        const text = store.draft(id);
        store.saveDrillRun(id, { at: Date.now(), secs: elapsed, text, scores, score: Object.values(scores).reduce((a, b) => a + b, 0) });
        store.touchStreak();
        toast({ msg: 'Run saved.', icon: '✓', timeout: 2200 });
        location.hash = '#/practice';
      };
    }
  };
  draw();
}

function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
export { PARTS };
