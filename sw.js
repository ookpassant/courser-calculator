/* Bloodline service worker — offline support (Phase 1).
   Precache the local app shell; runtime-cache Google Fonts so the
   blackletter/pixel faces survive offline too. Relative URLs keep this
   working whether served at the domain root or under /courser-calc. */
const VERSION = 'bloodline-v1';
const APP_CACHE = VERSION + '-app';
const FONT_CACHE = VERSION + '-fonts';

const PRECACHE = [
  './',
  './index.html',
  './breeding-calculator.js',
  './app.js',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts (CSS + woff2): cache-first, populate lazily.
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((hit) =>
          hit || fetch(req).then((res) => { cache.put(req, res.clone()); return res; })
            .catch(() => hit)
        )
      )
    );
    return;
  }

  // Same-origin app assets: cache-first, fall back to network, then cache the result.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(APP_CACHE).then((c) => c.put(req, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
  }
});
