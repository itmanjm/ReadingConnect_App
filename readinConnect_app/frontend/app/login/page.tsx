'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Star } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth'

export default function LoginPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (user) {
      console.log('Login: User already logged in, redirecting to dashboard')
      router.push('/dashboard/student')
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    console.log('Login: Starting Google sign-in with popup...')
    setGoogleLoading(true)
    setError('')

    const { error } = await signInWithGoogle()
    
    if (error) {
      console.error('Login: Google sign-in error:', error)
      setError(error)
    }
    
    setGoogleLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] relative overflow-hidden px-4">
      <div className="absolute top-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>☀️</div>
      <div className="absolute bottom-20 right-10 text-5xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>📚</div>
      <div className="absolute top-40 right-20 text-4xl animate-pulse">⭐</div>
      <div className="absolute bottom-40 left-20 text-4xl animate-bounce" style={{ animationDuration: '5s' }}>🎈</div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#FF6B6B]/10 blur-2xl" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-[#B8E0D2]/20 blur-2xl" />
      
      <Card className="w-full max-w-md rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFB5BA] flex items-center justify-center shadow-lg">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-[#5A4A42]">Welcome Back! 🎉</CardTitle>
          <CardDescription className="text-[#5A4A42]/70 text-lg">
            Sign in to continue your learning adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 mb-4">
              Sign in with Google to access your account
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-lg font-medium rounded-xl border-2 border-[#B8E0D2]/30 hover:bg-[#B8E0D2]/10 hover:border-[#B8E0D2] transition-all"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5 animate-spin" />
                  Signing in with Google...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1.10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                  </svg>
                  Sign in with Google
                </span>
              )}
            </Button>

            {error && (
              <div className="text-sm text-[#FF6B6B] bg-[#FF6B6B]/10 border-2 border-[#FF6B6B]/30 rounded-xl p-3 flex items-center gap-2">
                <span className="text-xl">😅</span>
                <span className="flex-1">{error}</span>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-[#5A4A42]/70">
              <p className="mb-2">Don&apos;t have an account?</p>
              <p className="text-sm text-gray-500 mb-2">
                Using Firebase Authentication
              </p>
              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-2 text-[#FF6B6B] hover:text-[#FF5252] font-bold text-lg hover:underline transition-all"
              >
                <span>🚀</span> Go to Dashboard
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
