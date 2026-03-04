import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import { onCallWithCors } from '../utils/cors';

export const createObservationSheet = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { studentId, notes, skills } = data as {
      studentId: string;
      notes: string;
      skills?: Record<string, { observed: boolean; level: number; notes?: string }>;
    };

    // Verify teacher has access to this student
    const teacherRef = admin.firestore().doc(`users/${uid}`);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists || teacherDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    // Create observation sheet
    const observationRef = admin.firestore().collection('observation_sheets').doc();
    await observationRef.set({
      id: observationRef.id,
      teacherId: uid,
      studentId,
      notes,
      skills: skills || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      observationId: observationRef.id
    };
  }
);

export const updateObservationSheet = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { observationId, notes, skills } = data as {
      observationId: string;
      notes?: string;
      skills?: Record<string, { observed: boolean; level: number; notes?: string }>;
    };

    // Get observation sheet
    const observationRef = admin.firestore().doc(`observation_sheets/${observationId}`);
    const observationDoc = await observationRef.get();

    if (!observationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Observation sheet not found');
    }

    const observationData = observationDoc.data();
    if (observationData?.teacherId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to update this observation');
    }

    // Update observation
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    if (notes !== undefined) updateData.notes = notes;
    if (skills !== undefined) updateData.skills = skills;

    await observationRef.update(updateData);

    return { success: true };
  }
);

export const getObservationSheets = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { studentId } = data as { studentId?: string };

    // Build query
    let query: admin.firestore.Query = admin.firestore().collection('observation_sheets');
    query = query.where('teacherId', '==', uid);
    
    if (studentId) {
      query = query.where('studentId', '==', studentId);
    }

    const sheetsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .get();

    const sheets = sheetsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { sheets };
  }
);
