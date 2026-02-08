'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Save, Trash2, ArrowLeft, CheckCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface DayActivity {
  id: string
  activityId: string
  title: string
  type: string
  difficulty: string
  duration: number
}

interface WeeklyPlan {
  weekNumber: number
  letterOfWeek: string
  theme: string
  startDate: string
  endDate: string
  notes: string
  days: {
    monday: DayActivity[]
    tuesday: DayActivity[]
    wednesday: DayActivity[]
    thursday: DayActivity[]
    friday: DayActivity[]
  }
}

const AVAILABLE_ACTIVITIES = [
  {
    id: 'phonics-hunt',
    title: 'Letter Hunt',
    type: 'phonics',
    difficulty: 'easy',
    duration: 10,
  },
  {
    id: 'sight-words-bingo',
    title: 'Sight Word Bingo',
    type: 'sight_words',
    difficulty: 'medium',
    duration: 15,
  },
  {
    id: 'fluency-timer',
    title: 'Reading Timer',
    type: 'fluency',
    difficulty: 'easy',
    duration: 10,
  },
  {
    id: 'comprehension-quiz',
    title: 'Comprehension Quiz',
    type: 'comprehension',
    difficulty: 'medium',
    duration: 15,
  },
  {
    id: 'phonics-match',
    title: 'Phonics Match',
    type: 'phonics',
    difficulty: 'medium',
    duration: 12,
  },
  {
    id: 'vocabulary-cards',
    title: 'Vocabulary Cards',
    type: 'vocabulary',
    difficulty: 'easy',
    duration: 8,
  },
]

const ACTIVITY_COLORS = {
  phonics: 'bg-purple-100 text-purple-800 border-purple-200',
  sight_words: 'bg-blue-100 text-blue-800 border-blue-200',
  fluency: 'bg-orange-100 text-orange-800 border-orange-200',
  comprehension: 'bg-green-100 text-green-800 border-green-200',
  vocabulary: 'bg-pink-100 text-pink-800 border-pink-200',
}

export default function WeeklyPlanBuilder() {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    weekNumber: 1,
    letterOfWeek: 'A',
    theme: '',
    startDate: '',
    endDate: '',
    notes: '',
    days: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
  })

  const [selectedDay, setSelectedDay] = useState<keyof WeeklyPlan['days'] | null>(null)
  const [showActivityPicker, setShowActivityPicker] = useState(false)
  const [saved, setSaved] = useState(false)

  const addActivity = (day: keyof WeeklyPlan['days'], activity: any) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: [...prev.days[day], { ...activity, id: `${day}-${Date.now()}` }],
      },
    }))
  }

  const removeActivity = (day: keyof WeeklyPlan['days'], activityId: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: prev.days[day].filter((a) => a.id !== activityId),
      },
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const totalActivities = Object.values(weeklyPlan.days).reduce((sum: number, activities) => sum + activities.length, 0)
  const totalDuration = Object.values(weeklyPlan.days).reduce((sum: number, activities) =>
    sum + activities.reduce((daySum: number, a) => daySum + a.duration, 0), 0)

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute top-20 right-20 text-5xl animate-bounce">📅</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">🗓️</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{animationDelay: '1s'}}>✏️</div>
      <div className="absolute bottom-20 right-20 text-5xl animate-bounce" style={{animationDelay: '0.5s'}}>🎯</div>
      <div className="absolute top-1/2 right-10 text-3xl animate-pulse" style={{animationDelay: '1.5s'}}>📚</div>
      
      {/* Decorative Circles */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#FF6B6B]/10 blur-2xl" />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#B8E0D2]/20 blur-2xl" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-[#FFB5BA]/15 blur-xl" />

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b-4 border-[#FF6B6B]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/teacher">
            <Button variant="outline" className="rounded-full border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-2xl font-bold text-[#FF6B6B] flex items-center gap-2">
            <span className="text-3xl">📅</span>
            <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] bg-clip-text text-transparent">
              Weekly Plan Builder
            </span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5A4A42] mb-3">
            Create Weekly Plan
          </h1>
          <p className="text-xl text-[#5A4A42]/70 max-w-2xl mx-auto">
            Design a week of learning activities for your students ✨
          </p>
        </div>

        {/* Plan Information Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔢</span>
                <CardTitle className="text-lg font-bold text-[#5A4A42]">Week Number</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={weeklyPlan.weekNumber}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, weekNumber: parseInt(e.target.value) || 1 })}
                min="1"
                max="52"
                className="rounded-2xl border-2 border-[#FFB5BA]/30 h-14 text-center text-2xl font-bold"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔤</span>
                <CardTitle className="text-lg font-bold text-[#5A4A42]">Letter of the Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={weeklyPlan.letterOfWeek}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, letterOfWeek: e.target.value.toUpperCase().slice(0, 1) })}
                maxLength={1}
                className="rounded-2xl border-2 border-[#FFB5BA]/30 text-center text-5xl font-black h-20 bg-gradient-to-br from-[#FFB5BA]/20 to-[#FF6B6B]/20"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <CardTitle className="text-lg font-bold text-[#5A4A42]">Theme</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="e.g., Animals, Weather, Colors"
                value={weeklyPlan.theme}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, theme: e.target.value })}
                className="rounded-2xl border-2 border-[#B8E0D2]/30 h-14 text-center"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <Label htmlFor="start-date" className="text-lg font-bold text-[#5A4A42]">Start Date</Label>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                id="start-date"
                type="date"
                value={weeklyPlan.startDate}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, startDate: e.target.value })}
                className="rounded-2xl border-2 border-[#FFB5BA]/30 h-14 text-center"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏁</span>
                <Label htmlFor="end-date" className="text-lg font-bold text-[#5A4A42]">End Date</Label>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                id="end-date"
                type="date"
                value={weeklyPlan.endDate}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, endDate: e.target.value })}
                className="rounded-2xl border-2 border-[#FFB5BA]/30 h-14 text-center"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1 rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💭</span>
                <CardTitle className="text-lg font-bold text-[#5A4A42]">Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Add any notes about this week..."
                value={weeklyPlan.notes}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, notes: e.target.value })}
                className="rounded-2xl border-2 border-[#B8E0D2]/30 h-14"
              />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          {(Object.keys(weeklyPlan.days) as Array<keyof WeeklyPlan['days']>).map((day) => (
            <Card key={day} className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-[#5A4A42]">
                  <span className="capitalize font-black text-lg">{day}</span>
                  <span className="text-2xl">
                    {day === 'monday' && '🌅'}
                    {day === 'tuesday' && '🌞'}
                    {day === 'wednesday' && '🌤️'}
                    {day === 'thursday' && '🌈'}
                    {day === 'friday' && '🎉'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyPlan.days[day].map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-2xl bg-[#FFF8F0] border-2 border-[#FFB5BA]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-[#5A4A42] text-sm">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs rounded-full px-2 py-1 ${ACTIVITY_COLORS[activity.type as keyof typeof ACTIVITY_COLORS]}`}>
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-[#5A4A42]/70 font-medium">
                            ⏱️ {activity.duration} min
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeActivity(day, activity.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {weeklyPlan.days[day].length === 0 && (
                  <div className="text-center py-6 text-[#5A4A42]/50 bg-[#FFF8F0]/50 rounded-2xl border-2 border-dashed border-[#FFB5BA]/30">
                    <span className="text-3xl mb-2 block">📚</span>
                    <p className="text-sm font-medium">No activities planned</p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setSelectedDay(day)
                    setShowActivityPicker(true)
                  }}
                  className="w-full rounded-full border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B]/50 transition-all"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary & Actions */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-6">
            <div className="text-lg text-[#5A4A42] bg-white/80 px-4 py-2 rounded-full shadow-lg border-2 border-[#FFB5BA]/30">
              <span className="font-black text-[#FF6B6B]">{totalActivities}</span> <span className="font-medium">activities</span>
            </div>
            <div className="text-lg text-[#5A4A42] bg-white/80 px-4 py-2 rounded-full shadow-lg border-2 border-[#B8E0D2]/30">
              <span className="font-black text-[#FF6B6B]">{totalDuration}</span> <span className="font-medium">minutes total</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12 px-6 border-2 border-[#FFB5BA]/50 hover:bg-[#FFB5BA]/10">
              Clear All
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-12 px-8 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
          </div>
        </div>

        {/* Activity Picker */}
        {showActivityPicker && selectedDay && (
          <Card className="rounded-3xl shadow-xl border-4 border-[#B8E0D2] bg-gradient-to-br from-[#B8E0D2]/30 to-[#FFB5BA]/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[#5A4A42]">
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span className="text-xl">Add Activity to {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</span>
                </span>
                <Button
                  onClick={() => setShowActivityPicker(false)}
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-[#FF6B6B]/10"
                >
                  <span className="text-xl">✕</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {AVAILABLE_ACTIVITIES.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => {
                      addActivity(selectedDay, activity)
                      setShowActivityPicker(false)
                    }}
                    className="p-4 rounded-2xl bg-white border-2 border-[#FFB5BA]/30 hover:border-[#FF6B6B]/50 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-[#5A4A42] group-hover:text-[#FF6B6B] transition-colors">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs rounded-full ${ACTIVITY_COLORS[activity.type as keyof typeof ACTIVITY_COLORS]}`}>
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-[#5A4A42]/70">
                            ⏱️ {activity.duration} min
                          </span>
                          <Badge variant="outline" className="text-xs rounded-full">
                            {activity.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <Plus className="h-5 w-5 text-[#FF6B6B] group-hover:scale-110 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {saved && (
          <Card className="rounded-3xl shadow-xl border-4 border-green-200 bg-green-50 animate-pulse">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">🎉</span>
                <p className="text-xl font-black text-green-700">
                  Weekly plan saved successfully!
                </p>
                <span className="text-4xl">🎉</span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
