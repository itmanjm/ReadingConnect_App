'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { useSound } from '@/lib/providers/SoundProvider'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BookOpen, LogOut, Plus, Users, Calendar, Volume2, VolumeX } from 'lucide-react'
import type { Database } from '@/types/database'

type Student = Database['public']['Tables']['students']['Row'] & {
  profile: Database['public']['Tables']['profiles']['Row']
}

export default function TeacherDashboard() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const signOut = useAuthStore((state) => state.signOut)
  const { isMuted, toggleMute, playClick, playHover } = useSound()

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || profile?.role !== 'teacher') {
      router.push('/auth/login')
      return
    }

    loadStudents()
  }, [user, profile, router])

  const loadStudents = async () => {
    if (!user?.id) return

    const supabase = createClient()

    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles (
          id,
          email,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading students:', error)
    } else {
      setStudents(data || [])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    playClick()
    await signOut()
    router.push('/')
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getReadingLevelColor = (level: string) => {
    switch (level) {
      case 'pre-reader':
        return 'bg-[#FFE5B4] text-[#5A4A42]'
      case 'beginner':
        return 'bg-[#B8E0D2] text-[#5A4A42]'
      case 'intermediate':
        return 'bg-[#FFB5BA] text-[#5A4A42]'
      case 'advanced':
        return 'bg-[#FF6B6B] text-white'
      default:
        return 'bg-[#E8D5E0] text-[#5A4A42]'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Users className="h-8 w-8 animate-spin text-blue-600" />
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
            <span className="text-xl font-black text-[#5A4A42]">ReadinConnect</span>
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
              {profile?.full_name || user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              onMouseEnter={playHover}
              className="rounded-full border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg shadow-[#FFE5B4]/20 mb-4">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-black text-[#5A4A42]">
                Welcome, {profile?.full_name?.split(' ')[0] || 'Teacher'}!
              </h1>
            </div>
            <p className="text-[#8B7355] text-lg">
              Manage your students and track their reading journey
            </p>
          </div>
          <Button 
            onClick={playClick}
            onMouseEnter={playHover}
            className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-6 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Student
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white border-0 shadow-xl shadow-[#B8E0D2]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#B8E0D2] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">👨‍🎓</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">{students.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Total Students</CardTitle>
              <p className="text-sm text-[#8B7355]">Active learners in your class</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#FFB5BA]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#FFB5BA] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">📅</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">0</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Weekly Plans</CardTitle>
              <p className="text-sm text-[#8B7355]">Learning plans created</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#FFE5B4]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#FFE5B4] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🎮</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">0</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Activities Created</CardTitle>
              <p className="text-sm text-[#8B7355]">Custom learning activities</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-0 shadow-xl shadow-[#4ECDC4]/20 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-[#4ECDC4]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">👨‍🎓</span>
              </div>
              <div>
                <CardTitle className="text-[#5A4A42] text-xl">Student Roster</CardTitle>
                <p className="text-sm text-[#8B7355]">Your assigned students</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-[#FFE5B4]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">🌱</span>
                </div>
                <p className="text-[#5A4A42] mb-4 font-medium">
                  You haven't added any students yet
                </p>
                <Button 
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-12 px-6 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Student
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <Card key={student.id} className="bg-white border-2 border-[#FFE5B4]/30 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#FFB5BA]/50 transition-all cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-[#FFB5BA] to-[#FF6B6B] text-white font-bold">
                              {getInitials(student.profile.full_name || student.profile.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg text-[#5A4A42]">
                              {student.profile.full_name || 'Unknown Student'}
                            </CardTitle>
                            <CardDescription className="text-[#8B7355]">{student.profile.email}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#8B7355]">Age Range</span>
                        <Badge variant="outline" className="border-[#B8E0D2] text-[#5A4A42] rounded-full">
                          {student.age_range || 'Not set'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#8B7355]">Reading Level</span>
                        <Badge className={`${getReadingLevelColor(student.reading_level)} rounded-full`}>
                          {student.reading_level === 'pre-reader' && '🌱 '}
                          {student.reading_level === 'beginner' && '🌿 '}
                          {student.reading_level === 'intermediate' && '🌻 '}
                          {student.reading_level === 'advanced' && '🌳 '}
                          {student.reading_level || 'Not set'}
                        </Badge>
                      </div>
                      <Button 
                        onClick={playClick}
                        onMouseEnter={playHover}
                        className="w-full mt-2 bg-[#B8E0D2]/10 hover:bg-[#B8E0D2]/20 text-[#5A4A42] border-2 border-[#B8E0D2]/30 hover:border-[#B8E0D2] rounded-full transition-all" 
                        variant="outline" 
                        size="sm"
                      >
                        View Progress
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
