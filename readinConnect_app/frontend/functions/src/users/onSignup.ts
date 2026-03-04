import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

export const onUserSignup = functions.auth.user().onCreate(async (user) => {
  const uid = user.email || user.uid
  const email = user.email || ''
  const displayName = user.displayName || email.split('@')[0]

  try {
    await admin.firestore().doc(`users/${user.uid}`).set({
      uid: user.uid,
      email: email,
      displayName: displayName,
      role: 'student',
      photoURL: user.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`User profile created for ${uid} with role: student`)
  } catch (error) {
    console.error('Error creating user profile:', error)
  }
})
