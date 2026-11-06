// Shift debrief: general notes only. The guard refuses anything that looks like client
// data and explains why, because a personal study app is the wrong place for it and
// the advisor's employer would agree.
import { store } from './store.js';
import { data } from './data.js';
import { esc, md } from './render.js';
import { toast } from './toast.js';

// Team and product words that start a capitalised pair without naming a person ("Fraud Team said").
const ORG = '(?:Fraud|Card|Cards|Customer|Client|Team|Service|Services|Support|Desk|Visa|Mastercard|Amex|Branch|Bank|Merchant|Collections|Disputes?|Security|Escalations?|Credit|Debit|Back|Front|Head|Office)';

const GUARDS = [
  { re: /(?<!\d)\d{4}(?:[ .-]{0,3}\d{4}){2}[ .-]{0,3}\d{1,4}(?:[ .-]{0,3}\d{1,3})?(?!\d)|(?<!\d)\d{4}[ .-]{0,3}\d{6}[ .-]{0,3}\d{5}(?!\d)/g, why: 'That looks like a card or account number.' },
  { re: /\d{8,}/g, why: 'That is a run of eight or more digits, which is how account and reference numbers look.' },
  { re: /(?<![\p{L}.'])(?:(?:Mr|Mrs|Ms|Mx|Dr|Mme|Mlle)\.?|M\.)\s+\p{Lu}[\p{L}'-]+/gu, why: 'That looks like a client\'s name.' },
  { re: /(?<![\p{L}.'])(?:mr|mrs|mme|mlle)\.?\s+\p{L}[\p{L}'-]+/giu, why: 'That looks like a client\'s name.' },
  { re: new RegExp(`(?<!\\p{L})(?!${ORG}(?!\\p{L}))\\p{Lu}[\\p{Ll}'-]+\\s+(?!${ORG}(?!\\p{L}))\\p{Lu}[\\p{Ll}'-]+\\s+(?:called|phoned|said|wants|asked)\\b`, 'gu'), why: 'That looks like a client\'s full name.' },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/g, why: 'That is an email address.' },
  { re: /(?<!\d)(?:\+?1[\s.-]?)?\(?(\d{3})\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g, allow: m => /^8(?:00|33|44|55|66|77|88)$/.test(m[1]), why: 'That looks like a phone number.' },
  { re: /\b\d{1,5}\s+[A-Z][a-z]+\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Cres|Crescent|Way|Lane)\b/g, why: 'That looks like a street address.' },
  { re: /\b\d{1,5}\s+(?:(?:rue|av\.?|avenue|boul\.?|boulevard|chemin|ch\.)\s+\p{L}[\p{L}'-]*|\p{L}[\p{L}'-]*\s+(?:st|street|ave|avenue|rd|road|blvd|drive|cres|crescent|lane)\.?(?!\p{L}))/giu, why: 'That looks like a street address.' }
];

const FOOTER = 'Nothing you type here leaves this device. Card numbers, names, emails, phone numbers and addresses are blocked.';

export function guard(text) {
  for (const g of GUARDS) for (const m of text.matchAll(g.re)) { if (g.allow?.(m)) continue; return { hit: m[0], why: g.why }; }
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
          <h1 class="h-xl">Shift debrief</h1>
          <p class="lede">A few quick notes after each shift. General patterns only, no client details.</p>
        </div>
      </header>

      <div class="debrief-layout">
        <div class="pol-card debrief-form-card">
          <div class="pol-card-top">
            <span class="mono dim" style="font-size:11px">${new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          <div class="field">
            <span><label for="dbIssue">Call type</label></span>
            <select id="dbIssue">
              <option value="">Pick the closest call type</option>
              ${opts}
              <option value="other">Other</option>
            </select>
          </div>

          <div class="field">
            <span><label for="dbWorked">What worked</label></span>
            <textarea id="dbWorked" rows="2" placeholder="The opening line, a question, or the steps that worked"></textarea>
          </div>

          <div class="field">
            <span><label for="dbLookup">What to look up before next shift</label></span>
            <textarea id="dbLookup" rows="2" placeholder="A figure you weren't sure of, or a step you had to put the client on hold for"></textarea>
          </div>

          <div class="field">
            <span><label for="dbPattern">Anything you noticed (optional)</label></span>
            <input id="dbPattern" placeholder="e.g. Third decline-after-alert this week, all stale SMS numbers">
          </div>

          <div class="debrief-foot">
            <div class="guard-msg" id="dbGuard" role="status" aria-live="polite">
              <span class="dim">${FOOTER}</span>
            </div>
            <button class="btn pri" id="dbSave" type="button">Save</button>
          </div>
        </div>

        <div class="debrief-side">
          ${list.length >= 2 ? `<div class="pol-card">
            <div class="pol-card-top">
              <strong>Your most common calls</strong>
              <span class="mono dim" style="font-size:11px">${list.length}</span>
            </div>
            <div class="driver-bars">
              ${top.map(([id, n]) => {
                const i = D.issues.find(x => x.id === id);
                const pct = Math.round((n / maxN) * 100);
                const label = i ? i.title.replace(/\s*\(.*\)$/, '') : (id === 'other' ? 'Other' : id);
                return `<div class="driver-row">
                  <div class="between" style="font-size:12.5px;margin-bottom:4px">
                    ${i ? `<a href="#/issue/${esc(id)}" class="driver-link">${esc(label)}</a>` : `<span>${esc(label)}</span>`}
                    <span class="mono dim">${n}</span>
                  </div>
                  <div class="driver-bar-track"><div class="driver-bar-fill" style="width:${pct}%"></div></div>
                </div>`;
              }).join('')}
            </div>
          </div>` : ''}

          <details class="disc" style="margin:0">
            <summary>Why this helps</summary>
            <div class="body">Calls blur together after a while. Writing down the one line that worked and the one thing you had to look up turns each shift into practice.</div>
          </details>
        </div>
      </div>

      <div class="sec-head" style="margin-top:28px">
        <span class="sec-title">Past entries</span>
      </div>

      ${list.length ? `<div class="bd-grid">
        ${list.slice(0, 60).map(d => {
          const i = D.issues.find(x => x.id === d.issue);
          return `<div class="pol-card">
            <div class="pol-card-top">
              ${i ? `<a href="#/issue/${esc(i.id)}"><strong>${esc(i.title)}</strong></a>` : `<strong>${esc(d.issue === 'other' ? 'Other' : d.issue)}</strong>`}
              <span class="dim mono" style="font-size:11px">${new Date(d.at).toLocaleDateString()}</span>
            </div>
            ${d.worked ? `<div class="debrief-line"><div class="debrief-line-body"><strong>Worked:</strong> ${md(d.worked)}</div></div>` : ''}
            ${d.lookUp ? `<div class="debrief-line"><div class="debrief-line-body"><strong>Look up:</strong> ${md(d.lookUp)}</div></div>` : ''}
            ${d.pattern ? `<div class="debrief-line"><div class="debrief-line-body"><strong>Noticed:</strong> ${md(d.pattern)}</div></div>` : ''}
            <div class="pol-card-foot" style="margin-top:auto;padding-top:8px;justify-content:flex-end">
              <button type="button" class="link-btn dim" data-del="${esc(d.id)}" style="background:none;border:0;padding:10px 4px;min-height:44px;font-size:12.5px;cursor:pointer;color:var(--muted);text-decoration:underline">Remove</button>
            </div>
          </div>`;
        }).join('')}
      </div>` : `<div class="empty">Nothing saved yet. After your next shift, write a few lines.</div>`}
    </div>
  </section>`;

  const fields = ['dbWorked', 'dbLookup', 'dbPattern'].map(id => main.querySelector('#' + id));
  const guardEl = main.querySelector('#dbGuard');

  let lastGuard = 'ok'; // the markup above already shows the clear notice
  const check = () => {
    for (const f of fields) {
      const g = guard(f.value);
      if (g) {
        const key = 'b:' + g.hit;
        if (key !== lastGuard) guardEl.innerHTML = `<span class="guard-alert"><strong>Blocked:</strong> ${esc(g.why)} Remove <code>${esc(g.hit)}</code> and describe what happened in general terms.</span>`;
        lastGuard = key;
        return g;
      }
    }
    const key = 'ok';
    if (key !== lastGuard) guardEl.innerHTML = `<span class="dim">${FOOTER}</span>`;
    lastGuard = key;
    return null;
  };
  fields.forEach(f => f.addEventListener('input', check));

  main.querySelector('#dbSave').onclick = () => {
    if (check()) { toast({ msg: 'Not saved. Client data stays out of this app.', icon: '!', timeout: 3200 }); return; }
    const issue = main.querySelector('#dbIssue').value;
    const [worked, lookUp, pattern] = fields.map(f => f.value.trim());
    if (!issue || (!worked && !lookUp)) { toast({ msg: 'Pick the call type and write at least one line.', timeout: 2600 }); return; }
    store.addDebrief({ issue, worked, lookUp, pattern });
    store.touchStreak();
    toast({ msg: 'Saved.', icon: '✓', timeout: 2200 });
    debriefView(main);
  };
  main.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const id = b.dataset.del;
    const idx = store.debriefs.findIndex(d => d.id === id);
    const gone = store.debriefs[idx];
    store.removeDebrief(id);
    debriefView(main);
    if (!gone) return;
    const t = toast({ id: 'debrief-undo', msg: 'Entry removed.', action: 'Undo', timeout: 6000, onAction: () => {
      t.close();
      store.restoreDebrief(gone, idx);
      if (location.hash.startsWith('#/debrief')) debriefView(main);
    } });
  });
}
