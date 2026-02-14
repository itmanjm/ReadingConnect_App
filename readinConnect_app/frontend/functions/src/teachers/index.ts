import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';

export const getTeacherStudents = functions.https.onCall(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    // Get teacher's profile to verify role
    const teacherRef = admin.firestore().doc(`users/${uid}`);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Teacher not found');
    }
    
    const teacherData = teacherDoc.data();
    if (teacherData?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'User is not a teacher');
    }

    // Get all students linked to this teacher
    const studentsSnapshot = await admin.firestore()
      .collection('users')
      .where('teacherId', '==', uid)
      .where('role', '==', 'student')
      .get();

    const students = await Promise.all(
      studentsSnapshot.docs.map(async (doc) => {
        const studentData = doc.data();
        
        // Get student's progress summary
        const progressSummary = await getStudentProgressSummary(doc.id);
        
        return {
          id: doc.id,
          ...studentData,
          progress: progressSummary
        };
      })
    );

    return { students };
  }
);

async function getStudentProgressSummary(studentId: string) {
  const summary: any = {
    phonics: { currentPhase: 1 },
    sightWords: { totalMastered: 0, currentLevel: 'pre-primer' },
    fluency: { currentWpm: 0, currentAccuracy: 0 },
    comprehension: { passagesCompleted: 0, overallAccuracy: 0 },
    totalPoints: 0,
    badges: 0
  };

  try {
    // Get phonics progress
    const phonicsDoc = await admin.firestore().doc(`users/${studentId}/progress/phonics`).get();
    if (phonicsDoc.exists) {
      const phonicsData = phonicsDoc.data();
      summary.phonics.currentPhase = phonicsData?.currentPhase || 1;
    }

    // Get sight words progress
    const sightWordsDoc = await admin.firestore().doc(`users/${studentId}/progress/sight-words`).get();
    if (sightWordsDoc.exists) {
      const sightWordsData = sightWordsDoc.data();
      summary.sightWords.totalMastered = sightWordsData?.totalMastered || 0;
      summary.sightWords.currentLevel = sightWordsData?.currentLevel || 'pre-primer';
    }

    // Get fluency progress
    const fluencyDoc = await admin.firestore().doc(`users/${studentId}/progress/fluency`).get();
    if (fluencyDoc.exists) {
      const fluencyData = fluencyDoc.data();
      summary.fluency.currentWpm = fluencyData?.currentWpm || 0;
      summary.fluency.currentAccuracy = fluencyData?.currentAccuracy || 0;
    }

    // Get comprehension progress
    const comprehensionDoc = await admin.firestore().doc(`users/${studentId}/progress/comprehension`).get();
    if (comprehensionDoc.exists) {
      const comprehensionData = comprehensionDoc.data();
      summary.comprehension.passagesCompleted = comprehensionData?.passagesCompleted || 0;
      summary.comprehension.overallAccuracy = comprehensionData?.overallAccuracy || 0;
    }

    // Get badges count
    const badgesSnapshot = await admin.firestore()
      .collection(`users/${studentId}/earned_badges`)
      .get();
    summary.badges = badgesSnapshot.size;

    // Get total points
    const userDoc = await admin.firestore().doc(`users/${studentId}`).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      summary.totalPoints = userData?.totalPoints || 0;
    }

  } catch (error) {
    console.error(`Error getting progress summary for student ${studentId}:`, error);
  }

  return summary;
}

export const getStudentDetailedProgress = functions.https.onCall(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { studentId } = validateInput<{ studentId: string }>(data, {
      studentId: 'string'
    });

    // Verify teacher has access to this student
    const teacherRef = admin.firestore().doc(`users/${uid}`);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists || teacherDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    // Get student info
    const studentRef = admin.firestore().doc(`users/${studentId}`);
    const studentDoc = await studentRef.get();
    
    if (!studentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Student not found');
    }

    const studentData = studentDoc.data();
    if (studentData?.teacherId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Student not assigned to this teacher');
    }

    // Get detailed progress for all activities
    const progress = await getStudentProgressSummary(studentId);
    
    // Get recent activity sessions
    const recentActivity = await getRecentActivity(studentId);

    return {
      student: {
        id: studentId,
        ...studentData
      },
      progress,
      recentActivity
    };
  }
);

async function getRecentActivity(studentId: string, limitCount: number = 10) {
  const activities: any[] = [];

  try {
    // Get recent phonics activity
    const phonicsDoc = await admin.firestore().doc(`users/${studentId}/progress/phonics`).get();
    if (phonicsDoc.exists) {
      const phonicsData = phonicsDoc.data();
      if (phonicsData?.lastUpdated) {
        activities.push({
          type: 'phonics',
          timestamp: phonicsData.lastUpdated,
          phase: phonicsData.currentPhase
        });
      }
    }

    // Get recent sight words activity
    const sightWordsDoc = await admin.firestore().doc(`users/${studentId}/progress/sight-words`).get();
    if (sightWordsDoc.exists) {
      const sightWordsData = sightWordsDoc.data();
      if (sightWordsData?.lastUpdated) {
        activities.push({
          type: 'sight-words',
          timestamp: sightWordsData.lastUpdated,
          level: sightWordsData.currentLevel
        });
      }
    }

    // Get recent fluency sessions
    const fluencyDoc = await admin.firestore().doc(`users/${studentId}/progress/fluency`).get();
    if (fluencyDoc.exists) {
      const fluencyData = fluencyDoc.data();
      if (fluencyData?.sessions && Array.isArray(fluencyData.sessions)) {
        const recentSessions = fluencyData.sessions.slice(-5);
        recentSessions.forEach((session: any) => {
          activities.push({
            type: 'fluency',
            timestamp: session.timestamp,
            wpm: session.wpm,
            accuracy: session.accuracy
          });
        });
      }
    }

    // Get recent comprehension activity
    const comprehensionDoc = await admin.firestore().doc(`users/${studentId}/progress/comprehension`).get();
    if (comprehensionDoc.exists) {
      const comprehensionData = comprehensionDoc.data();
      if (comprehensionData?.completedPassages && Array.isArray(comprehensionData.completedPassages)) {
        const recentPassages = comprehensionData.completedPassages.slice(-5);
        recentPassages.forEach((passage: any) => {
          activities.push({
            type: 'comprehension',
            timestamp: passage.completedAt,
            score: passage.score,
            totalQuestions: passage.totalQuestions
          });
        });
      }
    }

    // Sort by timestamp descending
    activities.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return activities.slice(0, limitCount);

  } catch (error) {
    console.error(`Error getting recent activity for student ${studentId}:`, error);
    return [];
  }
}

export const assignStudentToTeacher = functions.https.onCall(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { studentEmail } = validateInput<{ studentEmail: string }>(data, {
      studentEmail: 'string'
    });

    // Verify user is a teacher
    const teacherRef = admin.firestore().doc(`users/${uid}`);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists || teacherDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    // Find student by email
    const studentsSnapshot = await admin.firestore()
      .collection('users')
      .where('email', '==', studentEmail)
      .where('role', '==', 'student')
      .get();

    if (studentsSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'Student not found');
    }

    const studentDoc = studentsSnapshot.docs[0];
    const studentId = studentDoc.id;

    // Update student with teacher assignment
    await admin.firestore().doc(`users/${studentId}`).update({
      teacherId: uid,
      assignedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      studentId,
      studentEmail
    };
  }
);
