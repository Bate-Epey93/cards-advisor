// Flashcards over the figures, the say-this lines and the bank's own numbers. Leitner boxes.
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
  let pool = mode === 'weak' ? byKind.filter(c => weak.has(c.id))
    : mode === 'all' ? [...byKind]
    : byKind.filter(c => store.card(c.id).due <= now);

  if (mode === 'due') pool = pool.sort(() => Math.random() - 0.5);

  const dueCount = all.filter(c => store.card(c.id).due <= now).length;
  const masteredCount = all.filter(c => store.card(c.id).box >= 4).length;

  // Count cards per Leitner box (1..5)
  const boxCounts = [0, 0, 0, 0, 0];
  all.forEach(c => {
    const b = Math.min(5, Math.max(1, store.card(c.id).box || 1));
    boxCounts[b - 1]++;
  });

  let idx = 0, flipped = false;

  const draw = () => {
    const c = pool[idx];
    const progressSegs = pool.slice(0, 28); // visual cap for progress segments

    main.innerHTML = `<section class="screen screen-active"><div class="screen-inner" style="max-width:780px">
      <div class="kicker">Spaced Repetition · ${all.length} cards · ${dueCount} due now · ${weak.size} weak spots</div>
      <h1 class="title">The figures and lines, until they are reflex.</h1>
      <p class="subtitle">Leitner 5-box spaced repetition over statutory liability caps, complaint timelines, paired "Say this / Not this" lines, and public bank figures.</p>

      <!-- Leitner Box Distribution -->
      <div class="leitner-bar" aria-label="Leitner box distribution">
        ${boxCounts.map((cnt, i) => `
          <div class="leitner-box ${i >= 3 ? 'mastered' : i === 0 ? 'box-1' : ''}">
            <span class="lb-num">Box ${i + 1}</span>
            <strong class="lb-cnt">${cnt}</strong>
            <span class="lb-days">${[1, 2, 4, 8, 16][i]}d interval</span>
          </div>
        `).join('')}
      </div>

      <div class="lib-subbar" style="margin:18px 0 14px">
        <div class="lib-filters" role="tablist" aria-label="Deck mode">
          <button class="lib-fchip ${mode === 'due' ? 'on' : ''}" data-mode="due" type="button">Due now (${dueCount})</button>
          <button class="lib-fchip ${mode === 'weak' ? 'on' : ''}" data-mode="weak" type="button">Weak spots (${weak.size})</button>
          <button class="lib-fchip ${mode === 'all' ? 'on' : ''}" data-mode="all" type="button">All cards (${all.length})</button>
        </div>
        <div class="lib-filters" role="group" aria-label="Card type filter">
          ${[
            ['', 'All types'],
            ['figure', 'Statutes'],
            ['say this', 'Say This'],
            ['bank figure', 'Bank FAQ']
          ].map(([k, lbl]) => `<button class="lib-fchip ${kindFilter === k ? 'on' : ''}" data-kind="${k}" type="button">${lbl}</button>`).join('')}
        </div>
      </div>

      ${!c ? `
        <div class="empty-panel" style="text-align:center;padding:36px 24px">
          <img class="enso-stamp complete stamped" src="assets/enso-complete.svg" alt="" style="margin:0 auto 12px;display:block">
          <strong style="font-size:18px;display:block">${mode === 'weak' ? 'No weak cards right now.' : 'All caught up for today.'}</strong>
          <p style="margin:8px auto 16px">${mode === 'weak' ? 'Keep grading honestly as you study and any missed cards will collect here.' : 'You have cleared every due card in this filter. Switch to All Cards to keep drilling.'}</p>
          <button class="big-btn" data-mode="all" type="button">Browse all ${all.length} cards</button>
        </div>
      ` : `
        <!-- Session Progress Bar -->
        <div class="rv-progress" aria-label="Card ${idx + 1} of ${pool.length}">
          ${progressSegs.map((_, k) => `<span class="${k < idx ? 'done' : k === idx ? 'on' : ''}"></span>`).join('')}
        </div>

        <div class="between" style="margin-bottom:10px">
          <span class="mono-label">Card ${idx + 1} of ${pool.length} · ${esc(c.kind)}</span>
          <span class="chip flagship">Leitner Box ${store.card(c.id).box} of 5</span>
        </div>

        <div class="rv-card fc-stage" id="fc" role="button" tabindex="0" aria-pressed="${flipped}">
          <div class="rv-type">${c.kind === 'figure' ? 'Statutory / Network Figure' : c.kind === 'say this' ? 'Say This, Not This' : 'Bank Public Page Figure'}</div>
          <div class="fc-prompt">${md(c.q)}</div>

          ${flipped ? `
            <div class="fc-answer">
              <div class="sc-label" style="color:var(--accent-deep);margin-bottom:6px">Answer</div>
              <div class="fc-ans-main">${md(c.a)}</div>
              ${c.note ? `<div class="fc-ans-note">${md(c.note)}</div>` : ''}
              ${c.extra ? `<div class="fc-ans-extra"><strong>Client line / context:</strong> ${md(c.extra)}</div>` : ''}
            </div>
          ` : `
            <div class="fc-tap-hint">Tap card or press <kbd>Space</kbd> to reveal answer</div>
          `}
        </div>

        <div class="rv-rate" style="margin-top:14px">
          <button type="button" class="rv-rate-btn rate-miss" data-grade="0" ${flipped ? '' : 'disabled'}>
            <b>Missed it</b>
            <span>Reset to Box 1 (1d) · Key 1</span>
          </button>
          <button type="button" class="rv-rate-btn rate-flip" id="flipBtn">
            <b>${flipped ? 'Hide answer' : 'Reveal answer'}</b>
            <span>Space / Enter</span>
          </button>
          <button type="button" class="rv-rate-btn rate-hit" data-grade="1" ${flipped ? '' : 'disabled'}>
            <b>Knew it cold</b>
            <span>Advance to Box ${Math.min(5, store.card(c.id).box + 1)} · Key 2</span>
          </button>
        </div>

        <p class="fine">Bank figures are public-page readings dated in the corpus; always confirm in-system before quoting to a client.</p>
      `}
    </div></section>`;

    main.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => cardsView(main, b.dataset.mode, kindFilter));
    main.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => cardsView(main, mode, b.dataset.kind));

    const fc = main.querySelector('#fc');
    if (fc) {
      const flip = () => { flipped = !flipped; draw(); };
      fc.onclick = flip;
      main.querySelector('#flipBtn').onclick = flip;
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
