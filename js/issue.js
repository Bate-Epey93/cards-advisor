// Issue bank and the guided breakdown walkthrough.
import { data, issueById, policyById, PARTS, DEPTHS, isStale } from './data.js';
import { store } from './store.js';
import { esc, md } from './render.js';
import { mountHighlighter, unmountHighlighter } from './highlight.js';
import { verifyBadge, policyCard } from './policy.js';

const FREQ_RANK = { 'very common': 0, common: 1, occasional: 2 };
const EMOTIONS = ['angry', 'scared', 'embarrassed', 'confused', 'resigned', 'blindsided', 'anxious', 'humiliated'];

let filters = { q: '', cat: '', freq: '', emo: '', bd: false };

/* ═════════ bank ═════════ */
export function bankView(main, cat) {
  if (cat !== undefined) filters = { ...filters, cat };
  const D = data();
  const list = D.issues
    .filter(i => !filters.cat || i.category === filters.cat)
    .filter(i => !filters.freq || i.frequency === filters.freq)
    .filter(i => !filters.emo || (i.emotion || '').toLowerCase().includes(filters.emo))
    .filter(i => !filters.bd || i.breakdown)
    .filter(i => {
      if (!filters.q) return true;
      const t = [i.title, i.category, i.emotion, i.underlyingJob, i.trainingPoint, ...(i.quotes || []).map(q => q.text)].join(' ').toLowerCase();
      return filters.q.split(/\s+/).every(w => t.includes(w));
    })
    .sort((a, b) => (FREQ_RANK[a.frequency] - FREQ_RANK[b.frequency]) || ((b.breakdown ? 1 : 0) - (a.breakdown ? 1 : 0)) || a.n - b.n);

  const withBd = D.issues.filter(i => i.breakdown).length;
  const recent = store.recent(3).map(issueById).filter(Boolean);

  main.innerHTML = `<div class="wrap">
    <div class="eyebrow">Issue bank · ${D.issues.length} issues · ${withBd} with a guided breakdown</div>
    <h1 class="h-lg">What clients call about, and what they want underneath</h1>
    <p class="lede">Observed from about 120 public complaints, grouped into ${D.categories.length} categories. Open an issue for the eleven-part breakdown: the real problem, the emotional read, the first fifteen seconds, the questions in order, the paths to a resolution, and the rule behind each figure.</p>

    ${recent.length ? `<div class="chips" aria-label="Recently opened">${recent.map(i => `<a class="chip" href="#/issue/${i.id}">↻ ${esc(i.title.slice(0, 48))}${i.title.length > 48 ? '…' : ''}</a>`).join('')}</div>` : ''}

    <div class="field"><input id="bankQ" type="search" placeholder="Search titles, quotes, emotions… (e.g. abroad, lock, refund, spouse)" value="${esc(filters.q)}" autocomplete="off"></div>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <select id="bankCat" class="sel"><option value="">All categories</option>${D.categories.map(c => `<option value="${esc(c)}"${filters.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <select id="bankEmo" class="sel"><option value="">Any emotion</option>${EMOTIONS.map(e => `<option value="${e}"${filters.emo === e ? ' selected' : ''}>${e}</option>`).join('')}</select>
    </div>
    <div class="chips">
      ${['', 'very common', 'common', 'occasional'].map(f => `<button class="chip" data-freq="${f}" aria-pressed="${filters.freq === f}">${f || 'Any frequency'}</button>`).join('')}
      <button class="chip" data-bd aria-pressed="${filters.bd}">Guided breakdown only</button>
    </div>

    ${list.length ? list.map(i => `
      <a class="card issue-row" href="#/issue/${i.id}">
        <span class="issue-main">
          <span class="issue-title">${esc(i.title)}</span>
          <span class="dim issue-sub">${esc(i.underlyingJob || '')}</span>
          <span class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
            <span class="tag">${esc(i.category)}</span>
            <span class="tag freq-${i.frequency.replace(' ', '-')}">${esc(i.frequency)}</span>
            ${i.breakdown ? '<span class="tag bd">guided breakdown</span>' : '<span class="tag">observed</span>'}
          </span>
        </span>
        <span class="mono dim" aria-hidden="true">→</span>
      </a>`).join('') : `<div class="empty">Nothing matches. Clear a filter.</div>`}

    <p class="dim" style="font-size:12.4px;margin-top:22px">Not an official source for any bank. Every figure in this app is public material with its source and date; confirm it in your own systems before saying it to a client. Nothing you type here leaves this device.</p>
  </div>`;

  const rerun = () => bankView(main);
  main.querySelector('#bankQ').addEventListener('input', e => { filters.q = e.target.value.trim().toLowerCase(); rerun(); const q = main.querySelector('#bankQ'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); });
  main.querySelector('#bankCat').onchange = e => { filters.cat = e.target.value; rerun(); };
  main.querySelector('#bankEmo').onchange = e => { filters.emo = e.target.value; rerun(); };
  main.querySelectorAll('[data-freq]').forEach(b => b.onclick = () => { filters.freq = b.dataset.freq; rerun(); });
  main.querySelector('[data-bd]').onclick = () => { filters.bd = !filters.bd; rerun(); };
}

/* ═════════ one issue ═════════ */
function para(v) { return String(v || '').split('\n\n').map(p => `<p>${md(p)}</p>`).join(''); }

function renderPart(key, val) {
  if (val == null) return '';
  if (key === 'riskFlags') return `<div class="b-warn"><span class="lbl">Flags</span><ul class="b-list">${val.map(v => `<li>${md(v)}</li>`).join('')}</ul></div>`;
  if (key === 'diagnose') return `<ol class="b-steps">${val.map((v, i) => `<li><span class="num">${i + 1}</span><span>${md(v)}</span></li>`).join('')}</ol>`;
  if (key === 'sayThisNotThis') return val.map(s => `<div class="b-ge"><div class="hd">Say this, not this</div><div class="g"><b>Say</b> ${md(s.say)}</div><div class="b"><b>Not</b> ${md(s.not)}</div><div class="w">${md(s.why)}</div></div>`).join('');
  if (Array.isArray(val)) return `<ul class="b-list">${val.map(v => `<li>${md(v)}</li>`).join('')}</ul>`;
  if (key === 'surfaceRequest') return `<div class="b-quote">${md(val)}</div>`;
  if (key === 'engage') return `<div class="b-key"><span class="lbl">First fifteen seconds</span>${para(val)}</div>`;
  return para(val);
}

function observedBlocks(i) {
  return `
    ${(i.quotes || []).map(q => `<div class="b-quote">${md(q.text)}<cite>${q.url ? `<a href="${esc(q.url)}" target="_blank" rel="noopener">source</a>` : ''}${q.snippetOnly ? ' · search snippet only, page not loaded' : ''}</cite></div>`).join('')}
    ${i.frequencyEvidence ? `<div class="b-case"><span class="lbl">Frequency</span>${md(i.frequencyEvidence)}</div>` : ''}
    ${i.resolutionSeen ? `<div class="b-h">What resolved it, where anyone said</div>${para(i.resolutionSeen)}` : ''}
    ${i.posterClaims ? `<div class="b-warn"><span class="lbl">Poster claims, stored as claims</span>${para(i.posterClaims)}</div>` : ''}
    ${i.verifiedContext ? `<div class="b-key"><span class="lbl">Verified context</span>${para(i.verifiedContext)}</div>` : ''}
    ${i.trainingPoint ? `<div class="b-h">Training point</div>${para(i.trainingPoint)}` : ''}
    <p class="dim" style="font-size:12.4px">Source: ${esc(i.source || '')} · fetched ${esc(i.fetched || '')}</p>`;
}

export function issueView(main, id, partArg) {
  const D = data();
  const i = issueById(id);
  if (!i) { main.innerHTML = `<div class="wrap"><div class="empty">No such issue.</div></div>`; return; }
  store.touchSeen(i.id);
  store.touchStreak();

  const bd = i.breakdown;
  const depth = store.pref('depth') || 'agent';
  // part index: 0..10 walkthrough, 'o' observed, 'p' policy, 'all'
  const part = partArg === undefined ? (bd ? '0' : 'o') : partArg;
  const pi = /^\d+$/.test(part) ? Math.min(PARTS.length - 1, +part) : -1;

  const tabs = `<div class="tabs" role="tablist">
    ${bd ? `<button role="tab" data-part="0" aria-selected="${pi >= 0}">Walkthrough</button><button role="tab" data-part="all" aria-selected="${part === 'all'}">All eleven</button>` : ''}
    <button role="tab" data-part="o" aria-selected="${part === 'o'}">Observed</button>
    <button role="tab" data-part="p" aria-selected="${part === 'p'}">Policy${bd?.policyRefs?.length ? ` (${bd.policyRefs.length})` : ''}</button>
  </div>`;

  const depthBar = bd ? `<div class="depth" role="group" aria-label="Depth">
    ${DEPTHS.map(([k, l, s]) => `<button data-depth="${k}" aria-pressed="${depth === k}"><strong>${l}</strong><span>${s}</span></button>`).join('')}
  </div>
  <div class="b-plain"><span class="lbl">At ${depth} depth</span><p>${md(bd.depths?.[depth] || '')}</p></div>` : '';

  let body = '';
  if (pi >= 0 && bd) {
    const [key, label, hint] = PARTS[pi];
    body = `<div class="part-head"><span class="eyebrow">Part ${pi + 1} of ${PARTS.length}</span><h2 class="h-md">${label}</h2><p class="dim">${hint}</p></div>
      <div class="blocks">${renderPart(key, bd[key])}</div>
      <div class="pager">
        <button class="btn sec" data-go="${pi - 1}" ${pi === 0 ? 'disabled' : ''}>← Previous</button>
        <span class="dim mono" style="font-size:12px">${PARTS.map((_, k) => `<a href="#/issue/${i.id}/${k}" class="dot${k === pi ? ' on' : ''}" aria-label="Part ${k + 1}"></a>`).join('')}</span>
        ${pi < PARTS.length - 1 ? `<button class="btn" data-go="${pi + 1}">Next →</button>` : `<a class="btn" href="#/drill/${i.id}">Practise this call →</a>`}
      </div>`;
  } else if (part === 'all' && bd) {
    body = `<div class="blocks">${PARTS.map(([key, label], k) => `<div class="b-h">${k + 1}. ${label}</div>${renderPart(key, bd[key])}`).join('')}</div>`;
  } else if (part === 'p') {
    const refs = (bd?.policyRefs || []).map(policyById).filter(Boolean);
    const related = relatedPolicy(i, refs);
    body = `<div class="blocks">
      <p class="dim">Every figure below is public material with a source and a date. ${verifyBadge()} means confirm it in your systems before you say it to a client; the public pages contradict each other on hours and the figures are policy, not law.</p>
      ${refs.length ? refs.map(policyCard).join('') : ''}
      ${related.length ? `<div class="b-h">Related bank pages for this category</div>${related.map(policyCard).join('')}` : ''}
      ${!refs.length && !related.length ? `<div class="empty">No policy items linked yet.</div>` : ''}
    </div>`;
  } else {
    body = `<div class="blocks">${bd ? '' : `<div class="b-plain"><span class="lbl">Observed only</span><p>This issue has the demand signal, quotes and a training point but no authored breakdown yet. Use the eleven-part template on the right when you meet it on a call, and add a debrief afterwards.</p></div>`}${observedBlocks(i)}</div>`;
  }

  main.innerHTML = `<div class="wrap">
    <a class="dim" href="#/" style="font-size:12.6px">← Issue bank</a>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin:10px 0 6px"><span class="tag">${esc(i.category)}</span><span class="tag freq-${i.frequency.replace(' ', '-')}">${esc(i.frequency)}</span>${bd ? '<span class="tag bd">guided breakdown</span>' : ''}</div>
    <h1 class="h-lg">${esc(i.title)}</h1>
    ${i.underlyingJob || i.emotion ? `<p class="lede">${i.underlyingJob ? `<strong>Underneath:</strong> ${esc(i.underlyingJob)}` : ''}${i.underlyingJob && i.emotion ? '<br>' : ''}${i.emotion ? `<strong>State:</strong> ${esc(i.emotion)}` : ''}</p>` : ''}
    ${tabs}
    <div class="hl-bar" id="hlBar"></div>
    ${pi >= 0 || part === 'all' ? depthBar : ''}
    ${body}
    <div class="note-wrap"><div class="eyebrow">Your working notes on this issue (pattern only, never a client)</div>
      <textarea class="note" data-note="${i.id}" placeholder="How this went when you met it; the line that worked; what to check next time">${esc(store.note(i.id))}</textarea></div>
  </div>`;

  main.querySelectorAll('[data-part]').forEach(b => b.onclick = () => { location.hash = `#/issue/${i.id}/${b.dataset.part}`; });
  main.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { location.hash = `#/issue/${i.id}/${b.dataset.go}`; });
  main.querySelectorAll('[data-depth]').forEach(b => b.onclick = () => { store.pref('depth', b.dataset.depth); issueView(main, id, part); });
  const note = main.querySelector('textarea.note');
  note.addEventListener('input', () => store.note(i.id, note.value));

  const blocksEl = main.querySelector('.blocks');
  if (blocksEl) mountHighlighter({ sectionId: `${i.id}:${part}`, sectionTitle: `${i.title} · ${pi >= 0 ? PARTS[pi][1] : part}`, blocksEl, toolbarEl: main.querySelector('#hlBar') });
  else unmountHighlighter();
}

// Bank pages whose situations or text mention the category's words, minus ones already linked.
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
