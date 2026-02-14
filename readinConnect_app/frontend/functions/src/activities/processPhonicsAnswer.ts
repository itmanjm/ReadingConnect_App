import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import { calculateMasteryDelta, PHASE_DATA } from '../utils/scoring';
import { getUserMasteryDoc, updateLetterMastery, createLetterMastery } from '../utils/firestore';
import type { PhonicsAnswerInput, PhonicsAnswerResult, PhaseAccessResult } from '../types';

interface PhonicsAnswerData extends PhonicsAnswerInput {
  timestamp?: number;
}

export const processPhonicsAnswer = functions.https.onCall(
  async (data: unknown, context: any): Promise<PhonicsAnswerResult> => {
    const uid = validateAuth(context);
    
    const { letter, selectedSound, phaseId } = validateInput<PhonicsAnswerData>(data, {
      letter: 'string',
      selectedSound: 'string',
      phaseId: 'number'
    });

    if (!phaseId || phaseId < 1 || phaseId > 6) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid phase ID'
      );
    }

    const phaseData = PHASE_DATA.find((p) => p.id === phaseId);
    if (!phaseData) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Phase ${phaseId} not found`
      );
    }

    const accessResult = await verifyPhaseAccess(uid, phaseId);
    if (!accessResult.canAccess) {
      throw new functions.https.HttpsError(
        'permission-denied',
        accessResult.reason || 'Phase not unlocked'
      );
    }

    const correctSound = getCorrectSoundForLetter(letter);
    const isCorrect = selectedSound === correctSound;

    const masteryDoc = await getUserMasteryDoc(uid);
    const currentMastery = masteryDoc?.letters?.[letter] || createLetterMastery(letter, phaseId, 'new');
    
    const masteryResult = calculateMasteryDelta(letter, isCorrect, currentMastery, phaseId);
    const newMastery = updateLetterMastery(currentMastery, isCorrect);
    
    let phaseUnlocked: number | undefined;
    
    await admin.firestore().runTransaction(async (transaction) => {
      const userProgressRef = admin.firestore().doc(`users/${uid}/progress/phonics`);
      
      transaction.set(userProgressRef, {
        [`letters.${letter}`]: {
          ...newMastery,
          ...masteryResult,
          masteredAt: masteryResult.newStatus === 'mastered' ? admin.firestore.FieldValue.serverTimestamp() : newMastery.masteredAt
        },
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      const currentPhase = phaseId;
      const phases = masteryDoc?.phases || [];
      const currentPhaseProgress = phases[currentPhase - 1];
      const newMasteredCount = masteryResult.newStatus === 'mastered' 
        ? (currentPhaseProgress?.masteredCount || 0) + 1 
        : currentPhaseProgress?.masteredCount || 0;
      
      if (newMasteredCount >= (phaseData.masteryThreshold || 2)) {
        phaseUnlocked = phaseId + 1;
        transaction.set(userProgressRef, {
          [`phases.${currentPhase - 1}.completedAt`]: admin.firestore.FieldValue.serverTimestamp(),
          currentPhase: Math.max(masteryDoc?.currentPhase || 1, currentPhase + 1)
        }, { merge: true });
      }
    });

    return {
      isCorrect,
      masteryLevel: masteryResult.newStatus === 'mastered' ? 5 : masteryResult.newStatus === 'learning' ? 3 : 1,
      newStatus: masteryResult.newStatus,
      achievements: [],
      phaseUnlocked
    };
  }
);

async function verifyPhaseAccess(uid: string, phaseId: number): Promise<PhaseAccessResult> {
  const progressDoc = await admin.firestore().doc(`users/${uid}/progress/phonics`).get();
  
  if (!progressDoc.exists) {
    return { canAccess: phaseId === 1, reason: 'Starting at phase 1' };
  }
  
  const progress = progressDoc.data() || {};
  const currentPhase = progress.currentPhase || 1;
  
  if (phaseId <= currentPhase) {
    return { canAccess: true };
  }
  
  const previousPhaseProgress = progress.phases?.[phaseId - 1];
  if (!previousPhaseProgress) {
    return { canAccess: false, reason: 'Previous phase not found' };
  }
  
  const masteredCount = previousPhaseProgress.masteredCount || 0;
  const threshold = PHASE_DATA.find((p) => p.id === phaseId)?.masteryThreshold || 2;
  
  if (masteredCount >= threshold) {
    return { canAccess: true };
  }
  
  return {
    canAccess: false,
    reason: `Master ${threshold - masteredCount} more letters to unlock Phase ${phaseId}`
  };
}

function getCorrectSoundForLetter(letter: string): string {
  const soundMap: Record<string, string> = {
    'S': 's',
    'A': 'a_short',
    'T': 't',
    'P': 'p',
    'I': 'i_short',
    'N': 'n',
    'M': 'm',
    'D': 'd',
    'G': 'g',
    'O': 'o_short',
    'K': 'k',
    'E': 'e_short',
    'R': 'r',
    'B': 'b',
    'F': 'f',
    'L': 'l',
    'H': 'h',
    'U': 'u_short',
    'CH': 'ch',
    'SH': 'sh',
    'TH': 'th_unvoiced',
    'NG': 'ng',
    'WH': 'wh'
  };
  
  return soundMap[letter.toUpperCase()] || letter.toLowerCase();
}
