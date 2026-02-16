'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Calendar, BookOpen, Target, Award, Clock, ArrowLeft, Star, Trophy, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useSound } from '@/lib/providers/SoundProvider'
import { useSightWordProgress, useFluencyProgress, useComprehensionProgress } from '@/lib/hooks/useActivities'
import { useUserBadges } from '@/lib/hooks/useBadges'

interface SkillProgress {
  skill: string
  currentLevel: number
  targetLevel: number
  progress: number
  lastAssessed: string
  activitiesCompleted: number
}

const SKILL_PROGRESS: SkillProgress[] = [
  {
    skill: 'Letter Recognition',
    currentLevel: 4,
    targetLevel: 5,
    progress: 80,
    lastAssessed: '2026-02-05',
    activitiesCompleted: 12,
  },
  {
    skill: 'Phonics',
    currentLevel: 3,
    targetLevel: 5,
    progress: 60,
    lastAssessed: '2026-02-04',
    activitiesCompleted: 8,
  },
  {
    skill: 'Sight Words',
    currentLevel: 5,
    targetLevel: 5,
    progress: 100,
    lastAssessed: '2026-02-06',
    activitiesCompleted: 25,
  },
  {
    skill: 'Fluency',
    currentLevel: 2,
    targetLevel: 5,
    progress: 40,
    lastAssessed: '2026-02-03',
    activitiesCompleted: 5,
  },
  {
    skill: 'Comprehension',
    currentLevel: 3,
    targetLevel: 5,
    progress: 60,
    lastAssessed: '2026-02-05',
    activitiesCompleted: 7,
  },
  {
    skill: 'Vocabulary',
    currentLevel: 2,
    targetLevel: 5,
    progress: 40,
    lastAssessed: '2026-02-04',
    activitiesCompleted: 6,
  },
  {
    skill: 'Writing',
    currentLevel: 1,
    targetLevel: 5,
    progress: 20,
    lastAssessed: '2026-02-02',
    activitiesCompleted: 3,
  },
  {
    skill: 'Engagement',
    currentLevel: 4,
    targetLevel: 5,
    progress: 80,
    lastAssessed: '2026-02-06',
    activitiesCompleted: 15,
  },
]

const WEEKLY_PROGRESS = [
  { week: 'Week 1', activities: 18, accuracy: 72 },
  { week: 'Week 2', activities: 20, accuracy: 78 },
  { week: 'Week 3', activities: 22, accuracy: 82 },
  { week: 'Week 4', activities: 25, accuracy: 85 },
  { week: 'Week 5', activities: 21, accuracy: 79 },
]

export default function ProgressVisualization() {
  const { isMuted, toggleMute, playClick, playHover } = useSound()
  
  const { data: sightWordData } = useSightWordProgress()
  const { data: fluencyData } = useFluencyProgress()
  const { data: comprehensionData } = useComprehensionProgress()
  const { data: badgesData } = useUserBadges()
  
  const badges = badgesData?.badges || []
  
  const sightWordProgress = sightWordData as { currentLevel?: string; totalMastered?: number } | undefined
  const fluencyProgress = fluencyData as { currentWpm?: number; currentAccuracy?: number; sessionsCompleted?: number } | undefined
  const comprehensionProgress = comprehensionData as { currentLevel?: number; overallAccuracy?: number; passagesCompleted?: number } | undefined
  
  const skillProgressData = [
    {
      skill: 'Sight Words',
      currentLevel: sightWordProgress?.currentLevel === 'pre-primer' ? 1 : 
                    sightWordProgress?.currentLevel === 'primer' ? 2 : 
                    sightWordProgress?.currentLevel === 'grade-1' ? 3 : 
                    sightWordProgress?.currentLevel === 'grade-2' ? 4 : 1,
      targetLevel: 4,
      progress: sightWordProgress?.totalMastered ? Math.round((sightWordProgress.totalMastered / 100) * 100) : 0,
      lastAssessed: new Date().toISOString().split('T')[0],
      activitiesCompleted: sightWordProgress?.totalMastered || 0,
    },
    {
      skill: 'Fluency',
      currentLevel: fluencyProgress?.currentWpm ? Math.min(Math.floor(fluencyProgress.currentWpm / 20), 5) : 1,
      targetLevel: 5,
      progress: fluencyProgress?.currentAccuracy || 0,
      lastAssessed: new Date().toISOString().split('T')[0],
      activitiesCompleted: fluencyProgress?.sessionsCompleted || 0,
    },
    {
      skill: 'Comprehension',
      currentLevel: comprehensionProgress?.currentLevel || 1,
      targetLevel: 5,
      progress: comprehensionProgress?.overallAccuracy || 0,
      lastAssessed: new Date().toISOString().split('T')[0],
      activitiesCompleted: comprehensionProgress?.passagesCompleted || 0,
    },
  ]
  
  const averageProgress = Math.round(
    skillProgressData.reduce((sum, skill) => sum + skill.progress, 0) / skillProgressData.length
  )
  const totalActivities = skillProgressData.reduce((sum, skill) => sum + skill.activitiesCompleted, 0)
  const weeklyAverage = Math.round(totalActivities / 4)

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden p-4">
      <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '4s' }}>📊</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse" style={{ animationDuration: '3s' }}>⭐</div>
      <div className="absolute top-1/3 left-20 text-4xl animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>📈</div>
      <div className="absolute top-40 left-1/4 w-32 h-32 rounded-full bg-[#B8E0D2]/10 blur-2xl" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-[#FFB5BA]/10 blur-2xl" />

      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#B8E0D2]/20 sticky top-0 z-10 rounded-2xl mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/student" onClick={playClick}>
            <Button 
              variant="outline" 
              onMouseEnter={playHover}
              className="rounded-full border-2 border-[#B8E0D2]/30 hover:bg-[#B8E0D2]/10 hover:border-[#B8E0D2] transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              onMouseEnter={playHover}
              className="rounded-full border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white w-10 h-10 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <div className="text-2xl font-bold text-[#5A4A42] flex items-center gap-2">
              <span>📊</span> Progress Dashboard
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2 flex items-center gap-3">
            <span className="text-5xl">🎯</span>
            Your Progress
          </h1>
          <p className="text-xl text-[#5A4A42]/70">
            Track your amazing learning journey across all skill areas!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#B8E0D2]/20 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Average Progress
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#B8E0D2] flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-4xl font-bold text-[#5A4A42] flex items-center gap-2">
                {averageProgress}%
                <span className="text-2xl">🎯</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#FFB5BA]/20 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Total Activities
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#FFB5BA] flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-4xl font-bold text-[#5A4A42] flex items-center gap-2">
                {totalActivities}
                <span className="text-2xl">📚</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#FFE5B4]/30 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Weekly Average
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#FFE5B4] flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#8B6914]" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-4xl font-bold text-[#5A4A42] flex items-center gap-2">
                {weeklyAverage}
                <span className="text-2xl">📅</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#FF6B6B]/10 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Badges Earned
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-4xl font-bold text-[#5A4A42] flex items-center gap-2">
                {badges.length}
                <span className="text-2xl">🏆</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFB5BA] flex items-center justify-center shadow-md">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#5A4A42]">Skill Progress by Area</CardTitle>
                <CardDescription className="text-[#5A4A42]/70">Your development across all 8 skill areas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {skillProgressData.map((skill) => {
                const isImproving = skill.progress >= 50
                const isProficient = skill.progress >= 80

                return (
                  <Card
                    key={skill.skill}
                    className="rounded-2xl shadow-md border-2 border-[#B8E0D2]/20 hover:shadow-lg hover:border-[#B8E0D2]/40 transition-all bg-white"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-[#5A4A42]">
                          {skill.skill}
                        </CardTitle>
                        {isProficient && (
                          <Badge className="bg-[#B8E0D2] text-[#2D6A4F] border-2 border-[#98D0C0] rounded-full">
                            <span className="mr-1">⭐</span> Proficient
                          </Badge>
                        )}
                        {isImproving && !isProficient && (
                          <Badge className="bg-[#FFB5BA] text-[#8B4557] border-2 border-[#FF9AA2] rounded-full">
                            <span className="mr-1">📈</span> Developing
                          </Badge>
                        )}
                        {!isImproving && (
                          <Badge className="bg-[#FFE5B4] text-[#8B6914] border-2 border-[#FFD966] rounded-full">
                            <span className="mr-1">💪</span> Needs Practice
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#5A4A42]/70">Progress</span>
                          <div className="flex items-center gap-2">
                            {skill.progress > 0 && skill.progress < 50 && (
                              <TrendingDown className="h-4 w-4 text-[#FF6B6B]" />
                            )}
                            {skill.progress >= 50 && (
                              <TrendingUp className="h-4 w-4 text-[#B8E0D2]" />
                            )}
                            <span className="text-2xl font-bold text-[#5A4A42]">
                              {skill.progress}%
                            </span>
                          </div>
                        </div>
                        <Progress value={skill.progress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-[#FF6B6B] [&>div]:to-[#FFB5BA]" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#5A4A42]/70">Current Level</p>
                          <p className="font-semibold text-[#5A4A42]">
                            Level {skill.currentLevel} / {skill.targetLevel}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#5A4A42]/70">Activities</p>
                          <p className="font-semibold text-[#5A4A42]">
                            {skill.activitiesCompleted} completed
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-[#5A4A42]/70">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Last assessed: {new Date(skill.lastAssessed).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B8E0D2] to-[#98D0C0] flex items-center justify-center shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#5A4A42]">Weekly Activity Progress</CardTitle>
                <CardDescription className="text-[#5A4A42]/70">Your activity completion over the past 5 weeks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {WEEKLY_PROGRESS.map((week) => (
                <div
                  key={week.week}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#B8E0D2]/20 hover:bg-[#B8E0D2]/10 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#5A4A42]">
                        {week.week}
                      </h3>
                      <Badge
                        className={`rounded-full border-2 ${
                          week.accuracy >= 80
                            ? 'bg-[#B8E0D2] text-[#2D6A4F] border-[#98D0C0]'
                            : week.accuracy >= 70
                              ? 'bg-[#FFB5BA] text-[#8B4557] border-[#FF9AA2]'
                              : 'bg-[#FFE5B4] text-[#8B6914] border-[#FFD966]'
                        }`}
                      >
                        {week.accuracy}% Accuracy
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#5A4A42]/70">Activities</p>
                        <p className="text-2xl font-bold text-[#5A4A42]">
                          {week.activities}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#5A4A42]/70">Trend</p>
                        <div className="flex items-center gap-1 text-lg font-semibold text-[#5A4A42]">
                          {week.activities >= weeklyAverage && (
                            <TrendingUp className="h-5 w-5 text-[#B8E0D2]" />
                          )}
                          {week.activities < weeklyAverage && (
                            <TrendingDown className="h-5 w-5 text-[#FF6B6B]" />
                          )}
                          {week.activities === weeklyAverage && '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB5BA] to-[#FF9AA2] flex items-center justify-center shadow-md">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#5A4A42]">Learning Goals & Achievements</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#5A4A42] mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Current Goals
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#B8E0D2]/20 to-transparent border-2 border-[#B8E0D2]/30">
                    <div className="w-10 h-10 rounded-full bg-[#B8E0D2] flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#5A4A42]">
                        Master 25 sight words by end of month
                      </p>
                      <p className="text-sm text-[#5A4A42]/70">
                        18 / 25 words learned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#FFB5BA]/20 to-transparent border-2 border-[#FFB5BA]/30">
                    <div className="w-10 h-10 rounded-full bg-[#FFB5BA] flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#5A4A42]">
                        Read at 60+ WPM
                      </p>
                      <p className="text-sm text-[#5A4A42]/70">
                        Current: 54 WPM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#5A4A42] mb-3 flex items-center gap-2">
                  <span className="text-2xl">🏆</span> Recent Achievements
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#B8E0D2]/30 to-transparent border-2 border-[#B8E0D2]/40">
                    <div className="w-12 h-12 rounded-full bg-[#B8E0D2] flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5A4A42]">
                        Sight Words Master
                      </p>
                      <p className="text-sm text-[#5A4A42]/70">
                        Learned all Dolch Pre-primer words
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#FFE5B4]/30 to-transparent border-2 border-[#FFE5B4]/40">
                    <div className="w-12 h-12 rounded-full bg-[#FFE5B4] flex items-center justify-center">
                      <Star className="h-6 w-6 text-[#8B6914]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5A4A42]">
                        Week Streak Champion
                      </p>
                      <p className="text-sm text-[#5A4A42]/70">
                        5 consecutive days of activities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#FFB5BA]/30 to-transparent border-2 border-[#FFB5BA]/40">
                    <div className="w-12 h-12 rounded-full bg-[#FFB5BA] flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5A4A42]">
                        Fluency Improver
                      </p>
                      <p className="text-sm text-[#5A4A42]/70">
                        WPM increased by 15 this week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#98D0C0]/30 to-transparent border-2 border-[#98D0C0]/40">
                    <div className="w-12 h-12 rounded-full bg-[#98D0C0] flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5A4A42]">
                        Goal Achiever
                      </p>
                      <p className="text-sm text-[#5A4A42]/70">
                        Completed monthly reading goal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
