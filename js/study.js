// Flashcards over the key figures, the say-this lines and the bank's own numbers. Five boxes,
// shown to the advisor as New, Learning and Known.
import { buildDeck } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';

let deckCache = null;
function deck() { return deckCache || (deckCache = buildDeck()); }

export function cardsView(main, mode = 'due', kindFilter = '') {
  document.body.classList.remove('reading');
  const all = deck();
  const now = Date.now();
  const weak = new Set(store.weakCards);

  const byKind = kindFilter ? all.filter(c => c.kind === kindFilter) : all;
  const dueInKind = byKind.filter(c => store.card(c.id).due <= now).length;
  const weakInKind = byKind.filter(c => weak.has(c.id)).length;
  let pool = mode === 'weak' ? byKind.filter(c => weak.has(c.id))
    : mode === 'all' ? [...byKind]
    : byKind.filter(c => store.card(c.id).due <= now);

  if (mode === 'due') pool = pool.sort(() => Math.random() - 0.5);


  // Count cards per box (1..5), shown as three levels: New, Learning, Known
  const boxCounts = [0, 0, 0, 0, 0];
  all.forEach(c => {
    const b = Math.min(5, Math.max(1, store.card(c.id).box || 1));
    boxCounts[b - 1]++;
  });
  const fresh = boxCounts[0], learning = boxCounts[1] + boxCounts[2], known = boxCounts[3] + boxCounts[4];
  const levels = [[known, 'var(--teal)'], [learning, 'var(--accent)'], [fresh, 'var(--hair-strong)']];

  let idx = 0, flipped = false;

  const draw = () => {
    const c = pool[idx];
    const box = c ? (store.card(c.id).box || 1) : 1;
    const nextDays = [1, 2, 4, 8, 16][Math.min(5, box + 1) - 1];

    main.innerHTML = `<section class="screen screen-active"><div class="screen-inner" style="max-width:780px">
      <div class="lib-hero">
        <h1 class="title">Flashcards</h1>
        <p class="subtitle">Rules, numbers and what to say. Missed cards come back sooner.</p>
      </div>

      <div class="fc-levels" role="img" aria-label="How well you know the deck" style="display:flex;gap:2px;height:6px;border-radius:999px;overflow:hidden;background:var(--line)">
        ${levels.filter(([n]) => n > 0).map(([n, col]) => `<span style="flex:${n} 1 0;background:${col}"></span>`).join('')}
      </div>
      <p class="dim" style="font-size:12.5px;margin:6px 0 0">${known} known, ${learning} learning, ${fresh} new</p>
      <details class="disc" style="margin-top:10px">
        <summary>How it works</summary>
        <div class="body">Back in 1 day, 2 days, 4 days, 8 days, 16 days as you get a card right.</div>
      </details>

      <div class="lib-subbar" style="margin:14px 0 14px">
        <div class="lib-filters" role="group" aria-label="Which cards">
          <button class="lib-fchip ${mode === 'due' ? 'on' : ''}" data-mode="due" type="button" aria-pressed="${mode === 'due'}">Due (${dueInKind})</button>
          <button class="lib-fchip ${mode === 'weak' ? 'on' : ''}" data-mode="weak" type="button" aria-pressed="${mode === 'weak'}">Missed (${weakInKind})</button>
          <button class="lib-fchip ${mode === 'all' ? 'on' : ''}" data-mode="all" type="button" aria-pressed="${mode === 'all'}">All</button>
        </div>
        <select id="fcKind" class="sel-pill" aria-label="Card type">
          ${[
            ['', 'All types'],
            ['figure', 'Key figures'],
            ['say this', 'Say this, not this'],
            ['bank figure', 'Bank pages']
          ].map(([k, lbl]) => `<option value="${k}" ${kindFilter === k ? 'selected' : ''}>${lbl}</option>`).join('')}
        </select>
      </div>

      ${!c ? `
        <div class="empty-panel" style="text-align:center;padding:36px 24px">
          <img class="enso-stamp complete stamped" src="assets/enso-complete.svg" alt="" style="margin:0 auto 12px;display:block">
          <strong style="font-size:18px;display:block">${mode === 'weak' ? 'No missed cards right now.' : 'All caught up.'}</strong>
          <p style="margin:8px auto 16px">${mode === 'weak' ? 'Cards you miss will show up here.' : 'Nothing is due here. Tap All to keep going.'}</p>
          <button class="big-btn" data-mode="all" type="button">See all ${byKind.length} cards</button>
        </div>
      ` : `
        <div class="trk-bar" aria-hidden="true" style="margin:4px 0 8px">
          <div class="trk-bar-fill" style="width:${Math.round(idx / pool.length * 100)}%"></div>
        </div>

        <div style="margin-bottom:10px">
          <span class="mono-label">${idx + 1} of ${pool.length}</span>
        </div>

        <div class="rv-card fc-stage" id="fc" role="button" tabindex="0" aria-pressed="${flipped}">
          <div class="rv-type">${c.kind === 'figure' ? 'Key figure' : c.kind === 'say this' ? 'Say this, not this' : 'Bank page'}</div>
          <div class="fc-prompt">${md(c.q)}</div>

          ${flipped ? `
            <div class="fc-answer">
              <div class="fc-ans-main">${md(c.a)}</div>
              ${c.note ? `<div class="fc-ans-note">${md(c.note)}</div>` : ''}
              ${c.extra ? `<div class="fc-ans-extra"><strong>${c.kind === 'figure' ? 'What to say:' : c.kind === 'say this' ? 'From the issue:' : 'Page dated:'}</strong> ${md(c.extra)}</div>` : ''}
            </div>
          ` : `
            <div class="fc-tap-hint">Tap to flip<span class="kbd-hint"> or press Space</span></div>
          `}
        </div>

        ${flipped ? `
          <div class="rv-rate" style="margin-top:14px;grid-template-columns:repeat(2,minmax(0,1fr))">
            <button type="button" class="rv-rate-btn rate-miss" data-grade="0">
              <b>Missed it</b>
              <span>Back tomorrow<span class="kbd-hint"> · key 1</span></span>
            </button>
            <button type="button" class="rv-rate-btn rate-hit" data-grade="1">
              <b>Got it</b>
              <span>Back in ${nextDays} days<span class="kbd-hint"> · key 2</span></span>
            </button>
          </div>
        ` : `
          <button type="button" class="big-btn" id="flipBtn" style="width:100%;justify-content:center;margin-top:14px">Show answer</button>
        `}

        <p class="fine" style="margin-top:12px">Bank numbers come from public pages. Confirm in-system before you quote one.</p>
      `}
    </div></section>`;

    main.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => cardsView(main, b.dataset.mode, kindFilter));
    main.querySelector('#fcKind').onchange = e => cardsView(main, mode, e.target.value);

    const fc = main.querySelector('#fc');
    if (fc) {
      const flip = () => { flipped = !flipped; draw(); };
      fc.onclick = flip;
      main.querySelector('#flipBtn')?.addEventListener('click', flip);
      const grade = ok => {
        if (!flipped) return;
        store.gradeCard(c.id, ok);
        store.touchStreak();
        flipped = false;
        idx++;
        if (idx >= pool.length) { cardsView(main, mode, kindFilter); return; }
        draw();
      };
      main.querySelectorAll('[data-grade]').forEach(b => {
        b.onclick = () => grade(b.dataset.grade === '1');
      });
      fc.onkeydown = e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
        else if (flipped && (e.key === '1' || e.key === 'ArrowLeft')) { e.preventDefault(); grade(false); }
        else if (flipped && (e.key === '2' || e.key === 'ArrowRight')) { e.preventDefault(); grade(true); }
      };
      fc.focus({ preventScroll: true });
    }
  };
  draw();
}
