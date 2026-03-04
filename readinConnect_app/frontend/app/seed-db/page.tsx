'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/auth'

// This will be dynamically imported
let seedModule: any = null

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const { user } = useAuthStore()

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${log}`])
    console.log(log)
  }

  const seedDatabase = async () => {
    if (!user) {
      setMessage('❌ Please log in first')
      return
    }

    setLoading(true)
    setLogs([])
    addLog('🌱 Starting database seeding...')

    try {
      // Dynamically import the seed module
      const { seedFirestore, checkSeedingStatus } = await import('@/scripts/seed-firestore-browser')

      addLog('📦 Seed module loaded')

      // Seed the database
      await seedFirestore()

      addLog('✅ Database seeding completed!')
      setMessage('✅ Database seeded successfully!')

      // Check the status
      addLog('🔍 Checking seeding status...')
      await checkSeedingStatus()

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    if (!user) {
      setMessage('❌ Please log in first')
      return
    }

    setLoading(true)
    setLogs([])
    addLog('🔍 Checking database status...')

    try {
      const { checkSeedingStatus } = await import('@/scripts/seed-firestore-browser')
      await checkSeedingStatus()
      addLog('✅ Status check completed')
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#B8E0D2] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">🌱 Database Seeding Tool</h1>
          <p className="text-[#5A4A42]/70">Seed Firebase Firestore with initial data</p>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-green-800 font-medium">✅ Logged in as: {user.email}</p>
          </div>
        )}

        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-yellow-800 font-medium">⚠️ Please log in to seed the database</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Seed Database
              </CardTitle>
              <CardDescription>
                Add initial data to Firestore (reading levels, words, badges, rewards)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={seedDatabase}
                disabled={loading || !user}
                className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2]"
              >
                {loading ? 'Seeding...' : 'Seed Database'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Check Status
              </CardTitle>
              <CardDescription>
                Check if database has been seeded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={checkStatus}
                disabled={loading || !user}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {message && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className={message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}>
                {message}
              </p>
            </CardContent>
          </Card>
        )}

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
