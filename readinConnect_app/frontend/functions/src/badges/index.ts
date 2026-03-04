import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import { onCallWithCors } from '../utils/cors';

// Badge definitions
const BADGE_DEFINITIONS: Record<string, {
  name: string;
  description: string;
  category: string;
  requirement: {
    type: string;
    activityType?: string;
    value: number;
  };
  points: number;
}> = {
  // Mastery badges
  'phonics-master': {
    name: 'Phonics Master',
    description: 'Master all phonics phases',
    category: 'mastery',
    requirement: { type: 'phase_complete', activityType: 'phonics', value: 6 },
    points: 100
  },
  'sight-words-master': {
    name: 'Sight Words Master',
    description: 'Master all sight word levels',
    category: 'mastery',
    requirement: { type: 'level_complete', activityType: 'sight_words', value: 4 },
    points: 100
  },
  'fluency-master': {
    name: 'Fluency Master',
    description: 'Achieve 90+ WPM',
    category: 'mastery',
    requirement: { type: 'wpm_threshold', activityType: 'fluency', value: 90 },
    points: 150
  },
  'comprehension-master': {
    name: 'Comprehension Master',
    description: 'Achieve 90% accuracy in comprehension',
    category: 'mastery',
    requirement: { type: 'accuracy_threshold', activityType: 'comprehension', value: 90 },
    points: 150
  },
  
  // Streak badges
  'week-streak': {
    name: 'Week Warrior',
    description: '7 day learning streak',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
    points: 50
  },
  'month-streak': {
    name: 'Monthly Master',
    description: '30 day learning streak',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
    points: 200
  },
  
  // Activity badges
  'first-activity': {
    name: 'First Steps',
    description: 'Complete your first activity',
    category: 'activity',
    requirement: { type: 'activity_count', value: 1 },
    points: 10
  },
  'activity-enthusiast': {
    name: 'Activity Enthusiast',
    description: 'Complete 50 activities',
    category: 'activity',
    requirement: { type: 'activity_count', value: 50 },
    points: 100
  },
  'activity-champion': {
    name: 'Activity Champion',
    description: 'Complete 100 activities',
    category: 'activity',
    requirement: { type: 'activity_count', value: 100 },
    points: 250
  }
};

async function awardBadgeInternal(uid: string, badgeId: string): Promise<{ success: boolean; badge?: any; points?: number; reason?: string }> {
  if (!BADGE_DEFINITIONS[badgeId]) {
    return { success: false, reason: `Badge ${badgeId} does not exist` };
  }

  const badgeDef = BADGE_DEFINITIONS[badgeId];
  
  const earnedBadgeRef = admin.firestore()
    .collection('users')
    .doc(uid)
    .collection('earned_badges')
    .doc(badgeId);
  
  const earnedBadgeDoc = await earnedBadgeRef.get();
  if (earnedBadgeDoc.exists) {
    return { success: false, reason: 'Badge already earned' };
  }

  await earnedBadgeRef.set({
      badgeId,
      earnedAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: uid,
      ...badgeDef
    });

    // Update user points
    const userRef = admin.firestore().doc(`users/${uid}`);
    await userRef.update({
      totalPoints: admin.firestore.FieldValue.increment(badgeDef.points),
      [`badges.${badgeId}`]: {
        earnedAt: admin.firestore.FieldValue.serverTimestamp(),
        points: badgeDef.points
      }
    });

    return {
      success: true,
      badge: badgeDef,
      points: badgeDef.points
    };
}

export const awardBadge = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);

    const { badgeId } = validateInput<{ badgeId: string }>(data, {
      badgeId: 'string'
    });

    return awardBadgeInternal(uid, badgeId);
  }
);

async function checkAchievementsInternal(uid: string, activityType: string, metric: string, value: number): Promise<{ earnedBadges: string[]; totalEarned: number }> {
  const earnedBadges: string[] = [];

  // Check each badge definition
  for (const [badgeId, badgeDef] of Object.entries(BADGE_DEFINITIONS)) {
    const requirement = badgeDef.requirement;
    
    // Check if badge matches the activity type and metric
    if (requirement.activityType === activityType && requirement.type === metric) {
      if (value >= requirement.value) {
        // Try to award badge
        try {
          const result = await awardBadgeInternal(uid, badgeId);
          if (result.success) {
            earnedBadges.push(badgeId);
          }
        } catch (error) {
          console.error(`Error awarding badge ${badgeId}:`, error);
        }
      }
    }
  }

  return {
    earnedBadges,
    totalEarned: earnedBadges.length
  };
}

export const checkAchievements = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);

    const { activityType, metric, value } = validateInput<{
      activityType: string;
      metric: string;
      value: number;
    }>(data, {
      activityType: 'string',
      metric: 'string',
      value: 'number'
    });

    return checkAchievementsInternal(uid, activityType, metric, value);
  }
);

export const getUserBadges = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);

    const badgesSnapshot = await admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('earned_badges')
      .orderBy('earnedAt', 'desc')
      .get();

    const badges = badgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate progress to next badges
    const userRef = admin.firestore().doc(`users/${uid}`);
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};

    const progressToNext = Object.entries(BADGE_DEFINITIONS)
      .filter(([badgeId]) => !badges.find(b => b.id === badgeId))
      .map(([badgeId, badgeDef]) => ({
        badgeId,
        badge: badgeDef,
        progress: calculateProgress(userData, badgeDef),
        required: badgeDef.requirement.value
      }))
      .filter(item => item.progress > 0)
      .sort((a, b) => (b.progress / b.required) - (a.progress / a.required))
      .slice(0, 3);

    return {
      badges,
      totalPoints: userData.totalPoints || 0,
      progressToNext
    };
  }
);

function calculateProgress(userData: any, badgeDef: any): number {
  const req = badgeDef.requirement;
  
  switch (req.type) {
    case 'activity_count':
      return userData.totalActivities || 0;
    case 'streak':
      return userData.currentStreak || 0;
    case 'phase_complete':
      return userData.phonics?.currentPhase || 1;
    case 'level_complete':
      return userData.sightWords?.masteredLevels || 0;
    case 'wpm_threshold':
      return userData.fluency?.currentWpm || 0;
    case 'accuracy_threshold':
      return userData.comprehension?.overallAccuracy || 0;
    default:
      return 0;
  }
}

export const trackActivity = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);

    const { activityType, score, duration } = validateInput<{
      activityType: string;
      score: number;
      duration: number;
    }>(data, {
      activityType: 'string',
      score: 'number',
      duration: 'number'
    });

    const userRef = admin.firestore().doc(`users/${uid}`);

    // Update activity count
    await userRef.update({
      totalActivities: admin.firestore.FieldValue.increment(1),
      [`activityStats.${activityType}.count`]: admin.firestore.FieldValue.increment(1),
      [`activityStats.${activityType}.totalScore`]: admin.firestore.FieldValue.increment(score),
      [`activityStats.${activityType}.totalDuration`]: admin.firestore.FieldValue.increment(duration),
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Check for activity-based badges
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};
    const totalActivities = userData.totalActivities || 1;

    const achievementResult = await checkAchievementsInternal(
      uid,
      activityType,
      'activity_count',
      totalActivities
    );

    return {
      success: true,
      totalActivities,
      newBadges: achievementResult.earnedBadges
    };
  }
);
