import { loadData, data, searchIndex } from './data.js';
import { store } from './store.js';
import { esc } from './render.js';
import { bankView, issueView } from './issue.js';
import { policyView } from './policy.js';
import { cardsView } from './study.js';
import { practiceView, drillView, stopTimers } from './practice.js';
import { debriefView } from './debrief.js';
import { unmountHighlighter } from './highlight.js';
import { ensoMark, brushDot } from '../data/brush.js';
import { initPWA, checkForUpdate } from './pwa.js';
import { toast } from './toast.js';
import { APP_VERSION } from './version.js';

const main = document.getElementById('main');
const nav = document.getElementById('sidenavInner');
document.getElementById('brandMark').innerHTML = ensoMark();

/* ─────────── sidebar ─────────── */
const NAV = [
  ['#/', '◆', 'Issue bank'],
  ['#/policy', '§', 'Policy lookup'],
  ['#/practice', '✎', 'Role-play drills'],
  ['#/cards', '⚑', 'Flashcards'],
  ['#/debrief', '◷', 'Shift debrief'],
  ['#/about', 'i', 'About and backup']
];

function buildNav() {
  const hash = location.hash || '#/';
  const D = data();
  const item = ([h, ic, label]) => `<a class="nav-item" href="${h}"${hash === h ? ' aria-current="page"' : ''}><span class="n">${ic}</span>${label}</a>`;
  let html = `<div class="nav-group"><div class="nav-label">Work</div>${NAV.map(item).join('')}</div>`;
  if (D) {
    const bd = D.issues.filter(i => i.breakdown);
    html += `<div class="nav-group"><div class="nav-label" style="color:var(--rs)">${brushDot()}Guided breakdowns</div>` +
      bd.map(i => `<a class="nav-item" href="#/issue/${i.id}"${hash.startsWith('#/issue/' + i.id) ? ' aria-current="page"' : ''}><span class="n">→</span>${esc(i.title.replace(/\s*\(.*\)$/, '').slice(0, 44))}</a>`).join('') + `</div>`;
    html += `<div class="nav-group"><div class="nav-label">Categories</div>` +
      D.categories.map(c => `<a class="nav-item" href="#/cat/${encodeURIComponent(c)}"><span class="n">·</span>${esc(c)}</a>`).join('') + `</div>`;
  }
  nav.innerHTML = html;
}

const sidenav = document.getElementById('sidenav');
const scrim = document.getElementById('scrim');
const menuBtn = document.getElementById('menuBtn');
function setNav(open) {
  sidenav.classList.toggle('open', open);
  scrim.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.onclick = () => setNav(!sidenav.classList.contains('open'));
scrim.onclick = () => setNav(false);

/* ─────────── theme ─────────── */
const applyTheme = t => { document.documentElement.dataset.theme = t; document.querySelector('meta[name=theme-color]').content = t === 'light' ? '#f4f1ea' : '#0a0a0f'; };
applyTheme(store.pref('theme') || 'dark');
document.getElementById('themeBtn').onclick = () => { const t = store.pref('theme') === 'light' ? 'dark' : 'light'; store.pref('theme', t); applyTheme(t); };

/* ─────────── palette ─────────── */
let INDEX = [];
const palette = document.getElementById('palette');
const pInput = document.getElementById('paletteInput');
const pResults = document.getElementById('paletteResults');
let pSel = 0, pHits = [];
function openPalette() { palette.hidden = false; pInput.value = ''; pInput.focus(); runSearch(''); }
function closePalette() { palette.hidden = true; }
function runSearch(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  pHits = terms.length ? INDEX.filter(x => terms.every(tm => x.text.includes(tm))).slice(0, 40) : INDEX.filter(x => x.kind === 'Issue').slice(0, 12);
  pSel = 0;
  pResults.innerHTML = pHits.length
    ? pHits.map((h, i) => `<button class="pr${i === 0 ? ' sel' : ''}" data-i="${i}"><span class="k">${h.kind}</span>${esc(h.title)}<span class="s">${esc(h.sub)}</span></button>`).join('')
    : `<div class="empty">Nothing found. Try "abroad", "lock", "56 days", "spouse".</div>`;
  pResults.querySelectorAll('.pr').forEach(b => b.onclick = () => { go(pHits[+b.dataset.i].href); closePalette(); });
}
pInput.addEventListener('input', e => runSearch(e.target.value));
palette.addEventListener('click', e => { if (e.target === palette) closePalette(); });
document.getElementById('searchBtn').onclick = openPalette;
document.addEventListener('keydown', e => {
  if (!palette.hidden) {
    if (e.key === 'Escape') return closePalette();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      pSel = Math.max(0, Math.min(pHits.length - 1, pSel + (e.key === 'ArrowDown' ? 1 : -1)));
      pResults.querySelectorAll('.pr').forEach((b, i) => b.classList.toggle('sel', i === pSel));
      pResults.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter' && pHits[pSel]) { go(pHits[pSel].href); closePalette(); }
    return;
  }
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
  if (e.key === 'https://gh.072103.xyz/' && !typing) { e.preventDefault(); openPalette(); }
});

/* ─────────── about / backup ─────────── */
function aboutView() {
  const D = data();
  main.innerHTML = `<div class="wrap">
    <div class="eyebrow">About</div>
    <h1 class="h-lg">Cards Advisor</h1>
    <p class="lede">A study tool for a bank cards advisor. It holds the common card issues as clients describe them, what they want underneath, and a guided breakdown of how to engage, diagnose and resolve each one, with the rule behind every figure.</p>
    <div class="b-warn"><span class="lbl">Not affiliated with any bank</span><p>The corpus is public material: consumer reviews, news archives, the bank's own public pages, and Canadian law and regulator guidance, all dated. This app is not an official source. Confirm every figure in your own systems before you say it to a client, and never quote this app as the source.</p></div>
    <div class="b-key"><span class="lbl">No client data, ever</span><p>There is no field in this app for a client's name, card, account, phone or address, and the debrief screen refuses anything that looks like one. Nothing you type leaves this device; there are no network calls except loading the app itself.</p></div>
    <div class="card" style="display:block">
      <div class="between"><div><strong>Corpus</strong><div class="dim" style="font-size:12.6px">${D.issues.length} issues · ${D.breakdowns.length} breakdowns · ${D.faq.items.length} bank pages · ${D.rules.mustKnow.length} rules · compiled ${esc(D.compiled)}</div></div></div>
    </div>
    <div class="card" style="display:block">
      <div class="between"><div><strong>Your data on this device</strong><div class="dim" style="font-size:12.6px">${Object.keys(store.all.notes).length} notes · ${store.highlightCount} highlights · ${store.drillCount} drill runs · ${store.debriefs.length} debriefs</div></div>
        <span class="row" style="gap:6px"><button class="btn sec" id="exp">Export</button><button class="btn sec" id="imp">Import</button></span></div>
      <input type="file" id="impFile" accept="application/json" hidden>
    </div>
    <div class="card" style="display:block"><div class="between"><div><strong>Version</strong><div class="dim mono" style="font-size:12.2px">${esc(APP_VERSION)}</div></div><button class="btn sec" id="upd">Check for update</button></div></div>
    <p class="dim" style="font-size:12.4px">Sibling of Praxis, which carries the full customer-service and support-leadership tracks.</p>
  </div>`;
  main.querySelector('#exp').onclick = () => { download(`cards-advisor-backup-${new Date().toISOString().slice(0, 10)}.json`, store.exportAll()); store.pref('lastBackup', Date.now()); };
  const file = main.querySelector('#impFile');
  main.querySelector('#imp').onclick = () => file.click();
  file.onchange = async () => {
    const f = file.files[0]; if (!f) return;
    try { store.importAll(await f.text()); toast({ msg: 'Imported.', icon: '✓' }); aboutView(); }
    catch { toast({ msg: 'That file is not a Cards Advisor backup.', icon: '!' }); }
  };
  main.querySelector('#upd').onclick = () => checkForUpdate({ announce: true });
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ─────────── router ─────────── */
export function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

function route() {
  const [, seg, a, b] = (location.hash || '#/').split('/');
  setNav(false);
  stopTimers();
  window.scrollTo(0, 0);
  if (seg !== 'issue') unmountHighlighter();

  switch (seg) {
    case '': case undefined: bankView(main); break;
    case 'issue': issueView(main, a, b); break;
    case 'cat': bankView(main, decodeURIComponent(a || '')); break;
    case 'policy': policyView(main, a); break;
    case 'cards': cardsView(main); break;
    case 'practice': practiceView(main); break;
    case 'drill': drillView(main, a); break;
    case 'debrief': debriefView(main); break;
    case 'about': aboutView(); break;
    default: bankView(main);
  }
  buildNav();
  document.querySelectorAll('#tabbar a').forEach(l => {
    const h = l.getAttribute('href');
    const on = h === '#/' ? (seg === '' || seg === undefined || seg === 'issue' || seg === 'cat') : location.hash.startsWith(h);
    l.toggleAttribute('aria-current', on);
  });
  main.focus({ preventScroll: true });
}

/* ─────────── first run and backups ─────────── */
function firstRun() {
  if (store.pref('privacyAck')) return;
  toast({
    id: 'privacy', icon: '◆', timeout: 0,
    msg: 'Study tool, not an official bank source. Confirm figures in-system. Never type a client\'s details here.',
    action: 'Understood',
    onAction: () => { store.pref('privacyAck', Date.now()); document.querySelector('[data-toast-id=privacy]')?.remove(); }
  });
}
document.addEventListener('cards:storage-error', () => toast({ id: 'quota', icon: '!', timeout: 0, msg: 'This device refused to save. Export your notes from About.', action: 'Open About', secondary: 'Dismiss', onAction: () => { go('#/about'); } }));
function maybeNagBackup() {
  const risk = store.valueAtRisk(), last = store.pref('lastBackup') || 0, nag = store.pref('backupNag') || 0, now = Date.now();
  if (risk < 10 || now - last < 14 * 864e5 || now - nag < 3 * 864e5) return;
  store.pref('backupNag', now);
  setTimeout(() => toast({ id: 'backup', icon: '↓', timeout: 0, msg: `${risk} pieces of work are saved only on this device.`, action: 'Back up', secondary: 'Not now', onAction: () => go('#/about') }), 4000);
}

/* ─────────── boot ─────────── */
(async () => {
  try { await loadData(); }
  catch (e) {
    main.innerHTML = `<div class="wrap"><div class="empty">Could not load the corpus (${esc(e.message)}). If you are offline, open the app once online first.</div></div>`;
    return;
  }
  INDEX = searchIndex();
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', () => store.flushNow());
  route();
  initPWA();
  firstRun();
  maybeNagBackup();
})();
