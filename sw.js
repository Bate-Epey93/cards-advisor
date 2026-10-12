// Cards Advisor service worker. Offline-first for a fully static app.
// VERSION is stamped by tools/stamp-version.mjs; run it before every commit.
const VERSION = 'cards-831b3dea19';
const BASE = self.registration.scope;
const DEV = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(self.location.hostname);

const ASSETS = [
  '', 'index.html', 'manifest.webmanifest',
  'css/app.css',
  'js/app.js', 'js/store.js', 'js/data.js', 'js/render.js', 'js/issue.js', 'js/policy.js',
  'js/study.js', 'js/practice.js', 'js/debrief.js', 'js/highlight.js', 'js/pwa.js', 'js/toast.js', 'js/version.js',
  'data/observed.json', 'data/faq.json', 'data/rules.json', 'data/breakdowns.json', 'data/brush.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'
].map(p => new URL(p, BASE).toString());

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(cache =>
    Promise.allSettled(ASSETS.map(u => cache.add(new Request(u, { cache: 'reload' }))))
  ));
});

self.addEventListener('message', e => {
  const data = e.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'GET_VERSION') e.source?.postMessage({ type: 'VERSION', version: VERSION });
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put(new URL('index.html', BASE).toString(), fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(new URL('index.html', BASE).toString())) || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    if (DEV) {
      try { return await fetch(req, { cache: 'no-store' }); }
      catch { return (await caches.match(req)) || Response.error(); }
    }
    const cached = await caches.match(req);
    if (cached) {
      fetch(req).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(req, r)); }).catch(() => {});
      return cached;
    }
    try {
      const fresh = await fetch(req);
      if (fresh.ok) (await caches.open(VERSION)).put(req, fresh.clone());
      return fresh;
    } catch { return Response.error(); }
  })());
});
