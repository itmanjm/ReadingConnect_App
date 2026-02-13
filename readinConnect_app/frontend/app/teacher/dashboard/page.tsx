'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Users, BookOpen, Trophy, Calendar, TrendingUp, FileText, Settings, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/auth'

interface Student {
  id: string
  email: string
  full_name?: string
  current_reading_level?: string
  total_points?: number
  badges_earned?: number
  activities_completed?: number
  streak_days?: number
  created_at?: Date
}

interface ClassStats {
  totalStudents: number
  averageProgress: number
  mostActiveLevel: string
  totalActivities: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ClassStats>({
    totalStudents: 0,
    averageProgress: 0,
    mostActiveLevel: 'kindergarten',
    totalActivities: 0
  })

  useEffect(() => {
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'))
    
    const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student))

      setStudents(studentsData)

      const totalPoints = studentsData.reduce((sum, s) => sum + (s.total_points || 0), 0)
      const totalActivities = studentsData.reduce((sum, s) => sum + (s.activities_completed || 0), 0)
      const totalBadges = studentsData.reduce((sum, s) => sum + (s.badges_earned || 0), 0)

      setStats({
        totalStudents: studentsData.length,
        averageProgress: studentsData.length > 0 ? Math.round(totalPoints / studentsData.length) : 0,
        mostActiveLevel: 'kindergarten',
        totalActivities: totalActivities
      })

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const getLevelName = (levelId?: string): string => {
    const names: Record<string, string> = {
      'kindergarten': 'Kindergarten',
      'grade1': 'Grade 1',
      'grade2': 'Grade 2'
    }
    return levelId ? names[levelId] || levelId : 'Not Assigned'
  }

  const getLevelColor = (levelId?: string): string => {
    const colors: Record<string, string> = {
      'kindergarten': 'bg-[#FFB5BA]',
      'grade1': 'bg-[#FFE5B4]',
      'grade2': 'bg-[#B8E0D2]'
    }
    return levelId ? colors[levelId] || 'bg-gray-300' : 'bg-gray-300'
  }

  const getAvatarColor = (name?: string): string => {
    const colors = ['#FF6B6B', '#FFB5BA', '#FFE5B4', '#B8E0D2', '#4ECDC4']
    if (!name) return colors[0]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B7355]">Loading class data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFB5BA]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[#5A4A42] hover:text-[#FF6B6B] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-[#5A4A42]">Class Dashboard</h1>
          <button
            onClick={() => router.push('/teacher/worksheets')}
            className="bg-[#FF6B6B] text-white px-4 py-2 rounded-full font-bold hover:bg-[#FF5252] transition-colors flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Worksheets
          </button>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#5A4A42] mb-2">Teacher Dashboard</h2>
            <p className="text-[#8B7355]">Monitor student progress and manage your class</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFB5BA] rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{stats.totalStudents}</p>
                  <p className="text-sm text-[#8B7355]">Students</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFE5B4] rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-[#FF8C00]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{stats.averageProgress}</p>
                  <p className="text-sm text-[#8B7355]">Avg Points</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#B8E0D2] rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-[#4ECDC4]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{stats.totalActivities}</p>
                  <p className="text-sm text-[#8B7355]">Activities</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4ECDC4] rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{getLevelName(stats.mostActiveLevel)}</p>
                  <p className="text-sm text-[#8B7355]">Top Level</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden">
            <div className="bg-gradient-to-r from-[#FFB5BA]/20 to-[#FFE5B4]/20 p-6 border-b border-[#FFB5BA]/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#5A4A42]">Student Roster</h3>
                    <p className="text-sm text-[#8B7355]">{students.length} students enrolled</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/teacher/level-assignment')}
                  className="bg-[#FF6B6B] text-white px-4 py-2 rounded-full font-bold hover:bg-[#FF5252] transition-colors flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Levels
                </button>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#FFB5BA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-12 w-12 text-[#FFB5BA]" />
                </div>
                <h3 className="text-xl font-bold text-[#5A4A42] mb-2">No Students Yet</h3>
                <p className="text-[#8B7355] mb-6">Students will appear here once they join your class</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FFF8F0]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#8B7355]">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#8B7355]">Reading Level</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#8B7355]">Points</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#8B7355]">Activities</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#8B7355]">Badges</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#8B7355]">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr
                        key={student.id}
                        className={`border-b border-[#FFB5BA]/10 hover:bg-[#FFB5BA]/5 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#FFF8F0]'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: getAvatarColor(student.full_name) }}
                            >
                              {(student.full_name || student.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#5A4A42]">
                                {student.full_name || 'Unknown Student'}
                              </p>
                              <p className="text-sm text-[#8B7355]">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getLevelColor(student.current_reading_level)}`}>
                            {getLevelName(student.current_reading_level)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⭐</span>
                            <span className="font-bold text-[#5A4A42]">{student.total_points || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#5A4A42]">{student.activities_completed || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-[#FFD700]" />
                            <span className="font-bold text-[#5A4A42]">{student.badges_earned || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.streak_days && student.streak_days > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-[#FF6B6B]/10 text-[#FF6B6B] px-3 py-1 rounded-full font-bold">
                              🔥 {student.streak_days} days
                            </span>
                          ) : (
                            <span className="text-[#8B7355]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
