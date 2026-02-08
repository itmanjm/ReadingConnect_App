'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Star } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const signIn = useAuthStore((state) => state.signIn)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl border-2 border-[#B8E0D2]/30 focus:border-[#FF6B6B] h-12 text-lg"
              />
            </div>

            {error && (
              <div className="text-sm text-[#FF6B6B] bg-[#FF6B6B]/10 border-2 border-[#FF6B6B]/30 rounded-xl p-3 flex items-center gap-2">
                <span className="text-xl">😅</span>
                {error}
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
