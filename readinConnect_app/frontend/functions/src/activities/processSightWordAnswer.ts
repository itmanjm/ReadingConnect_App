import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import type { SightWordAnswerInput, SightWordAnswerResult } from '../types';

const SIGHT_WORD_LEVELS = ['pre-primer', 'primer', 'grade-1', 'grade-2'] as const;

const MASTERY_THRESHOLD = 3; // Consecutive correct to master

export const processSightWordAnswer = functions.https.onCall(
  async (data: unknown, context: any): Promise<SightWordAnswerResult> => {
    const uid = validateAuth(context);
    
    const { word, level, isCorrect } = validateInput<{ word: string; level: string; isCorrect: boolean }>(data, {
      word: 'string',
      level: 'string',
      isCorrect: 'boolean'
    });

    if (!SIGHT_WORD_LEVELS.includes(level as any)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid level. Must be one of: ${SIGHT_WORD_LEVELS.join(', ')}`
      );
    }

    const progressRef = admin.firestore().doc(`users/${uid}/progress/sight-words`);
    const progressDoc = await progressRef.get();
    
    const currentProgress = progressDoc.exists ? progressDoc.data() : {
      masteredWords: {
        'pre-primer': [],
        'primer': [],
        'grade-1': [],
        'grade-2': []
      },
      currentLevel: 'pre-primer',
      totalMastered: 0,
      wordProgress: {}
    };

    const wordProgress = currentProgress.wordProgress?.[word] || {
      word,
      level,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      status: 'new',
      lastAttemptAt: null
    };

    // Update progress
    wordProgress.totalAttempts += 1;
    if (isCorrect) {
      wordProgress.correctAttempts += 1;
      wordProgress.consecutiveCorrect += 1;
    } else {
      wordProgress.consecutiveCorrect = 0;
    }
    wordProgress.lastAttemptAt = admin.firestore.FieldValue.serverTimestamp();

    // Check for mastery
    let isMastered = false;
    let newLevelUnlocked = false;
    
    if (wordProgress.consecutiveCorrect >= MASTERY_THRESHOLD && currentProgress.masteredWords && !currentProgress.masteredWords[level].includes(word)) {
      isMastered = true;
      wordProgress.status = 'mastered';
      
      // Add to mastered words
      currentProgress.masteredWords[level].push(word);
      currentProgress.totalMastered += 1;
      
      // Check if level is complete (mastered 80% of words)
      const totalWordsInLevel = getTotalWordsInLevel(level);
      const masteryPercentage = currentProgress.masteredWords[level]?.length / totalWordsInLevel;
      
      if (masteryPercentage >= 0.8) {
        const nextLevelIndex = SIGHT_WORD_LEVELS.indexOf(level as any) + 1;
        if (nextLevelIndex < SIGHT_WORD_LEVELS.length) {
          const nextLevel = SIGHT_WORD_LEVELS[nextLevelIndex];
          if (currentProgress.currentLevel === level) {
            currentProgress.currentLevel = nextLevel;
            newLevelUnlocked = true;
          }
        }
      }
    } else if (wordProgress.consecutiveCorrect >= 1) {
      wordProgress.status = 'learning';
    }

    // Update Firestore
    await progressRef.set({
      ...currentProgress,
      wordProgress: {
        ...currentProgress.wordProgress,
        [word]: wordProgress
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      isCorrect,
      isMastered,
      consecutiveCorrect: wordProgress.consecutiveCorrect,
      totalAttempts: wordProgress.totalAttempts,
      newLevelUnlocked,
      achievements: []
    };
  }
);

function getTotalWordsInLevel(level: string): number {
  const levelWordCounts: Record<string, number> = {
    'pre-primer': 40,
    'primer': 52,
    'grade-1': 41,
    'grade-2': 46
  };
  return levelWordCounts[level] || 40;
}

export const getSightWordProgress = functions.https.onCall(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const progressRef = admin.firestore().doc(`users/${uid}/progress/sight-words`);
    const progressDoc = await progressRef.get();
    
    if (!progressDoc.exists) {
      return {
        masteredWords: {
          'pre-primer': [],
          'primer': [],
          'grade-1': [],
          'grade-2': []
        },
        currentLevel: 'pre-primer',
        totalMastered: 0,
        wordProgress: {}
      };
    }
    
    return progressDoc.data();
  }
);
