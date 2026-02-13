'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Trophy, Flame, Star, Target, Gift, BookOpen, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/auth'
import { useAuthStore } from '@/lib/stores/auth'
import { ConfettiExplosion, StarBurst, CelebrationMessage, MilestoneProgress, AchievementCard, AchievementCelebration } from '@/components/CelebrationEffects'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  unlockedAt?: any
}

interface StudentStats {
  totalPoints: number
  badgesEarned: number
  activitiesCompleted: number
  streakDays: number
  phonicsMastered: number
  sightWordsMastered: number
  fluencyWPM: number
}

const milestoneGoals = [
  { id: 'first_points', icon: '🌟', name: 'First Steps', goal: 10, current: 0 },
  { id: 'hundred', icon: '💯', name: 'Century Club', goal: 100, current: 0 },
  { id: 'five_hundred', icon: '🏆', name: 'Reading Champion', goal: 500, current: 0 },
  { id: 'first_badge', icon: '🎖️', name: 'Badge Collector', goal: 1, current: 0 },
  { id: 'five_badges', icon: '👑', name: 'Badge Master', goal: 5, current: 0 },
  { id: 'streak_week', icon: '🔥', name: 'Week Warrior', goal: 7, current: 0 },
  { id: 'streak_month', icon: '⚡', name: 'Monthly Master', goal: 30, current: 0 },
  { id: 'ten_activities', icon: '📚', name: 'Active Learner', goal: 10, current: 0 },
  { id: 'fifty_activities', icon: '🌈', name: 'Dedicated Student', goal: 50, current: 0 },
  { id: 'phonics_pro', icon: '🔤', name: 'Phonics Pro', goal: 10, current: 0 },
]

export default function StudentAchievements() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<StudentStats>({
    totalPoints: 0,
    badgesEarned: 0,
    activitiesCompleted: 0,
    streakDays: 0,
    phonicsMastered: 0,
    sightWordsMastered: 0,
    fluencyWPM: 0
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null)
  const [activeTab, setActiveTab] = useState<'milestones' | 'achievements' | 'badges'>('milestones')

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return

      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)))
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data()
          setStats({
            totalPoints: userData.total_points || 0,
            badgesEarned: userData.badges_earned || 0,
            activitiesCompleted: userData.activities_completed || 0,
            streakDays: userData.streak_days || 0,
            phonicsMastered: userData.phonics_mastered?.length || 0,
            sightWordsMastered: userData.sight_words_mastered || 0,
            fluencyWPM: userData.fluency_wpm || 0
          })
        }

        const achievementsSnap = await getDocs(collection(db, 'users', user.uid, 'achievements'))
        const unlockedAchievements = achievementsSnap.docs
          .filter(doc => doc.data().unlockedAt)
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Achievement))

        setAchievements(unlockedAchievements)

        if (unlockedAchievements.length > achievements.length) {
          const newAchievement = unlockedAchievements[unlockedAchievements.length - 1]
          setCelebrationAchievement(newAchievement)
          setShowCelebration(true)
          setShowConfetti(true)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.uid])

  const handleDismissCelebration = () => {
    setShowCelebration(false)
    setCelebrationAchievement(null)
  }

  const getMilestoneProgress = (goalId: string): { progress: number; goal: number } => {
    const goal = milestoneGoals.find(g => g.id === goalId)
    if (!goal) return { progress: 0, goal: 0 }

    let current = 0
    switch (goalId) {
      case 'first_points':
      case 'hundred':
      case 'five_hundred':
        current = stats.totalPoints
        break
      case 'first_badge':
      case 'five_badges':
        current = stats.badgesEarned
        break
      case 'streak_week':
      case 'streak_month':
        current = stats.streakDays
        break
      case 'ten_activities':
      case 'fifty_activities':
        current = stats.activitiesCompleted
        break
      case 'phonics_pro':
        current = stats.phonicsMastered
        break
    }

    return { progress: Math.min(current, goal.goal), goal: goal.goal }
  }

  const isMilestoneUnlocked = (goalId: string): boolean => {
    const goal = milestoneGoals.find(g => g.id === goalId)
    if (!goal) return false

    const achievement = achievements.find(a => a.id === goalId)
    return !!achievement
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B7355]">Loading achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <ConfettiExplosion active={showConfetti} />
      <CelebrationMessage 
        message="Achievement Unlocked! 🎉" 
        active={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <AchievementCelebration
        achievement={celebrationAchievement}
        show={showCelebration}
        onDismiss={handleDismissCelebration}
      />

      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFB5BA]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard/student')}
            className="flex items-center gap-2 text-[#5A4A42] hover:text-[#FF6B6B] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-[#5A4A42] flex items-center gap-2">
            <Award className="h-6 w-6 text-[#FFD700]" />
            Achievements
          </h1>
          <div className="flex items-center gap-2 bg-[#FFD700] px-4 py-2 rounded-full">
            <Star className="h-5 w-5 text-[#5A4A42]" />
            <span className="font-black text-[#5A4A42]">{stats.totalPoints}</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white text-center">
              <Trophy className="h-8 w-8 text-[#FFD700] mx-auto mb-2" />
              <p className="text-2xl font-black text-[#5A4A42]">{stats.totalPoints}</p>
              <p className="text-sm text-[#8B7355]">Total Points</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white text-center">
              <Award className="h-8 w-8 text-[#FF6B6B] mx-auto mb-2" />
              <p className="text-2xl font-black text-[#5A4A42]">{stats.badgesEarned}</p>
              <p className="text-sm text-[#8B7355]">Badges</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white text-center">
              <Flame className="h-8 w-8 text-[#FF8C00] mx-auto mb-2" />
              <p className="text-2xl font-black text-[#5A4A42]">{stats.streakDays}</p>
              <p className="text-sm text-[#8B7355]">Day Streak</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-white text-center">
              <Target className="h-8 w-8 text-[#4ECDC4] mx-auto mb-2" />
              <p className="text-2xl font-black text-[#5A4A42]">{stats.activitiesCompleted}</p>
              <p className="text-sm text-[#8B7355]">Activities</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {(['milestones', 'achievements', 'badges'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-[#FF6B6B] text-white shadow-lg'
                    : 'bg-white text-[#5A4A42] hover:bg-[#FFB5BA]/20'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'milestones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestoneGoals.map((milestone) => {
                const { progress, goal } = getMilestoneProgress(milestone.id)
                const unlocked = isMilestoneUnlocked(milestone.id)

                return (
                  <div 
                    key={milestone.id}
                    className={`rounded-xl p-4 transition-all ${
                      unlocked 
                        ? 'bg-gradient-to-br from-[#B8E0D2]/50 to-[#4ECDC4]/50 border-2 border-[#4ECDC4]' 
                        : 'bg-white border-2 border-[#FFB5BA]/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl ${!unlocked ? 'grayscale opacity-50' : ''}`}>
                        {milestone.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#5A4A42]">{milestone.name}</h3>
                          {unlocked && <span className="text-[#4ECDC4]">✓</span>}
                        </div>
                        <p className="text-sm text-[#8B7355]">{progress} / {goal}</p>
                        <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              unlocked ? 'bg-[#4ECDC4]' : 'bg-[#FF6B6B]'
                            }`}
                            style={{ width: `${(progress / goal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={{
                    icon: achievement.icon,
                    title: achievement.title,
                    description: achievement.description,
                    points: achievement.points,
                    unlocked: true
                  }}
                />
              ))}
              {achievements.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-[#FFB5BA]" />
                  <h3 className="text-xl font-bold text-[#5A4A42] mb-2">No Achievements Yet</h3>
                  <p className="text-[#8B7355]">Complete activities and practice to unlock achievements!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, index) => {
                const badgeIndex = index + 1
                const earned = badgeIndex <= stats.badgesEarned
                
                const badges = ['🏆', '⭐', '🎖️', '👑', '🎯', '🔥', '💯', '📚', '🔤', '🌟', '⚡', '🎉']

          return (
            <div
              key={index}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-3xl
                ${earned 
                  ? 'bg-gradient-to-br from-[#FFD700] to-[#FFB347] shadow-lg' 
                  : 'bg-gray-200 grayscale opacity-50'
                }
              `}
            >
              {earned ? badges[index] : '❓'}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
