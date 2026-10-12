// Block renderer. Content data is a list of typed blocks; each maps to one function here.

export function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// markdown-lite: **bold**, *italic*, `code`, line breaks
export function md(s = '') {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function para(v) {
  return String(v).split('\n\n').map(p => `<p>${md(p)}</p>`).join('');
}

const B = {
  p: b => para(b.v),
  h: b => `<div class="b-h">${md(b.v)}</div>`,

  key: b => `<div class="b-key"><span class="lbl">${esc(b.lbl || 'Key insight')}</span>${para(b.v)}</div>`,
  plain: b => `<div class="b-plain"><span class="lbl">${esc(b.lbl || 'In plain english')}</span>${para(b.v)}</div>`,
  warn: b => `<div class="b-warn"><span class="lbl">${esc(b.lbl || 'Pitfall')}</span>${para(b.v)}</div>`,
  case: b => `<div class="b-case"><span class="lbl">${esc(b.lbl || 'Real world')}</span>${b.title ? `<strong>${md(b.title)}</strong> — ` : ''}${md(b.v)}</div>`,

  formula: b => `<div class="b-formula">
      <div class="lbl">${esc(b.label || 'Formula')}</div>
      <div class="expr">${esc(b.expr)}</div>
      ${b.example ? `<div class="ex">${md(b.example)}</div>` : ''}
    </div>`,

  list: b => `<ul class="b-list">${b.v.map(i => `<li><span>${md(i)}</span></li>`).join('')}</ul>`,

  steps: b => `<ol class="b-steps">${b.v.map((s, i) => `<li>
      <div class="num">${s.n || i + 1}</div>
      <div><span class="nm">${md(s.name)}</span>${s.body ? `<br>${md(s.body)}` : ''}</div>
    </li>`).join('')}</ol>`,

  ge: b => `<div class="b-ge">
      ${b.label ? `<div class="hd">${esc(b.label)}</div>` : ''}
      ${b.good ? `<div class="g"><b>✓ WORKS:</b> ${md(b.good)}</div>` : ''}
      ${b.bad ? `<div class="b"><b>✗ FAILS:</b> ${md(b.bad)}</div>` : ''}
      ${b.why ? `<div class="w"><strong>Why:</strong> ${md(b.why)}</div>` : ''}
    </div>`,

  quote: b => `<blockquote class="b-quote">${md(b.v)}${b.by ? `<cite>${md(b.by)}</cite>` : ''}</blockquote>`,

  code: b => `<div class="between" style="margin:11px 0 -4px">
      <span class="eyebrow" style="margin:0">${esc(b.label || 'Copy block')}</span>
      <button class="copy" data-copy="${esc(b.v)}">Copy</button>
    </div><pre class="b-code">${esc(b.v)}</pre>`,

  table: b => `<div class="tbl-wrap"><table>
      <thead><tr>${b.head.map(h => `<th>${md(h)}</th>`).join('')}</tr></thead>
      <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`,

  bench: b => `<div class="bench">${b.title ? `<div class="eyebrow">${esc(b.title)}</div>` : ''}
      ${b.v.map(r => `<div class="r"><span>${md(r.m)}</span><span class="v">${md(r.val)}</span>${r.note ? `<span class="n">${md(r.note)}</span>` : ''}</div>`).join('')}
      ${b.source ? `<div class="dim" style="font-size:11.5px;margin-top:5px">Source basis: ${md(b.source)}</div>` : ''}
    </div>`,

  cards: b => b.v.map(c => `<details class="disc"><summary>${md(c.h)}</summary><div class="body blocks">${
      Array.isArray(c.b) ? renderBlocks(c.b) : para(c.b)
    }</div></details>`).join(''),

  script: b => `<div class="b-h">${md(b.title || 'Script')}</div><div class="b-script">${
      b.v.map(l => `<div class="ln ${l.tone || ''}"><span class="who">${esc(l.who)}</span><span>${md(l.line)}</span></div>`).join('')
    }</div>`,

  drill: b => `<div class="b-drill"><div class="eyebrow">${esc(b.title || 'Drills — 5 minutes each')}</div>${
      b.v.map(d => `<div class="it"><span>${md(d)}</span></div>`).join('')
    }</div>`,

  rubric: b => `<div class="b-rubric"><div class="eyebrow">Self-assessment rubric</div>
      <div class="lv j"><div class="t">Junior signal</div><div>${md(b.j)}</div></div>
      <div class="lv c"><div class="t">Competent / mid</div><div>${md(b.c)}</div></div>
      <div class="lv s"><div class="t">Senior signal</div><div>${md(b.s)}</div></div>
    </div>`,

  prompt: b => `<details class="disc"><summary>⚙ ${md(b.label)}</summary><div class="body">
      <div class="between" style="margin-bottom:6px"><span class="eyebrow" style="margin:0">Prompt</span>
      <button class="copy" data-copy="${esc(b.v)}">Copy</button></div>
      <pre class="b-code">${esc(b.v)}</pre>
      ${b.why ? `<div class="dim" style="font-size:12.6px">${md(b.why)}</div>` : ''}
    </div></details>`
};

export function renderBlocks(blocks = []) {
  return blocks.map(b => (B[b.t] || (x => para(x.v || '')))(b)).join('');
}

// Plain text of a block list — used by search indexing.
export function blocksText(blocks = []) {
  const out = [];
  const walk = v => {
    if (v == null) return;
    if (typeof v === 'string') { out.push(v); return; }
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (typeof v === 'object') { Object.values(v).forEach(walk); }
  };
  walk(blocks);
  return out.join(' · ');
}
