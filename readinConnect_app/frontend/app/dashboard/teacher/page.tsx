'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { useTeacherStudents, useAssignStudentToTeacher } from '@/lib/hooks/useTeachers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, Calendar, LogOut, Zap, TrendingUp, FileText, MessageSquare, Award } from 'lucide-react'
import Link from 'next/link'

export default function TeacherDashboard() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const signOut = useAuthStore((state) => state.signOut)
  const { data: studentsData, isLoading: studentsLoading, refetch } = useTeacherStudents()
  const assignStudent = useAssignStudentToTeacher()
  const students = studentsData?.students || []

  const [loading, setLoading] = useState(true)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [assignError, setAssignError] = useState('')
  const [assignSuccess, setAssignSuccess] = useState('')

  useEffect(() => {
    if (!user || profile?.role !== 'teacher') {
      router.push('/auth/login')
      return
    }

    setLoading(false)
  }, [user, profile, router])

  const totalPoints = students.reduce((sum, s) => sum + (s.total_points || 0), 0)
  const totalActivities = students.reduce((sum, s) => sum + (s.activities_completed || 0), 0)
  const avgStreak = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.streak_days || 0), 0) / students.length)
    : 0

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleAssignStudent = async () => {
    if (!studentEmail) {
      setAssignError('Please enter a student email')
      return
    }

    try {
      setAssignError('')
      setAssignSuccess('')
      await assignStudent.mutateAsync(studentEmail)
      setAssignSuccess('Student assigned successfully!')
      setStudentEmail('')
      refetch()
      setTimeout(() => setShowAddStudent(false), 2000)
    } catch (error: any) {
      setAssignError(error.message || 'Failed to assign student')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <span className="text-5xl animate-bounce block mb-4">📚</span>
          <p className="text-[#5A4A42] font-medium">Loading your classroom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-20 right-20 text-5xl animate-bounce">📚</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">✏️</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{animationDelay: '1s'}}>🎨</div>
      <div className="absolute bottom-20 right-20 text-5xl animate-bounce" style={{animationDelay: '0.5s'}}>🍎</div>
      <div className="absolute top-1/2 right-10 text-3xl animate-pulse" style={{animationDelay: '1.5s'}}>🌟</div>
      
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#FF6B6B]/10 blur-2xl" />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#B8E0D2]/20 blur-2xl" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-[#FFB5BA]/15 blur-xl" />

      <nav className="bg-white/90 backdrop-blur-sm border-b-4 border-[#FF6B6B]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B6B] to-[#FFB5BA] rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] bg-clip-text text-transparent">
              Teacher Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#5A4A42] font-medium bg-white/80 px-4 py-2 rounded-full shadow-sm">
              {profile?.displayName || user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="rounded-full border-2 border-[#FFB5BA]/50 hover:bg-[#FFB5BA]/10"
            >
              <LogOut className="h-4 w-4 mr-2 text-[#FF6B6B]" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5A4A42] mb-3">
            Welcome, {profile?.displayName?.split(' ')[0] || 'Teacher'}! 👋
          </h1>
          <p className="text-xl text-[#5A4A42]/70">Manage your students and track their progress</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{studentsLoading ? '...' : students.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-gray-800 text-lg">Students</CardTitle>
              <p className="text-sm text-gray-500">Total enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{studentsLoading ? '...' : totalActivities}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-gray-800 text-lg">Activities</CardTitle>
              <p className="text-sm text-gray-500">Completed by students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{studentsLoading ? '...' : totalPoints}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-gray-800 text-lg">Total Points</CardTitle>
              <p className="text-sm text-gray-500">Earned by all students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{studentsLoading ? '...' : avgStreak}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-gray-800 text-lg">Avg Streak</CardTitle>
              <p className="text-sm text-gray-500">Days (average)</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Management
              </CardTitle>
              <CardDescription>Manage your classroom</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showAddStudent ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
                  onClick={() => setShowAddStudent(true)}
                >
                  <Users className="h-4 w-4" />
                  Add Student (by Email)
                </Button>
              ) : (
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  {assignError && <p className="text-red-500 text-xs">{assignError}</p>}
                  {assignSuccess && <p className="text-green-600 text-xs">{assignSuccess}</p>}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAssignStudent}
                      disabled={assignStudent.isPending}
                      className="flex-1"
                    >
                      {assignStudent.isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddStudent(false)
                        setStudentEmail('')
                        setAssignError('')
                        setAssignSuccess('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <Link href="/teacher/reports">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  View Reports & Progress
                </Button>
              </Link>
              <Link href="/teacher/level-assignment">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Assign Reading Levels
                </Button>
              </Link>
              <Link href="/teacher/observation-sheets">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen className="h-4 w-4" />
                  Create Observation Sheets
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication
              </CardTitle>
              <CardDescription>Stay connected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/teacher/messages">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Button>
              </Link>
              <Link href="/teacher/weekly-plans">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Plans
                </Button>
              </Link>
              <Link href="/teacher/gamification">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Award className="h-4 w-4" />
                  Gamification
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>Students assigned to you via Cloud Functions</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Zap className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading students...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No students assigned yet</p>
                <p className="text-sm">Students will appear here once they are linked to your account</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {(student.full_name || student.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{student.total_points || 0} pts</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
