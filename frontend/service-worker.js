const CACHE_NAME = 'jetsonic-pwa-v11';
const ASSETS = ['/', '/parts/', '/services/', '/aog/', '/quality/', '/about/', '/contact/', '/thank-you.html', '/offline.html', '/styles.css', '/app.js', '/cms.js', '/manifest.webmanifest', '/assets/jetsonic_trade_logo.png', '/assets/logo.svg', '/assets/hero-aircraft.jpg', '/assets/icon-192.png', '/assets/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('/offline.html')))
  );
});
