import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import type { ComprehensionQuestionInput, ComprehensionAnswerResult } from '../types';

admin.initializeApp();

export const processComprehensionAnswer = functions.https.onCall(
  async (data: unknown, context: any): Promise<ComprehensionAnswerResult> => {
    const uid = validateAuth(context);
    
    const { 
      passageId, 
      questionId, 
      answer, 
      questionType,
      isCorrect
    } = validateInput<ComprehensionQuestionInput & { isCorrect: boolean }>(data, {
      passageId: 'string',
      questionId: 'string',
      answer: 'string',
      questionType: 'string',
      isCorrect: 'boolean'
    });

    const validQuestionTypes = ['literal', 'inferential', 'evaluative'];
    if (!validQuestionTypes.includes(questionType)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid question type. Must be one of: ${validQuestionTypes.join(', ')}`
      );
    }

    const progressRef = admin.firestore().doc(`users/${uid}/progress/comprehension`);
    const progressDoc = await progressRef.get();
    
    const currentProgress = progressDoc.exists ? progressDoc.data() : {
      passagesCompleted: 0,
      questionsAnswered: 0,
      accuracyByType: {
        literal: { correct: 0, total: 0 },
        inferential: { correct: 0, total: 0 },
        evaluative: { correct: 0, total: 0 }
      },
      currentLevel: 1,
      completedPassages: []
    };

    // Update accuracy by type
    currentProgress.accuracyByType[questionType].total += 1;
    if (isCorrect) {
      currentProgress.accuracyByType[questionType].correct += 1;
    }
    currentProgress.questionsAnswered += 1;

    // Check if passage is complete (all questions answered)
    // This would need to be tracked per passage
    const answerRecord = {
      passageId,
      questionId,
      questionType,
      answer,
      isCorrect,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Calculate overall accuracy
    const totalCorrect = Object.values(currentProgress.accuracyByType).reduce(
      (sum: number, type: any) => sum + type.correct, 
      0
    );
    const totalQuestions = Object.values(currentProgress.accuracyByType).reduce(
      (sum: number, type: any) => sum + type.total, 
      0
    );
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Determine level based on accuracy and question types
    let currentLevel = 1;
    const literalAccuracy = currentProgress.accuracyByType.literal.total > 0 
      ? currentProgress.accuracyByType.literal.correct / currentProgress.accuracyByType.literal.total 
      : 0;
    const inferentialAccuracy = currentProgress.accuracyByType.inferential.total > 0
      ? currentProgress.accuracyByType.inferential.correct / currentProgress.accuracyByType.inferential.total
      : 0;
    
    if (literalAccuracy >= 0.8 && inferentialAccuracy >= 0.7) {
      currentLevel = 3; // Advanced
    } else if (literalAccuracy >= 0.7) {
      currentLevel = 2; // Intermediate
    }

    currentProgress.currentLevel = currentLevel;

    // Update Firestore
    await progressRef.set({
      ...currentProgress,
      overallAccuracy,
      answers: admin.firestore.FieldValue.arrayUnion(answerRecord),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      isCorrect,
      accuracyByType: currentProgress.accuracyByType,
      overallAccuracy,
      currentLevel
    };
  }
);

export const completeComprehensionPassage = functions.https.onCall(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { passageId, score, totalQuestions } = validateInput<{ passageId: string; score: number; totalQuestions: number }>(data, {
      passageId: 'string',
      score: 'number',
      totalQuestions: 'number'
    });

    const progressRef = admin.firestore().doc(`users/${uid}/progress/comprehension`);
    
    await progressRef.update({
      passagesCompleted: admin.firestore.FieldValue.increment(1),
      completedPassages: admin.firestore.FieldValue.arrayUnion({
        passageId,
        score,
        totalQuestions,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      }),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  }
);

export const getComprehensionProgress = functions.https.onCall(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const progressRef = admin.firestore().doc(`users/${uid}/progress/comprehension`);
    const progressDoc = await progressRef.get();
    
    if (!progressDoc.exists) {
      return {
        passagesCompleted: 0,
        questionsAnswered: 0,
        accuracyByType: {
          literal: { correct: 0, total: 0 },
          inferential: { correct: 0, total: 0 },
          evaluative: { correct: 0, total: 0 }
        },
        currentLevel: 1,
        completedPassages: []
      };
    }
    
    return progressDoc.data();
  }
);
