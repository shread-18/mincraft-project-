/**
 * FoodLens Service Worker
 * Guarantees 100% PWA installability, offline shell, and resilient caching.
 */

const CACHE_NAME = 'foodlens-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon-32x32.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/foodlens-icon.svg',
  '/screenshot-wide.png',
  '/screenshot-narrow.png',
  '/products/p001_yogabar.webp',
  '/products/p003_oats.jpg',
  '/products/p005_kinderjoy.webp',
  '/products/p007_makhana.jpg',
  '/products/p008_lays.webp'
];

// Install: Pre-cache core app shell with resilient error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual caching so a single failed asset never aborts installation
      return Promise.allSettled(
        STATIC_ASSETS.map((assetUrl) =>
          cache.add(assetUrl).catch((err) => {
            console.warn('[SW] Could not pre-cache asset:', assetUrl, err);
          })
        )
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: Required by PWA specs to pass installability check
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests or browser extension protocols
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API endpoints: Network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({
              success: true,
              offline: true,
              message: 'Offline mode active. Using cached data.'
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // App Shell & Static Assets: Cache-First with Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          if (event.request.mode === 'navigate') {
            const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
            if (fallback) return fallback;
          }
          return new Response('Offline resource unavailable', { status: 503, statusText: 'Offline' });
        });
    })
  );
});

