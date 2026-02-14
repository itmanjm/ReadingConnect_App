import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import type { FluencySessionInput, FluencySessionResult } from '../types';

admin.initializeApp();

// Age-appropriate WPM benchmarks
const WPM_BENCHMARKS: Record<number, { target: number; excellent: number }> = {
  4: { target: 20, excellent: 40 },
  5: { target: 30, excellent: 60 },
  6: { target: 50, excellent: 90 },
  7: { target: 70, excellent: 110 },
  8: { target: 90, excellent: 130 }
};

export const processFluencySession = functions.https.onCall(
  async (data: unknown, context: any): Promise<FluencySessionResult> => {
    const uid = validateAuth(context);
    
    const { 
      passageId, 
      words, 
      correctWords, 
      timeSeconds, 
      ageGroup 
    } = validateInput<FluencySessionInput>(data, {
      passageId: 'string',
      words: 'number',
      correctWords: 'number',
      timeSeconds: 'number',
      ageGroup: 'number'
    });

    // Calculate WPM
    const minutes = timeSeconds / 60;
    const wpm = Math.round(words / minutes);
    
    // Calculate accuracy
    const accuracy = Math.round((correctWords / words) * 100);
    
    // Get benchmark for age group
    const benchmark = WPM_BENCHMARKS[ageGroup] || WPM_BENCHMARKS[6];
    
    // Determine if this is an improvement
    const progressRef = admin.firestore().doc(`users/${uid}/progress/fluency`);
    const progressDoc = await progressRef.get();
    
    let isImprovement = false;
    let previousWpm: number | undefined;
    
    if (progressDoc.exists) {
      const progress = progressDoc.data();
      previousWpm = progress?.currentWpm;
      if (previousWpm && wpm > previousWpm) {
        isImprovement = true;
      }
    }
    
    // Calculate level based on WPM
    let currentLevel = 1;
    if (wpm >= benchmark.excellent) {
      currentLevel = 3; // Advanced
    } else if (wpm >= benchmark.target) {
      currentLevel = 2; // Intermediate
    }
    
    // Update progress
    const sessionData = {
      passageId,
      wpm,
      accuracy,
      timeSeconds,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      words,
      correctWords
    };
    
    await progressRef.set({
      currentWpm: wpm,
      currentAccuracy: accuracy,
      currentLevel,
      totalSessions: admin.firestore.FieldValue.increment(1),
      sessions: admin.firestore.FieldValue.arrayUnion(sessionData),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return {
      wpm,
      accuracy,
      isImprovement,
      previousWpm,
      currentLevel
    };
  }
);

export const getFluencyProgress = functions.https.onCall(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const progressRef = admin.firestore().doc(`users/${uid}/progress/fluency`);
    const progressDoc = await progressRef.get();
    
    if (!progressDoc.exists) {
      return {
        currentWpm: 0,
        currentAccuracy: 0,
        currentLevel: 1,
        totalSessions: 0,
        sessions: []
      };
    }
    
    return progressDoc.data();
  }
);
