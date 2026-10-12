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
  const D = data();
  const list = store.debriefs;
  const opts = D.issues.map(i => `<option value="${i.id}">${esc(i.title)}</option>`).join('');
  const byIssue = {};
  list.forEach(d => { byIssue[d.issue] = (byIssue[d.issue] || 0) + 1; });
  const top = Object.entries(byIssue).sort((a, b) => b[1] - a[1]).slice(0, 5);

  main.innerHTML = `<div class="wrap">
    <div class="eyebrow">Shift debrief</div>
    <h1 class="h-lg">Three lines after a shift, pattern only</h1>
    <p class="lede">Issue type, what worked, what to look up. No names, no numbers, no client details: the box refuses them and tells you why. The pattern over weeks is what gets you to specialist.</p>

    <div class="card" style="display:block">
      <div class="field"><span>Issue type</span>
        <select id="dbIssue"><option value="">Pick the closest issue</option>${opts}<option value="other">Something not in the bank yet</option></select></div>
      <div class="field"><span>What worked</span><textarea id="dbWorked" rows="2" placeholder="The line, the question, the order that landed"></textarea></div>
      <div class="field"><span>What to look up</span><textarea id="dbLookup" rows="2" placeholder="The figure you were not sure of, the procedure you had to hold for"></textarea></div>
      <div class="field"><span>Pattern (optional)</span><input id="dbPattern" placeholder="e.g. third decline-after-alert this week, all stale phone numbers"></div>
      <div class="between"><span class="dim" id="dbGuard" style="font-size:12.6px"></span><button class="btn" id="dbSave">Save debrief</button></div>
    </div>

    ${top.length ? `<div class="eyebrow" style="margin-top:22px">Your pattern, ${list.length} debriefs</div>
      <div class="card" style="display:block">${top.map(([id, n]) => {
        const i = D.issues.find(x => x.id === id);
        return `<div class="row between"><a href="#/issue/${id}">${esc(i ? i.title : id === 'other' ? 'Not in the bank yet' : id)}</a><span class="mono dim">${n}</span></div>`;
      }).join('')}</div>` : ''}

    <div class="eyebrow" style="margin-top:22px">Log</div>
    ${list.length ? list.slice(0, 60).map(d => {
      const i = D.issues.find(x => x.id === d.issue);
      return `<div class="card" style="display:block">
        <div class="between"><strong>${esc(i ? i.title : d.issue === 'other' ? 'Not in the bank yet' : d.issue)}</strong><span class="dim mono" style="font-size:12px">${new Date(d.at).toLocaleDateString()}</span></div>
        ${d.worked ? `<div style="margin-top:6px"><span class="tag">worked</span> ${md(d.worked)}</div>` : ''}
        ${d.lookUp ? `<div style="margin-top:4px"><span class="tag">look up</span> ${md(d.lookUp)}</div>` : ''}
        ${d.pattern ? `<div style="margin-top:4px"><span class="tag">pattern</span> ${md(d.pattern)}</div>` : ''}
        <div style="margin-top:6px"><button class="ghost-btn" data-del="${d.id}">Remove</button></div>
      </div>`;
    }).join('') : `<div class="empty">Nothing yet. After your next shift, three lines.</div>`}
  </div>`;

  const fields = ['dbWorked', 'dbLookup', 'dbPattern'].map(id => main.querySelector('#' + id));
  const guardEl = main.querySelector('#dbGuard');
  const check = () => {
    for (const f of fields) {
      const g = guard(f.value);
      if (g) { guardEl.innerHTML = `<span style="color:var(--rs)">Blocked: ${esc(g.why)}</span> Remove "${esc(g.hit)}" and describe the pattern instead.`; return g; }
    }
    guardEl.textContent = '';
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
