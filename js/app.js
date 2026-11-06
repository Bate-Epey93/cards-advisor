import { loadData, data, searchIndex } from './data.js';
import { store } from './store.js';
import { esc } from './render.js';
import { bankView, issueView, cleanupIssueReader } from './issue.js';
import { policyView } from './policy.js';
import { cardsView } from './study.js';
import { practiceView, drillView, stopTimers } from './practice.js';
import { debriefView } from './debrief.js';
import { badgeView } from './badge.js';
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

// Depth switch in topbar (visible when reading an issue)
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

// Topbar policy sheet button
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
    : `<div class="empty" style="margin:12px">Nothing found. Try "abroad", "lock", "56 days", "spouse", or "$50".</div>`;
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

/* ─────────── about / settings / backup ─────────── */
function aboutView() {
  document.body.classList.remove('reading');
  const D = data();
  const curDepth = store.pref('depth') || 'agent';
  const onePage = !!store.pref('onePage');
  const gateMode = !!store.pref('gateMode');
  const curTheme = store.pref('theme') || 'light';

  main.innerHTML = `<section class="screen screen-active">
    <div class="screen-inner" style="max-width:860px">
      <header class="view-head">
        <div>
          <span class="kicker">Settings · Corpus · Local Backup</span>
          <h1 class="h-xl">Cards Advisor Workbench</h1>
          <p class="lede">An interactive step-by-step call deconstructor and policy reference for bank cards advisors. Holds 44 real client issues, what the client wants underneath, the call anatomy map, and the statutory or bank rule behind every figure.</p>
        </div>
      </header>

      <div class="b-warn">
        <span class="lbl">Not affiliated with any bank</span>
        <p>The corpus is compiled from public material: consumer reviews, news archives, public bank FAQ pages, and Canadian law and regulator guidance (Bank Act, FCAC, Quebec CPA, Visa/Mastercard Zero Liability), all dated. This app is a personal study tool, not an official bank source. Confirm every figure in your internal systems before quoting it to a client.</p>
      </div>

      <div class="b-key">
        <span class="lbl">No client data, ever</span>
        <p>There is no field in this app for a client's name, card number, account, phone, or address, and the Shift Debrief privacy guard blocks anything that looks like one. Everything you write stays in local storage on this device; zero network requests leave your browser.</p>
      </div>

      <div class="set-list" style="margin-top:24px">
        <div class="set-block">
          <div class="set-info">
            <strong>Default Advisor Depth</strong>
            <p>Controls which role lens is highlighted in step-by-step walkthroughs (New Advisor, Specialist, or Team Lead).</p>
          </div>
          <div class="seg-group">
            <button type="button" class="seg-btn${curDepth === 'agent' ? ' on' : ''}" aria-pressed="${curDepth === 'agent'}" data-set-depth="agent">New Advisor</button>
            <button type="button" class="seg-btn${curDepth === 'specialist' ? ' on' : ''}" aria-pressed="${curDepth === 'specialist'}" data-set-depth="specialist">Specialist</button>
            <button type="button" class="seg-btn${curDepth === 'lead' ? ' on' : ''}" aria-pressed="${curDepth === 'lead'}" data-set-depth="lead">Team Lead</button>
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Walkthrough Reader Mode</strong>
            <p>Step-by-step mode pairs each call phase with the interactive Call Anatomy diagram and timeline scrubber.</p>
          </div>
          <div class="seg-group">
            <button type="button" class="seg-btn${!onePage ? ' on' : ''}" aria-pressed="${!onePage}" data-set-onepage="0">Step-by-Step</button>
            <button type="button" class="seg-btn${onePage ? ' on' : ''}" aria-pressed="${onePage}" data-set-onepage="1">All 11 on One Page</button>
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>15-Second Opener Sketch Gate</strong>
            <p>Prompt yourself to draft or say your opening line before revealing the recommended script in Part 04.</p>
          </div>
          <div class="seg-group">
            <button type="button" class="seg-btn${!gateMode ? ' on' : ''}" aria-pressed="${!gateMode}" data-set-gate="0">Instant Reveal</button>
            <button type="button" class="seg-btn${gateMode ? ' on' : ''}" aria-pressed="${gateMode}" data-set-gate="1">Sketch Gate On</button>
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Appearance Theme</strong>
            <p>Warm Editorial Paper (light) for daytime study or Slate Ink (dark) for low-light review.</p>
          </div>
          <div class="seg-group">
            <button type="button" class="seg-btn${curTheme === 'light' ? ' on' : ''}" aria-pressed="${curTheme === 'light'}" data-set-theme="light">Warm Paper</button>
            <button type="button" class="seg-btn${curTheme === 'dark' ? ' on' : ''}" aria-pressed="${curTheme === 'dark'}" data-set-theme="dark">Slate Ink</button>
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Your Local Study Data</strong>
            <p>${store.totalStepsRead} steps completed · ${Object.keys(store.all.notes).length} issue notes · ${store.highlightCount} highlights · ${store.drillCount} drill runs · ${store.debriefs.length} shift debriefs</p>
          </div>
          <div class="row" style="gap:8px">
            <button class="btn sec" id="exp">Export Backup</button>
            <button class="btn sec" id="imp">Import Backup</button>
            <input type="file" id="impFile" accept=".json,application/json" hidden>
          </div>
        </div>

        <div class="set-block">
          <div class="set-info">
            <strong>Corpus &amp; App Version</strong>
            <p>${D.issues.length} issues · ${D.breakdowns.length} full 11-part breakdowns · ${D.faq.items.length} bank FAQ pages · ${D.rules.mustKnow.length} statutory figures · Build <span class="mono">${esc(APP_VERSION)}</span></p>
          </div>
          <div class="row" style="gap:8px">
            <button class="btn sec" id="upd">Check for Update</button>
          </div>
        </div>
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
  main.querySelectorAll('[data-set-gate]').forEach(b => b.onclick = () => {
    store.pref('gateMode', b.dataset.setGate === '1');
    aboutView();
  });
  main.querySelectorAll('[data-set-theme]').forEach(b => b.onclick = () => {
    store.pref('theme', b.dataset.setTheme);
    applyTheme(b.dataset.setTheme);
    aboutView();
  });

  main.querySelector('#exp').onclick = () => {
    download(`cards-advisor-backup-${new Date().toISOString().slice(0, 10)}.json`, store.exportAll());
    store.pref('lastBackup', Date.now());
    toast({ msg: 'Backup exported.', icon: '✓' });
  };
  const file = main.querySelector('#impFile');
  main.querySelector('#imp').onclick = () => file.click();
  file.onchange = async () => {
    const f = file.files[0]; if (!f) return;
    const text = await f.text();
    if (!confirm('Replace all study data on this device with this backup?')) { file.value = ''; return; }
    try {
      store.importAll(text);
      file.value = '';
      syncTopbarDepth();
      applyTheme(store.pref('theme') || 'light');
      toast({ msg: 'Backup imported.', icon: '✓' });
      aboutView();
    } catch {
      file.value = '';
      toast({ msg: 'That file is not a valid Cards Advisor backup.', icon: '!' });
    }
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
export function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

const scrollMem = new Map();

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
    case 'about': aboutView(); break;
    default: history.replaceState(null, '', '#/'); seg = ''; bankView(main);
  }

  // Back from an issue to the bank returns to the list position; everything else starts at the top
  const toBank = seg === '' || seg === undefined || seg === 'cat';
  const fromIssue = !!from && from.startsWith('#/issue/');
  // 'instant' overrides the CSS scroll-behavior: smooth on #main, so the reset does not animate
  main.scrollTo({ top: (toBank && fromIssue) ? (scrollMem.get(location.hash || '#/') || 0) : 0, behavior: 'instant' });

  // Highlight active tab in top/bottom nav pill
  document.querySelectorAll('#tbNav .tb-tab').forEach(tab => {
    const navKey = tab.dataset.nav;
    const isIssues = (seg === '' || seg === undefined || seg === 'issue' || seg === 'cat') && navKey === 'issues';
    const isPractice = (seg === 'practice' || seg === 'drill') && navKey === 'practice';
    const isId = (seg === 'id' || seg === 'badge') && navKey === 'id';
    const isExact = seg === navKey;
    const active = isIssues || isPractice || isId || isExact;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
  });

  document.getElementById('badgeNavBtn')?.classList.toggle('active', seg === 'id' || seg === 'badge');
  document.getElementById('aboutBtn')?.classList.toggle('active', seg === 'about');
  if (!main.contains(document.activeElement)) main.focus({ preventScroll: true });
}

/* ─────────── first run and backups ─────────── */
function firstRun() {
  if (store.pref('privacyAck')) return;
  toast({
    id: 'privacy', icon: '◆', timeout: 0,
    msg: 'Study workbench, not an official bank source. Confirm figures in-system. Never type client details here.',
    action: 'Understood',
    onAction: () => { store.pref('privacyAck', Date.now()); dismissToast('privacy'); },
    onDismiss: () => store.pref('privacyAck', Date.now())
  });
}

document.addEventListener('cards:storage-error', () => toast({
  id: 'quota', icon: '!', timeout: 0,
  msg: 'This device refused to save. Export your notes from Settings.',
  action: 'Open Settings', secondary: 'Dismiss',
  onAction: () => { dismissToast('quota'); go('#/about'); }
}));

function maybeNagBackup() {
  if (!store.pref('privacyAck')) return;
  const risk = store.valueAtRisk(), last = store.pref('lastBackup') || 0, nag = store.pref('backupNag') || 0, now = Date.now();
  if (risk < 10 || now - last < 14 * 864e5 || now - nag < 3 * 864e5) return;
  store.pref('backupNag', now);
  setTimeout(() => toast({
    id: 'backup', icon: '↓', timeout: 0,
    msg: `${risk} pieces of work are saved only on this device.`,
    action: 'Back up', secondary: 'Not now',
    onAction: () => { dismissToast('backup'); go('#/about'); }
  }), 4000);
}

/* ─────────── boot ─────────── */
(async () => {
  try { await loadData(); }
  catch (e) {
    main.innerHTML = `<section class="screen screen-active"><div class="screen-inner"><div class="empty">Could not load the corpus (${esc(e.message)}). If you are offline, open the app once online first.</div></div></section>`;
    return;
  }
  INDEX = searchIndex();
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', () => store.flushNow());
  window.addEventListener('pagehide', () => store.flushNow());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') store.flushNow(); });
  route();
  initPWA();
  firstRun();
  maybeNagBackup();
})();
