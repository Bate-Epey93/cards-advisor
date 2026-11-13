import { loadData, data, searchIndex } from './data.js';
import { store } from './store.js';
import { esc } from './render.js';
import { bankView, issueView, cleanupIssueReader } from './issue.js';
import { policyView } from './policy.js';
import { cardsView } from './study.js';
import { practiceView, drillView, stopTimers } from './practice.js';
import { debriefView } from './debrief.js';
import { badgeView } from './badge.js';
import { callView, callSearchIndex } from './call.js';
import { unmountHighlighter, openPanel } from './highlight.js';
import { renderRoughCardLogo } from './diagram.js';
import { initPWA, checkForUpdate } from './pwa.js';
import { toast, dismissToast } from './toast.js';
import { APP_VERSION } from './version.js';

const main = document.getElementById('main');
document.querySelector('.skip')?.addEventListener('click', e => { e.preventDefault(); main.focus(); });
const brandMark = document.getElementById('brandMark');
if (brandMark) brandMark.innerHTML = renderRoughCardLogo();

/* ─────────── topbar controls ─────────── */
const backBtn = document.getElementById('backBtn');
if (backBtn) {
  backBtn.onclick = () => {
    go('#/');
  };
}

// Topbar depth switch: removed from the markup, kept null-safe
const depthSwitch = document.getElementById('depthSwitch');
function syncTopbarDepth() {
  const d = store.pref('depth') || 'agent';
  depthSwitch?.querySelectorAll('[data-depth]').forEach(b => {
    b.classList.toggle('on', b.dataset.depth === d);
    b.setAttribute('aria-pressed', String(b.dataset.depth === d));
  });
}
syncTopbarDepth();
// the reader's own depth pills fire this on window; keep the topbar in step
window.addEventListener('cards:depth-changed', syncTopbarDepth);

depthSwitch?.querySelectorAll('[data-depth]').forEach(b => {
  b.onclick = () => {
    const d = b.dataset.depth;
    store.pref('depth', d);
    syncTopbarDepth();
    // bubbles: reaches the reader whether it listens on document or window
    document.dispatchEvent(new CustomEvent('cards:topbar-depth', { detail: d, bubbles: true }));
  };
});

// Topbar Policy button: opens the Policy for this issue sheet
const topPolicyBtn = document.getElementById('topPolicyBtn');
if (topPolicyBtn) {
  topPolicyBtn.onclick = () => {
    document.dispatchEvent(new CustomEvent('cards:open-policy-sheet', { bubbles: true }));
  };
}

/* ─────────── theme ─────────── */
const applyTheme = (t, animate = true) => {
  if (animate) document.documentElement.classList.add('theme-transitioning');
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.content = t === 'light' ? '#f5f2eb' : '#070913';
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 240);
};
applyTheme(store.pref('theme') || 'dark', false);

document.getElementById('themeBtn')?.addEventListener('click', () => {
  const cur = document.documentElement.dataset.theme || store.pref('theme') || 'dark';
  const t = cur === 'light' ? 'dark' : 'light';
  store.pref('theme', t);
  applyTheme(t);
  if ((location.hash || '#/').startsWith('#/about')) aboutView();
});

/* ─────────── palette ─────────── */
let INDEX = [];
const palette = document.getElementById('palette');
const pInput = document.getElementById('paletteInput');
const pResults = document.getElementById('paletteResults');
let pSel = 0, pHits = [];
let pReturn = null;
// leaves alone anything already inert (e.g. #app while the Policy sheet is open) so closing the palette does not undo it
let pInerted = [];
const setBehindInert = on => {
  if (on) {
    pInerted = [...document.body.children].filter(el => el !== palette && el.tagName !== 'SCRIPT' && !el.inert);
    pInerted.forEach(el => { el.inert = true; });
  } else {
    pInerted.forEach(el => { el.inert = false; });
    pInerted = [];
  }
};

function openPalette() {
  if (!palette.hidden) return;
  pReturn = document.activeElement;
  setBehindInert(true);
  palette.hidden = false;
  pInput.value = '';
  pInput.focus();
  runSearch('');
}
function closePalette() {
  if (palette.hidden) return;
  palette.hidden = true;
  setBehindInert(false);
  pInput.removeAttribute('aria-activedescendant');
  if (pReturn && document.contains(pReturn)) pReturn.focus({ preventScroll: true });
  pReturn = null;
}
document.getElementById('paletteClose')?.addEventListener('click', closePalette);
function runSearch(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  pHits = terms.length
    ? INDEX.filter(x => terms.every(tm => x.text.includes(tm))).slice(0, 40)
    : INDEX.filter(x => x.kind === 'Issue').slice(0, 12);
  pSel = 0;
  pResults.innerHTML = pHits.length
    ? pHits.map((h, i) => `<button class="pr${i === 0 ? ' sel' : ''}" role="option" id="pr-${i}" aria-selected="${i === 0}" data-i="${i}">
        <span class="k">${esc(h.kind)}</span>
        <span class="pr-main">
          <strong>${esc(h.title)}</strong>
          <span class="s">${esc(h.sub)}</span>
        </span>
      </button>`).join('')
    : `<div class="empty" style="margin:12px">Nothing found. Try "abroad", "lock", "hold", "warm transfer", "56 days", or "$50".</div>`;
  pHits.length ? pInput.setAttribute('aria-activedescendant', 'pr-0') : pInput.removeAttribute('aria-activedescendant');
  pResults.querySelectorAll('.pr').forEach(b => {
    b.onclick = () => {
      go(pHits[+b.dataset.i].href);
      closePalette();
    };
  });
}

pInput?.addEventListener('input', e => runSearch(e.target.value));
palette?.addEventListener('click', e => { if (e.target === palette) closePalette(); });
document.getElementById('searchBtn')?.addEventListener('click', openPalette);

document.addEventListener('keydown', e => {
  if (!palette.hidden) {
    if (e.key === 'Escape') { e.preventDefault(); return closePalette(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      pSel = Math.max(0, Math.min(pHits.length - 1, pSel + (e.key === 'ArrowDown' ? 1 : -1)));
      pResults.querySelectorAll('.pr').forEach((b, i) => { b.classList.toggle('sel', i === pSel); b.setAttribute('aria-selected', String(i === pSel)); });
      if (pHits.length) pInput.setAttribute('aria-activedescendant', 'pr-' + pSel);
      pResults.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter' && pHits[pSel]) {
      e.preventDefault();
      go(pHits[pSel].href);
      closePalette();
    }
    return;
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPalette();
    return;
  }

  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  // Esc: the open Policy sheet is handled by the reader's own key handler
  if (e.key === 'Escape' && !document.querySelector('.sheet-scrim')) {
    if (document.body.classList.contains('hl-open')) { e.preventDefault(); openPanel(false); return; }
    if (document.body.classList.contains('reading') && !typing) { e.preventDefault(); go('#/'); return; }
  }
  if (e.key === '/' && !typing) {
    e.preventDefault();
    openPalette();
  }
});

/* ─────────── me ─────────── */
// Hub for the personal screens that left the bottom nav.
function meView() {
  document.body.classList.remove('reading');
  const items = [
    ['#/call/numbers', 'My numbers', 'Handle time, hold, wrap, Other Not Ready and the 94 percent compliance target, worked out for my own shift.'],
    ['#/debrief', 'Shift debrief', `Three lines after a shift, kept on this device. ${store.debriefs.length} saved.`],
    ['#/cards', 'Flashcards', 'The six call steps, my numbers, key figures and say this, not this lines. Missed cards come back sooner.'],
    ['#/id', 'Badge', 'My name and role on the advisor badge.'],
    ['#/about', 'Settings', 'Detail level, issue layout, theme, backup and updates.']
  ];
  main.innerHTML = `<section class="screen screen-active">
    <div class="screen-inner" style="max-width:860px">
      <header class="view-head">
        <div>
          <h1 class="h-xl">Me</h1>
          <p class="lede">My numbers, my notes after a shift, and how this app is set up.</p>
        </div>
      </header>
      <nav class="set-list" aria-label="Me">
        ${items.map(([href, title, desc]) => `<a class="set-block" href="${href}" style="flex-wrap:nowrap;min-height:44px">
          <span class="set-info" style="flex:1 1 auto;min-width:0">
            <strong>${esc(title)}</strong>
            <p>${esc(desc)}</p>
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style="flex:0 0 auto;color:var(--muted)"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>`).join('')}
      </nav>
    </div>
  </section>`;
}

/* ─────────── about / settings / backup ─────────── */
function aboutView() {
  document.body.classList.remove('reading');
  const D = data();
  const curDepth = store.pref('depth') || 'agent';
  const onePage = !!store.pref('onePage');
  const curTheme = store.pref('theme') || 'dark';
  const notes = Object.keys(store.all.notes).length;
  const seg = (attr, val, on, label) => `<button type="button" class="seg-btn${on ? ' on' : ''}" aria-pressed="${on}" ${attr}="${val}">${label}</button>`;

  main.innerHTML = `<section class="screen screen-active">
    <div class="screen-inner" style="max-width:860px">
      <header class="view-head">
        <div>
          <h1 class="h-xl">Settings</h1>
        </div>
      </header>

      <div class="b-warn">
        <span class="lbl">Before you use this</span>
        <p style="margin:4px 0">Not affiliated with any bank. A personal study tool, not an official bank source.</p>
        <p style="margin:4px 0">Confirm every figure in your systems before you quote it.</p>
        <p style="margin:4px 0">Never type client details. Nothing you write leaves this device, and the Debrief screen blocks anything that looks like client details.</p>
      </div>

      <div class="set-list" style="margin-top:24px">
        <div class="set-block">
          <div class="set-info">
            <strong>Detail level</strong>
            <p>How much detail each issue shows.</p>
          </div>
          <div class="seg-group">
            ${seg('data-set-depth', 'agent', curDepth === 'agent', 'New advisor')}
            ${seg('data-set-depth', 'specialist', curDepth === 'specialist', 'Specialist')}
            ${seg('data-set-depth', 'lead', curDepth === 'lead', 'Team lead')}
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Issue layout</strong>
            <p>Show a full guide one step at a time, or every step on one page.</p>
          </div>
          <div class="seg-group">
            ${seg('data-set-onepage', '0', !onePage, 'One step at a time')}
            ${seg('data-set-onepage', '1', onePage, 'All on one page')}
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Theme</strong>
          </div>
          <div class="seg-group">
            ${seg('data-set-theme', 'light', curTheme === 'light', 'Light')}
            ${seg('data-set-theme', 'dark', curTheme === 'dark', 'Dark')}
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Your badge</strong>
            <p>Your name and role on the advisor badge.</p>
          </div>
          <div class="row" style="gap:8px">
            <a class="btn sec" href="#/id">Open badge</a>
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Your saved work</strong>
            <p>${store.totalStepsRead} steps, ${notes} notes, ${store.drillCount} practice tries, ${store.debriefs.length} debriefs</p>
          </div>
          <div class="row" style="gap:8px">
            <button type="button" class="btn sec" id="exp">Save backup</button>
            <button type="button" class="btn sec" id="imp">Restore backup</button>
            <input type="file" id="impFile" accept=".json,application/json" hidden>
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Version</strong>
            <p class="mono">${esc(APP_VERSION)}</p>
          </div>
          <div class="row" style="gap:8px">
            <button type="button" class="btn sec" id="upd">Check for updates</button>
          </div>
        </div>

        <details class="set-block set-more">
          <summary class="set-info"><strong>Where the content comes from</strong></summary>
          <p style="flex:1 1 100%;margin:0;font-size:13.5px;color:var(--muted)">Public material, all dated: consumer reviews, news archives, public bank pages, and Canadian law and regulator guidance (the Bank Act, FCAC (the federal consumer regulator), the Quebec Consumer Protection Act, and Visa and Mastercard Zero Liability). Confirm every figure in your systems before you quote it.</p>
        </details>

        <details class="set-block set-more">
          <summary class="set-info"><strong>About this app</strong></summary>
          <p style="flex:1 1 100%;margin:0;font-size:13.5px;color:var(--muted)">Cards Advisor is a study tool for bank cards advisors, with the six steps of a call, ${D.issues.length} card issues (${D.breakdowns.length} full guides), the policy behind each figure, practice calls and flashcards. The call notes are my own study notes and general call craft, not any bank's official model.</p>
        </details>
      </div>
    </div>
  </section>`;

  main.querySelectorAll('[data-set-depth]').forEach(b => b.onclick = () => {
    store.pref('depth', b.dataset.setDepth);
    syncTopbarDepth();
    aboutView();
  });
  main.querySelectorAll('[data-set-onepage]').forEach(b => b.onclick = () => {
    store.pref('onePage', b.dataset.setOnepage === '1');
    aboutView();
  });
  main.querySelectorAll('[data-set-theme]').forEach(b => b.onclick = () => {
    store.pref('theme', b.dataset.setTheme);
    applyTheme(b.dataset.setTheme);
    aboutView();
  });

  main.querySelector('#exp').onclick = saveBackup;
  const file = main.querySelector('#impFile');
  main.querySelector('#imp').onclick = () => file.click();
  file.onchange = async () => {
    const f = file.files[0]; if (!f) return;
    const text = await f.text();
    if (!confirm('Replace all your saved work on this device with this backup?')) { file.value = ''; return; }
    try {
      store.importAll(text);
      file.value = '';
      syncTopbarDepth();
      applyTheme(store.pref('theme') || 'dark');
      toast({ msg: 'Backup restored.', icon: '✓' });
      aboutView();
    } catch {
      file.value = '';
      toast({ msg: "That file isn't a Cards Advisor backup.", icon: '!' });
    }
  };
  main.querySelector('#upd').onclick = () => checkForUpdate({ announce: true });
}

function saveBackup() {
  download(`cards-advisor-backup-${new Date().toISOString().slice(0, 10)}.json`, store.exportAll());
  store.pref('lastBackup', Date.now());
  toast({ msg: 'Backup saved.', icon: '✓' });
}

function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ─────────── router ─────────── */
export function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

const scrollMem = new Map();

// Which of the five tabs lights up for each route segment.
const NAV_FOR = {
  call: 'call',
  '': 'issues', issue: 'issues', cat: 'issues',
  practice: 'practice', drill: 'practice', cards: 'practice',
  policy: 'policy',
  me: 'me', debrief: 'me', id: 'me', badge: 'me', about: 'me'
};

function route(ev) {
  closePalette();
  const from = ev?.oldURL ? (new URL(ev.oldURL).hash || '#/') : null;
  if (from) scrollMem.set(from, main.scrollTop);
  // a stray non-route hash (e.g. '#main' from a bookmark) resolves to the bank
  if (location.hash && !location.hash.startsWith('#/')) history.replaceState(null, '', '#/');
  let [seg = '', a, b] = (location.hash || '#/').replace(/^#\/?/, '').replace(/\/+$/, '').split('/');
  a = a || undefined; b = b || undefined;
  stopTimers();
  window.scrollTo(0, 0);
  if (seg !== 'issue') {
    cleanupIssueReader();
    unmountHighlighter();
  }
  syncTopbarDepth();

  switch (seg) {
    case '': case undefined: bankView(main); break;
    case 'issue': issueView(main, a, b); break;
    case 'cat': { let c = ''; try { c = decodeURIComponent(a || ''); } catch { c = ''; } bankView(main, c); break; }
    case 'policy': policyView(main, a); break;
    case 'cards': cardsView(main); break;
    case 'practice': practiceView(main); break;
    case 'drill': drillView(main, a); break;
    case 'debrief': debriefView(main); break;
    case 'id': case 'badge': badgeView(main); break;
    case 'call': document.body.classList.remove('reading'); callView(main, a, b); break;
    case 'me': meView(); break;
    case 'about': aboutView(); break;
    default: history.replaceState(null, '', '#/'); seg = ''; bankView(main);
  }

  // Back from an issue to the bank returns to the list position; everything else starts at the top
  const toBank = seg === '' || seg === undefined || seg === 'cat';
  const fromIssue = !!from && from.startsWith('#/issue/');
  // 'instant' overrides the CSS scroll-behavior: smooth on #main, so the reset does not animate
  main.scrollTo({ top: (toBank && fromIssue) ? (scrollMem.get(location.hash || '#/') || 0) : 0, behavior: 'instant' });

  // Highlight active tab in top/bottom nav pill
  const activeNav = NAV_FOR[seg || ''] || '';
  document.querySelectorAll('#tbNav .tb-tab').forEach(tab => {
    const active = tab.dataset.nav === activeNav;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
  });

  document.getElementById('aboutBtn')?.classList.toggle('active', seg === 'about' || seg === 'id' || seg === 'badge');
  if (!main.contains(document.activeElement)) main.focus({ preventScroll: true });
}

/* ─────────── first run and backups ─────────── */
function firstRun() {
  if (store.pref('privacyAck')) return;
  toast({
    id: 'privacy', icon: '!', timeout: 0,
    msg: 'Study tool, not an official bank source. Confirm figures in your systems. Never type client details here.',
    action: 'Got it',
    onAction: () => { store.pref('privacyAck', Date.now()); dismissToast('privacy'); },
    onDismiss: () => store.pref('privacyAck', Date.now())
  });
}

document.addEventListener('cards:storage-error', () => toast({
  id: 'quota', icon: '!', timeout: 0,
  msg: "Couldn't save on this device. Save a backup from Settings.",
  action: 'Open settings', secondary: 'Not now',
  onAction: () => { dismissToast('quota'); go('#/about'); }
}));

function maybeNagBackup() {
  if (!store.pref('privacyAck')) return;
  const risk = store.valueAtRisk(), last = store.pref('lastBackup') || 0, nag = store.pref('backupNag') || 0, now = Date.now();
  if (risk < 10 || now - last < 14 * 864e5 || now - nag < 3 * 864e5) return;
  store.pref('backupNag', now);
  setTimeout(() => toast({
    id: 'backup', icon: '!', timeout: 0,
    msg: `Your saved work (${risk} items) is only on this device. Save a backup?`,
    action: 'Save backup', secondary: 'Not now',
    onAction: () => { dismissToast('backup'); saveBackup(); }
  }), 4000);
}

/* ─────────── boot ─────────── */
(async () => {
  try { await loadData(); }
  catch (e) {
    main.innerHTML = `<section class="screen screen-active"><div class="screen-inner"><div class="empty" title="${esc(e.message)}">Couldn't load the study content. If you're offline, open the app once while online.</div></div></section>`;
    return;
  }
  INDEX = searchIndex();
  // Call tab entries come from js/call.js; search still works if that index fails.
  try {
    for (const x of callSearchIndex() || []) {
      if (!x || !x.title || !x.href) continue;
      const sub = x.sub || '';
      INDEX.push({ kind: x.kind || 'Call', title: x.title, sub, href: x.href, text: String(x.text || `${x.title} ${sub}`).toLowerCase() });
    }
  } catch (e) { console.warn('call search index unavailable', e); }
  // A first load with no hash opens on the Call tab; '#/' stays the Issues list.
  if (!location.hash) history.replaceState(null, '', '#/call');
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', () => store.flushNow());
  window.addEventListener('pagehide', () => store.flushNow());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') store.flushNow(); });
  route();
  initPWA();
  firstRun();
  maybeNagBackup();
})();
