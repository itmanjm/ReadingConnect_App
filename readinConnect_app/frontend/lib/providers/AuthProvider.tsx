'use client'
 
import { useEffect, useState, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/auth'
import { useAuthStore } from '@/lib/stores/auth'
import { useRouter } from 'next/navigation'
 
interface AuthProviderProps {
  children: React.ReactNode
}
 
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setAuthError = useAuthStore((state) => state.setAuthError)
  const [initialized, setInitialized] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)
  const listenerInitializedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
 
  useEffect(() => {
    if (listenerInitializedRef.current) {
      console.log('AuthProvider: Listener already initialized, skipping...')
      return
    }
 
    listenerInitializedRef.current = true
    console.log('AuthProvider: Setting up auth state listener...')
    setLoading(true)
 
    timeoutRef.current = setTimeout(() => {
      console.warn('AuthProvider: Auth initialization timeout - showing app anyway')
      setTimeoutReached(true)
      setLoading(false)
      setInitialized(true)
    }, 3000)
 
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      console.log('AuthProvider: Auth state changed:', authUser?.email || 'No user')
      setUser(authUser)
      setLoading(false)
      setInitialized(true)
      setAuthReady(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }, (error) => {
      console.error('AuthProvider: Auth state error:', error)
      setLoading(false)
      setInitialized(true)
      setAuthError('Auth initialization failed. Some features may not work.')
    })
 
    return () => {
      console.log('AuthProvider: Cleaning up auth listener')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      listenerInitializedRef.current = false
      unsubscribe()
    }
  }, [])
 
  useEffect(() => {
    if (authReady && initialized) {
      console.log('AuthProvider: User logged in, checking current route', user?.email)
      const currentPath = window.location.pathname
 
       if (user && (currentPath === '/login' || currentPath === '/auth/login' || currentPath === '/auth/register' || currentPath === '/register' || currentPath === '/')) {
        console.log('AuthProvider: Redirecting to student dashboard')
        router.push('/dashboard/student')
      }
    }
  }, [user, initialized, authReady, router])
 
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
 
  if (timeoutReached && !user) {
    console.warn('AuthProvider: Showing app with auth timeout warning')
    return (
      <>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-sm">
          Authentication may not be working properly. Some features may be limited.
        </div>
        {children}
      </>
    )
  }
 
  return <>{children}</>
}

