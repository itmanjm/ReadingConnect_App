/**
 * Service Worker for ReadinConnect
 * Handles audio caching for offline support
 * Strategy: Cache First for phoneme audio, Network First for other assets
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `readinconnect-${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `readinconnect-audio-${CACHE_VERSION}`;

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

// Assets to cache on install (besides audio)
const CRITICAL_ASSETS = [
  '/',
  '/dashboard/student',
  '/activities/phonics',
  '/activities/sound-detective',
  '/activities/word-builder',
  '/activities/blend-blaster'
];

// Install event - cache phoneme audio files and critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(AUDIO_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching phoneme audio files');

      // Cache all phoneme audio files
      const phonemeUrls = PHONEMES_TO_CACHE.map(phoneme => `/audio/phonemes/${phoneme}.mp3`);

      return cache.addAll(phonemeUrls).then(() => {
        console.log('[Service Worker] All phoneme audio files cached successfully');

        // Optionally cache critical assets (uncomment if needed)
        // return caches.open(CACHE_NAME).then(cache => cache.addAll(CRITICAL_ASSETS));
      }).catch((error) => {
        console.error('[Service Worker] Error caching phoneme audio files:', error);
        // Continue even if some files fail - offline will still work with cached files
      });
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches (not current version)
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Old caches cleaned up');

      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle phoneme audio files with Cache First strategy
  if (url.pathname.startsWith('/audio/phonemes/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Cache hit - return cached response immediately
          if (cachedResponse) {
            console.log('[Service Worker] Serving phoneme from cache:', url.pathname);
            return cachedResponse;
          }

          // Cache miss - fetch from network
          console.log('[Service Worker] Fetching phoneme from network:', url.pathname);
          return fetch(request).then((networkResponse) => {
            // Clone response before caching
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              console.log('[Service Worker] Not caching non-2xx or non-basic response');
              return networkResponse;
            }

            // Cache the response for future use
            const responseToCache = networkResponse.clone();
            cache.put(request, responseToCache);

            return networkResponse;
          }).catch((networkError) => {
            console.error('[Service Worker] Network fetch failed for phoneme:', networkError);
            // Return a custom offline response if cache and network fail
            return new Response('Audio file not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
    return;
  }

  // For other requests, use Network First strategy (better for dynamic content)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          cache.put(request, responseToCache);
        }

        return networkResponse;
      }).catch(() => {
        // Network failed, try cache
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache (offline fallback):', url.pathname);
            return cachedResponse;
          }

          // Return offline page for HTML requests
          if (request.mode === 'navigate') {
            return caches.match('/').then((cachedIndex) => {
              return cachedIndex || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/html' })
              });
            });
          }

          // Return error for other requests
          return new Response('Offline - resource not cached', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skipping waiting state');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_PHONEMES') {
    // Cache specific phonemes on demand
    const phonemes = event.data.phonemes || [];
    console.log('[Service Worker] Caching requested phonemes:', phonemes);

    caches.open(AUDIO_CACHE_NAME).then((cache) => {
      const urls = phonemes.map(phoneme => `/audio/phonemes/${phoneme}.mp3`);
      cache.addAll(urls).then(() => {
        console.log('[Service Worker] Successfully cached phonemes:', phonemes);

        // Notify client that caching is complete
        event.ports[0]?.postMessage({
          type: 'PHONEMES_CACHED',
          phonemes
        });
      }).catch((error) => {
        console.error('[Service Worker] Error caching phonemes:', error);
        event.ports[0]?.postMessage({
          type: 'CACHE_ERROR',
          error: error.message
        });
      });
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all caches
    console.log('[Service Worker] Clearing all caches');

    Promise.all([
      caches.delete(CACHE_NAME),
      caches.delete(AUDIO_CACHE_NAME)
    ]).then(() => {
      console.log('[Service Worker] All caches cleared');

      // Notify client that caches are cleared
      event.ports[0]?.postMessage({
        type: 'CACHE_CLEARED'
      });
    }).catch((error) => {
      console.error('[Service Worker] Error clearing caches:', error);
    });
  }

  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    // Get cache status
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.keys()),
      caches.open(AUDIO_CACHE_NAME).then(cache => cache.keys())
    ]).then(([generalKeys, audioKeys]) => {
      event.ports[0]?.postMessage({
        type: 'CACHE_STATUS',
        general: generalKeys.length,
        audio: audioKeys.length,
        version: CACHE_VERSION
      });
    });
  }
});

console.log('[Service Worker] Loaded version:', CACHE_VERSION);
