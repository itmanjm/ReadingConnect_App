import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, signInWithPopupGoogle } from '@/lib/firebase/auth'

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
  setUser: (user: FirebaseUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setAuthError: (error: string | null) => void
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const DEFAULT_ROLE: UserRole = 'student'

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

  setUser: (user) => {
    const currentProfile = get().profile
    if (user && !currentProfile) {
      const profile = createProfileFromUser(user)
      set({ user, profile, authError: null })
    } else if (!user) {
      set({ user: null, profile: null, authError: null })
    } else {
      set({ user, authError: null })
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

      console.log('AuthStore: Sign in successful')
      return { error: null }
    } catch (error: any) {
      console.error('AuthStore: Sign in error:', error.code, error.message)
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

    console.log('AuthStore: Google sign-in completed successfully')
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
}))
