import { toast, dismissToast } from './toast.js';
import { APP_VERSION } from './version.js';

let reg = null;
let reloading = false;
let lastCheck = 0;
let updateReady = false;

const CHECK_EVERY = 20 * 60 * 1000;   // background poll while the app stays open
const MIN_GAP = 60 * 1000;            // never hammer the network on rapid resumes

/* ── the update prompt ── */
function promptUpdate(worker) {
  if (!worker || updateReady) return;
  updateReady = true;
  toast({
    id: 'update',
    icon: '↑',
    msg: 'New version of Cards Advisor is ready.',
    action: 'Update now',
    secondary: 'Later',
    timeout: 0,
    onAction: async el => {
      el.querySelector('.toast-msg').textContent = 'Updating…';
      el.querySelectorAll('button').forEach(b => b.disabled = true);
      // Re-read the registration: the captured worker can be stale if another
      // build installed while the toast was sitting there.
      const fresh = (await navigator.serviceWorker.getRegistration())?.waiting || worker;
      fresh.postMessage({ type: 'SKIP_WAITING' });
      // Safety net: activation can be held up by in-flight requests, so reload
      // ourselves if controllerchange has not fired by then.
      setTimeout(() => hardReload(), 4000);
    },
    onSecondary: () => { updateReady = false; }
  });
}

function hardReload() {
  if (reloading) return;
  reloading = true;
  location.reload();
}

/* ── manual check, used by the Progress screen and on resume ── */
export async function checkForUpdate({ announce = false } = {}) {
  if (!reg) {
    if (announce) toast({ msg: 'Offline updates are not available in this browser.', timeout: 3600 });
    return 'unsupported';
  }
  const now = Date.now();
  if (now - lastCheck < MIN_GAP && !announce) return 'throttled';
  lastCheck = now;

  if (announce) toast({ id: 'checking', msg: 'Checking for a new version…', timeout: 2400 });
  try {
    await reg.update();
  } catch {
    if (announce) toast({ msg: 'Could not reach the server. You are offline.', timeout: 3600 });
    return 'offline';
  }
  if (reg.waiting) { dismissToast('checking'); promptUpdate(reg.waiting); return 'update'; }
  if (reg.installing) { if (announce) toast({ msg: 'Downloading an update…', timeout: 2600 }); return 'installing'; }
  if (announce) toast({ msg: `Up to date — ${APP_VERSION}`, timeout: 3000 });
  return 'current';
}

/* ── boot ── */
export function initPWA() {
  installPrompt();

  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const base = location.pathname.replace(/[^/]*$/, '');

  navigator.serviceWorker.register(base + 'sw.js').then(r => {
    reg = r;

    // A build was already waiting when this page loaded.
    if (r.waiting && navigator.serviceWorker.controller) promptUpdate(r.waiting);

    r.addEventListener('updatefound', () => {
      const incoming = r.installing;
      if (!incoming) return;
      incoming.addEventListener('statechange', () => {
        // controller present means this is an update, not the first install
        if (incoming.state === 'installed' && navigator.serviceWorker.controller) promptUpdate(incoming);
        if (incoming.state === 'activated' && !navigator.serviceWorker.controller) {
          toast({ msg: 'Cards Advisor is installed and works offline.', timeout: 3600, icon: '✓' });
        }
      });
    });

    // Poll while open, and check whenever the app comes back to the foreground.
    // This is what makes the prompt appear on a phone that never fully closes the app.
    setInterval(() => checkForUpdate(), CHECK_EVERY);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    });
    window.addEventListener('online', () => checkForUpdate());
  }).catch(() => {});

  navigator.serviceWorker.addEventListener('controllerchange', () => hardReload());
}

/* ── install-to-homescreen button ── */
function installPrompt() {
  const btn = document.getElementById('installBtn');
  if (!btn) return;
  let deferred = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });

  btn.onclick = async () => {
    if (!deferred) return;
    btn.hidden = true;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === 'accepted') toast({ msg: 'Added to your home screen.', timeout: 3000, icon: '✓' });
  };

  window.addEventListener('appinstalled', () => { btn.hidden = true; });

  // iOS has no beforeinstallprompt: tell the user how, once.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (isIOS && !standalone && !localStorage.getItem('cards:ios-hint')) {
    localStorage.setItem('cards:ios-hint', '1');
    setTimeout(() => toast({
      msg: 'Add Cards Advisor to your home screen: Share, then Add to Home Screen.',
      timeout: 7000, icon: '⇪'
    }), 2600);
  }
}
