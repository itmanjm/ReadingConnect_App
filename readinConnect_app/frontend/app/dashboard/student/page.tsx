'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { useSound } from '@/lib/providers/SoundProvider'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Volume2, VolumeX, Star, Zap, TrendingUp, LogOut, Home } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const signOut = useAuthStore((state) => state.signOut)
  const { isMuted, toggleMute, playClick, playHover, playNavigate } = useSound()

  const [totalPoints, setTotalPoints] = useState(0)
  const [completedActivities, setCompletedActivities] = useState(0)
  const [earnedBadges, setEarnedBadges] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || profile?.role !== 'student') {
      router.push('/auth/login')
      return
    }

    if (user.id) {
      loadStudentData()
    }
  }, [user, profile, router])

  const loadStudentData = async () => {
    if (!user?.id) return

    const supabase = createClient()

    const [pointsResult, completionsResult, badgesResult] = await Promise.all([
      supabase.rpc('get_student_total_points', { student_id: user.id }),
      supabase
        .from('activity_completions')
        .select('id', { count: 'exact' })
        .eq('student_id', user.id),
      supabase
        .from('earned_badges')
        .select('id', { count: 'exact' })
        .eq('student_id', user.id),
    ])

    setTotalPoints(pointsResult.data || 0)
    setCompletedActivities(completionsResult.count || 0)
    setEarnedBadges(badgesResult.count || 0)
    setLoading(false)
  }

  const handleSignOut = async () => {
    playClick()
    await signOut()
    router.push('/')
  }

  const handleGameClick = () => {
    playNavigate()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Zap className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFE5B4]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
              <span className="text-2xl">📚</span>
            </div>
            <span className="text-xl font-black text-[#5A4A42]">Reading</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              onMouseEnter={playHover}
              className="rounded-full border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white w-10 h-10 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <span className="text-sm font-medium text-[#8B7355]">
              {profile?.full_name?.split(' ')[0] || 'Reader'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              onMouseEnter={playHover}
              className="rounded-full border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Bye!
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg shadow-[#FFE5B4]/20 mb-4">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-black text-[#5A4A42]">
              Hi, {profile?.full_name?.split(' ')[0] || 'Super Reader'}!
            </h1>
          </div>
          <p className="text-[#8B7355] text-lg">Ready for today's adventures?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white border-0 shadow-xl shadow-[#FFE5B4]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#FFE5B4] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">⭐</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">{totalPoints}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Your Stars</CardTitle>
              <p className="text-sm text-[#8B7355]">Keep collecting!</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#B8E0D2]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#B8E0D2] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🎮</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">{completedActivities}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Games Played</CardTitle>
              <p className="text-sm text-[#8B7355]">You're doing great!</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#E8D5E0]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#E8D5E0] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">{earnedBadges}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Badges Won</CardTitle>
              <p className="text-sm text-[#8B7355]">Super achievements!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white border-0 shadow-xl shadow-[#FFB5BA]/20 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-[#FFB5BA]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFB5BA]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <CardTitle className="text-[#5A4A42] text-xl">Your Powers</CardTitle>
                  <p className="text-sm text-[#8B7355]">See how strong you're getting!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {[
                { skill: 'Letter Recognition', progress: 75, emoji: '🔤' },
                { skill: 'Phonics', progress: 60, emoji: '🎵' },
                { skill: 'Sight Words', progress: 45, emoji: '👀' },
                { skill: 'Fluency', progress: 30, emoji: '⚡' },
                { skill: 'Comprehension', progress: 20, emoji: '🧠' },
              ].map((item) => (
                <div key={item.skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="font-bold text-[#5A4A42]">{item.skill}</span>
                    </div>
                    <span className="font-black text-[#FF6B6B]">{item.progress}%</span>
                  </div>
                  <div className="h-3 bg-[#FFE5B4]/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFE5B4] rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#4ECDC4]/20 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-[#4ECDC4]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎮</span>
                </div>
                <div>
                  <CardTitle className="text-[#5A4A42] text-xl">Pick a Game</CardTitle>
                  <p className="text-sm text-[#8B7355]">Choose your adventure!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Link href="/activities/phonics" onClick={handleGameClick}>
                <div 
                  className="flex items-center justify-between p-4 bg-[#FFB5BA]/10 rounded-2xl hover:bg-[#FFB5BA]/20 cursor-pointer transition-all group"
                  onMouseEnter={playHover}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFB5BA] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Letter Hunt</p>
                      <p className="text-sm text-[#8B7355]">Find letters and win!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#FFB5BA] text-white border-0 rounded-full px-4 py-1">
                    Play!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/sight-words" onClick={handleGameClick}>
                <div 
                  className="flex items-center justify-between p-4 bg-[#B8E0D2]/10 rounded-2xl hover:bg-[#B8E0D2]/20 cursor-pointer transition-all group"
                  onMouseEnter={playHover}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#B8E0D2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Word Bingo</p>
                      <p className="text-sm text-[#8B7355]">Match and shout BINGO!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#B8E0D2] text-[#5A4A42] border-0 rounded-full px-4 py-1">
                    Play!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/fluency" onClick={handleGameClick}>
                <div 
                  className="flex items-center justify-between p-4 bg-[#FFE5B4]/10 rounded-2xl hover:bg-[#FFE5B4]/20 cursor-pointer transition-all group"
                  onMouseEnter={playHover}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFE5B4] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">⏱️</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Reading Race</p>
                      <p className="text-sm text-[#8B7355]">How fast can you go?</p>
                    </div>
                  </div>
                  <Badge className="bg-[#FFE5B4] text-[#5A4A42] border-0 rounded-full px-4 py-1">
                    Play!
                  </Badge>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
