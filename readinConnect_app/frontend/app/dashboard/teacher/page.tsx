'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, Calendar, LogOut, Zap } from 'lucide-react'

export default function TeacherDashboard() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const signOut = useAuthStore((state) => state.signOut)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || profile?.role !== 'teacher') {
      router.push('/auth/login')
      return
    }

    setLoading(false)
  }, [user, profile, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Zap className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Teacher Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {profile?.displayName || user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {profile?.displayName?.split(' ')[0] || 'Teacher'}!
          </h1>
          <p className="text-gray-600 mt-1">Manage your students and track their progress</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">0</span>
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
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">0</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-gray-800 text-lg">Activities</CardTitle>
              <p className="text-sm text-gray-500">Created this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">0</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-gray-800 text-lg">Weekly Plans</CardTitle>
              <p className="text-sm text-gray-500">Active plans</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your classroom</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                <span>Add Student</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Calendar className="h-6 w-6" />
                <span>Create Weekly Plan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
