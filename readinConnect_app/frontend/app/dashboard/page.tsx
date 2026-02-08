'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { BookOpen, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const loading = useAuthStore((state) => state.loading)
  const loadProfile = useAuthStore((state) => state.loadProfile)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
      } else if (!profile) {
        loadProfile()
      } else {
        switch (profile.role) {
          case 'student':
            router.push('/dashboard/student')
            break
          case 'teacher':
            router.push('/dashboard/teacher')
            break
          case 'parent':
            router.push('/dashboard/parent')
            break
          case 'admin':
            router.push('/dashboard/admin')
            break
          default:
            router.push('/')
        }
      }
    } else {
      loadProfile()
    }
  }, [user, profile, loading, router, loadProfile])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <BookOpen className="h-16 w-16 text-blue-600 animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  )
}
