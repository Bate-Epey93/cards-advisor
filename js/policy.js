// Policy: key figures and rules by topic (set by law or card network rules) and the
// bank's public pages, each with its source, its date, and the verify badge.
// Nothing here is the source of truth.
import { data, policyById, ageDays, isStale, STALE_DAYS } from './data.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';

export function verifyBadge() {
  return `<span class="verify" title="Confirm in your own systems before saying it to a client">confirm in-system</span>`;
}

function staleBadge(date) {
  const a = ageDays(date);
  if (a === null || a <= STALE_DAYS) return '';
  return `<span class="stale" title="Older than ${STALE_DAYS} days. Check the source again.">checked ${a} days ago</span>`;
}

const UNOFFICIAL = '<span class="unofficial" title="Taken from an unofficial source, not the official rule">Unofficial source</span>';

// "A. Lost, stolen…" → "Lost, stolen…"
const secName = (sec = '') => String(sec).replace(/^[A-Z]\.\s*/, '');

// Callers in issue.js pass policyCard straight to .map(), so the 2nd arg can be an index.
export function policyCard(p, opts = {}) {
  if (!p) return '';
  const inList = !!(opts && typeof opts === 'object' && opts.inList);
  if (p.kind === 'rule') {
    return `<a class="pol-card rule-pol-card" href="#/policy/${p.id}">
      <div class="pol-fig-col">
        <span class="fig">${esc(p.figure)}</span>
        ${inList ? '' : '<span class="chip flagship" title="Set by law or card network rules">Key figure</span>'}
      </div>
      <div class="pol-main">
        <div class="pol-rule-txt">${md(p.rule)}</div>
        ${p.clientLine ? `<div class="pol-client-line"><b>Say:</b> "${esc(p.clientLine)}"</div>` : ''}
        <div class="pol-meta">
          <span>${esc(p.source)}, as of ${esc(p.asOf)}</span>
          ${p.flag ? UNOFFICIAL : ''}
        </div>
      </div>
      <span class="bd-go" aria-hidden="true">→</span>
    </a>`;
  }
  if (p.kind === 'section') {
    return `<a class="pol-card sec-pol-card" href="#/policy/${p.id}">
      <div class="pol-main">
        <strong class="pol-q">${esc(p.title)}</strong>
        <span class="pol-sub">${esc(p.summary.slice(0, 175))}${p.summary.length > 175 ? '…' : ''}</span>
        <div class="pol-meta">
          ${inList ? '' : '<span class="chip lab-chip">Rules by topic</span>'}
          <span>as of ${esc(p.asOf)}</span> ${staleBadge(p.asOf)}
        </div>
      </div>
      <span class="bd-go" aria-hidden="true">→</span>
    </a>`;
  }
  const fig = (p.figures || [])[0] ? shortFig(p.figures[0]) : 'FAQ';
  const showFig = fig !== 'FAQ' && fig !== '§';
  const chip = inList ? '' : '<span class="chip design">Bank page</span>';
  return `<a class="pol-card faq-pol-card" href="#/policy/${p.id}">
    ${showFig ? `<div class="pol-fig-col">
      <span class="fig faq-fig">${esc(fig)}</span>
      ${chip}
    </div>` : ''}
    <div class="pol-main">
      <strong class="pol-q">${esc(p.question)}</strong>
      ${(p.figures || []).length ? `<span class="pol-sub"><strong>Key figure:</strong> ${md(p.figures[0])}</span>` : (() => { const lead = (p.answer || []).find(Boolean) || ''; return lead ? `<span class="pol-sub">${esc(lead.slice(0, 150))}${lead.length > 150 ? '…' : ''}</span>` : ''; })()}
      ${(() => {
        const bits = [showFig ? '' : chip, inList ? '' : verifyBadge(), staleBadge(p.fetched), inList ? '' : `<span class="dim" style="font-size:11.5px">${esc(secName(p.section))}</span>`].filter(Boolean);
        return bits.length ? `<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px">${bits.join('')}</div>` : '';
      })()}
    </div>
    <span class="bd-go" aria-hidden="true">→</span>
  </a>`;
}

function shortFig(f = '') {
  const m = String(f).match(/(\$[\d,]+|\d+\s*(?:to\s*\d+\s*)?(?:business\s*)?(?:days?|hours?|months?|years?|%)|1-8\d\d-[\d-]+)/i);
  return m ? m[1] : 'FAQ';
}

const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const srcLink = u => `<a href="${esc(u)}" target="_blank" rel="noopener" title="${esc(u)}">${esc(host(u))} ↗</a>`;

export function policyView(main, id) {
  document.body.classList.remove('reading');
  const D = data();
  if (id) return policyDetail(main, id);

  let activeTab = 'all';
  let query = '';
  const compiledAge = ageDays(D.compiled);

  main.innerHTML = `<section class="screen screen-active"><div class="screen-inner">
    <h1 class="title">Policy</h1>
    <p class="subtitle">Laws and card network rules apply to every bank. Bank pages can change without notice, so ${verifyBadge()} before you quote them. ${compiledAge > STALE_DAYS ? `<span class="stale">Sources are ${compiledAge} days old. Check them again.</span>` : ''}</p>

    <div class="deconstruct-bar">
      <label class="db-field" for="polQ">
        <svg class="ico db-ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4 4"/></svg>
        <input id="polQ" type="search" aria-label="Search policy" placeholder="Search a figure or topic, like $50 or 56 days" autocomplete="off" spellcheck="false">
      </label>
    </div>

    <div class="lib-subbar" style="margin-bottom:22px">
      <div class="lib-filters" role="group" aria-label="Show">
        <button class="lib-fchip on" data-ptab="all" type="button" aria-pressed="true">All</button>
        <button class="lib-fchip" data-ptab="rules" type="button" aria-pressed="false">Key figures</button>
        <button class="lib-fchip" data-ptab="sections" type="button" aria-pressed="false">Rules by topic</button>
        <button class="lib-fchip" data-ptab="faq" type="button" aria-pressed="false">Bank pages</button>
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

    const fold = activeTab === 'all' && !terms.length;
    const unver = D.rules.unverifiable || [];

    body.innerHTML = `
      ${rules.length ? `
        <div class="lib-section-head" style="margin-top:24px">
          <h2 class="lib-section-title">Key figures</h2>
          <span class="lib-section-sub">Set by law or card network rules</span>
        </div>
        <div class="pol-list">${rules.map(r => policyCard(policyById(r.id), { inList: true })).join('')}</div>
      ` : ''}

      ${!terms.length && (activeTab === 'all' || activeTab === 'rules') && unver.length ? `
        <details class="disc" style="margin-top:14px" ${activeTab === 'rules' ? 'open' : ''}>
          <summary>Not confirmed with an official source (${unver.length})</summary>
          <div class="body"><ul class="b-list" style="margin:0">${unver.map(u => `<li>${md(u)}</li>`).join('')}</ul></div>
        </details>
      ` : ''}

      ${secs.length ? `
        <div class="lib-section-head">
          <h2 class="lib-section-title">Rules by topic</h2>
        </div>
        <div class="pol-list">${secs.map(s => policyCard(policyById(s.id), { inList: true })).join('')}</div>
      ` : ''}

      ${faq.length ? `
        <div class="lib-section-head">
          <h2 class="lib-section-title">Bank pages</h2>
          <span class="lib-section-sub">${verifyBadge()}</span>
        </div>
        ${Object.entries(bySec).map(([sec, items]) => {
          const list = `<div class="pol-list">${items.map(f => policyCard(policyById(f.id), { inList: true })).join('')}</div>`;
          return fold
            ? `<details class="disc"><summary>${esc(secName(sec))} (${items.length})</summary><div class="body">${list}</div></details>`
            : `<h3 class="lib-section-title" style="font-size:15px;margin:18px 0 8px">${esc(secName(sec))}</h3>${list}`;
        }).join('')}
      ` : ''}

      ${!rules.length && !secs.length && !faq.length ? `<div class="empty-panel"><strong>Nothing matches "${esc(query)}".</strong><p>Try a number like 50, 56, 120 or 10, or a word like dispute, lock, abroad or senior.</p></div>` : ''}

      <p class="dim" style="font-size:12px;margin-top:28px">Compiled ${esc(D.compiled)}</p>
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
    main.innerHTML = `<div class="screen-inner"><div class="empty-panel">Not found. <a href="#/policy">← Policy</a></div></div>`;
    return;
  }
  const D = data();
  const usedBy = D.breakdowns.filter(b => (b.policyRefs || []).includes(id));
  const back = `<a class="back-inline" href="#/policy">← Policy</a>`;
  let html = '';

  if (p.kind === 'rule') {
    html = `
      ${back}
      <div class="kicker" style="margin-top:14px" title="Set by law or card network rules">Key figure, ${esc(p.source)}</div>
      <div class="rule-hero-card">
        <div class="fig big">${esc(p.figure)}</div>
        <p class="subtitle" style="margin:8px 0 0;color:var(--ink)">${md(p.rule)}</p>
      </div>
      ${p.clientLine ? `
        <div class="solution-card">
          <div class="sc-label">What to say</div>
          <p class="engage-script">"${md(p.clientLine)}"</p>
          <div class="row" style="margin-top:10px;justify-content:flex-end">
            <button type="button" class="gbtn" id="copyClientLine" data-copy="${esc(p.clientLine)}">Copy</button>
          </div>
        </div>
      ` : ''}
      ${p.flag ? `<div class="model-card"><div class="mc-kick">${UNOFFICIAL}</div><p>${md(p.flagReason || 'Not checked against the official rule. Use as a guide only.')}</p></div>` : ''}
      <div class="model-card">
        <div class="mc-kick">Source</div>
        <p>Checked as of <strong>${esc(p.asOf)}</strong> ${staleBadge(p.asOf)}</p>
        ${p.url ? `<p style="margin-top:6px">${srcLink(p.url)}</p>` : ''}
      </div>
    `;
  } else if (p.kind === 'section') {
    html = `
      ${back}
      <h1 class="title" style="margin-top:14px">${esc(p.title)}</h1>
      <div class="model-card">
        <div class="mc-kick">Rules by topic</div>
        <p style="font-size:15.5px;line-height:1.65;color:var(--ink)">${md(p.summary)}</p>
      </div>
      ${p.flag ? `<div class="model-card"><div class="mc-kick">${UNOFFICIAL}</div><p>Some figures here come from unofficial sources, not the official rule. Use them as a guide.</p></div>` : ''}
      <div class="sd-block">
        <h3>Source</h3>
        <p class="dim" style="font-size:13px;margin:0 0 6px">Checked as of ${esc(p.asOf)} ${staleBadge(p.asOf)}</p>
        <div class="sd-list">
          ${(p.sources || []).map(u => `<div class="sd-item">${srcLink(u)}</div>`).join('')}
        </div>
      </div>
    `;
  } else {
    const dated = p.dateTag && !(/undated/i.test(p.dateTag) && !/\d/.test(p.dateTag));
    // Source notes minus the bare URLs, which are listed once under "Source pages" below.
    const srcNotes = String(p.sourceText || '').replace(/^\s*Sources?:\s*/i, '').split(/\s*;\s*/)
      .map(x => x.trim()).filter(x => x && !/^https?:\/\/\S+$/.test(x))
      .map(x => x.replace(/https?:\/\/[^\s)]+/g, u => host(u)));
    const srcs = p.sources || [];
    html = `
      ${back}
      <div class="kicker" style="margin-top:14px">${esc(secName(p.section))}</div>
      <h1 class="title" style="font-size:clamp(24px,3.2vw,36px)">${esc(p.question)}</h1>
      ${dated ? `<p class="dim" style="font-size:12.5px;margin:4px 0 12px">Page dated: ${esc(p.dateTag)}</p>` : ''}
      <div class="scale-band">
        <div class="sb-label">${verifyBadge()} Public bank page, not an official source</div>
        <p>Saved from the bank's public site on ${esc(p.fetched || 'an unknown date')}. It can change without notice. Confirm in-system before you quote it. ${staleBadge(p.fetched)}</p>
      </div>
      ${(p.figures || []).length ? `
        <div class="solution-card">
          <div class="sc-label">Key figures</div>
          <ul class="b-list" style="margin:0">${p.figures.map(f => `<li><strong>${md(f)}</strong></li>`).join('')}</ul>
        </div>
      ` : ''}
      ${(p.answer || []).length ? `<div class="model-card">
        <div class="mc-kick">What the page says</div>
        ${p.answer.map(a => `<p style="font-size:15px;color:var(--ink);line-height:1.65;margin-bottom:10px">${md(a)}</p>`).join('')}
      </div>` : ''}
      ${srcNotes.length ? `<div class="b-quote">${md(srcNotes.join('; '))}<cite>Source</cite></div>` : ''}
      ${(p.situations || []).length ? `
        <div class="sd-block">
          <h3>When this comes up</h3>
          <div class="row" style="gap:6px;flex-wrap:wrap">${p.situations.map(s => `<span class="chip tone-ink">${md(s)}</span>`).join('')}</div>
        </div>
      ` : ''}
      ${srcs.length ? `<div class="sd-block">
        <h3>${srcs.length === 1 ? 'Source page' : 'Source pages'}</h3>
        <div class="sd-list">${srcs.map(u => `<div class="sd-item">${srcLink(u)}</div>`).join('')}</div>
      </div>` : ''}
    `;
  }

  if (usedBy.length) {
    html += `
      <div class="sd-block">
        <h3>Used in ${usedBy.length} issue${usedBy.length === 1 ? '' : 's'}</h3>
        <div class="pol-list">
          ${usedBy.map(b => `<a class="pol-card" href="#/issue/${b.observed}/0">
            <div class="pol-main"><strong>${esc(b.title)}</strong><span class="dim" style="font-size:12.5px">Open guide</span></div>
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
        toast({ msg: 'Copied.', icon: '✓', timeout: 1800 });
      } catch {
        toast({ msg: 'Could not copy.', icon: '!' });
      }
    };
  }
}

export { isStale };
