// Cards Advisor service worker. Offline-first for a fully static app.
// VERSION is stamped by tools/stamp-version.mjs; run it before every commit.
const VERSION = 'cards-59b1f60738';
const BASE = self.registration.scope;
const DEV = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(self.location.hostname);

const ASSETS = [
  '', 'index.html', 'manifest.webmanifest',
  'css/app.css', 'css/call.css',
  'js/app.js', 'js/store.js', 'js/data.js', 'js/render.js', 'js/diagram.js', 'js/issue.js', 'js/call.js', 'js/policy.js',
  'js/study.js', 'js/practice.js', 'js/debrief.js', 'js/badge.js', 'js/highlight.js', 'js/pwa.js', 'js/toast.js', 'js/version.js',
  'data/observed.json', 'data/faq.json', 'data/rules.json', 'data/breakdowns.json', 'data/callflow.json',
  'vendor/rough.js',
  'fonts/CormorantGaramond.woff2', 'fonts/CormorantGaramond-Italic.woff2',
  'fonts/SourceSerif4.woff2', 'fonts/SourceSerif4-Italic.woff2',
  'fonts/HankenGrotesk.woff2', 'fonts/JetBrainsMono.woff2',
  'assets/enso-complete.svg', 'assets/enso-gate.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'
].map(p => new URL(p, BASE).toString());

// addAll is all-or-nothing: if any file fails, install rejects and the previous
// worker keeps its complete cache, so a partial build never activates. The
// version.js check also rejects a cache filled from a CDN that still serves the
// previous build's files; the browser retries on its next update check.
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));
    const v = await cache.match(new URL('js/version.js', BASE).toString());
    if (!v || !(await v.text()).includes(`'${VERSION}'`)) {
      throw new Error('precache does not match ' + VERSION);
    }
  })());
});

self.addEventListener('message', e => {
  const data = e.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'GET_VERSION') e.source?.postMessage({ type: 'VERSION', version: VERSION });
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // CacheStorage is shared by every app on this origin (github.io), so only
    // delete this app's own old caches.
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('cards-') && k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Each build is atomic: in production the shell and precached files come only
// from this version's cache, with no background revalidation, so new code
// arrives only through a new service worker and its update toast. Only the
// scope root and index.html count as the shell; other page loads pass through.
const SHELL = new URL('index.html', BASE).toString();
const isShell = u => {
  const p = new URL(u).href.split(/[?#]/)[0];
  return p === BASE || p === SHELL;
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  if (nav && !isShell(req.url)) return;
  const key = nav ? SHELL : req;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (DEV) {
      try {
        const r = await fetch(req, { cache: 'no-store' });
        if (nav && r.ok && r.type === 'basic') e.waitUntil(cache.put(SHELL, r.clone()));
        return r;
      } catch { return (await cache.match(key)) || Response.error(); }
    }
    const hit = await cache.match(key);
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r.ok && r.type === 'basic') e.waitUntil(cache.put(key, r.clone()));
      return r;
    } catch { return Response.error(); }
  })());
});
