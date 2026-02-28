/**
 * Service Worker for ReadinConnect
 * Handles audio caching for offline support
 */

const CACHE_NAME = 'readinconnect-audio-v1';
const AUDIO_CACHE_PREFIX = 'phoneme-';

// List of phonemes to cache on install
const PHONEMES_TO_CACHE = [
  's', 'a', 't', 'p', 'i', 'n',
  'c', 'k', 'e', 'h', 'r', 'm', 'd',
  'g', 'o', 'u', 'l', 'f', 'b',
  'ai', 'j', 'oa', 'ie', 'ee', 'or',
  'z', 'w', 'ng', 'v', 'oo_long', 'oo_short',
  'y', 'x', 'ch', 'sh', 'th_unvoiced', 'th_voiced',
  'qu', 'ou', 'oi', 'ue', 'er', 'ar'
];

// Install event - cache phoneme audio files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching phoneme audio files');

      // Cache all phoneme audio files
      const phonemeUrls = PHONEMES_TO_CACHE.map(phoneme => `/audio/phonemes/${phoneme}.mp3`);

      return cache.addAll(phonemeUrls).then(() => {
        console.log('[Service Worker] All phoneme audio files cached');
      }).catch((error) => {
        console.error('[Service Worker] Error caching phoneme audio files:', error);
        // Continue even if some files fail
      });
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients
  return self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only cache audio files from /audio/phonemes/
  if (url.pathname.startsWith('/audio/phonemes/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Cache hit - return cached response
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', url.pathname);
            return cachedResponse;
          }

          // Cache miss - fetch from network
          console.log('[Service Worker] Fetching from network:', url.pathname);
          return fetch(request).then((networkResponse) => {
            // Clone the response before caching
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Cache the valid response
            const responseToCache = networkResponse.clone();
            cache.put(request, responseToCache);

            return networkResponse;
          });
        });
      }).catch((error) => {
        console.error('[Service Worker] Error serving from cache:', error);
        return fetch(request);
      })
    );
  }

  // For non-audio requests, just pass through
  event.respondWith(fetch(request));
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_PHONEMES') {
    // Cache specific phonemes on demand
    const phonemes = event.data.phonemes || [];
    caches.open(CACHE_NAME).then((cache) => {
      const urls = phonemes.map(phoneme => `/audio/phonemes/${phoneme}.mp3`);
      cache.addAll(urls).then(() => {
        console.log('[Service Worker] Cached requested phonemes:', phonemes);
      }).catch((error) => {
        console.error('[Service Worker] Error caching phonemes:', error);
      });
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear audio cache
    caches.delete(CACHE_NAME).then(() => {
      console.log('[Service Worker] Audio cache cleared');
    });
  }
});

console.log('[Service Worker] Loaded');
