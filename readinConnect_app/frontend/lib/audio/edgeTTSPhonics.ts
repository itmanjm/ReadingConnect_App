/**
 * Edge TTS Phoneme Player for ReadinConnect
 * Uses pre-generated high-quality phoneme audio files from Edge TTS
 * Replaces Web Speech API (browser TTS) for better quality
 */

export interface PhonemeInfo {
  symbol: string;
  audioUrl: string;
  action: string;
  exampleWord: string;
  jollyPhonicsGroup: number;
  phonemeText: string;
}

// Base URL for phoneme audio files
// Can be configured via environment variable
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PHONEME_BASE_URL) {
    return process.env.NEXT_PUBLIC_PHONEME_BASE_URL;
  }
  return '/audio/phonemes/';
};

// Import caching utilities (optional - can use if needed)
// import { getPhonemeAudioBuffer, registerServiceWorker } from './phonemeCache';

// Audio cache to reduce reloads (legacy - keeping for backwards compatibility)
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Register Service Worker on module load (optional)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.warn('[EdgeTTSPhonics] Service Worker registration failed:', error);
  });
}

// Jolly Phonics actions for each phoneme
const phonemeActions: Record<string, string> = {
  's': 'Weave hand in an S shape, like a snake, and say sssss',
  'a': 'Wiggle fingers above elbow as if ants crawling on arm, say a, a, a',
  't': 'Turn head from side to side as if watching tennis, say tuh, tuh, tuh',
  'p': 'Pretend to puff out candles, puffing sound, say puh, puh, puh',
  'i': 'Pretend to be mice, wiggle fingers on whiskers, say ih, ih, ih',
  'n': 'Hold arms out and pretend to be a plane, nnnnn',
  'c': 'Click fingers like castanets, kuh, kuh, kuh',
  'k': 'Same as C, click fingers like castanets',
  'e': 'Pretend to crack an egg, say e as in egg',
  'h': 'Pant like a dog, huffing sound, huh, huh, huh',
  'r': 'Pretend to be a dog, pull hands like on a rope, rrrr',
  'm': 'Rub tummy as if tasty, mmmmmm',
  'd': 'Pretend to beat a drum, duh, duh, duh',
  'g': 'Spiral hand down like water going down drain, guh, guh, guh',
  'o': 'Pretend to turn light switch on and off, o as in orange',
  'u': 'Pretend to put up an umbrella, uh, uh, uh',
  'l': 'Pretend to lick a lollipop, lllll',
  'f': 'Blow on hand like blowing bubbles, fffff',
  'b': 'Pretend to hit a ball with a bat, buh, buh, buh',
  'ai': 'Cup hand over ear and say ai',
  'j': 'Pretend to be a jack-in-the-box, juh, juh, juh',
  'oa': 'Bring hand over mouth as if something wrong, say oh',
  'ie': 'Stand to attention and salute, saying ie',
  'ee': 'Put hands on head as if donkey ears, say ee',
  'or': 'Pretend to be a seal, make or sound',
  'z': 'Put arms out at sides and pretend to be a bee, buzzing',
  'w': 'Blow on to hand as if wind, say wuh',
  'ng': 'Pretend to be weightlifter, strain and say ng',
  'v': 'Pretend to be holding steering wheel, make vvv',
  'oo_long': 'Point to moon, make oo sound',
  'oo_short': 'Move head as if it\'s cuckoo clock, make short oo sound',
  'y': 'Pretend to eat a yogurt, say yuh',
  'x': 'Pretend to take a photo with camera, say ks',
  'ch': 'Pretend to be a train, chuh, chuh, chuh',
  'sh': 'Put finger to lips like shushing, shhh',
  'th_unvoiced': 'Pretend to be rude clown, stick out tongue and say th',
  'th_voiced': 'Pretend to be duck, make this sound with thumb',
  'qu': 'Make a duck\'s beak with hands and say kwuh',
  'ou': 'Cup hands around mouth and shout ou as in out',
  'oi': 'Pretend to have pain, say oi',
  'ue': 'Point to colored sky, say ue',
  'er': 'Roll hand over arm like mixer, say er',
  'ar': 'Pretend to hold scarf around neck, say ar'
};

// Example words for each phoneme
const exampleWords: Record<string, string> = {
  's': 'snake', 'a': 'apple', 't': 'tennis', 'p': 'puff', 'i': 'insect', 'n': 'net',
  'c': 'castanet', 'k': 'kite', 'e': 'egg', 'h': 'hat', 'r': 'rat', 'm': 'map',
  'd': 'drum', 'g': 'goat', 'o': 'orange', 'u': 'umbrella', 'l': 'log', 'f': 'fan',
  'b': 'ball', 'ai': 'rain', 'j': 'jelly', 'oa': 'boat', 'ie': 'pie', 'ee': 'tree',
  'or': 'corn', 'z': 'zip', 'w': 'wind', 'ng': 'ring', 'v': 'van',
  'oo_long': 'moon', 'oo_short': 'book',
  'y': 'yoyo', 'x': 'box', 'ch': 'church', 'sh': 'ship',
  'th_unvoiced': 'thumb', 'th_voiced': 'this',
  'qu': 'queen', 'ou': 'out', 'oi': 'coin', 'ue': 'blue', 'er': 'her', 'ar': 'car'
};

// Jolly Phonics groups
const jollyPhonicsGroups: Record<string, number> = {
  's': 1, 'a': 1, 't': 1, 'p': 1, 'i': 1, 'n': 1,
  'c': 2, 'k': 2, 'e': 2, 'h': 2, 'r': 2, 'm': 2, 'd': 2,
  'g': 3, 'o': 3, 'u': 3, 'l': 3, 'f': 3, 'b': 3,
  'ai': 4, 'j': 4, 'oa': 4, 'ie': 4, 'ee': 4, 'or': 4,
  'z': 5, 'w': 5, 'ng': 5, 'v': 5, 'oo_long': 5, 'oo_short': 5,
  'y': 6, 'x': 6, 'ch': 6, 'sh': 6, 'th_unvoiced': 6, 'th_voiced': 6,
  'qu': 7, 'ou': 7, 'oi': 7, 'ue': 7, 'er': 7, 'ar': 7
};

// Phoneme text for display (what the audio says)
const phonemeTexts: Record<string, string> = {
  's': 'ssss', 'a': 'a as in apple', 't': 't as in tennis', 'p': 'p as in puff',
  'i': 'i as in insect', 'n': 'nnn',
  'c': 'c as in castanet', 'k': 'k as in kite', 'e': 'e as in egg',
  'h': 'h as in hat', 'r': 'rrr', 'm': 'mmm', 'd': 'd as in drum',
  'g': 'g as in gurgle', 'o': 'o as in orange', 'u': 'u as in umbrella',
  'l': 'lll', 'f': 'fff', 'b': 'b as in ball',
  'ai': 'ai as in rain', 'j': 'j as in jelly', 'oa': 'oa as in boat',
  'ie': 'ie as in pie', 'ee': 'ee as in tree', 'or': 'or as in corn',
  'z': 'zzz', 'w': 'w as in wind', 'ng': 'ng as in ring', 'v': 'vvv',
  'oo_long': 'oo as in moon', 'oo_short': 'oo as in book',
  'y': 'y as in yoyo', 'x': 'x as in box', 'ch': 'ch as in church',
  'sh': 'sh as in ship', 'th_unvoiced': 'th as in thumb', 'th_voiced': 'th as in this',
  'qu': 'qu as in queen', 'ou': 'ou as in out', 'oi': 'oi as in coin',
  'ue': 'ue as in blue', 'er': 'er as in her', 'ar': 'ar as in car'
};

/**
 * Play a phoneme audio file
 * @param phoneme - The phoneme identifier (e.g., 's', 'a', 'ch')
 * @returns Promise that resolves when playback completes
 */
export const playPhoneme = async (phoneme: string): Promise<void> => {
  if (typeof window === 'undefined') {
    console.warn('playPhoneme called on server side');
    return;
  }

  const baseUrl = getBaseUrl();
  const audioUrl = `${baseUrl}${phoneme}.mp3`;

  try {
    // Check if audio is cached
    let audio = audioCache.get(phoneme);
    
    if (!audio) {
      // Create new audio element
      audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audioCache.set(phoneme, audio);
    }

    // Play the audio
    await audio.play();
  } catch (error) {
    console.error(`Error playing phoneme ${phoneme}:`, error);
    // Fallback to browser TTS if audio file fails
    fallbackToBrowserTTS(phoneme);
  }
};

/**
 * Get phoneme information for display
 * @param phoneme - The phoneme identifier
 * @returns PhonemeInfo object with metadata
 */
export const getPhonemeInfo = (phoneme: string): PhonemeInfo => {
  const baseUrl = getBaseUrl();
  const symbol = phoneme.replace(/_/g, '').toUpperCase();
  
  // Special case for oo_long and oo_short
  const displaySymbol = phoneme === 'oo_long' ? 'OO' :
                       phoneme === 'oo_short' ? 'oo' :
                       phoneme.replace(/_/g, '').toUpperCase();
  
  return {
    symbol: displaySymbol,
    audioUrl: `${baseUrl}${phoneme}.mp3`,
    action: phonemeActions[phoneme] || '',
    exampleWord: exampleWords[phoneme] || '',
    jollyPhonicsGroup: jollyPhonicsGroups[phoneme] || 0,
    phonemeText: phonemeTexts[phoneme] || phoneme
  };
};

/**
 * Preload phonemes for faster playback
 * Call this early in the app lifecycle (e.g., in useEffect)
 * @param phonemes - Array of phoneme identifiers to preload
 */
export const preloadPhonemes = (phonemes: string[]): void => {
  if (typeof window === 'undefined') return;

  const baseUrl = getBaseUrl();
  
  phonemes.forEach(phoneme => {
    if (!audioCache.has(phoneme)) {
      const audioUrl = `${baseUrl}${phoneme}.mp3`;
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.load();
      audioCache.set(phoneme, audio);
    }
  });
};

/**
 * Play a CVC word by breaking it into phonemes
 * @param word - The CVC word to pronounce (e.g., 'cat')
 * @returns Promise that resolves when playback completes
 */
export const playCVCWord = async (word: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  const letters = word.toLowerCase().split('');
  
  // Play each phoneme with a pause
  for (let i = 0; i < letters.length; i++) {
    await playPhoneme(letters[i]);
    // Wait for phoneme to finish (approx 600ms)
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  // Small pause before playing the full word
  await new Promise(resolve => setTimeout(resolve, 300));

  // Play the full word using browser TTS
  await speakWord(word);
};

/**
 * Speak a word using browser TTS (for full words, not phonemes)
 * @param word - The word to speak
 * @returns Promise that resolves when playback completes
 */
const speakWord = async (word: string): Promise<void> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-GB'; // British English
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Fallback to browser TTS if Edge TTS audio file fails
 * @param phoneme - The phoneme identifier
 */
const fallbackToBrowserTTS = (phoneme: string): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Browser TTS not available');
    return;
  }

  const phonemeText = phonemeTexts[phoneme] || phoneme;
  const utterance = new SpeechSynthesisUtterance(phonemeText);
  utterance.lang = 'en-GB'; // British English
  utterance.rate = 0.6;
  utterance.pitch = 1.1;
  
  window.speechSynthesis.speak(utterance);
};

/**
 * Check if phoneme audio is available
 * @param phoneme - The phoneme identifier
 * @returns Promise<boolean> - true if audio file exists
 */
export const isPhonemeAvailable = async (phoneme: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const baseUrl = getBaseUrl();
  const audioUrl = `${baseUrl}${phoneme}.mp3`;

  try {
    const response = await fetch(audioUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get all available phonemes
 * @returns Array of phoneme identifiers
 */
export const getAllPhonemes = (): string[] => {
  return Object.keys(phonemeActions);
};

/**
 * Get phonemes by Jolly Phonics group
 * @param group - Group number (1-7)
 * @returns Array of phoneme identifiers in the group
 */
export const getPhonemesByGroup = (group: number): string[] => {
  return Object.entries(jollyPhonicsGroups)
    .filter(([_, g]) => g === group)
    .map(([phoneme, _]) => phoneme);
};

/**
 * Stop all audio playback
 */
export const stopAllPlayback = (): void => {
  if (typeof window === 'undefined') return;

  // Stop all cached audio
  audioCache.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });

  // Stop browser TTS
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Clear the audio cache
 * Useful for memory management
 */
export const clearAudioCache = (): void => {
  audioCache.clear();
};
