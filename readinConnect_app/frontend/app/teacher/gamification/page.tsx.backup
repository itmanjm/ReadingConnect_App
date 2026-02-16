'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Users, 
  Plus, 
  Flame, 
  Star,
  Gift,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/auth'
import { useGamification, useLeaderboard } from '@/lib/hooks/useGamification'

interface Student {
  id: string
  email: string
  full_name?: string
  total_points?: number
  badges_earned?: number
  streak_days?: number
  activities_completed?: number
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'individual' | 'class'
  goal: number
  currentProgress: number
  metric: string
  endDate: any
  participants?: string[]
  rewards: { badgeId?: string; bonusPoints?: number; description?: string }
  status: string
}

interface ClassGoal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  metric: string
  rewards: string
  status: string
}

export default function TeacherGamification() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [activeTab, setActiveTab] = useState<'challenges' | 'goals' | 'leaderboard'>('challenges')
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)
  const [showCreateGoal, setShowCreateGoal] = useState(false)
  
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    type: 'individual' as 'individual' | 'class',
    goal: '',
    metric: 'points' as 'points' | 'words' | 'activities' | 'streak',
    days: '7',
    badgeId: '',
    bonusPoints: ''
  })

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetValue: '',
    metric: 'total_points' as 'total_points' | 'total_activities' | 'avg_streak' | 'words_learned',
    days: '30',
    rewards: ''
  })

  const { challenges, classGoals, createChallenge, createClassGoal, loading } = useGamification()
  const { entries: leaderboard, loading: leaderboardLoading } = useLeaderboard()

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
      }
    }
    fetchStudents()
  }, [])

  const handleCreateChallenge = async () => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + parseInt(challengeForm.days))

    await createChallenge(
      challengeForm.title,
      challengeForm.description,
      challengeForm.type,
      parseInt(challengeForm.goal),
      challengeForm.metric,
      endDate,
      {
        badgeId: challengeForm.badgeId || undefined,
        bonusPoints: challengeForm.bonusPoints ? parseInt(challengeForm.bonusPoints) : undefined,
        description: `Complete the ${challengeForm.title} challenge!`
      }
    )

    setChallengeForm({
      title: '',
      description: '',
      type: 'individual',
      goal: '',
      metric: 'points',
      days: '7',
      badgeId: '',
      bonusPoints: ''
    })
    setShowCreateChallenge(false)
  }

  const handleCreateGoal = async () => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + parseInt(goalForm.days))

    await createClassGoal(
      goalForm.title,
      goalForm.description,
      parseInt(goalForm.targetValue),
      goalForm.metric,
      endDate,
      goalForm.rewards
    )

    setGoalForm({
      title: '',
      description: '',
      targetValue: '',
      metric: 'total_points',
      days: '30',
      rewards: ''
    })
    setShowCreateGoal(false)
  }

  const getProgressColor = (progress: number, goal: number): string => {
    const percentage = (progress / goal) * 100
    if (percentage >= 75) return 'bg-[#4ECDC4]'
    if (percentage >= 50) return 'bg-[#FFE5B4]'
    if (percentage >= 25) return 'bg-[#FFB5BA]'
    return 'bg-gray-300'
  }

  const getRankIcon = (rank: number): { icon: string; color: string } => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-500' }
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400' }
    if (rank === 3) return { icon: '🥉', color: 'text-orange-400' }
    return { icon: `${rank}`, color: 'text-[#8B7355]' }
  }

  const getDaysRemaining = (endDate: any): number => {
    if (!endDate) return 0
    const end = new Date(endDate)
    const now = new Date()
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const totalClassPoints = students.reduce((sum, s) => sum + (s.total_points || 0), 0)
  const totalActivities = students.reduce((sum, s) => sum + (s.activities_completed || 0), 0)
  const avgStreak = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + (s.streak_days || 0), 0) / students.length) 
    : 0

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
          <h1 className="text-xl font-bold text-[#5A4A42] flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#FFD700]" />
            Class Gamification
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFB5BA] rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{totalClassPoints.toLocaleString()}</p>
                  <p className="text-sm text-[#8B7355]">Class Points</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFE5B4] rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#FF8C00]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{totalActivities}</p>
                  <p className="text-sm text-[#8B7355]">Activities</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#B8E0D2] rounded-xl flex items-center justify-center">
                  <Flame className="h-6 w-6 text-[#4ECDC4]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{avgStreak}</p>
                  <p className="text-sm text-[#8B7355]">Avg Streak</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#5A4A42]">{students.length}</p>
                  <p className="text-sm text-[#8B7355]">Students</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'challenges'
                  ? 'bg-[#FF6B6B] text-white shadow-lg'
                  : 'bg-white text-[#5A4A42] hover:bg-[#FFB5BA]/20'
              }`}
            >
              <Target className="h-5 w-5 inline mr-2" />
              Challenges
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'goals'
                  ? 'bg-[#FF6B6B] text-white shadow-lg'
                  : 'bg-white text-[#5A4A42] hover:bg-[#FFB5BA]/20'
              }`}
            >
              <TrendingUp className="h-5 w-5 inline mr-2" />
              Class Goals
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-[#FF6B6B] text-white shadow-lg'
                  : 'bg-white text-[#5A4A42] hover:bg-[#FFB5BA]/20'
              }`}
            >
              <Trophy className="h-5 w-5 inline mr-2" />
              Leaderboard
            </button>
          </div>

          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#5A4A42]">Active Challenges</h2>
                <button
                  onClick={() => setShowCreateChallenge(true)}
                  className="bg-[#FF6B6B] text-white px-4 py-2 rounded-full font-bold hover:bg-[#FF5252] transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create Challenge
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.filter((c: Challenge) => c.status === 'active').map((challenge: Challenge) => {
                  const progress = (challenge.currentProgress / challenge.goal) * 100
                  const daysLeft = getDaysRemaining(challenge.endDate)
                  
                  return (
                    <div key={challenge.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#FFB5BA]/30">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                            challenge.type === 'class' 
                              ? 'bg-[#4ECDC4] text-white' 
                              : 'bg-[#FFB5BA] text-[#FF6B6B]'
                          }`}>
                            {challenge.type === 'class' ? '🏫 Class' : '👤 Individual'}
                          </span>
                          <h3 className="font-bold text-[#5A4A42] mt-2">{challenge.title}</h3>
                          <p className="text-sm text-[#8B7355]">{challenge.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[#FF6B6B]">
                            <Clock className="h-4 w-4" />
                            <span className="font-bold">{daysLeft}d left</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#8B7355]">Progress</span>
                          <span className="font-bold text-[#5A4A42]">
                            {challenge.currentProgress} / {challenge.goal} {challenge.metric}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(challenge.currentProgress, challenge.goal)} transition-all duration-500`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>

                      {challenge.rewards && (
                        <div className="bg-[#FFF8F0] rounded-xl p-3">
                          <div className="flex items-center gap-2 text-[#8B7355]">
                            <Gift className="h-4 w-4" />
                            <span className="text-sm">
                              {challenge.rewards.bonusPoints && `+${challenge.rewards.bonusPoints} points`}
                              {challenge.rewards.badgeId && ' 🎖️ Badge'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2 text-sm text-[#8B7355]">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants?.length || 0} participants</span>
                      </div>
                    </div>
                  )
                })}

                {challenges.filter((c: Challenge) => c.status === 'active').length === 0 && (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <Target className="h-16 w-16 mx-auto mb-4 text-[#FFB5BA]" />
                    <h3 className="text-xl font-bold text-[#5A4A42] mb-2">No Active Challenges</h3>
                    <p className="text-[#8B7355] mb-6">Create a challenge to motivate your students!</p>
                    <button
                      onClick={() => setShowCreateChallenge(true)}
                      className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-bold hover:bg-[#FF5252] transition-colors"
                    >
                      Create First Challenge
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#5A4A42]">Class Goals</h2>
                <button
                  onClick={() => setShowCreateGoal(true)}
                  className="bg-[#4ECDC4] text-white px-4 py-2 rounded-full font-bold hover:bg-[#3DBDB5] transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create Goal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classGoals.filter((g: ClassGoal) => g.status === 'in_progress').map((goal: ClassGoal) => {
                  const progress = (goal.currentValue / goal.targetValue) * 100
                  
                  return (
                    <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#4ECDC4]/30">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-[#5A4A42]">{goal.title}</h3>
                          <p className="text-sm text-[#8B7355]">{goal.description}</p>
                        </div>
                        <span className="bg-[#4ECDC4] text-white px-2 py-1 rounded-full text-xs font-bold">
                          🎯 In Progress
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#8B7355]">Progress</span>
                          <span className="font-bold text-[#5A4A42]">
                            {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.metric.replace('total_', '').replace('_', ' ')}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#B8E0D2] transition-all duration-500"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-[#B8E0D2]/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-[#4ECDC4]">
                          <Gift className="h-4 w-4" />
                          <span className="text-sm font-bold">Reward: {goal.rewards}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {classGoals.filter((g: ClassGoal) => g.status === 'in_progress').length === 0 && (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-lg col-span-2">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-[#B8E0D2]" />
                    <h3 className="text-xl font-bold text-[#5A4A42] mb-2">No Active Goals</h3>
                    <p className="text-[#8B7355] mb-6">Set a class goal to work towards together!</p>
                    <button
                      onClick={() => setShowCreateGoal(true)}
                      className="bg-[#4ECDC4] text-white px-6 py-3 rounded-full font-bold hover:bg-[#3DBDB5] transition-colors"
                    >
                      Create First Goal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden">
              <div className="bg-gradient-to-r from-[#FFB5BA]/20 to-[#FFE5B4]/20 p-6 border-b border-[#FFB5BA]/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FFD700] rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#5A4A42]">Class Leaderboard</h2>
                    <p className="text-sm text-[#8B7355]">Top performing students this month</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#FFB5BA]/10">
                {leaderboardLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  leaderboard.map((entry, index) => {
                    const { icon, color } = getRankIcon(entry.rank)
                    return (
                      <div
                        key={entry.id}
                        className={`p-4 flex items-center gap-4 hover:bg-[#FFB5BA]/5 transition-colors ${
                          index < 3 ? 'bg-gradient-to-r from-transparent to-[#FFD700]/5' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${color} bg-white shadow`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#5A4A42]">{entry.name}</p>
                          <div className="flex gap-4 text-sm text-[#8B7355]">
                            <span>⭐ {entry.points}</span>
                            <span>🏆 {entry.badges}</span>
                            <span>🔥 {entry.streak}d</span>
                          </div>
                        </div>
                        {index < 3 && (
                          <div className="text-2xl">
                            {index === 0 ? '👑' : ''}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {showCreateChallenge && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#5A4A42] mb-6">Create Challenge</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#8B7355] mb-2">Title</label>
                    <input
                      type="text"
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Reading Week Challenge"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#8B7355] mb-2">Description</label>
                    <textarea
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the challenge..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Type</label>
                      <select
                        value={challengeForm.type}
                        onChange={(e) => setChallengeForm(prev => ({ ...prev, type: e.target.value as 'individual' | 'class' }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                      >
                        <option value="individual">Individual</option>
                        <option value="class">Class Wide</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Metric</label>
                      <select
                        value={challengeForm.metric}
                        onChange={(e) => setChallengeForm(prev => ({ ...prev, metric: e.target.value as any }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                      >
                        <option value="points">Points</option>
                        <option value="words">Words</option>
                        <option value="activities">Activities</option>
                        <option value="streak">Streak Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Goal Amount</label>
                      <input
                        type="number"
                        value={challengeForm.goal}
                        onChange={(e) => setChallengeForm(prev => ({ ...prev, goal: e.target.value }))}
                        placeholder="100"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Duration (Days)</label>
                      <input
                        type="number"
                        value={challengeForm.days}
                        onChange={(e) => setChallengeForm(prev => ({ ...prev, days: e.target.value }))}
                        placeholder="7"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Bonus Points (optional)</label>
                      <input
                        type="number"
                        value={challengeForm.bonusPoints}
                        onChange={(e) => setChallengeForm(prev => ({ ...prev, bonusPoints: e.target.value }))}
                        placeholder="50"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Badge ID (optional)</label>
                      <input
                        type="text"
                        value={challengeForm.badgeId}
                        onChange={(e) => setChallengeForm(prev => ({ ...prev, badgeId: e.target.value }))}
                        placeholder="e.g., reading-champion"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowCreateChallenge(false)}
                    className="flex-1 py-3 text-[#8B7355] hover:text-[#5A4A42] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateChallenge}
                    disabled={!challengeForm.title || !challengeForm.goal}
                    className="flex-1 py-3 bg-[#FF6B6B] text-white rounded-xl font-bold hover:bg-[#FF5252] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Challenge
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCreateGoal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#5A4A42] mb-6">Create Class Goal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#8B7355] mb-2">Goal Title</label>
                    <input
                      type="text"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., 10,000 Points Together"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#4ECDC4] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#8B7355] mb-2">Description</label>
                    <textarea
                      value={goalForm.description}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Work together as a class to achieve this goal..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#4ECDC4] outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Target Value</label>
                      <input
                        type="number"
                        value={goalForm.targetValue}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, targetValue: e.target.value }))}
                        placeholder="10000"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#4ECDC4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#8B7355] mb-2">Duration (Days)</label>
                      <input
                        type="number"
                        value={goalForm.days}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, days: e.target.value }))}
                        placeholder="30"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#4ECDC4] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#8B7355] mb-2">Metric</label>
                    <select
                      value={goalForm.metric}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, metric: e.target.value as any }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#4ECDC4] outline-none"
                    >
                      <option value="total_points">Total Points</option>
                      <option value="total_activities">Total Activities</option>
                      <option value="avg_streak">Average Streak</option>
                      <option value="words_learned">Words Learned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#8B7355] mb-2">Class Reward</label>
                    <input
                      type="text"
                      value={goalForm.rewards}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, rewards: e.target.value }))}
                      placeholder="e.g., Pizza Party 🎉"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#4ECDC4] outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowCreateGoal(false)}
                    className="flex-1 py-3 text-[#8B7355] hover:text-[#5A4A42] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={!goalForm.title || !goalForm.targetValue}
                    className="flex-1 py-3 bg-[#4ECDC4] text-white rounded-xl font-bold hover:bg-[#3DBDB5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
