/**
 * Browser-based Firestore Seeder
 *
 * This script can be run in the browser console after logging into ReadinConnect.
 * It seeds Firestore with initial data for reading levels, CVC words, and sight words.
 *
 * Usage:
 * 1. Start the dev server: npm run dev
 * 2. Open http://localhost:3000
 * 3. Log in with any account
 * 4. Open browser console (F12)
 * 5. Copy and paste this entire script
 * 6. Run: seedFirestore()
 */

import { db, doc, setDoc, collection, addDoc, getDoc } from '@/lib/firebase/firestore'

// Reading Levels Data
export const readingLevels = [
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
    created_at: new Date().toISOString()
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
    created_at: new Date().toISOString()
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
    created_at: new Date().toISOString()
  }
]

// Sample CVC Words (subset for testing)
export const cvcWords = [
  { word: 'cat', letter1: 'c', letter2: 'a', letter3: 't', phonetic_sound: '/k/-/æ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'at' },
  { word: 'hat', letter1: 'h', letter2: 'a', letter3: 't', phonetic_sound: '/h/-/æ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'at' },
  { word: 'mat', letter1: 'm', letter2: 'a', letter3: 't', phonetic_sound: '/m/-/æ/-/t/', frequency: 5, difficulty_level: 'easy', word_family: 'at' },
  { word: 'bat', letter1: 'b', letter2: 'a', letter3: 't', phonetic_sound: '/b/-/æ/-/t/', frequency: 4, difficulty_level: 'easy', word_family: 'at' },
  { word: 'dog', letter1: 'd', letter2: 'o', letter3: 'g', phonetic_sound: '/d/-/ɒ/-/g/', frequency: 5, difficulty_level: 'easy', word_family: 'og' },
  { word: 'log', letter1: 'l', letter2: 'o', letter3: 'g', phonetic_sound: '/l/-/ɒ/-/g/', frequency: 4, difficulty_level: 'easy', word_family: 'og' },
  { word: 'pig', letter1: 'p', letter2: 'i', letter3: 'g', phonetic_sound: '/p/-/ɪ/-/g/', frequency: 5, difficulty_level: 'easy', word_family: 'ig' },
  { word: 'big', letter1: 'b', letter2: 'i', letter3: 'g', phonetic_sound: '/b/-/ɪ/-/g/', frequency: 5, difficulty_level: 'easy', word_family: 'ig' },
  { word: 'hen', letter1: 'h', letter2: 'e', letter3: 'n', phonetic_sound: '/h/-/ɛ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'en' },
  { word: 'pen', letter1: 'p', letter2: 'e', letter3: 'n', phonetic_sound: '/p/-/ɛ/-/n/', frequency: 4, difficulty_level: 'easy', word_family: 'en' },
  { word: 'sun', letter1: 's', letter2: 'u', letter3: 'n', phonetic_sound: '/s/-/ʌ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'un' },
  { word: 'fun', letter1: 'f', letter2: 'u', letter3: 'n', phonetic_sound: '/f/-/ʌ/-/n/', frequency: 5, difficulty_level: 'easy', word_family: 'un' }
]

// Sample Sight Words (Dolch pre-primer subset)
export const sightWords = [
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
  { word: 'is', level: 'pre-primer', frequency: 10 },
  { word: 'it', level: 'pre-primer', frequency: 10 },
  { word: 'jump', level: 'pre-primer', frequency: 8 },
  { word: 'little', level: 'pre-primer', frequency: 9 }
]

// Badges
export const badges = [
  {
    badge_id: 'first_word',
    title: 'First Steps',
    description: 'Complete your first word activity',
    icon: '🌟',
    points: 10,
    type: 'achievement'
  },
  {
    badge_id: 'streak_3',
    title: '3-Day Streak',
    description: 'Practice for 3 consecutive days',
    icon: '🔥',
    points: 30,
    type: 'streak'
  },
  {
    badge_id: 'level_complete',
    title: 'Level Master',
    description: 'Complete all words in a level',
    icon: '🏆',
    points: 100,
    type: 'level_completion'
  },
  {
    badge_id: 'perfect_score',
    title: 'Perfect Reader',
    description: 'Get 100% on a fluency test',
    icon: '💯',
    points: 50,
    type: 'achievement'
  }
]

// Rewards
export const rewards = [
  {
    reward_id: 'custom_avatar',
    title: 'Custom Avatar',
    description: 'Unlock a special avatar',
    icon: '🎨',
    cost: 100,
    points: 0
  },
  {
    reward_id: 'new_theme',
    title: 'New Theme',
    description: 'Unlock a fun color theme',
    icon: '🎭',
    cost: 150,
    points: 0
  },
  {
    reward_id: 'story_book',
    title: 'Story Book',
    description: 'Unlock a printable story',
    icon: '📖',
    cost: 200,
    points: 0
  }
]

// Main seeding function
export async function seedFirestore() {
  console.log('🌱 Starting Firestore seeding...')

  try {
    // Seed Reading Levels
    console.log('📚 Seeding reading levels...')
    for (const level of readingLevels) {
      const levelRef = doc(db, 'reading_levels', level.level_id)
      await setDoc(levelRef, level)
      console.log(`✅ Seeded level: ${level.level_name}`)
    }

    // Seed CVC Words
    console.log('🔤 Seeding CVC words...')
    for (const word of cvcWords) {
      const wordRef = doc(db, 'cvc_words', word.word)
      await setDoc(wordRef, word)
    }
    console.log(`✅ Seeded ${cvcWords.length} CVC words`)

    // Seed Sight Words
    console.log('👀 Seeding sight words...')
    for (const sightWord of sightWords) {
      const wordRef = doc(db, 'sight_words', sightWord.word)
      await setDoc(wordRef, sightWord)
    }
    console.log(`✅ Seeded ${sightWords.length} sight words`)

    // Seed Badges
    console.log('🏅 Seeding badges...')
    for (const badge of badges) {
      const badgeRef = doc(db, 'badges', badge.badge_id)
      await setDoc(badgeRef, badge)
    }
    console.log(`✅ Seeded ${badges.length} badges`)

    // Seed Rewards
    console.log('🎁 Seeding rewards...')
    for (const reward of rewards) {
      const rewardRef = doc(db, 'rewards', reward.reward_id)
      await setDoc(rewardRef, reward)
    }
    console.log(`✅ Seeded ${rewards.length} rewards`)

    console.log('🎉 Firestore seeding completed successfully!')
    console.log('\nCollections seeded:')
    console.log('- reading_levels (3 levels)')
    console.log('- cvc_words (12 words)')
    console.log('- sight_words (20 words)')
    console.log('- badges (4 badges)')
    console.log('- rewards (3 rewards)')

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error)
    throw error
  }
}

// Check if data exists
export async function checkSeedingStatus() {
  console.log('🔍 Checking Firestore seeding status...')

  const checks = [
    { name: 'Reading Levels', docId: 'kindergarten', collection: 'reading_levels' },
    { name: 'CVC Words', docId: 'cat', collection: 'cvc_words' },
    { name: 'Sight Words', docId: 'a', collection: 'sight_words' },
    { name: 'Badges', docId: 'first_word', collection: 'badges' },
    { name: 'Rewards', docId: 'custom_avatar', collection: 'rewards' }
  ]

  for (const check of checks) {
    const docRef = doc(db, check.collection, check.docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log(`✅ ${check.name}: Data exists`)
    } else {
      console.log(`❌ ${check.name}: No data found`)
    }
  }
}

// Export for use in other modules
export default {
  seedFirestore,
  checkSeedingStatus,
  readingLevels,
  cvcWords,
  sightWords,
  badges,
  rewards
}
