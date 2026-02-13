const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": "readingconnect-lit",
  "private_key": process.env.FIREBASE_ADMIN_PRIVATE_KEY
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const badges = [
  {
    badge_id: 'word_explorer',
    name: 'Word Explorer',
    description: 'Learn 10 words',
    icon: '📖',
    category: 'mastery',
    requirement: { type: 'words_learned', value: 10 },
    points: 50,
    rarity: 'common',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'word_wizard',
    name: 'Word Wizard',
    description: 'Learn 50 words',
    icon: '🧙',
    category: 'mastery',
    requirement: { type: 'words_learned', value: 50 },
    points: 200,
    rarity: 'rare',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'master_reader',
    name: 'Master Reader',
    description: 'Learn 100 words',
    icon: '👑',
    category: 'mastery',
    requirement: { type: 'words_learned', value: 100 },
    points: 500,
    rarity: 'epic',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first activity',
    icon: '👣',
    category: 'activity',
    requirement: { type: 'activities_completed', value: 1 },
    points: 25,
    rarity: 'common',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'activity_ace',
    name: 'Activity Ace',
    description: 'Complete 10 activities',
    icon: '🎯',
    category: 'activity',
    requirement: { type: 'activities_completed', value: 10 },
    points: 100,
    rarity: 'common',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'super_star',
    name: 'Super Star',
    description: 'Complete 50 activities',
    icon: '⭐',
    category: 'activity',
    requirement: { type: 'activities_completed', value: 50 },
    points: 300,
    rarity: 'rare',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak_days', value: 7 },
    points: 100,
    rarity: 'rare',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '📅',
    category: 'streak',
    requirement: { type: 'streak_days', value: 30 },
    points: 500,
    rarity: 'epic',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'level_complete',
    name: 'Level Complete',
    description: 'Complete your current reading level',
    icon: '🏆',
    category: 'level',
    requirement: { type: 'level_completed', value: 1 },
    points: 300,
    rarity: 'epic',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    badge_id: 'word_master_badge',
    name: 'Word Master',
    description: 'Master 25 words (80%+ accuracy)',
    icon: '🎓',
    category: 'mastery',
    requirement: { type: 'words_mastered', value: 25 },
    points: 150,
    rarity: 'rare',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedBadges() {
  console.log('🏅 Seeding badges...');
  
  try {
    const batch = db.batch();
    
    badges.forEach(badge => {
      const ref = db.collection('badges').doc(badge.badge_id);
      batch.set(ref, badge);
    });
    
    await batch.commit();
    
    console.log('✅ Badges seeded successfully');
    console.log(`📊 Total badges: ${badges.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
}

seedBadges();
