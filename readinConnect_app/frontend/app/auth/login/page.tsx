'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Star, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const signIn = useAuthStore((state) => state.signIn)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const registered = searchParams.get('registered')
    if (registered === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('Login: Google sign-in clicked')
    setGoogleLoading(true)
    setError('')

    try {
      const { error } = await signInWithGoogle()

      if (error) {
        console.error('Login: Google sign-in error:', error)
        setError(error)
        setGoogleLoading(false)
      } else {
        console.log('Login: Google sign-in successful, waiting for auth state update...')
        // AuthProvider will handle the redirect automatically
        // Keep loading state true until redirect happens
      }
    } catch (err: any) {
      console.error('Login: Unexpected error:', err)
      setError(err?.message || 'An unexpected error occurred')
      setGoogleLoading(false)
    }
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#5A4A42] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl border-2 border-[#B8E0D2]/30 focus:border-[#FF6B6B] h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#5A4A42] font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl border-2 border-[#B8E0D2]/30 focus:border-[#FF6B6B] h-12 text-lg"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#B8E0D2]/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#5A4A42]/70">Or continue with</span>
              </div>
            </div>

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
                  Redirecting to Google...
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </span>
              )}
            </Button>

            {successMessage && (
              <div className="text-sm text-green-600 bg-green-50 border-2 border-green-200 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="flex-1">{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-[#FF6B6B] bg-[#FF6B6B]/10 border-2 border-[#FF6B6B]/30 rounded-xl p-3 flex items-center gap-2">
                <span className="text-xl">😅</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-[#5A4A42]/70">
            <p className="mb-2">Don&apos;t have an account?</p>
            <Link 
              href="/auth/register" 
              className="inline-flex items-center gap-2 text-[#FF6B6B] hover:text-[#FF5252] font-bold text-lg hover:underline transition-all"
            >
              <span>🚀</span> Sign up here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
