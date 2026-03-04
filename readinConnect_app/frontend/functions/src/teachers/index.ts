import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import { onCallWithCors } from '../utils/cors';

export const getTeacherStudents = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const teacherRef = admin.firestore().doc(`users/${uid}`);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Teacher not found');
    }
    
    const teacherData = teacherDoc.data();
    if (teacherData?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'User is not a teacher');
    }

    const studentsSnapshot = await admin.firestore()
      .collection('users')
      .where('teacherId', '==', uid)
      .where('role', '==', 'student')
      .get();

    const students = await Promise.all(
      studentsSnapshot.docs.map(async (doc) => {
        const studentData = doc.data();
        
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
    const phonicsDoc = await admin.firestore().doc(`users/${studentId}/progress/phonics`).get();
    if (phonicsDoc.exists) {
      const phonicsData = phonicsDoc.data();
      summary.phonics.currentPhase = phonicsData?.currentPhase || 1;
    }

    const sightWordsDoc = await admin.firestore().doc(`users/${studentId}/progress/sight-words`).get();
    if (sightWordsDoc.exists) {
      const sightWordsData = sightWordsDoc.data();
      summary.sightWords.totalMastered = sightWordsData?.totalMastered || 0;
      summary.sightWords.currentLevel = sightWordsData?.currentLevel || 'pre-primer';
    }

    const fluencyDoc = await admin.firestore().doc(`users/${studentId}/progress/fluency`).get();
    if (fluencyDoc.exists) {
      const fluencyData = fluencyDoc.data();
      summary.fluency.currentWpm = fluencyData?.currentWpm || 0;
      summary.fluency.currentAccuracy = fluencyData?.currentAccuracy || 0;
    }

    const comprehensionDoc = await admin.firestore().doc(`users/${studentId}/progress/comprehension`).get();
    if (comprehensionDoc.exists) {
      const comprehensionData = comprehensionDoc.data();
      summary.comprehension.passagesCompleted = comprehensionData?.passagesCompleted || 0;
      summary.comprehension.overallAccuracy = comprehensionData?.overallAccuracy || 0;
    }

    const badgesSnapshot = await admin.firestore()
      .collection(`users/${studentId}/earned_badges`)
      .get();
    summary.badges = badgesSnapshot.size;

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

export const getStudentDetailedProgress = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { studentId } = validateInput<{ studentId: string }>(data, {
      studentId: 'string'
    });

    const teacherRef = admin.firestore().doc(`users/${uid}`);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists || teacherDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    const studentRef = admin.firestore().doc(`users/${studentId}`);
    const studentDoc = await studentRef.get();
    
    if (!studentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Student not found');
    }

    const studentData = studentDoc.data();
    if (studentData?.teacherId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Student not assigned to this teacher');
    }

    const progress = await getStudentProgressSummary(studentId);
    
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

export const assignStudentToTeacher = onCallWithCors(
  async (data: unknown, context: any) => {
    const uid = validateAuth(context);
    
    const { studentEmail } = validateInput<{ studentEmail: string }>(data, {
      studentEmail: 'string'
    });

    const teacherRef = admin.firestore().doc(`users/${uid}`);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists || teacherDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

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

export const createAssignment = onCallWithCors(
  async (data: any, context: any) => {
    const uid = validateAuth(context);
    
    const teacherDoc = await admin.firestore().doc(`users/${uid}`).get();
    if (!teacherDoc.exists || teacherDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }
    
    const { title, description, games, targetStudentIds, dueDate, settings } = data;
    
    const assignmentRef = admin.firestore().collection('assignments').doc();
    const assignment = {
      id: assignmentRef.id,
      teacherId: uid,
      title,
      description: description || '',
      games,
      targetStudentIds,
      dueDate: dueDate ? new Date(dueDate) : null,
      settings: settings || { sequentialUnlock: false, allowReplay: true },
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await assignmentRef.set(assignment);
    
    const batch = admin.firestore().batch();
    
    for (const studentId of targetStudentIds) {
      const studentAssignmentRef = admin.firestore().collection('studentAssignments').doc();
      const studentAssignment = {
        id: studentAssignmentRef.id,
        studentId,
        assignmentId: assignmentRef.id,
        teacherId: uid,
        status: 'not_started',
        progress: {
          totalGames: games.length,
          completedGames: 0,
          currentGameIndex: 0,
          percentComplete: 0
        },
        gameProgress: games.reduce((acc: any, game: any, index: number) => {
          acc[game.gameId] = {
            status: index === 0 ? 'available' : 'locked',
            score: 0,
            accuracy: 0,
            attempts: 0,
            timeSpentSeconds: 0
          };
          return acc;
        }, {}),
        assignedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(studentAssignmentRef, studentAssignment);
    }
    
    await batch.commit();
    
    return { success: true, assignmentId: assignmentRef.id };
  }
);

export const getTeacherAssignments = onCallWithCors(
  async (data: any, context: any) => {
    const uid = validateAuth(context);
    
    const teacherDoc = await admin.firestore().doc(`users/${uid}`).get();
    if (!teacherDoc.exists || teacherDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }
    
    const assignmentsSnapshot = await admin.firestore()
      .collection('assignments')
      .where('teacherId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const assignments = await Promise.all(
      assignmentsSnapshot.docs.map(async (doc) => {
        const assignmentData = doc.data();
        
        const studentAssignmentsSnapshot = await admin.firestore()
          .collection('studentAssignments')
          .where('assignmentId', '==', doc.id)
          .get();
        
        const studentProgress = studentAssignmentsSnapshot.docs.map(sa => ({
          studentId: sa.data().studentId,
          status: sa.data().status,
          progress: sa.data().progress
        }));
        
        return {
          id: doc.id,
          ...assignmentData,
          studentProgress
        };
      })
    );
    
    return { assignments };
  }
);

export const getStudentAssignments = onCallWithCors(
  async (data: any, context: any) => {
    const uid = validateAuth(context);
    
    const studentAssignmentsSnapshot = await admin.firestore()
      .collection('studentAssignments')
      .where('studentId', '==', uid)
      .where('status', 'in', ['not_started', 'in_progress'])
      .get();
    
    const assignments = await Promise.all(
      studentAssignmentsSnapshot.docs.map(async (doc) => {
        const saData = doc.data();
        
        const assignmentDoc = await admin.firestore()
          .collection('assignments')
          .doc(saData.assignmentId)
          .get();
        
        if (!assignmentDoc.exists) return null;
        
        return {
          studentAssignmentId: doc.id,
          ...saData,
          assignment: assignmentDoc.data()
        };
      })
    );
    
    return { assignments: assignments.filter(a => a !== null) };
  }
);

export const updateGameProgress = onCallWithCors(
  async (data: any, context: any) => {
    const uid = validateAuth(context);
    
    const { studentAssignmentId, gameId, score, accuracy, timeSpentSeconds, completed } = data;
    
    const saRef = admin.firestore().collection('studentAssignments').doc(studentAssignmentId);
    const saDoc = await saRef.get();
    
    if (!saDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Assignment not found');
    }
    
    const saData = saDoc.data();
    if (saData?.studentId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }
    
    const gameProgress = saData?.gameProgress || {};
    gameProgress[gameId] = {
      ...gameProgress[gameId],
      status: completed ? 'completed' : 'in_progress',
      score,
      accuracy,
      timeSpentSeconds: (gameProgress[gameId]?.timeSpentSeconds || 0) + timeSpentSeconds,
      completedAt: completed ? admin.firestore.FieldValue.serverTimestamp() : null
    };
    
    const totalGames = saData?.progress?.totalGames || 0;
    const completedGames = Object.values(gameProgress).filter((g: any) => g.status === 'completed').length;
    const percentComplete = Math.round((completedGames / totalGames) * 100);
    
    const assignment = await admin.firestore().collection('assignments').doc(saData?.assignmentId).get();
    const assignmentData = assignment.data();
    const currentGameIndex = assignmentData?.games.findIndex((g: any) => g.gameId === gameId);
    const nextGame = assignmentData?.games[currentGameIndex + 1];
    
    if (completed && nextGame && assignmentData?.settings?.sequentialUnlock) {
      gameProgress[nextGame.gameId].status = 'available';
    }
    
    let status = saData?.status;
    if (completedGames === 0) status = 'not_started';
    else if (completedGames === totalGames) status = 'completed';
    else status = 'in_progress';
    
    await saRef.update({
      gameProgress,
      status,
      progress: {
        totalGames,
        completedGames,
        currentGameIndex: currentGameIndex + 1,
        percentComplete
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, nextGameId: nextGame?.gameId };
  }
);
