// Flashcards over the figures, the say-this lines and the bank's own numbers. Leitner boxes.
import { buildDeck } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';

let deckCache = null;
function deck() { return deckCache || (deckCache = buildDeck()); }

export function cardsView(main, mode = 'due') {
  const all = deck();
  const now = Date.now();
  const kinds = [...new Set(all.map(c => c.kind))];
  const weak = new Set(store.weakCards);
  let pool = mode === 'weak' ? all.filter(c => weak.has(c.id))
    : mode === 'all' ? all
    : all.filter(c => store.card(c.id).due <= now);
  if (mode !== 'all' && mode !== 'weak') pool = pool.sort(() => Math.random() - 0.5);

  const dueCount = all.filter(c => store.card(c.id).due <= now).length;
  let idx = 0, flipped = false;

  const draw = () => {
    const c = pool[idx];
    main.innerHTML = `<div class="wrap">
      <div class="eyebrow">Flashcards · ${all.length} cards · ${dueCount} due · ${weak.size} weak</div>
      <h1 class="h-lg">The figures and the lines, until they are reflex</h1>
      <div class="tabs" role="tablist">
        <button role="tab" data-mode="due" aria-selected="${mode === 'due'}">Due now</button>
        <button role="tab" data-mode="weak" aria-selected="${mode === 'weak'}">Weak spots</button>
        <button role="tab" data-mode="all" aria-selected="${mode === 'all'}">Everything</button>
      </div>
      ${!c ? `<div class="empty">${mode === 'weak' ? 'No weak cards. Keep grading honestly and they will appear.' : 'Nothing due. Come back tomorrow, or switch to Everything.'}</div>` : `
      <div class="dim mono" style="font-size:12px;margin-bottom:8px">${idx + 1} / ${pool.length} · ${esc(c.kind)} · box ${store.card(c.id).box}</div>
      <div class="fc" id="fc" role="button" tabindex="0" aria-pressed="${flipped}">
        <div>
          <div class="q">${md(c.q)}</div>
          ${flipped ? `<div class="a"><strong>${md(c.a)}</strong>${c.note ? `<br><span class="dim">${md(c.note)}</span>` : ''}${c.extra ? `<br><span class="dim" style="font-size:12.6px">${md(c.extra)}</span>` : ''}</div>` : `<div class="a dim">Tap to reveal</div>`}
        </div>
      </div>
      <div class="pager">
        <button class="btn sec" data-grade="0" ${flipped ? '' : 'disabled'}>Missed it</button>
        <button class="btn" data-grade="1" ${flipped ? '' : 'disabled'}>Knew it</button>
      </div>
      <p class="dim" style="font-size:12.4px">Bank figures are public-page readings dated in the corpus; confirm in-system before saying one to a client.</p>`}
    </div>`;

    main.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => cardsView(main, b.dataset.mode));
    const fc = main.querySelector('#fc');
    if (fc) {
      const flip = () => { flipped = !flipped; draw(); };
      fc.onclick = flip;
      fc.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } };
      main.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => {
        store.gradeCard(c.id, b.dataset.grade === '1');
        store.touchStreak();
        flipped = false;
        idx++;
        if (idx >= pool.length) { cardsView(main, mode); return; }
        draw();
      });
    }
  };
  draw();
}
