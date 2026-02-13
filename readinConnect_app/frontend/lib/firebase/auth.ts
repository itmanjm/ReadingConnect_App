import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

setPersistence(auth, inMemoryPersistence)
auth.useDeviceLanguage()

console.log('Auth: Firebase initialized with inMemoryPersistence')

export async function checkPersistence() {
  console.log('Auth: Checking Firebase auth settings...')
  console.log('Auth: app.name:', app.name)
  console.log('Auth: app.options:', app.options)
  console.log('Auth: auth.settings:', auth.settings)
  console.log('Auth: auth.currentUser:', auth.currentUser)
  return auth.settings
}

const googleProvider = new (await import('firebase/auth')).GoogleAuthProvider()

export async function signInWithEmail(email: string, password: string) {
  const result = await (await import('firebase/auth')).signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signUpWithEmail(email: string, password: string) {
  const result = await (await import('firebase/auth')).createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signInWithPopupGoogle() {
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  let userResult: any = null
  let errorResult: any = null

  try {
    const result = await signInWithPopup(auth, provider)
    console.log('Auth: Google sign-in successful via popup')
    userResult = result.user

    errorResult = null
  } catch (err: any) {
    console.error('Auth: Google sign-in error:', err)
    errorResult = 'Failed to sign in with Google'
  }

  return { user: userResult, error: errorResult }
}

export async function getGoogleRedirectResult() {
  const { getRedirectResult } = await import('firebase/auth')
  return await getRedirectResult(auth)
}

export async function signOutUser() {
  const { signOut: firebaseSignOut } = await import('firebase/auth')
  await firebaseSignOut(auth)
}

export function getCurrentFirebaseUser() {
  return auth.currentUser
}
