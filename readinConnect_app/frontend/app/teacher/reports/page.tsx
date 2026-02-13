'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Users, Calendar, Check, X, MessageCircle, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/auth'
import { downloadProgressReport, StudentProgress } from '@/lib/utils/progressReportGenerator'

interface Student {
  id: string
  email: string
  full_name?: string
  role?: string
  current_reading_level?: string
  total_points?: number
  badges_earned?: number
  activities_completed?: number
  streak_days?: number
  phonics_mastered?: string[]
  sight_words_mastered?: number
  fluency_wpm?: number
  fluency_accuracy?: number
  comprehension_score?: number
  join_date?: Date
  last_active?: Date
}

export default function TeacherReports() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [generating, setGenerating] = useState(false)
  const [reportOptions, setReportOptions] = useState({
    includePhonics: true,
    includeSightWords: true,
    includeFluency: true,
    includeComprehension: true,
    includeRecommendations: true,
    includeParentNotes: true
  })

  useEffect(() => {
    async function fetchStudents() {
      try {
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'))
        const snapshot = await getDocs(studentsQuery)
        
        const studentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Student))

        setStudents(studentsData)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleGenerateReport = async (student: Student) => {
    setGenerating(true)
    setSelectedStudent(student)

    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      const progressData: StudentProgress = {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        current_reading_level: student.current_reading_level,
        total_points: student.total_points || 0,
        badges_earned: student.badges_earned || 0,
        activities_completed: student.activities_completed || 0,
        streak_days: student.streak_days || 0,
        phonics_mastered: student.phonics_mastered || [],
        sight_words_mastered: student.sight_words_mastered || 0,
        fluency_wpm: student.fluency_wpm || 0,
        fluency_accuracy: student.fluency_accuracy || 0,
        comprehension_score: student.comprehension_score || 0,
        join_date: student.join_date,
        last_active: student.last_active
      }

      downloadProgressReport(progressData, reportOptions)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
      setSelectedStudent(null)
    }
  }

  const getLevelColor = (level?: string): string => {
    const colors: Record<string, string> = {
      'kindergarten': 'bg-[#FFB5BA]',
      'grade1': 'bg-[#FFE5B4]',
      'grade2': 'bg-[#B8E0D2]'
    }
    return level ? colors[level] || 'bg-gray-300' : 'bg-gray-300'
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
          <p className="text-[#8B7355]">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFB5BA]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard/teacher')}
            className="flex items-center gap-2 text-[#5A4A42] hover:text-[#FF6B6B] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-[#5A4A42]">Progress Reports</h1>
          <button
            onClick={() => router.push('/teacher/messages')}
            className="flex items-center gap-2 bg-[#4ECDC4] text-white px-4 py-2 rounded-full font-bold hover:bg-[#3DBDB5] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Messages
          </button>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden">
                <div className="bg-gradient-to-r from-[#FFB5BA]/20 to-[#FFE5B4]/20 p-6 border-b border-[#FFB5BA]/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#5A4A42]">Student Reports</h2>
                      <p className="text-sm text-[#8B7355]">{students.length} students enrolled</p>
                    </div>
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-[#FFB5BA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-12 w-12 text-[#FFB5BA]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#5A4A42] mb-2">No Students Yet</h3>
                    <p className="text-[#8B7355]">Students will appear here once they join</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#FFB5BA]/10">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="p-6 hover:bg-[#FFB5BA]/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: getAvatarColor(student.full_name) }}
                            >
                              {(student.full_name || student.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-[#5A4A42]">
                                {student.full_name || 'Unknown Student'}
                              </h3>
                              <p className="text-sm text-[#8B7355]">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getLevelColor(student.current_reading_level)}`}>
                              {student.current_reading_level || 'No Level'}
                            </span>
                            <div className="flex items-center gap-1 text-[#8B7355]">
                              <span className="text-xl">⭐</span>
                              <span className="font-bold">{student.total_points || 0}</span>
                            </div>
                            <button
                              onClick={() => handleGenerateReport(student)}
                              disabled={generating && selectedStudent?.id === student.id}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                                generating && selectedStudent?.id === student.id
                                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                  : 'bg-[#FF6B6B] text-white hover:bg-[#FF5252] hover:shadow-lg'
                              }`}
                            >
                              {generating && selectedStudent?.id === student.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Download PDF
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-6 text-sm text-[#8B7355]">
                          <span>🏆 {student.badges_earned || 0} badges</span>
                          <span>📝 {student.activities_completed || 0} activities</span>
                          <span>🔥 {student.streak_days || 0} day streak</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-3xl shadow-xl border-4 border-white p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[#5A4A42] mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#4ECDC4]" />
                  Report Options
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportOptions.includePhonics}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, includePhonics: e.target.checked }))}
                      className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <span className="text-[#5A4A42]">Phonics Progress</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportOptions.includeSightWords}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, includeSightWords: e.target.checked }))}
                      className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <span className="text-[#5A4A42]">Sight Words</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportOptions.includeFluency}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, includeFluency: e.target.checked }))}
                      className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <span className="text-[#5A4A42]">Fluency Stats</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportOptions.includeComprehension}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, includeComprehension: e.target.checked }))}
                      className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <span className="text-[#5A4A42]">Comprehension Score</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportOptions.includeRecommendations}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                      className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <span className="text-[#5A4A42]">Recommendations</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportOptions.includeParentNotes}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, includeParentNotes: e.target.checked }))}
                      className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <span className="text-[#5A4A42]">Parent Notes</span>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-[#FFF8F0] rounded-xl">
                  <h4 className="font-bold text-[#5A4A42] mb-2 text-sm">Preview</h4>
                  <p className="text-xs text-[#8B7355]">
                    PDF will include {Object.values(reportOptions).filter(Boolean).length} sections
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
