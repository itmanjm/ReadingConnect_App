import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/auth'
import { signInWithPopupGoogle } from '@/lib/firebase/auth'

type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

interface Profile {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  photoURL: string | null
}

interface AuthState {
  user: FirebaseUser | null
  profile: Profile | null
  loading: boolean
  authError: string | null
  uid: string | null
  setUser: (user: FirebaseUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setAuthError: (error: string | null) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  fetchUserProfile: (uid: string) => Promise<Profile | null>
}

const DEFAULT_ROLE: UserRole = 'student'

const fetchUserProfileFromFirestore = async (uid: string, userEmail?: string | null): Promise<Profile | null> => {
  try {
    console.log('fetchUserProfile: Querying Firestore for uid:', uid)
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      console.log('fetchUserProfile: Found document, role:', data?.role)
      return {
        uid: uid,
        email: data.email || null,
        displayName: data.displayName || null,
        role: data.role || DEFAULT_ROLE,
        photoURL: data.photoURL || null,
      }
    }
    console.log('fetchUserProfile: No document found, returning default student profile')
    return {
      uid: uid,
      email: userEmail || null,
      displayName: userEmail?.split('@')[0] || null,
      role: DEFAULT_ROLE,
      photoURL: null,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

const createProfileFromUser = (user: FirebaseUser | null, role?: UserRole | null): Profile | null => {
  if (!user) return null
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: role || DEFAULT_ROLE,
    photoURL: user.photoURL,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  uid: null,
 
  setUser: async (user) => {
    if (!user) {
      set({ user: null, profile: null, uid: null, authError: null, loading: false })
      return
    }

    const uid = user.uid
    const profile = await fetchUserProfileFromFirestore(uid, user.email)
    
    if (profile) {
      console.log('AuthStore: Profile loaded via setUser, role:', profile.role)
      set({ user, profile, uid, authError: null, loading: false })
    } else {
      console.warn('AuthStore: No profile found via setUser, using default')
      const defaultProfile = createProfileFromUser(user)
      set({ user, profile: defaultProfile, uid, authError: null, loading: false })
    }
  },

  setProfile: (profile) => set({ profile }),

  setLoading: (loading) => set({ loading }),

  setAuthError: (error) => set({ authError: error }),

  signUp: async (email, password, displayName, role) => {
    try {
      console.log('AuthStore: Creating user with email:', email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      if (!userCredential?.user) {
        return { error: 'Failed to create account' }
      }

      console.log('AuthStore: User created, updating profile')
      await updateProfile(userCredential.user, { displayName })

      // Create user profile in Firestore
      console.log('AuthStore: Creating Firestore profile for user:', userCredential.user.uid)
      const userProfile = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: role,
        photoURL: userCredential.user.photoURL || null,
        selectedLevel: null,
        totalPoints: 0,
        streakDays: 0,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        preferences: {
          audioEnabled: true,
          theme: 'default'
        }
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile)
      console.log('AuthStore: Firestore profile created successfully')

      return { error: null }
    } catch (error: any) {
      console.error('AuthStore: Sign up error:', error.code, error.message)
      const errorMessage = error?.message || 'Failed to create account'
      return { error: errorMessage }
    }
  },

  signIn: async (email, password) => {
    try {
      console.log('AuthStore: Signing in with email:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      if (!userCredential?.user) {
        return { error: 'Failed to sign in' }
      }

      const uid = userCredential.user.uid
      console.log('AuthStore: Sign in successful, user:', userCredential.user.email, 'uid:', uid)
      
      const profile = await fetchUserProfileFromFirestore(uid, email)
      if (profile) {
        console.log('AuthStore: Profile fetched successfully, role:', profile.role)
        set({ 
          user: userCredential.user, 
          profile, 
          uid, 
          authError: null,
          loading: false 
        })
        console.log('AuthStore: State updated with user and profile')
      } else {
        console.warn('AuthStore: No profile found in Firestore, using default')
        const defaultProfile = createProfileFromUser(userCredential.user)
        set({ 
          user: userCredential.user, 
          profile: defaultProfile, 
          uid, 
          authError: null,
          loading: false 
        })
      }
      
      return { error: null }
    } catch (error: any) {
      console.error('AuthStore: Sign in error:', error)
      console.error('AuthStore: Sign in error code:', error.code)
      console.error('AuthStore: Sign in error message:', error.message)
      console.error('AuthStore: Sign in error customData:', error.customData)
      const errorMessage = error?.message || 'Failed to sign in'
      return { error: errorMessage }
    }
  },

  signInWithGoogle: async () => {
    console.log('AuthStore: Starting Google sign-in with popup...')

    const { user, error } = await signInWithPopupGoogle()

    if (error) {
      console.error('AuthStore: Google sign-in error:', error)
      let errorMessage = 'Failed to sign in with Google'

      if (error.includes('auth/operation-not-allowed')) {
        errorMessage = 'Google Sign-In is not enabled in Firebase Console'
      } else if (error.includes('auth/unauthorized-domain')) {
        errorMessage = 'This domain is not authorized for sign-in'
      }

      return { error: errorMessage }
    }

    if (user) {
      const uid = user.uid
      console.log('AuthStore: Google sign-in completed, fetching profile for:', uid)

      const profile = await fetchUserProfileFromFirestore(uid, user.email)
      if (profile) {
        console.log('AuthStore: Google profile fetched, role:', profile.role)
        set({ user, profile, uid, authError: null, loading: false })
      } else {
        console.warn('AuthStore: No profile found for Google user, creating new profile')
        // Create new profile for Google user
        const userProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || '',
          role: DEFAULT_ROLE,
          photoURL: user.photoURL || null,
          selectedLevel: null,
          totalPoints: 0,
          streakDays: 0,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          preferences: {
            audioEnabled: true,
            theme: 'default'
          }
        }

        try {
          await setDoc(doc(db, 'users', user.uid), userProfile)
          console.log('AuthStore: Firestore profile created for Google user')
        } catch (err) {
          console.error('AuthStore: Error creating Google user profile:', err)
        }

        const defaultProfile = createProfileFromUser(user, DEFAULT_ROLE)
        set({ user, profile: defaultProfile, uid, authError: null, loading: false })
      }
    }

    return { error: null }
  },

  signOut: async () => {
    try {
      console.log('AuthStore: Signing out...')
      await firebaseSignOut(auth)
      console.log('AuthStore: Sign out successful')
    } catch (error) {
      console.error('AuthStore: Sign out error:', error)
    }
  },

  fetchUserProfile: async (uid: string) => {
    return fetchUserProfileFromFirestore(uid)
  },
}))
