/**
 * IndexedDB-based phoneme cache for ReadinConnect
 * Provides offline storage and fast playback for phoneme audio
 */

// Database name and version
const DB_NAME = 'ReadinConnectPhonemeCache';
const DB_VERSION = 1;
const STORE_NAME = 'phonemes';

// Cache entry structure
interface PhonemeCacheEntry {
  phoneme: string;
  audioBlob: Blob;
  timestamp: number;
  size: number;
  audioData?: ArrayBuffer;
}

// IndexedDB instance
let db: IDBDatabase | null = null;

// In-memory cache for immediate playback (L1 cache)
const memoryCache: Map<string, AudioBuffer> = new Map();

/**
 * Initialize IndexedDB
 */
export const initPhonemeCache = async (): Promise<IDBDatabase> => {
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[PhonemeCache] Error opening database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('[PhonemeCache] Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create phoneme store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'phoneme' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[PhonemeCache] Created phoneme store');
      }
    };
  });
};

/**
 * Cache a phoneme audio file
 */
export const cachePhoneme = async (
  phoneme: string,
  audioBlob: Blob
): Promise<void> => {
  try {
    const database = await initPhonemeCache();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      const entry: PhonemeCacheEntry = {
        phoneme,
        audioBlob,
        timestamp: Date.now(),
        size: audioBlob.size,
      };

      const request = objectStore.put(entry);

      request.onsuccess = () => {
        console.log(`[PhonemeCache] Cached phoneme: ${phoneme} (${audioBlob.size} bytes)`);
        resolve();
      };

      request.onerror = () => {
        console.error(`[PhonemeCache] Error caching phoneme ${phoneme}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[PhonemeCache] Error in cachePhoneme:', error);
    throw error;
  }
};

/**
 * Get a cached phoneme audio file
 */
export const getCachedPhoneme = async (
  phoneme: string
): Promise<Blob | null> => {
  try {
    const database = await initPhonemeCache();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);

      const request = objectStore.get(phoneme);

      request.onsuccess = () => {
        const entry: PhonemeCacheEntry | undefined = request.result;
        if (entry) {
          console.log(`[PhonemeCache] Cache hit: ${phoneme}`);
          resolve(entry.audioBlob);
        } else {
          console.log(`[PhonemeCache] Cache miss: ${phoneme}`);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error(`[PhonemeCache] Error getting phoneme ${phoneme}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[PhonemeCache] Error in getCachedPhoneme:', error);
    return null;
  }
};

/**
 * Decode audio blob to AudioBuffer for fast playback
 */
export const decodeAudioBlob = async (
  blob: Blob
): Promise<AudioBuffer | null> => {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('[PhonemeCache] Error decoding audio blob:', error);
    return null;
  }
};

/**
 * Load and cache phoneme from network
 */
export const loadPhonemeFromNetwork = async (
  phoneme: string
): Promise<AudioBuffer | null> => {
  try {
    const audioUrl = `/audio/phonemes/${phoneme}.mp3`;
    const response = await fetch(audioUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Cache the blob in IndexedDB
    await cachePhoneme(phoneme, blob);

    // Decode for immediate playback
    const audioBuffer = await decodeAudioBlob(blob);

    if (audioBuffer) {
      // Store in memory cache
      memoryCache.set(phoneme, audioBuffer);
    }

    return audioBuffer;
  } catch (error) {
    console.error(`[PhonemeCache] Error loading phoneme ${phoneme} from network:`, error);
    return null;
  }
};

/**
 * Get phoneme audio buffer (from memory, IndexedDB, or network)
 */
export const getPhonemeAudioBuffer = async (
  phoneme: string
): Promise<AudioBuffer | null> => {
  // Check memory cache first (L1)
  if (memoryCache.has(phoneme)) {
    console.log(`[PhonemeCache] Memory cache hit: ${phoneme}`);
    return memoryCache.get(phoneme)!;
  }

  // Check IndexedDB cache (L2)
  const cachedBlob = await getCachedPhoneme(phoneme);
  if (cachedBlob) {
    const audioBuffer = await decodeAudioBlob(cachedBlob);
    if (audioBuffer) {
      // Store in memory cache for next time
      memoryCache.set(phoneme, audioBuffer);
      return audioBuffer;
    }
  }

  // Load from network (L3)
  return await loadPhonemeFromNetwork(phoneme);
};

/**
 * Preload multiple phonemes
 */
export const preloadPhonemesBatch = async (
  phonemes: string[]
): Promise<void> => {
  console.log(`[PhonemeCache] Preloading ${phonemes.length} phonemes...`);

  const startTime = Date.now();
  const results = await Promise.allSettled(
    phonemes.map(phoneme => getPhonemeAudioBuffer(phoneme))
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
  const duration = Date.now() - startTime;

  console.log(
    `[PhonemeCache] Preloaded ${successful}/${phonemes.length} phonemes in ${duration}ms`
  );
};

/**
 * Clear all cached phonemes
 */
export const clearPhonemeCache = async (): Promise<void> => {
  try {
    if (db) {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = objectStore.clear();
        request.onsuccess = () => {
          console.log('[PhonemeCache] Cache cleared');
          memoryCache.clear();
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.error('[PhonemeCache] Error clearing cache:', error);
    throw error;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<{
  count: number;
  totalSize: number;
  phonemes: string[];
}> => {
  try {
    const database = await initPhonemeCache();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const entries: PhonemeCacheEntry[] = request.result || [];
        const count = entries.length;
        const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
        const phonemes = entries.map(entry => entry.phoneme);

        resolve({ count, totalSize, phonemes });
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[PhonemeCache] Error getting cache stats:', error);
    return { count: 0, totalSize: 0, phonemes: [] };
  }
};

/**
 * Register Service Worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[ServiceWorker] Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[ServiceWorker] Registered successfully:', registration.scope);

    // Wait for the service worker to be active
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    return registration;
  } catch (error) {
    console.error('[ServiceWorker] Registration failed:', error);
    return null;
  }
};
