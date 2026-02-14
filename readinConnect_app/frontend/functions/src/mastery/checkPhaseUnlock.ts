import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth } from '../utils/validation';
import { PHASE_DATA } from '../utils/scoring';
import type { PhaseAccessResult } from '../types';

export const checkPhaseUnlock = functions.https.onCall(
  async (data: unknown, context: any): Promise<PhaseAccessResult> => {
    const uid = validateAuth(context);
    
    const { phaseId } = data as { phaseId?: number };
    
    if (!phaseId || phaseId < 1 || phaseId > 6) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid phase ID (must be 1-6)'
      );
    }
    
    const progressDoc = await admin.firestore().doc(`users/${uid}/progress/phonics`).get();
    
    if (!progressDoc.exists) {
      return {
        canAccess: phaseId === 1,
        reason: phaseId === 1 ? 'Starting at phase 1' : 'No progress found'
      };
    }
    
    const progress = progressDoc.data() || {};
    const currentPhase = progress.currentPhase || 1;
    
    if (phaseId <= currentPhase) {
      return { canAccess: true };
    }
    
    const previousPhaseData = PHASE_DATA.find((p) => p.id === phaseId);
    const previousPhaseProgress = progress.phases?.[phaseId - 2];
    
    if (!previousPhaseProgress) {
      return {
        canAccess: false,
        reason: 'Previous phase progress not found'
      };
    }
    
    const masteredCount = previousPhaseProgress.masteredCount || 0;
    const threshold = previousPhaseData?.masteryThreshold || 2;
    
    if (masteredCount >= threshold) {
      const unlockedPhase = await unlockNextPhase(uid, phaseId);
      return { canAccess: true };
    }
    
    return {
      canAccess: false,
      reason: `Master ${threshold - masteredCount} more letters to unlock Phase ${phaseId}`
    };
  }
);

async function unlockNextPhase(uid: string, phaseId: number): Promise<void> {
  await admin.firestore().doc(`users/${uid}/progress/phonics`).update({
    currentPhase: phaseId
  });
}
