const admin = require('firebase-admin');
const fs = require('fs');

// Firebase Admin SDK configuration from local file
const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Reading Levels Data
const readingLevels = [
  {
    level_id: 'kindergarten',
    level_name: 'Kindergarten',
    age_range: '4-5',
    lexile_min: 0,
    lexile_max: 200,
    fry_readability_range: '0-2',
    description: 'Beginner CVC words and letter sounds',
    estimated_duration_weeks: 8,
    min_cvc_words: 50,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    level_id: 'grade1',
    level_name: 'Grade 1',
    age_range: '6-7',
    lexile_min: 200,
    lexile_max: 400,
    fry_readability_range: '2-3',
    description: 'Simple sentences and early sight words',
    estimated_duration_weeks: 10,
    min_cvc_words: 75,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    level_id: 'grade2',
    level_name: 'Grade 2',
    age_range: '8+',
    lexile_min: 400,
    lexile_max: 700,
    fry_readability_range: '4-6',
    description: 'Multi-syllable words and comprehension focus',
    estimated_duration_weeks: 12,
    min_cvc_words: 100,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Comprehensive CVC Words Data (50+ words organized by word families)
const cvcWords = [
  // AT family
  { word: 'cat', letter1: 'c', letter2: 'a', letter3: 't', phonetic_sound: '/k/-/æ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'at' },
  { word: 'hat', letter1: 'h', letter2: 'a', letter3: 't', phonetic_sound: '/h/-/æ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'at' },
  { word: 'mat', letter1: 'm', letter2: 'a', letter3: 't', phonetic_sound: '/m/-/æ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'at' },
  { word: 'rat', letter1: 'r', letter2: 'a', letter3: 't', phonetic_sound: '/r/-/æ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'at' },
  { word: 'bat', letter1: 'b', letter2: 'a', letter3: 't', phonetic_sound: '/b/-/æ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'at' },
  { word: 'sat', letter1: 's', letter2: 'a', letter3: 't', phonetic_sound: '/s/-/æ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'at' },
  { word: 'pat', letter1: 'p', letter2: 'a', letter3: 't', phonetic_sound: '/p/-/æ/-/t/', frequency: 3, difficulty_level: 'easy', word_family: 'at' },
  { word: 'fat', letter1: 'f', letter2: 'a', letter3: 't', phonetic_sound: '/f/-/æ/-/t/', frequency: 3, difficulty_level: 'easy', word_family: 'at' },
  
  // AN family
  { word: 'can', letter1: 'c', letter2: 'a', letter3: 'n', phonetic_sound: '/k/-/æ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'an' },
  { word: 'man', letter1: 'm', letter2: 'a', letter3: 'n', phonetic_sound: '/m/-/æ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'an' },
  { word: 'pan', letter1: 'p', letter2: 'a', letter3: 'n', phonetic_sound: '/p/-/æ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'an' },
  { word: 'fan', letter1: 'f', letter2: 'a', letter3: 'n', phonetic_sound: '/f/-/æ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'an' },
  { word: 'ran', letter1: 'r', letter2: 'a', letter3: 'n', phonetic_sound: '/r/-/æ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'an' },
  { word: 'van', letter1: 'v', letter2: 'a', letter3: 'n', phonetic_sound: '/v/-/æ/-/n/', frequency: 3, difficulty_level: 'medium', word_family: 'an' },
  { word: 'tan', letter1: 't', letter2: 'a', letter3: 'n', phonetic_sound: '/t/-/æ/-/n/', frequency: 3, difficulty_level: 'easy', word_family: 'an' },
  
  // AP family
  { word: 'cap', letter1: 'c', letter2: 'a', letter3: 'p', phonetic_sound: '/k/-/æ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'ap' },
  { word: 'map', letter1: 'm', letter2: 'a', letter3: 'p', phonetic_sound: '/m/-/æ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'ap' },
  { word: 'tap', letter1: 't', letter2: 'a', letter3: 'p', phonetic_sound: '/t/-/æ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'ap' },
  { word: 'nap', letter1: 'n', letter2: 'a', letter3: 'p', phonetic_sound: '/n/-/æ/-/p/', frequency: 3, difficulty_level: 'easy', word_family: 'ap' },
  { word: 'lap', letter1: 'l', letter2: 'a', letter3: 'p', phonetic_sound: '/l/-/æ/-/p/', frequency: 3, difficulty_level: 'easy', word_family: 'ap' },
  { word: 'sap', letter1: 's', letter2: 'a', letter3: 'p', phonetic_sound: '/s/-/æ/-/p/', frequency: 2, difficulty_level: 'easy', word_family: 'ap' },
  
  // OG family
  { word: 'dog', letter1: 'd', letter2: 'o', letter3: 'g', phonetic_sound: '/d/-/ɒ/-/g/', frequency: 5, difficulty_level: 'easy', word_family: 'og' },
  { word: 'log', letter1: 'l', letter2: 'o', letter3: 'g', phonetic_sound: '/l/-/ɒ/-/g/', frequency: 4, difficulty_level: 'easy', word_family: 'og' },
  { word: 'fog', letter1: 'f', letter2: 'o', letter3: 'g', phonetic_sound: '/f/-/ɒ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'og' },
  { word: 'hog', letter1: 'h', letter2: 'o', letter3: 'g', phonetic_sound: '/h/-/ɒ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'og' },
  { word: 'jog', letter1: 'j', letter2: 'o', letter3: 'g', phonetic_sound: '/dʒ/-/ɒ/-/g/', frequency: 2, difficulty_level: 'medium', word_family: 'og' },
  
  // OP family
  { word: 'hop', letter1: 'h', letter2: 'o', letter3: 'p', phonetic_sound: '/h/-/ɒ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'op' },
  { word: 'mop', letter1: 'm', letter2: 'o', letter3: 'p', phonetic_sound: '/m/-/ɒ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'op' },
  { word: 'pop', letter1: 'p', letter2: 'o', letter3: 'p', phonetic_sound: '/p/-/ɒ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'op' },
  { word: 'top', letter1: 't', letter2: 'o', letter3: 'p', phonetic_sound: '/t/-/ɒ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'op' },
  { word: 'cop', letter1: 'c', letter2: 'o', letter3: 'p', phonetic_sound: '/k/-/ɒ/-/p/', frequency: 3, difficulty_level: 'easy', word_family: 'op' },
  
  // OT family
  { word: 'cot', letter1: 'c', letter2: 'o', letter3: 't', phonetic_sound: '/k/-/ɒ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ot' },
  { word: 'dot', letter1: 'd', letter2: 'o', letter3: 't', phonetic_sound: '/d/-/ɒ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ot' },
  { word: 'hot', letter1: 'h', letter2: 'o', letter3: 't', phonetic_sound: '/h/-/ɒ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ot' },
  { word: 'lot', letter1: 'l', letter2: 'o', letter3: 't', phonetic_sound: '/l/-/ɒ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ot' },
  { word: 'pot', letter1: 'p', letter2: 'o', letter3: 't', phonetic_sound: '/p/-/ɒ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ot' },
  { word: 'rot', letter1: 'r', letter2: 'o', letter3: 't', phonetic_sound: '/r/-/ɒ/-/t/', frequency: 3, difficulty_level: 'easy', word_family: 'ot' },
  { word: 'not', letter1: 'n', letter2: 'o', letter3: 't', phonetic_sound: '/n/-/ɒ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'ot' },
  
  // EN family
  { word: 'hen', letter1: 'h', letter2: 'e', letter3: 'n', phonetic_sound: '/h/-/ɛ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'en' },
  { word: 'pen', letter1: 'p', letter2: 'e', letter3: 'n', phonetic_sound: '/p/-/ɛ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'en' },
  { word: 'ten', letter1: 't', letter2: 'e', letter3: 'n', phonetic_sound: '/t/-/ɛ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'en' },
  { word: 'men', letter1: 'm', letter2: 'e', letter3: 'n', phonetic_sound: '/m/-/ɛ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'en' },
  { word: 'den', letter1: 'd', letter2: 'e', letter3: 'n', phonetic_sound: '/d/-/ɛ/-/n/', frequency: 3, difficulty_level: 'easy', word_family: 'en' },
  { word: 'ben', letter1: 'b', letter2: 'e', letter3: 'n', phonetic_sound: '/b/-/ɛ/-/n/', frequency: 3, difficulty_level: 'easy', word_family: 'en' },
  
  // ET family
  { word: 'jet', letter1: 'j', letter2: 'e', letter3: 't', phonetic_sound: '/dʒ/-/ɛ/-/t/', frequency: 4, difficulty_level: 'medium', word_family: 'et' },
  { word: 'let', letter1: 'l', letter2: 'e', letter3: 't', phonetic_sound: '/l/-/ɛ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'et' },
  { word: 'met', letter1: 'm', letter2: 'e', letter3: 't', phonetic_sound: '/m/-/ɛ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'et' },
  { word: 'net', letter1: 'n', letter2: 'e', letter3: 't', phonetic_sound: '/n/-/ɛ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'et' },
  { word: 'pet', letter1: 'p', letter2: 'e', letter3: 't', phonetic_sound: '/p/-/ɛ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'et' },
  { word: 'set', letter1: 's', letter2: 'e', letter3: 't', phonetic_sound: '/s/-/ɛ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'et' },
  { word: 'wet', letter1: 'w', letter2: 'e', letter3: 't', phonetic_sound: '/w/-/ɛ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'et' },
  { word: 'bet', letter1: 'b', letter2: 'e', letter3: 't', phonetic_sound: '/b/-/ɛ/-/t/', frequency: 3, difficulty_level: 'easy', word_family: 'et' },
  { word: 'get', letter1: 'g', letter2: 'e', letter3: 't', phonetic_sound: '/g/-/ɛ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'et' },
  
  // IG family
  { word: 'big', letter1: 'b', letter2: 'i', letter3: 'g', phonetic_sound: '/b/-/ɪ/-/g/', frequency: 5, difficulty_level: 'easy', word_family: 'ig' },
  { word: 'dig', letter1: 'd', letter2: 'i', letter3: 'g', phonetic_sound: '/d/-/ɪ/-/g/', frequency: 4, difficulty_level: 'easy', word_family: 'ig' },
  { word: 'fig', letter1: 'f', letter2: 'i', letter3: 'g', phonetic_sound: '/f/-/ɪ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'ig' },
  { word: 'pig', letter1: 'p', letter2: 'i', letter3: 'g', phonetic_sound: '/p/-/ɪ/-/g/', frequency: 5, difficulty_level: 'easy', word_family: 'ig' },
  { word: 'rig', letter1: 'r', letter2: 'i', letter3: 'g', phonetic_sound: '/r/-/ɪ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'ig' },
  { word: 'wig', letter1: 'w', letter2: 'i', letter3: 'g', phonetic_sound: '/w/-/ɪ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'ig' },
  
  // IN family
  { word: 'pin', letter1: 'p', letter2: 'i', letter3: 'n', phonetic_sound: '/p/-/ɪ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'in' },
  { word: 'win', letter1: 'w', letter2: 'i', letter3: 'n', phonetic_sound: '/w/-/ɪ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'in' },
  { word: 'tin', letter1: 't', letter2: 'i', letter3: 'n', phonetic_sound: '/t/-/ɪ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'in' },
  { word: 'fin', letter1: 'f', letter2: 'i', letter3: 'n', phonetic_sound: '/f/-/ɪ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'in' },
  { word: 'bin', letter1: 'b', letter2: 'i', letter3: 'n', phonetic_sound: '/b/-/ɪ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'in' },
  { word: 'din', letter1: 'd', letter2: 'i', letter3: 'n', phonetic_sound: '/d/-/ɪ/-/n/', frequency: 3, difficulty_level: 'easy', word_family: 'in' },
  
  // IP family
  { word: 'dip', letter1: 'd', letter2: 'i', letter3: 'p', phonetic_sound: '/d/-/ɪ/-/p/', frequency: 3, difficulty_level: 'easy', word_family: 'ip' },
  { word: 'hip', letter1: 'h', letter2: 'i', letter3: 'p', phonetic_sound: '/h/-/ɪ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'ip' },
  { word: 'lip', letter1: 'l', letter2: 'i', letter3: 'p', phonetic_sound: '/l/-/ɪ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'ip' },
  { word: 'rip', letter1: 'r', letter2: 'i', letter3: 'p', phonetic_sound: '/r/-/ɪ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'ip' },
  { word: 'sip', letter1: 's', letter2: 'i', letter3: 'p', phonetic_sound: '/s/-/ɪ/-/p/', frequency: 3, difficulty_level: 'easy', word_family: 'ip' },
  { word: 'tip', letter1: 't', letter2: 'i', letter3: 'p', phonetic_sound: '/t/-/ɪ/-/p/', frequency: 4, difficulty_level: 'easy', word_family: 'ip' },
  
  // IT family
  { word: 'bit', letter1: 'b', letter2: 'i', letter3: 't', phonetic_sound: '/b/-/ɪ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'it' },
  { word: 'fit', letter1: 'f', letter2: 'i', letter3: 't', phonetic_sound: '/f/-/ɪ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'it' },
  { word: 'hit', letter1: 'h', letter2: 'i', letter3: 't', phonetic_sound: '/h/-/ɪ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'it' },
  { word: 'pit', letter1: 'p', letter2: 'i', letter3: 't', phonetic_sound: '/p/-/ɪ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'it' },
  { word: 'sit', letter1: 's', letter2: 'i', letter3: 't', phonetic_sound: '/s/-/ɪ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'it' },
  
  // UG family
  { word: 'bug', letter1: 'b', letter2: 'u', letter3: 'g', phonetic_sound: '/b/-/ʌ/-/g/', frequency: 4, difficulty_level: 'easy', word_family: 'ug' },
  { word: 'dug', letter1: 'd', letter2: 'u', letter3: 'g', phonetic_sound: '/d/-/ʌ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'ug' },
  { word: 'hug', letter1: 'h', letter2: 'u', letter3: 'g', phonetic_sound: '/h/-/ʌ/-/g/', frequency: 4, difficulty_level: 'easy', word_family: 'ug' },
  { word: 'jug', letter1: 'j', letter2: 'u', letter3: 'g', phonetic_sound: '/dʒ/-/ʌ/-/g/', frequency: 4, difficulty_level: 'medium', word_family: 'ug' },
  { word: 'mug', letter1: 'm', letter2: 'u', letter3: 'g', phonetic_sound: '/m/-/ʌ/-/g/', frequency: 4, difficulty_level: 'easy', word_family: 'ug' },
  { word: 'pug', letter1: 'p', letter2: 'u', letter3: 'g', phonetic_sound: '/p/-/ʌ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'ug' },
  { word: 'rug', letter1: 'r', letter2: 'u', letter3: 'g', phonetic_sound: '/r/-/ʌ/-/g/', frequency: 4, difficulty_level: 'easy', word_family: 'ug' },
  { word: 'tug', letter1: 't', letter2: 'u', letter3: 'g', phonetic_sound: '/t/-/ʌ/-/g/', frequency: 3, difficulty_level: 'easy', word_family: 'ug' },
  
  // UN family
  { word: 'bun', letter1: 'b', letter2: 'u', letter3: 'n', phonetic_sound: '/b/-/ʌ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'un' },
  { word: 'fun', letter1: 'f', letter2: 'u', letter3: 'n', phonetic_sound: '/f/-/ʌ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'un' },
  { word: 'gun', letter1: 'g', letter2: 'u', letter3: 'n', phonetic_sound: '/g/-/ʌ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'un' },
  { word: 'nun', letter1: 'n', letter2: 'u', letter3: 'n', phonetic_sound: '/n/-/ʌ/-/n/', frequency: 3, difficulty_level: 'easy', word_family: 'un' },
  { word: 'pun', letter1: 'p', letter2: 'u', letter3: 'n', phonetic_sound: '/p/-/ʌ/-/n/', frequency: 3, difficulty_level: 'easy', word_family: 'un' },
  { word: 'run', letter1: 'r', letter2: 'u', letter3: 'n', phonetic_sound: '/r/-/ʌ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'un' },
  { word: 'sun', letter1: 's', letter2: 'u', letter3: 'n', phonetic_sound: '/s/-/ʌ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'un' },
  
  // UT family
  { word: 'but', letter1: 'b', letter2: 'u', letter3: 't', phonetic_sound: '/b/-/ʌ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'ut' },
  { word: 'cut', letter1: 'c', letter2: 'u', letter3: 't', phonetic_sound: '/k/-/ʌ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ut' },
  { word: 'hut', letter1: 'h', letter2: 'u', letter3: 't', phonetic_sound: '/h/-/ʌ/-/t/', frequency: 3, difficulty_level: 'easy', word_family: 'ut' },
  { word: 'nut', letter1: 'n', letter2: 'u', letter3: 't', phonetic_sound: '/n/-/ʌ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ut' },
  { word: 'put', letter1: 'p', letter2: 'u', letter3: 't', phonetic_sound: '/p/-/ʊ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'ut' },
  { word: 'rut', letter1: 'r', letter2: 'u', letter3: 't', phonetic_sound: '/r/-/ʌ/-/t/', frequency: 3, difficulty_level: 'easy', word_family: 'ut' },
];

// Dolch Sight Words by Level
const sightWords = {
  prePrimer: [
    { word: 'a', level: 'pre-primer', frequency: 10 },
    { word: 'and', level: 'pre-primer', frequency: 10 },
    { word: 'away', level: 'pre-primer', frequency: 8 },
    { word: 'big', level: 'pre-primer', frequency: 8 },
    { word: 'blue', level: 'pre-primer', frequency: 7 },
    { word: 'can', level: 'pre-primer', frequency: 9 },
    { word: 'come', level: 'pre-primer', frequency: 8 },
    { word: 'down', level: 'pre-primer', frequency: 8 },
    { word: 'find', level: 'pre-primer', frequency: 7 },
    { word: 'for', level: 'pre-primer', frequency: 9 },
    { word: 'funny', level: 'pre-primer', frequency: 6 },
    { word: 'go', level: 'pre-primer', frequency: 10 },
    { word: 'help', level: 'pre-primer', frequency: 8 },
    { word: 'here', level: 'pre-primer', frequency: 8 },
    { word: 'I', level: 'pre-primer', frequency: 10 },
    { word: 'in', level: 'pre-primer', frequency: 10 },
    { word: 'is', level: 'pre-primer', frequency: 9 },
    { word: 'it', level: 'pre-primer', frequency: 10 },
    { word: 'jump', level: 'pre-primer', frequency: 7 },
    { word: 'little', level: 'pre-primer', frequency: 8 },
    { word: 'look', level: 'pre-primer', frequency: 9 },
    { word: 'make', level: 'pre-primer', frequency: 8 },
    { word: 'me', level: 'pre-primer', frequency: 10 },
    { word: 'my', level: 'pre-primer', frequency: 9 },
    { word: 'not', level: 'pre-primer', frequency: 9 },
    { word: 'one', level: 'pre-primer', frequency: 8 },
    { word: 'play', level: 'pre-primer', frequency: 9 },
    { word: 'red', level: 'pre-primer', frequency: 7 },
    { word: 'run', level: 'pre-primer', frequency: 9 },
    { word: 'said', level: 'pre-primer', frequency: 9 },
    { word: 'see', level: 'pre-primer', frequency: 9 },
    { word: 'the', level: 'pre-primer', frequency: 10 },
    { word: 'three', level: 'pre-primer', frequency: 7 },
    { word: 'to', level: 'pre-primer', frequency: 10 },
    { word: 'two', level: 'pre-primer', frequency: 8 },
    { word: 'up', level: 'pre-primer', frequency: 9 },
    { word: 'we', level: 'pre-primer', frequency: 9 },
    { word: 'where', level: 'pre-primer', frequency: 7 },
    { word: 'yellow', level: 'pre-primer', frequency: 6 },
    { word: 'you', level: 'pre-primer', frequency: 10 },
  ],
  primer: [
    { word: 'all', level: 'primer', frequency: 9 },
    { word: 'am', level: 'primer', frequency: 9 },
    { word: 'are', level: 'primer', frequency: 9 },
    { word: 'at', level: 'primer', frequency: 9 },
    { word: 'ate', level: 'primer', frequency: 7 },
    { word: 'be', level: 'primer', frequency: 9 },
    { word: 'black', level: 'primer', frequency: 6 },
    { word: 'brown', level: 'primer', frequency: 6 },
    { word: 'but', level: 'primer', frequency: 9 },
    { word: 'came', level: 'primer', frequency: 8 },
    { word: 'did', level: 'primer', frequency: 9 },
    { word: 'do', level: 'primer', frequency: 9 },
    { word: 'eat', level: 'primer', frequency: 8 },
    { word: 'four', level: 'primer', frequency: 7 },
    { word: 'get', level: 'primer', frequency: 9 },
    { word: 'good', level: 'primer', frequency: 8 },
    { word: 'have', level: 'primer', frequency: 9 },
    { word: 'he', level: 'primer', frequency: 10 },
    { word: 'into', level: 'primer', frequency: 8 },
    { word: 'like', level: 'primer', frequency: 9 },
    { word: 'must', level: 'primer', frequency: 8 },
    { word: 'new', level: 'primer', frequency: 8 },
    { word: 'no', level: 'primer', frequency: 9 },
    { word: 'now', level: 'primer', frequency: 8 },
    { word: 'on', level: 'primer', frequency: 9 },
    { word: 'our', level: 'primer', frequency: 8 },
    { word: 'out', level: 'primer', frequency: 8 },
    { word: 'please', level: 'primer', frequency: 7 },
    { word: 'pretty', level: 'primer', frequency: 6 },
    { word: 'ran', level: 'primer', frequency: 8 },
    { word: 'ride', level: 'primer', frequency: 7 },
    { word: 'saw', level: 'primer', frequency: 8 },
    { word: 'say', level: 'primer', frequency: 8 },
    { word: 'she', level: 'primer', frequency: 10 },
    { word: 'so', level: 'primer', frequency: 9 },
    { word: 'soon', level: 'primer', frequency: 7 },
    { word: 'that', level: 'primer', frequency: 9 },
    { word: 'there', level: 'primer', frequency: 8 },
    { word: 'they', level: 'primer', frequency: 9 },
    { word: 'this', level: 'primer', frequency: 9 },
    { word: 'too', level: 'primer', frequency: 8 },
    { word: 'under', level: 'primer', frequency: 7 },
    { word: 'want', level: 'primer', frequency: 9 },
    { word: 'was', level: 'primer', frequency: 9 },
    { word: 'well', level: 'primer', frequency: 8 },
    { word: 'went', level: 'primer', frequency: 8 },
    { word: 'what', level: 'primer', frequency: 9 },
    { word: 'white', level: 'primer', frequency: 6 },
    { word: 'who', level: 'primer', frequency: 8 },
    { word: 'will', level: 'primer', frequency: 9 },
    { word: 'with', level: 'primer', frequency: 9 },
    { word: 'yes', level: 'primer', frequency: 9 },
  ],
  firstGrade: [
    { word: 'after', level: 'first', frequency: 8 },
    { word: 'again', level: 'first', frequency: 8 },
    { word: 'an', level: 'first', frequency: 9 },
    { word: 'any', level: 'first', frequency: 8 },
    { word: 'as', level: 'first', frequency: 9 },
    { word: 'ask', level: 'first', frequency: 7 },
    { word: 'by', level: 'first', frequency: 9 },
    { word: 'could', level: 'first', frequency: 8 },
    { word: 'every', level: 'first', frequency: 8 },
    { word: 'fly', level: 'first', frequency: 7 },
    { word: 'from', level: 'first', frequency: 9 },
    { word: 'give', level: 'first', frequency: 8 },
    { word: 'going', level: 'first', frequency: 8 },
    { word: 'had', level: 'first', frequency: 9 },
    { word: 'has', level: 'first', frequency: 9 },
    { word: 'her', level: 'first', frequency: 9 },
    { word: 'him', level: 'first', frequency: 9 },
    { word: 'his', level: 'first', frequency: 9 },
    { word: 'how', level: 'first', frequency: 8 },
    { word: 'just', level: 'first', frequency: 8 },
    { word: 'know', level: 'first', frequency: 8 },
    { word: 'let', level: 'first', frequency: 8 },
    { word: 'live', level: 'first', frequency: 8 },
    { word: 'may', level: 'first', frequency: 8 },
    { word: 'of', level: 'first', frequency: 10 },
    { word: 'old', level: 'first', frequency: 7 },
    { word: 'once', level: 'first', frequency: 8 },
    { word: 'open', level: 'first', frequency: 7 },
    { word: 'over', level: 'first', frequency: 8 },
    { word: 'put', level: 'first', frequency: 8 },
    { word: 'round', level: 'first', frequency: 7 },
    { word: 'some', level: 'first', frequency: 9 },
    { word: 'stop', level: 'first', frequency: 8 },
    { word: 'take', level: 'first', frequency: 8 },
    { word: 'thank', level: 'first', frequency: 7 },
    { word: 'them', level: 'first', frequency: 9 },
    { word: 'then', level: 'first', frequency: 8 },
    { word: 'think', level: 'first', frequency: 7 },
    { word: 'walk', level: 'first', frequency: 8 },
    { word: 'were', level: 'first', frequency: 9 },
    { word: 'when', level: 'first', frequency: 9 },
  ],
  secondGrade: [
    { word: 'always', level: 'second', frequency: 7 },
    { word: 'around', level: 'second', frequency: 8 },
    { word: 'because', level: 'second', frequency: 8 },
    { word: 'been', level: 'second', frequency: 9 },
    { word: 'before', level: 'second', frequency: 8 },
    { word: 'best', level: 'second', frequency: 7 },
    { word: 'both', level: 'second', frequency: 7 },
    { word: 'buy', level: 'second', frequency: 7 },
    { word: 'call', level: 'second', frequency: 8 },
    { word: 'cold', level: 'second', frequency: 7 },
    { word: 'does', level: 'second', frequency: 8 },
    { word: "don't", level: 'second', frequency: 8 },
    { word: 'fast', level: 'second', frequency: 7 },
    { word: 'first', level: 'second', frequency: 8 },
    { word: 'five', level: 'second', frequency: 7 },
    { word: 'found', level: 'second', frequency: 7 },
    { word: 'gave', level: 'second', frequency: 7 },
    { word: 'goes', level: 'second', frequency: 7 },
    { word: 'green', level: 'second', frequency: 6 },
    { word: 'its', level: 'second', frequency: 8 },
    { word: 'made', level: 'second', frequency: 8 },
    { word: 'many', level: 'second', frequency: 8 },
    { word: 'off', level: 'second', frequency: 8 },
    { word: 'or', level: 'second', frequency: 9 },
    { word: 'pull', level: 'second', frequency: 7 },
    { word: 'read', level: 'second', frequency: 8 },
    { word: 'right', level: 'second', frequency: 8 },
    { word: 'sing', level: 'second', frequency: 7 },
    { word: 'sit', level: 'second', frequency: 8 },
    { word: 'sleep', level: 'second', frequency: 7 },
    { word: 'tell', level: 'second', frequency: 8 },
    { word: 'their', level: 'second', frequency: 9 },
    { word: 'these', level: 'second', frequency: 8 },
    { word: 'those', level: 'second', frequency: 8 },
    { word: 'upon', level: 'second', frequency: 7 },
    { word: 'us', level: 'second', frequency: 8 },
    { word: 'use', level: 'second', frequency: 7 },
    { word: 'very', level: 'second', frequency: 8 },
    { word: 'wash', level: 'second', frequency: 6 },
    { word: 'which', level: 'second', frequency: 8 },
    { word: 'why', level: 'second', frequency: 7 },
    { word: 'wish', level: 'second', frequency: 7 },
    { word: 'work', level: 'second', frequency: 8 },
    { word: 'would', level: 'second', frequency: 8 },
    { word: 'write', level: 'second', frequency: 7 },
    { word: 'your', level: 'second', frequency: 9 },
  ]
};

async function seedFirestore() {
  console.log('🌱 Starting Firestore data seeding...');
  
  try {
    // 1. Seed Reading Levels
    console.log('📚 Seeding reading levels...');
    const levelsBatch = db.batch();
    readingLevels.forEach(level => {
      const ref = db.collection('reading_levels').doc(level.level_id);
      levelsBatch.set(ref, level);
    });
    await levelsBatch.commit();
    console.log('✅ Reading levels seeded successfully');
    
    // 2. Seed CVC Words (comprehensive list)
    console.log('📝 Seeding CVC words...');
    let cvcCount = 0;
    const cvcBatchSize = 500; // Firestore batch limit
    
    for (let i = 0; i < cvcWords.length; i += cvcBatchSize) {
      const batch = db.batch();
      const chunk = cvcWords.slice(i, i + cvcBatchSize);
      
      chunk.forEach((word, index) => {
        const wordId = `cvc_${i + index}`;
        const ref = db.collection('reading_levels').doc('kindergarten').collection('cvc_words').doc(wordId);
        batch.set(ref, {
          ...word,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        cvcCount++;
      });
      
      await batch.commit();
      console.log(`  ✅ Seeded CVC batch ${Math.floor(i / cvcBatchSize) + 1}/${Math.ceil(cvcWords.length / cvcBatchSize)}`);
    }
    console.log(`✅ Total CVC words seeded: ${cvcCount}`);
    
    // 3. Seed Sight Words
    console.log('📖 Seeding sight words...');
    let sightWordCount = 0;
    
    for (const [level, words] of Object.entries(sightWords)) {
      const batch = db.batch();
      
      words.forEach((word, index) => {
        const wordId = `${level}_${index}`;
        const ref = db.collection('reading_levels').doc('kindergarten').collection('sight_words').doc(wordId);
        batch.set(ref, {
          ...word,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        sightWordCount++;
      });
      
      await batch.commit();
      console.log(`  ✅ Seeded ${words.length} ${level} sight words`);
    }
    console.log(`✅ Total sight words seeded: ${sightWordCount}`);
    
    console.log('\n🎉 Firestore seeding completed!');
    console.log('📊 Summary:');
    console.log(`  - Reading levels: ${readingLevels.length}`);
    console.log(`  - CVC words: ${cvcCount}`);
    console.log(`  - Sight words: ${sightWordCount}`);
    console.log(`  - Total documents written: ${readingLevels.length + cvcCount + sightWordCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run seeding
seedFirestore();
