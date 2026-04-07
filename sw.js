// ── ZEROWEIGHT Service Worker ──
const CACHE_NAME = 'zeroweight-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
];

// Installation — met les fichiers en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation — supprime les vieux caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — réseau d'abord, cache en fallback
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes Firebase
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('google') ||
      event.request.url.includes('youtube') ||
      event.request.url.includes('wikimedia')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache avec la nouvelle version
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
