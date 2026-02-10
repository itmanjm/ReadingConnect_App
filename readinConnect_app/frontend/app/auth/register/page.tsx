'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Star, Rocket, GraduationCap, Users } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const signUp = useAuthStore((state) => state.signUp)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signUp(email, password, fullName, role)

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      router.push('/auth/login?registered=true')
    }
  }

  const getRoleIcon = (r: string) => {
    switch (r) {
      case 'student': return <Rocket className="h-5 w-5" />
      case 'teacher': return <GraduationCap className="h-5 w-5" />
      case 'parent': return <Users className="h-5 w-5" />
      default: return null
    }
  }

  const getRoleEmoji = (r: string) => {
    switch (r) {
      case 'student': return '🚀'
      case 'teacher': return '🍎'
      case 'parent': return '👨‍👩‍👧‍👦'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] relative overflow-hidden px-4 py-8">
      <div className="absolute top-16 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🌈</div>
      <div className="absolute bottom-20 right-16 text-5xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>📖</div>
      <div className="absolute top-40 right-12 text-4xl animate-pulse">✨</div>
      <div className="absolute bottom-32 left-16 text-4xl animate-bounce" style={{ animationDuration: '5s' }}>🎨</div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#FF6B6B]/10 blur-2xl" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-[#B8E0D2]/20 blur-2xl" />
      
      <Card className="w-full max-w-md rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B8E0D2] to-[#98D0C0] flex items-center justify-center shadow-lg">
              <Star className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-[#5A4A42]">Join the Fun! 🎉</CardTitle>
          <CardDescription className="text-[#5A4A42]/70 text-lg">
            Create your account and start learning today
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#5A4A42] font-medium">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl border-2 border-[#B8E0D2]/30 focus:border-[#FF6B6B] h-12 text-lg"
              />
            </div>

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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="rounded-xl border-2 border-[#B8E0D2]/30 focus:border-[#FF6B6B] h-12 text-lg"
              />
              <p className="text-xs text-[#5A4A42]/60">Password must be at least 6 characters</p>
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
              onClick={async () => {
                console.log('Register: Google sign-in clicked')
                setGoogleLoading(true)
                setError('')

                try {
                  const { error } = await signInWithGoogle()

                  if (error) {
                    console.error('Register: Google sign-in error:', error)
                    setError(error)
                    setGoogleLoading(false)
                  } else {
                    console.log('Register: Google sign-in successful, waiting for auth state update...')
                    // AuthProvider will handle the redirect automatically
                  }
                } catch (err: any) {
                  console.error('Register: Unexpected error:', err)
                  setError(err?.message || 'An unexpected error occurred')
                  setGoogleLoading(false)
                }
              }}
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </span>
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#5A4A42] font-medium">I am a...</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'teacher', 'parent'] as const).map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={role === r ? 'default' : 'outline'}
                    onClick={() => setRole(r)}
                    disabled={loading}
                    className={`rounded-xl h-14 flex flex-col items-center justify-center gap-1 transition-all ${
                      role === r 
                        ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white border-0 shadow-md' 
                        : 'border-2 border-[#B8E0D2]/30 hover:bg-[#B8E0D2]/10'
                    }`}
                  >
                    <span className="text-lg">{getRoleEmoji(r)}</span>
                    <span className="text-xs capitalize">{r}</span>
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-[#FF6B6B] bg-[#FF6B6B]/10 border-2 border-[#FF6B6B]/30 rounded-xl p-3 flex items-center gap-2">
                <span className="text-xl">😅</span>
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] mt-6" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5 animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-[#5A4A42]/70">
            <p className="mb-2">Already have an account?</p>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-[#FF6B6B] hover:text-[#FF5252] font-bold text-lg hover:underline transition-all"
            >
              <span>🔑</span> Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
