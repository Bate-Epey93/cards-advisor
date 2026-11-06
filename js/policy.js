// Policy lookup: the regulatory layer and the bank's public pages, each with its
// source, its date, and the verify badge. Nothing here is the source of truth.
import { data, policyById, ageDays, isStale, STALE_DAYS } from './data.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';

export function verifyBadge() {
  return `<span class="verify" title="Confirm in your own systems before saying it to a client">confirm in-system</span>`;
}

function staleBadge(date) {
  const a = ageDays(date);
  if (a === null) return '';
  return a > STALE_DAYS
    ? `<span class="stale" title="Older than ${STALE_DAYS} days; re-check the source">checked ${a}d ago</span>`
    : `<span class="fresh">checked ${a === 0 ? 'today' : a + 'd ago'}</span>`;
}

export function policyCard(p) {
  if (!p) return '';
  if (p.kind === 'rule') {
    return `<a class="pol-card rule-pol-card" href="#/policy/${p.id}">
      <div class="pol-fig-col">
        <span class="fig">${esc(p.figure)}</span>
        <span class="chip flagship">Statute / Rule</span>
      </div>
      <div class="pol-main">
        <div class="pol-rule-txt">${md(p.rule)}</div>
        ${p.clientLine ? `<div class="pol-client-line"><b>Say:</b> "${esc(p.clientLine)}"</div>` : ''}
        <div class="pol-meta">
          <span>${esc(p.source)}</span>
          <span>·</span>
          <span>as of ${esc(p.asOf)}</span>
          ${p.flag ? '<span class="stale">secondary source</span>' : ''}
        </div>
      </div>
      <span class="bd-go" aria-hidden="true">→</span>
    </a>`;
  }
  if (p.kind === 'section') {
    return `<a class="pol-card sec-pol-card" href="#/policy/${p.id}">
      <div class="pol-fig-col">
        <span class="fig">§</span>
        <span class="chip lab-chip">Framework</span>
      </div>
      <div class="pol-main">
        <strong class="pol-q">${esc(p.title)}</strong>
        <span class="pol-sub">${esc(p.summary.slice(0, 175))}${p.summary.length > 175 ? '…' : ''}</span>
        <div class="pol-meta"><span>as of ${esc(p.asOf)}</span> ${staleBadge(p.asOf)}</div>
      </div>
      <span class="bd-go" aria-hidden="true">→</span>
    </a>`;
  }
  return `<a class="pol-card faq-pol-card" href="#/policy/${p.id}">
    <div class="pol-fig-col">
      <span class="fig faq-fig">${(p.figures || [])[0] ? esc(shortFig(p.figures[0])) : 'FAQ'}</span>
      <span class="chip design">Bank page</span>
    </div>
    <div class="pol-main">
      <strong class="pol-q">${esc(p.question)}</strong>
      ${(p.figures || []).length ? `<span class="pol-sub"><strong>Key figure:</strong> ${md(p.figures[0])}</span>` : (() => { const lead = (p.answer || []).find(Boolean) || ''; return lead ? `<span class="pol-sub">${esc(lead.slice(0, 150))}${lead.length > 150 ? '…' : ''}</span>` : ''; })()}
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px">
        ${verifyBadge()}
        ${staleBadge(p.fetched)}
        <span class="dim" style="font-size:11.5px">${esc(p.section)}</span>
      </div>
    </div>
    <span class="bd-go" aria-hidden="true">→</span>
  </a>`;
}

function shortFig(f = '') {
  const m = String(f).match(/(\$[\d,]+|\d+\s*(?:to\s*\d+\s*)?(?:business\s*)?(?:days?|hours?|months?|years?|%)|1-8\d\d-[\d-]+)/i);
  return m ? m[1] : 'FAQ';
}

export function policyView(main, id) {
  document.body.classList.remove('reading');
  const D = data();
  if (id) return policyDetail(main, id);

  let activeTab = 'all';
  let query = '';
  const compiledAge = ageDays(D.compiled);

  main.innerHTML = `<section class="screen screen-active"><div class="screen-inner">
    <div class="kicker">Policy &amp; Regulatory Lookup · Compiled ${esc(D.compiled)}</div>
    <h1 class="title">The rule, its source, its date.</h1>
    <p class="subtitle">Two distinct layers: Canadian law & network rules bind every issuer; the bank's public FAQ pages are policy that can change without notice and always carry ${verifyBadge()}. ${compiledAge > STALE_DAYS ? `<span class="stale">${compiledAge} days old — re-verify sources</span>` : ''}</p>

    <div class="deconstruct-bar">
      <label class="db-field" for="polQ">
        <svg class="ico db-ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4 4"/></svg>
        <input id="polQ" type="search" aria-label="Search policy and figures" placeholder="Search figures, statutes, questions… (e.g. $50, 56 days, OBSI, lock, PIN, foreign)" autocomplete="off" spellcheck="false">
      </label>
    </div>

    <div class="lib-subbar" style="margin-bottom:22px">
      <div class="lib-filters" role="group" aria-label="Policy layers">
        <button class="lib-fchip on" data-ptab="all" type="button" aria-pressed="true">All (${D.rules.mustKnow.length + D.rules.sections.length + D.faq.items.length})</button>
        <button class="lib-fchip" data-ptab="rules" type="button" aria-pressed="false">${D.rules.mustKnow.length} Must-Know Figures</button>
        <button class="lib-fchip" data-ptab="sections" type="button" aria-pressed="false">${D.rules.sections.length} Regulatory Sections</button>
        <button class="lib-fchip" data-ptab="faq" type="button" aria-pressed="false">${D.faq.items.length} Bank FAQ Readings</button>
      </div>
    </div>

    <div id="polBody"></div>
  </div></section>`;

  const body = main.querySelector('#polBody');
  const render = () => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const hit = t => !terms.length || terms.every(w => t.toLowerCase().includes(w));

    const rules = (activeTab === 'all' || activeTab === 'rules')
      ? D.rules.mustKnow.filter(r => hit(r.figure + ' ' + r.rule + ' ' + r.source + ' ' + (r.clientLine || '')))
      : [];
    const secs = (activeTab === 'all' || activeTab === 'sections')
      ? D.rules.sections.filter(s => hit(s.title + ' ' + s.summary))
      : [];
    const faq = (activeTab === 'all' || activeTab === 'faq')
      ? D.faq.items.filter(f => hit([f.question, f.section, ...(f.answer || []), ...(f.figures || []), ...(f.situations || [])].join(' ')))
      : [];

    const bySec = {};
    faq.forEach(f => (bySec[f.section] = bySec[f.section] || []).push(f));

    body.innerHTML = `
      ${rules.length ? `
        <div class="lib-section-head" style="margin-top:24px">
          <h2 class="lib-section-title">Figures to Know Cold</h2>
          <span class="lib-section-sub">${rules.length} statutory & network caps</span>
        </div>
        <div class="pol-list">${rules.map(r => policyCard(policyById(r.id))).join('')}</div>
      ` : ''}

      ${secs.length ? `
        <div class="lib-section-head">
          <h2 class="lib-section-title">Regulatory Framework by Topic</h2>
          <span class="lib-section-sub">${secs.length} sections</span>
        </div>
        <div class="pol-list">${secs.map(s => policyCard(policyById(s.id))).join('')}</div>
      ` : ''}

      ${Object.keys(bySec).length ? Object.entries(bySec).map(([sec, items]) => `
        <div class="lib-section-head">
          <h2 class="lib-section-title">${esc(sec)}</h2>
          <span class="lib-section-sub">${items.length} bank page readings</span>
        </div>
        <div class="pol-list">${items.map(f => policyCard(policyById(f.id))).join('')}</div>
      `).join('') : ''}

      ${!rules.length && !secs.length && !faq.length ? `<div class="empty-panel"><strong>Nothing matches "${esc(query)}".</strong><p>Try searching for a number ("50", "56", "120", "10") or keyword ("dispute", "lock", "abroad", "senior").</p></div>` : ''}

      ${!terms.length && activeTab === 'all' && D.rules.unverifiable?.length ? `
        <div class="problem-card" style="margin-top:32px">
          <div class="pc-label">Could not be verified against a primary source</div>
          <ul class="b-list">${D.rules.unverifiable.map(u => `<li>${md(u)}</li>`).join('')}</ul>
        </div>
      ` : ''}
    `;
  };

  render();
  main.querySelector('#polQ').addEventListener('input', e => {
    query = e.target.value;
    render();
  });
  main.querySelectorAll('[data-ptab]').forEach(btn => {
    btn.onclick = () => {
      activeTab = btn.dataset.ptab;
      main.querySelectorAll('[data-ptab]').forEach(b => { b.classList.toggle('on', b.dataset.ptab === activeTab); b.setAttribute('aria-pressed', String(b.dataset.ptab === activeTab)); });
      render();
    };
  });
}

function policyDetail(main, id) {
  const p = policyById(id);
  if (!p) {
    main.innerHTML = `<div class="screen-inner"><div class="empty-panel">No such policy item. <a href="#/policy">Back to Policy lookup</a></div></div>`;
    return;
  }
  const D = data();
  const usedBy = D.breakdowns.filter(b => (b.policyRefs || []).includes(id));
  const back = `<a class="back-inline" href="#/policy">← Policy lookup</a>`;
  let html = '';

  if (p.kind === 'rule') {
    html = `
      ${back}
      <div class="kicker" style="margin-top:14px">Statutory / Network Rule · ${esc(p.source)}</div>
      <div class="rule-hero-card">
        <div class="fig big">${esc(p.figure)}</div>
        <p class="subtitle" style="margin:8px 0 0;color:var(--ink)">${md(p.rule)}</p>
      </div>
      ${p.clientLine ? `
        <div class="solution-card">
          <div class="sc-label">Say it to a client like this</div>
          <p class="engage-script">"${md(p.clientLine)}"</p>
          <div class="row" style="margin-top:10px;justify-content:flex-end">
            <button type="button" class="gbtn" id="copyClientLine" data-copy="${esc(p.clientLine)}">Copy client line</button>
          </div>
        </div>
      ` : ''}
      ${p.flag ? `<div class="problem-card"><div class="pc-label">Secondary source</div><p>${md(p.flagReason || 'Not verified against a primary source; treat as directional.')}</p></div>` : ''}
      <div class="model-card">
        <div class="mc-kick">Provenance & Verification</div>
        <p>Checked as of <strong>${esc(p.asOf)}</strong> ${staleBadge(p.asOf)}</p>
        ${p.url ? `<p style="margin-top:6px"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)} ↗</a></p>` : ''}
      </div>
    `;
  } else if (p.kind === 'section') {
    html = `
      ${back}
      <div class="kicker" style="margin-top:14px">Regulatory Framework</div>
      <h1 class="title">${esc(p.title)}</h1>
      <div class="model-card">
        <div class="mc-kick">Summary of Rules</div>
        <p style="font-size:15.5px;line-height:1.65;color:var(--ink)">${md(p.summary)}</p>
      </div>
      ${p.flag ? `<div class="problem-card"><div class="pc-label">Partly secondary source</div><p>One or more figures here come from a search snippet or acquirer documentation rather than the primary rule.</p></div>` : ''}
      <div class="sd-block">
        <h3>Primary Sources (${staleBadge(p.asOf)})</h3>
        <div class="sd-list">
          ${(p.sources || []).map(u => `<div class="sd-item"><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)} ↗</a></div>`).join('')}
        </div>
      </div>
    `;
  } else {
    html = `
      ${back}
      <div class="kicker" style="margin-top:14px">${esc(p.section)} · ${esc(p.dateTag || 'undated')}</div>
      <h1 class="title" style="font-size:clamp(24px,3.2vw,36px)">${esc(p.question)}</h1>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin:10px 0 16px">${verifyBadge()}${staleBadge(p.fetched)}</div>
      <div class="scale-band">
        <div class="sb-label">Public page reading — not an official internal source</div>
        <p>Condensed reading of a public bank page, fetched ${esc(p.fetched || '')}. Bank policy changes without notice. Confirm the figure in your internal systems before quoting it.</p>
      </div>
      ${(p.figures || []).length ? `
        <div class="solution-card">
          <div class="sc-label">Key figures on the page</div>
          <ul class="b-list" style="margin:0">${p.figures.map(f => `<li><strong>${md(f)}</strong></li>`).join('')}</ul>
        </div>
      ` : ''}
      ${(p.answer || []).length ? `<div class="model-card">
        <div class="mc-kick">Condensed reading</div>
        ${p.answer.map(a => `<p style="font-size:15px;color:var(--ink);line-height:1.65;margin-bottom:10px">${md(a)}</p>`).join('')}
      </div>` : ''}
      ${p.sourceText ? `<div class="b-quote">${md(p.sourceText)}<cite>Source notes</cite></div>` : ''}
      ${(p.situations || []).length ? `
        <div class="sd-block">
          <h3>Call situations this answers</h3>
          <div class="row" style="gap:6px;flex-wrap:wrap">${p.situations.map(s => `<span class="chip tone-ink">${md(s)}</span>`).join('')}</div>
        </div>
      ` : ''}
      ${(p.sources || []).length ? `<div class="sd-block">
        <h3>Public URLs</h3>
        <div class="sd-list">${p.sources.map(u => `<div class="sd-item"><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)} ↗</a></div>`).join('')}</div>
      </div>` : ''}
    `;
  }

  if (usedBy.length) {
    html += `
      <div class="sd-block">
        <h3>Referenced in ${usedBy.length} Guided Breakdown${usedBy.length === 1 ? '' : 's'}</h3>
        <div class="pol-list">
          ${usedBy.map(b => `<a class="pol-card" href="#/issue/${b.observed}/0">
            <div class="pol-main"><strong>${esc(b.title)}</strong><span class="dim" style="font-size:12.5px">Open 11-part call walkthrough</span></div>
            <span class="bd-go">→</span>
          </a>`).join('')}
        </div>
      </div>
    `;
  }

  main.innerHTML = `<section class="screen screen-active"><div class="screen-inner">${html}</div></section>`;
  const copyBtn = main.querySelector('#copyClientLine');
  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        toast({ msg: 'Client line copied.', icon: '✓', timeout: 1800 });
      } catch {
        toast({ msg: 'Clipboard unavailable.', icon: '!' });
      }
    };
  }
}

export { isStale };
