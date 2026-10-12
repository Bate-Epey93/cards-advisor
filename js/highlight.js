// Highlighter and summary notepad.
//
// Turn the highlighter on, select text in a section, and the passage is marked in place
// and clipped to a notepad on the right, filed under the subheading it came from. The
// notepad is a docked rail on wide screens and an edge panel on a phone.
//
// Highlights survive re-renders by storing character offsets against a block index rather
// than DOM nodes: the section HTML is deterministic, so offsets map back exactly.
import { store } from './store.js';
import { esc } from './render.js';
import { toast } from './toast.js';

const KINDS = {
  'b-key': 'key', 'b-warn': 'pitfall', 'b-case': 'case', 'b-ge': 'example',
  'b-formula': 'formula', 'b-quote': 'quote', 'b-drill': 'drill', 'b-rubric': 'rubric',
  'b-script': 'script', 'b-code': 'code', 'tbl-wrap': 'table', 'b-list': 'list', 'b-steps': 'steps'
};
const KIND_LABEL = {
  key: 'Key insight', pitfall: 'Pitfall', case: 'Case', example: 'Example', formula: 'Formula',
  quote: 'Quote', drill: 'Drill', rubric: 'Rubric', script: 'Script', code: 'Block',
  table: 'Table', list: 'List', steps: 'Steps', text: '' 
};

let ctx = null;   // { sectionId, sectionTitle, blocksEl }

/* ═════════ offsets ═════════ */
// Character offset of a (node, offset) position within root's textContent.
function offsetOf(root, node, nodeOffset) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0, n;
  while ((n = walk.nextNode())) {
    if (n === node) return total + nodeOffset;
    total += n.nodeValue.length;
  }
  return -1;
}

// Text nodes covering [start, end) within root, with their local slices.
function nodesInRange(root, start, end) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const out = [];
  let total = 0, n;
  while ((n = walk.nextNode())) {
    const len = n.nodeValue.length;
    const nodeStart = total, nodeEnd = total + len;
    if (nodeEnd > start && nodeStart < end) {
      out.push({ node: n, from: Math.max(0, start - nodeStart), to: Math.min(len, end - nodeStart) });
    }
    total = nodeEnd;
    if (total >= end) break;
  }
  return out;
}

/* ═════════ where did this come from ═════════ */
function groupFor(blockEl, node) {
  // inside a disclosure: its summary is the most useful title
  let el = node.nodeType === 3 ? node.parentElement : node;
  const det = el?.closest?.('details');
  if (det && blockEl.contains(det)) {
    const sum = det.querySelector('summary');
    if (sum) return clean(sum.textContent);
  }
  // otherwise the nearest subheading above this block
  let prev = blockEl;
  while (prev) {
    if (prev.classList?.contains('b-h')) return clean(prev.textContent);
    prev = prev.previousElementSibling;
  }
  return ctx?.sectionTitle || 'Notes';
}

function kindFor(blockEl, node) {
  let el = node.nodeType === 3 ? node.parentElement : node;
  while (el && el !== blockEl.parentElement) {
    for (const cls of el.classList || []) if (KINDS[cls]) return KINDS[cls];
    el = el.parentElement;
  }
  for (const cls of blockEl.classList || []) if (KINDS[cls]) return KINDS[cls];
  return 'text';
}

const clean = s => String(s || '').replace(/\s+/g, ' ').replace(/^[+·\s]+|[+\s]+$/g, '').trim();

/* ═════════ capture ═════════ */
function capture() {
  if (!ctx || !store.pref('hlOn')) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const blockEl = [...ctx.blocksEl.children].find(c => c.contains(range.commonAncestorContainer) || c === range.commonAncestorContainer);
  if (!blockEl) return;

  const text = clean(sel.toString());
  if (text.length < 2) return;

  const start = offsetOf(blockEl, range.startContainer, range.startOffset);
  const end = offsetOf(blockEl, range.endContainer, range.endOffset);
  if (start < 0 || end < 0 || end <= start) return;

  const clip = {
    id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    b: +blockEl.dataset.b, start, end, text,
    group: groupFor(blockEl, range.startContainer),
    kind: kindFor(blockEl, range.startContainer),
    at: Date.now()
  };

  const list = store.highlights(ctx.sectionId);
  // ignore an exact repeat of a range already clipped
  if (list.some(h => h.b === clip.b && h.start === clip.start && h.end === clip.end)) { sel.removeAllRanges(); return; }

  store.addHighlight(ctx.sectionId, clip);
  sel.removeAllRanges();
  paintHighlights();
  renderPanel();
  if (!store.pref('hlPanel')) openPanel(true);
  store.touchStreak();
}

/* ═════════ paint ═════════ */
export function paintHighlights() {
  if (!ctx) return;
  ctx.blocksEl.querySelectorAll('mark.hl').forEach(m => {
    const parent = m.parentNode;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize();
  });

  const list = store.highlights(ctx.sectionId);
  // paint from the end so earlier offsets stay valid as nodes split
  [...list].sort((a, b) => b.b - a.b || b.start - a.start).forEach(h => {
    const blockEl = ctx.blocksEl.children[h.b];
    if (!blockEl) return;
    nodesInRange(blockEl, h.start, h.end).forEach(({ node, from, to }) => {
      try {
        const r = document.createRange();
        r.setStart(node, from);
        r.setEnd(node, to);
        const mark = document.createElement('mark');
        mark.className = 'hl';
        mark.dataset.hid = h.id;
        r.surroundContents(mark);
      } catch { /* a range that crosses element boundaries is painted per node, so skip the odd one */ }
    });
  });
}

/* ═════════ panel ═════════ */
function panelEl() {
  let p = document.getElementById('hlPanel');
  if (p) return p;
  p = document.createElement('aside');
  p.id = 'hlPanel';
  p.className = 'hl-panel';
  p.setAttribute('aria-label', 'Summary notepad');
  document.body.appendChild(p);

  const handle = document.createElement('button');
  handle.id = 'hlHandle';
  handle.className = 'hl-handle';
  handle.setAttribute('aria-label', 'Open the summary notepad');
  handle.innerHTML = `<span class="hl-handle-grip"></span><span class="hl-handle-n" data-n>0</span>`;
  handle.onclick = () => openPanel(!store.pref('hlPanel'));
  document.body.appendChild(handle);

  return p;
}

export function renderPanel() {
  if (!ctx) return;
  const p = panelEl();
  const list = store.highlights(ctx.sectionId);
  const groups = [];
  list.forEach(h => {
    let g = groups.find(x => x.title === h.group);
    if (!g) groups.push(g = { title: h.group, items: [] });
    g.items.push(h);
  });

  const n = list.length;
  const handleN = document.querySelector('#hlHandle [data-n]');
  if (handleN) handleN.textContent = n;
  document.getElementById('hlHandle')?.classList.toggle('has', n > 0);

  p.innerHTML = `
    <div class="hl-head">
      <div style="min-width:0">
        <div class="eyebrow" style="margin:0">Summary notepad</div>
        <div class="hl-sec">${esc(ctx.sectionTitle)}</div>
      </div>
      <button class="icon-btn" data-hl-close aria-label="Close the notepad">×</button>
    </div>

    ${n ? `<div class="hl-body">
      ${groups.map(g => `<section class="hl-group">
        <h3 class="hl-group-t">${esc(g.title)}</h3>
        ${g.items.map(h => `<div class="hl-clip" data-go="${h.id}">
          ${KIND_LABEL[h.kind] ? `<span class="hl-kind hl-${h.kind}">${esc(KIND_LABEL[h.kind])}</span>` : ''}
          <p>${esc(h.text)}</p>
          <button class="hl-x" data-del="${h.id}" aria-label="Remove this clipping">×</button>
        </div>`).join('')}
      </section>`).join('')}
    </div>

    <div class="hl-foot">
      <span class="mono dim">${n} clipping${n === 1 ? '' : 's'}</span>
      <span class="row" style="gap:6px;margin-left:auto">
        <button class="copy" data-hl-copy>Copy</button>
        <button class="copy" data-hl-note>To notes</button>
        <button class="copy" data-hl-clear style="color:var(--rs)">Clear</button>
      </span>
    </div>`
    : `<div class="hl-empty">
        <p><strong>Nothing clipped yet.</strong></p>
        <p>Turn the highlighter on, then select any passage. It is marked in the page and filed here under the heading it came from.</p>
      </div>`}`;

  p.querySelector('[data-hl-close]').onclick = () => openPanel(false);
  p.querySelectorAll('[data-del]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    store.removeHighlight(ctx.sectionId, b.dataset.del);
    paintHighlights(); renderPanel();
  });
  p.querySelectorAll('[data-go]').forEach(c => c.onclick = () => {
    const mark = ctx.blocksEl.querySelector(`mark.hl[data-hid="${c.dataset.go}"]`);
    if (!mark) return;
    mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
    mark.classList.add('flash');
    setTimeout(() => mark.classList.remove('flash'), 1200);
    if (window.matchMedia('(max-width:1099px)').matches) openPanel(false);
  });

  p.querySelector('[data-hl-copy]')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(asMarkdown(ctx.sectionTitle, groups)); toast({ msg: 'Summary copied.', icon: '❐', timeout: 2000 }); }
    catch { toast({ msg: 'Clipboard blocked by the browser.', timeout: 3200 }); }
  });
  p.querySelector('[data-hl-note]')?.addEventListener('click', () => {
    const existing = store.note(ctx.sectionId);
    store.note(ctx.sectionId, (existing ? existing.trimEnd() + '\n\n' : '') + asMarkdown(null, groups));
    toast({ msg: 'Added to your notes for this section.', icon: '✓', timeout: 2600 });
    const ta = document.querySelector(`textarea[data-note="${ctx.sectionId}"]`);
    if (ta) ta.value = store.note(ctx.sectionId);
  });
  p.querySelector('[data-hl-clear]')?.addEventListener('click', () => {
    if (!confirm('Remove every clipping from this section?')) return;
    store.clearHighlights(ctx.sectionId);
    paintHighlights(); renderPanel();
  });
}

export function asMarkdown(title, groups) {
  const L = [];
  if (title) L.push(`## ${title}`, '');
  groups.forEach(g => {
    L.push(`**${g.title}**`, '');
    g.items.forEach(h => L.push(`- ${KIND_LABEL[h.kind] ? `*(${KIND_LABEL[h.kind]})* ` : ''}${h.text}`));
    L.push('');
  });
  return L.join('\n');
}

/* ═════════ open / close ═════════ */
export function openPanel(on) {
  panelEl();
  store.pref('hlPanel', !!on);
  document.body.classList.toggle('hl-open', !!on);
  document.getElementById('hlPanel')?.setAttribute('aria-hidden', String(!on));
  if (on) renderPanel();
}

/* ═════════ mount per section ═════════ */
export function mountHighlighter({ sectionId, sectionTitle, blocksEl, toolbarEl }) {
  ctx = { sectionId, sectionTitle, blocksEl };
  [...blocksEl.children].forEach((el, i) => { el.dataset.b = i; });

  paintHighlights();
  panelEl();
  renderPanel();
  document.body.classList.toggle('hl-open', !!store.pref('hlPanel'));
  document.body.classList.toggle('hl-armed', !!store.pref('hlOn'));

  if (toolbarEl) {
    toolbarEl.innerHTML = `
      <button class="hl-btn" data-hl-toggle aria-pressed="${!!store.pref('hlOn')}">
        <span class="hl-btn-ico">▨</span><span>Highlighter</span>
      </button>
      <button class="hl-btn ghost" data-hl-open>
        <span class="hl-btn-ico">☰</span><span>Notepad</span>
        <span class="hl-count" data-count>${store.highlights(sectionId).length}</span>
      </button>`;
    toolbarEl.querySelector('[data-hl-toggle]').onclick = e => {
      const on = !store.pref('hlOn');
      store.pref('hlOn', on);
      e.currentTarget.setAttribute('aria-pressed', String(on));
      document.body.classList.toggle('hl-armed', on);
      toast({
        msg: on ? 'Highlighter on. Select any passage to clip it.' : 'Highlighter off.',
        icon: on ? '▨' : '○', timeout: 2400
      });
      if (on && !store.pref('hlPanel') && window.matchMedia('(min-width:1100px)').matches) openPanel(true);
    };
    toolbarEl.querySelector('[data-hl-open]').onclick = () => openPanel(!store.pref('hlPanel'));
  }

  // capture after the selection settles; touch needs a beat for the handles to finish
  blocksEl.addEventListener('mouseup', () => setTimeout(capture, 10));
  blocksEl.addEventListener('touchend', () => setTimeout(capture, 260));

  // tapping a mark while armed removes it
  blocksEl.addEventListener('click', e => {
    const mark = e.target.closest('mark.hl');
    if (!mark || !store.pref('hlOn')) return;
    if (!window.getSelection()?.isCollapsed) return;
    store.removeHighlight(sectionId, mark.dataset.hid);
    paintHighlights(); renderPanel();
  });
}

export function unmountHighlighter() {
  ctx = null;
  document.body.classList.remove('hl-open');
  const p = document.getElementById('hlPanel');
  const h = document.getElementById('hlHandle');
  p?.remove(); h?.remove();
}

/* ═════════ edge gesture: swipe in from the right ═════════ */
let ex = 0, ey = 0, edging = false;
document.addEventListener('touchstart', e => {
  if (!ctx || e.touches.length !== 1) return;
  const t = e.touches[0];
  const open = document.body.classList.contains('hl-open');
  // start within the right edge to open, or anywhere on the panel to close
  edging = open ? !!e.target.closest('#hlPanel') : t.clientX > window.innerWidth - 26;
  ex = t.clientX; ey = t.clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  if (!edging || !ctx) return;
  edging = false;
  const t = e.changedTouches[0];
  const dx = t.clientX - ex, dy = t.clientY - ey;
  if (Math.abs(dy) > 60 || Math.abs(dx) < 45) return;
  if (dx < 0 && !document.body.classList.contains('hl-open')) openPanel(true);
  if (dx > 0 && document.body.classList.contains('hl-open')) openPanel(false);
}, { passive: true });

// a swipe that begins at the right edge belongs to the panel, not to section paging
export function edgeActive() { return edging; }
