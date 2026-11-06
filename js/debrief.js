// Shift debrief: pattern notes only. The guard refuses anything that looks like client
// data and explains why, because a personal study app is the wrong place for it and
// the advisor's employer would agree.
import { store } from './store.js';
import { data } from './data.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';

const GUARDS = [
  { re: /(?:\d[ -]?){13,19}/, why: 'That looks like a card or account number.' },
  { re: /\d{8,}/, why: 'That is a run of eight or more digits, which is how account and reference numbers look.' },
  { re: /\b(?:Mr|Mrs|Ms|Mx|Dr|Mme|Mlle|M)\.?\s+[A-Z][a-zà-ÿ]+/, why: 'That looks like a client\'s name.' },
  { re: /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+(?:called|phoned|said|wants|asked))/, why: 'That looks like a client\'s full name.' },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, why: 'That is an email address.' },
  { re: /\b\d{3}[ -]?\d{3}[ -]?\d{4}\b/, why: 'That looks like a phone number.' },
  { re: /\b\d{1,5}\s+[A-Z][a-z]+\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Cres|Crescent|Way|Lane)\b/, why: 'That looks like a street address.' }
];

export function guard(text) {
  for (const g of GUARDS) { const m = text.match(g.re); if (m) return { hit: m[0], why: g.why }; }
  return null;
}

export function debriefView(main) {
  document.body.classList.remove('reading');
  const D = data();
  const list = store.debriefs;
  const opts = D.issues.map(i => `<option value="${esc(i.id)}">${esc(i.title)}</option>`).join('');
  const byIssue = {};
  list.forEach(d => { byIssue[d.issue] = (byIssue[d.issue] || 0) + 1; });
  const top = Object.entries(byIssue).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxN = top.length ? Math.max(1, top[0][1]) : 1;

  main.innerHTML = `<section class="screen screen-active">
    <div class="screen-inner">
      <header class="view-head">
        <div>
          <span class="kicker">Shift Debrief · Pattern Log</span>
          <h1 class="h-xl">Three lines after a shift, pattern only</h1>
          <p class="lede">Issue type, what worked, and what to look up. No names, no numbers, no client details: the privacy guard refuses them in real time and explains why. Your pattern over weeks is what gets you to specialist.</p>
        </div>
        <div class="guard-badge ok" id="guardBadge">
          <span class="guard-dot"></span>
          <span id="guardBadgeTxt">Privacy Guard Active · Local Only</span>
        </div>
      </header>

      <div class="debrief-layout">
        <div class="pol-card debrief-form-card">
          <div class="pol-card-top">
            <span class="bd-domain" style="--dom:var(--teal)">NEW SHIFT ENTRY</span>
            <span class="mono dim" style="font-size:11px">${new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          <div class="field">
            <span>1 · Issue type</span>
            <select id="dbIssue">
              <option value="">Pick the closest issue driver…</option>
              ${opts}
              <option value="other">Something not in the issue bank yet</option>
            </select>
          </div>

          <div class="field">
            <span>2 · What worked on the call</span>
            <textarea id="dbWorked" rows="2" placeholder="The opener, the diagnostic question, or the sequence that landed…"></textarea>
          </div>

          <div class="field">
            <span>3 · What to look up before next shift</span>
            <textarea id="dbLookup" rows="2" placeholder="The figure you weren't sure of, or the procedure you had to place a hold for…"></textarea>
          </div>

          <div class="field">
            <span>4 · Pattern noticed (optional)</span>
            <input id="dbPattern" placeholder="e.g. Third decline-after-alert this week, all stale SMS numbers">
          </div>

          <div class="debrief-foot">
            <div class="guard-msg" id="dbGuard">
              <span class="dim">Zero network calls. Card numbers, names, emails, phones, and addresses are automatically blocked.</span>
            </div>
            <button class="btn pri" id="dbSave">Save debrief →</button>
          </div>
        </div>

        <div class="debrief-side">
          <div class="pol-card">
            <div class="pol-card-top">
              <span class="kicker">Call Driver Frequency</span>
              <span class="mono dim" style="font-size:11px">${list.length} logged</span>
            </div>
            ${top.length ? `<div class="driver-bars">
              ${top.map(([id, n]) => {
                const i = D.issues.find(x => x.id === id);
                const pct = Math.round((n / maxN) * 100);
                const label = i ? i.title.replace(/\s*\(.*\)$/, '') : (id === 'other' ? 'Not in the bank yet' : id);
                return `<div class="driver-row">
                  <div class="between" style="font-size:12.5px;margin-bottom:4px">
                    ${i ? `<a href="#/issue/${esc(id)}" class="driver-link">${esc(label)}</a>` : `<span>${esc(label)}</span>`}
                    <span class="mono dim">${n}</span>
                  </div>
                  <div class="driver-bar-track"><div class="driver-bar-fill" style="width:${pct}%"></div></div>
                </div>`;
              }).join('')}
            </div>` : `<p class="dim" style="font-size:13px;margin:8px 0 0">Log your first shift debrief to see your personal call-driver distribution and weak spots.</p>`}
          </div>

          <div class="b-key" style="margin:0">
            <span class="lbl">Why 3 lines work</span>
            <p>Advisors plateau when every call blurs into the next. Naming the single line that landed and the single procedure you had to look up turns a shift into deliberate practice.</p>
          </div>
        </div>
      </div>

      <div class="sec-head" style="margin-top:28px">
        <span class="sec-title">Shift Log (${list.length})</span>
        <span class="sec-line"></span>
      </div>

      ${list.length ? `<div class="bd-grid">
        ${list.slice(0, 60).map(d => {
          const i = D.issues.find(x => x.id === d.issue);
          return `<div class="pol-card">
            <div class="pol-card-top">
              <strong>${esc(i ? i.title : d.issue === 'other' ? 'Not in the bank yet' : d.issue)}</strong>
              <span class="dim mono" style="font-size:11px">${new Date(d.at).toLocaleDateString()}</span>
            </div>
            ${d.worked ? `<div class="debrief-line"><span class="tag teal">Worked</span><div class="debrief-line-body">${md(d.worked)}</div></div>` : ''}
            ${d.lookUp ? `<div class="debrief-line"><span class="tag amber">Look up</span><div class="debrief-line-body">${md(d.lookUp)}</div></div>` : ''}
            ${d.pattern ? `<div class="debrief-line"><span class="tag">Pattern</span><div class="debrief-line-body">${md(d.pattern)}</div></div>` : ''}
            <div class="pol-card-foot" style="margin-top:auto;padding-top:8px">
              ${i ? `<a class="ghost-btn sm" href="#/issue/${esc(i.id)}">Open issue →</a>` : '<span></span>'}
              <button class="ghost-btn sm" data-del="${esc(d.id)}">Remove</button>
            </div>
          </div>`;
        }).join('')}
      </div>` : `<div class="empty">Nothing logged yet. After your next shift, write three lines.</div>`}
    </div>
  </section>`;

  const fields = ['dbWorked', 'dbLookup', 'dbPattern'].map(id => main.querySelector('#' + id));
  const guardEl = main.querySelector('#dbGuard');
  const badgeEl = main.querySelector('#guardBadge');
  const badgeTxt = main.querySelector('#guardBadgeTxt');

  const check = () => {
    for (const f of fields) {
      const g = guard(f.value);
      if (g) {
        guardEl.innerHTML = `<span class="guard-alert"><strong>Blocked:</strong> ${esc(g.why)} Remove <code>${esc(g.hit)}</code> and describe the pattern instead.</span>`;
        badgeEl?.classList.remove('ok');
        badgeEl?.classList.add('blocked');
        if (badgeTxt) badgeTxt.textContent = 'Client Data Blocked';
        return g;
      }
    }
    guardEl.innerHTML = `<span class="dim">Zero network calls. Card numbers, names, emails, phones, and addresses are automatically blocked.</span>`;
    badgeEl?.classList.add('ok');
    badgeEl?.classList.remove('blocked');
    if (badgeTxt) badgeTxt.textContent = 'Privacy Guard Active · Local Only';
    return null;
  };
  fields.forEach(f => f.addEventListener('input', check));

  main.querySelector('#dbSave').onclick = () => {
    if (check()) { toast({ msg: 'Not saved. Client data stays out of this app.', icon: '!', timeout: 3200 }); return; }
    const issue = main.querySelector('#dbIssue').value;
    const [worked, lookUp, pattern] = fields.map(f => f.value.trim());
    if (!issue || (!worked && !lookUp)) { toast({ msg: 'Pick the issue and write at least one line.', timeout: 2600 }); return; }
    store.addDebrief({ issue, worked, lookUp, pattern });
    store.touchStreak();
    toast({ msg: 'Debrief saved.', icon: '✓', timeout: 2200 });
    debriefView(main);
  };
  main.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { store.removeDebrief(b.dataset.del); debriefView(main); });
}
