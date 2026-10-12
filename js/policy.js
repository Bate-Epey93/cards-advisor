// Policy lookup: the regulatory layer and the bank's public pages, each with its
// source, its date, and the verify badge. Nothing here is the source of truth.
import { data, policyById, ageDays, isStale, STALE_DAYS } from './data.js';
import { esc, md } from './render.js';

export function verifyBadge() { return `<span class="verify" title="Confirm in your own systems before saying it to a client">confirm in-system</span>`; }
function staleBadge(date) {
  const a = ageDays(date);
  if (a === null) return '';
  return a > STALE_DAYS ? `<span class="stale" title="Older than ${STALE_DAYS} days; re-check the source">checked ${a} days ago</span>` : `<span class="fresh">checked ${a === 0 ? 'today' : a + ' days ago'}</span>`;
}

export function policyCard(p) {
  if (!p) return '';
  if (p.kind === 'rule') return `<a class="card pol" href="#/policy/${p.id}">
      <span class="fig">${esc(p.figure)}</span>
      <span class="pol-main"><span>${md(p.rule)}</span><span class="dim" style="font-size:12.2px">${esc(p.source)} · as of ${esc(p.asOf)}${p.flag ? ' · <em>secondary source</em>' : ''}</span></span></a>`;
  if (p.kind === 'section') return `<a class="card pol" href="#/policy/${p.id}"><span class="fig">§</span><span class="pol-main"><strong>${esc(p.title)}</strong><span class="dim" style="font-size:12.6px">${esc(p.summary.slice(0, 160))}…</span></span></a>`;
  return `<a class="card pol" href="#/policy/${p.id}">
      <span class="fig" style="font-size:13px">bank page</span>
      <span class="pol-main"><strong>${esc(p.question)}</strong>
        ${(p.figures || []).length ? `<span>${md(p.figures[0])}</span>` : `<span class="dim">${esc(((p.answer || [])[0] || '').slice(0, 140))}…</span>`}
        <span class="row" style="gap:6px;flex-wrap:wrap">${verifyBadge()}${staleBadge(p.fetched)}<span class="dim" style="font-size:11.6px">${esc(p.section)} · ${esc(p.dateTag || '')}</span></span></span></a>`;
}

export function policyView(main, id) {
  const D = data();
  if (id) return policyDetail(main, id);

  const compiledAge = ageDays(D.compiled);
  main.innerHTML = `<div class="wrap">
    <div class="eyebrow">Policy lookup</div>
    <h1 class="h-lg">The rule, its source, its date</h1>
    <p class="lede">Two layers. The law and network rules bind every Canadian issuer and a client can hold the bank to them. The bank's public pages are policy and can change on a Tuesday; they carry ${verifyBadge()}. Corpus compiled ${esc(D.compiled)}${compiledAge > STALE_DAYS ? ` <span class="stale">${compiledAge} days ago, re-check sources</span>` : ''}.</p>

    <div class="field"><input id="polQ" type="search" placeholder="Search figures, questions, answers… (e.g. 56 days, lock, PIN, foreign)" autocomplete="off"></div>
    <div id="polBody"></div>
  </div>`;

  const body = main.querySelector('#polBody');
  const render = q => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hit = t => !terms.length || terms.every(w => t.toLowerCase().includes(w));
    const rules = D.rules.mustKnow.filter(r => hit(r.figure + ' ' + r.rule + ' ' + r.source + ' ' + (r.clientLine || '')));
    const secs = D.rules.sections.filter(s => hit(s.title + ' ' + s.summary));
    const faq = D.faq.items.filter(f => hit([f.question, f.section, ...(f.answer || []), ...(f.figures || []), ...(f.situations || [])].join(' ')));
    const bySec = {};
    faq.forEach(f => (bySec[f.section] = bySec[f.section] || []).push(f));
    body.innerHTML = `
      ${rules.length ? `<div class="b-h">Figures to know cold (${rules.length})</div>${rules.map(r => policyCard(policyById(r.id))).join('')}` : ''}
      ${secs.length ? `<div class="b-h">The rules, by topic</div>${secs.map(s => policyCard(policyById(s.id))).join('')}` : ''}
      ${Object.keys(bySec).length ? Object.entries(bySec).map(([sec, items]) => `<div class="b-h">${esc(sec)} (${items.length})</div>${items.map(f => policyCard(policyById(f.id))).join('')}`).join('') : ''}
      ${!rules.length && !secs.length && !faq.length ? `<div class="empty">Nothing matches.</div>` : ''}
      ${!terms.length && D.rules.unverifiable?.length ? `<div class="b-warn" style="margin-top:18px"><span class="lbl">Could not be verified against a primary source</span><ul class="b-list">${D.rules.unverifiable.map(u => `<li>${md(u)}</li>`).join('')}</ul></div>` : ''}`;
  };
  render('');
  main.querySelector('#polQ').addEventListener('input', e => render(e.target.value));
}

function policyDetail(main, id) {
  const p = policyById(id);
  if (!p) { main.innerHTML = `<div class="wrap"><div class="empty">No such item.</div></div>`; return; }
  const D = data();
  const usedBy = D.breakdowns.filter(b => (b.policyRefs || []).includes(id));
  const back = `<a class="dim" href="#/policy" style="font-size:12.6px">← Policy lookup</a>`;
  let html = '';

  if (p.kind === 'rule') {
    html = `${back}<div class="eyebrow" style="margin-top:10px">Rule · ${esc(p.source)}</div>
      <h1 class="h-lg"><span class="fig big">${esc(p.figure)}</span></h1>
      <p class="lede">${md(p.rule)}</p>
      ${p.clientLine ? `<div class="b-key"><span class="lbl">Say it to a client like this</span><p>${md(p.clientLine)}</p></div>` : ''}
      ${p.flag ? `<div class="b-warn"><span class="lbl">Secondary source</span><p>${md(p.flagReason || 'Not verified against a primary source; treat as directional.')}</p></div>` : ''}
      <p class="dim">As of ${esc(p.asOf)} ${staleBadge(p.asOf)}<br>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a>` : ''}</p>`;
  } else if (p.kind === 'section') {
    html = `${back}<div class="eyebrow" style="margin-top:10px">Regulatory layer</div><h1 class="h-lg">${esc(p.title)}</h1>
      <div class="blocks"><p>${md(p.summary)}</p></div>
      ${p.flag ? `<div class="b-warn"><span class="lbl">Partly secondary</span><p>One or more figures here come from a search snippet or acquirer documentation rather than the primary rule.</p></div>` : ''}
      <p class="dim">As of ${esc(p.asOf)} ${staleBadge(p.asOf)}</p>
      <ul class="b-list">${(p.sources || []).map(u => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join('')}</ul>`;
  } else {
    html = `${back}<div class="eyebrow" style="margin-top:10px">${esc(p.section)} · ${esc(p.dateTag || 'undated')}</div>
      <h1 class="h-lg">${esc(p.question)}</h1>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:12px">${verifyBadge()}${staleBadge(p.fetched)}</div>
      <div class="b-warn"><span class="lbl">Not an official source</span><p>This is a condensed reading of a public page, fetched ${esc(p.fetched || '')}. Bank policy changes without notice. Confirm the figure in your systems before you say it, and never quote this app as the source.</p></div>
      <div class="blocks">
        ${(p.figures || []).length ? `<div class="b-key"><span class="lbl">Figures on the page</span><ul class="b-list">${p.figures.map(f => `<li>${md(f)}</li>`).join('')}</ul></div>` : ''}
        ${(p.answer || []).map(a => `<p>${md(a)}</p>`).join('')}
        ${p.sourceText ? `<div class="b-quote">${md(p.sourceText)}<cite>verbatim from the page</cite></div>` : ''}
        ${(p.situations || []).length ? `<div class="b-h">Situations it answers</div><ul class="b-list">${p.situations.map(s => `<li>${md(s)}</li>`).join('')}</ul></div>` : ''}
      </div>
      <ul class="b-list">${(p.sources || []).map(u => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join('')}</ul>`;
  }

  if (usedBy.length) html += `<div class="b-h">Used in</div>${usedBy.map(b => `<a class="card" href="#/issue/${b.observed}/p" style="display:block">${esc(b.title)}</a>`).join('')}`;
  main.innerHTML = `<div class="wrap">${html}</div>`;
}

export { isStale };
