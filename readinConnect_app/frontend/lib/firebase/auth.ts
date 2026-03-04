import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCGc4EBAdLRdmfBd_08reVeXVt6a6OfirE",
  authDomain: "readingconnect-lit.firebaseapp.com",
  projectId: "readingconnect-lit",
  storageBucket: "readingconnect-lit.firebasestorage.app",
  messagingSenderId: "302745627563",
  appId: "1:302745627563:web:8c0c7ec22a8bba294f00ee",
  measurementId: "G-L3B7M9ZZMG"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const db = getFirestore(app)

setPersistence(auth, browserLocalPersistence)
auth.useDeviceLanguage()

console.log('Firebase initialized with browserLocalPersistence')

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
