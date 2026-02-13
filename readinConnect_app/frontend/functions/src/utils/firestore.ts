import * as admin from 'firebase-admin';

const db = admin.firestore();

export const getDoc = async (collection: string, docId: string) => {
  const doc = await db.collection(collection).doc(docId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

export const setDoc = async (collection: string, docId: string, data: any) => {
  await db.collection(collection).doc(docId).set({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
};

export const updateDoc = async (collection: string, docId: string, data: any) => {
  await db.collection(collection).doc(docId).update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
};

export const runTransaction = async <T>(
  updateFn: (transaction: admin.firestore.Transaction) => Promise<T>
): Promise<T> => {
  return db.runTransaction(updateFn);
};

export const getUserProgress = async (userId: string) => {
  return getDoc(`users/${userId}/progress/main`, 'phonics');
};

export const updateUserProgress = async (userId: string, updates: any) => {
  await updateDoc(`users/${userId}/progress`, 'phonics', updates);
};

export const getUserMasteryDoc = async (userId: string) => {
  return getDoc(`users/${userId}/progress`, 'phonics');
};

export const createLetterMastery = (
  letter: string,
  phaseId: number,
  status: 'new' | 'learning' | 'mastered' = 'new'
) => ({
  letter,
  phase: phaseId,
  status,
  consecutiveCorrect: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
  regressionCount: 0
});

export const updateLetterMastery = (
  mastery: any,
  isCorrect: boolean
): any => ({
  ...mastery,
  totalAttempts: admin.firestore.FieldValue.increment(1),
  correctAttempts: isCorrect ? admin.firestore.FieldValue.increment(1) : mastery.correctAttempts,
  consecutiveCorrect: isCorrect ? admin.firestore.FieldValue.increment(1) : 0,
  lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
  ...(isCorrect && {
    masteredAt: mastery.status === 'mastered' ? mastery.masteredAt : admin.firestore.FieldValue.serverTimestamp()
  })
});
