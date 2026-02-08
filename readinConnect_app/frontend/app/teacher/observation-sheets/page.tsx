'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, Plus, Trash2, ArrowLeft, Clipboard, Download, Calendar, CheckCircle, Star, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface SkillObservation {
  skill: string
  mastery: 'not_yet' | 'emerging' | 'developing' | 'proficient'
  notes: string
}

interface ObservationSheet {
  id: string
  studentId: string
  studentName: string
  weekDate: string
  observations: SkillObservation[]
  notes: string
  recommendations: string
}

const SKILL_AREAS = [
  'Letter Recognition',
  'Phonemic Awareness',
  'Phonics',
  'Sight Words',
  'Fluency',
  'Comprehension',
  'Writing',
  'Engagement',
]

const MASTERY_LEVELS = {
  not_yet: { label: 'Not Yet', color: 'bg-red-100 text-red-800', value: 0, emoji: '🔴' },
  emerging: { label: 'Emerging', color: 'bg-orange-100 text-orange-800', value: 1, emoji: '🟠' },
  developing: { label: 'Developing', color: 'bg-yellow-100 text-yellow-800', value: 2, emoji: '🟡' },
  proficient: { label: 'Proficient', color: 'bg-green-100 text-green-800', value: 3, emoji: '🟢' },
} as const

export default function ObservationSheetBuilder() {
  const [observationSheet, setObservationSheet] = useState<ObservationSheet>({
    id: '',
    studentId: '',
    studentName: '',
    weekDate: new Date().toISOString().split('T')[0],
    observations: SKILL_AREAS.map((skill) => ({
      skill,
      mastery: 'not_yet',
      notes: '',
    })),
    notes: '',
    recommendations: '',
  })

  const [saved, setSaved] = useState(false)

  const updateObservation = (index: number, field: keyof SkillObservation, value: any) => {
    setObservationSheet((prev) => {
      const newObservations = [...prev.observations]
      newObservations[index] = { ...newObservations[index], [field]: value }
      return { ...prev, observations: newObservations }
    })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const getMasteryCount = (level: keyof typeof MASTERY_LEVELS) => {
    return observationSheet.observations.filter((o) => o.mastery === level).length
  }

  const overallProgress = Math.round(
    observationSheet.observations.reduce((sum: number, o) => sum + MASTERY_LEVELS[o.mastery].value, 0) /
      (observationSheet.observations.length * MASTERY_LEVELS.proficient.value) * 100
  )

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute top-20 right-20 text-5xl animate-bounce">✏️</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">📊</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{animationDelay: '1s'}}>🎯</div>
      <div className="absolute bottom-20 right-20 text-5xl animate-bounce" style={{animationDelay: '0.5s'}}>⭐</div>
      <div className="absolute top-1/2 right-10 text-3xl animate-pulse" style={{animationDelay: '1.5s'}}>📝</div>

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
            <span className="text-3xl">📝</span>
            <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] bg-clip-text text-transparent">
              Observation Sheet
            </span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5A4A42] mb-3">
            Student Observation Sheet
          </h1>
          <p className="text-xl text-[#5A4A42]/70 max-w-2xl mx-auto">
            Track student progress and provide personalized feedback ✨
          </p>
        </div>

        {/* Student Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <Label htmlFor="student-name" className="text-lg font-bold text-[#5A4A42]">Student Name</Label>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                id="student-name"
                type="text"
                placeholder="Enter student name"
                value={observationSheet.studentName}
                onChange={(e) => setObservationSheet({ ...observationSheet, studentName: e.target.value })}
                className="rounded-2xl border-2 border-[#FFB5BA]/30 h-14 text-lg text-center"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <Label htmlFor="week-date" className="text-lg font-bold text-[#5A4A42]">Week Date</Label>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                id="week-date"
                type="date"
                value={observationSheet.weekDate}
                onChange={(e) => setObservationSheet({ ...observationSheet, weekDate: e.target.value })}
                className="rounded-2xl border-2 border-[#B8E0D2]/30 h-14 text-lg text-center"
              />
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="rounded-3xl shadow-xl border-4 border-white bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
                <span>🔴</span> Not Yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-red-800">
                {getMasteryCount('not_yet')}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-orange-700 flex items-center gap-2">
                <span>🟠</span> Emerging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-orange-800">
                {getMasteryCount('emerging')}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-yellow-700 flex items-center gap-2">
                <span>🟡</span> Developing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-yellow-800">
                {getMasteryCount('developing')}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-green-700 flex items-center gap-2">
                <span>🟢</span> Proficient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-green-800">
                {getMasteryCount('proficient')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <CardTitle className="text-2xl text-[#5A4A42]">Overall Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="h-6 bg-[#FFE4DC] rounded-full overflow-hidden border-2 border-[#FFB5BA]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] transition-all duration-500 rounded-full"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
              <div className="text-5xl font-black text-[#FF6B6B]">
                {overallProgress}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Observations */}
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <CardTitle className="text-2xl text-[#5A4A42]">Skill Observations</CardTitle>
            </div>
            <CardDescription className="text-lg text-[#5A4A42]/70">
              Rate student progress in each skill area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {observationSheet.observations.map((observation, index) => (
                <div
                  key={observation.skill}
                  className="p-5 rounded-2xl bg-[#FFF8F0] border-2 border-[#FFB5BA]/30 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{['🔤', '🎧', '📖', '👁️', '📚', '🧠', '✍️', '😊'][index]}</span>
                      <h3 className="text-lg font-bold text-[#5A4A42]">
                        {observation.skill}
                      </h3>
                    </div>
                    <Badge className="rounded-full px-4 py-1 bg-[#B8E0D2] text-[#5A4A42] border-0">
                      Skill {index + 1}
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(MASTERY_LEVELS).map(([level, config]) => (
                      <button
                        key={level}
                        onClick={() => updateObservation(index, 'mastery', level)}
                        className={`
                          flex-1 min-w-[120px] py-3 px-4 rounded-2xl font-bold transition-all transform hover:scale-105
                          ${observation.mastery === level
                            ? `${config.color} ring-4 ring-offset-2 ring-offset-[#FFF8F0] shadow-lg`
                            : 'bg-white border-2 border-[#FFB5BA]/30 hover:bg-[#FFB5BA]/10'}
                        `}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <span>{config.emoji}</span>
                          <span>{config.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <Input
                    type="text"
                    placeholder="Add notes about this skill..."
                    value={observation.notes}
                    onChange={(e) => updateObservation(index, 'notes', e.target.value)}
                    className="mt-4 rounded-2xl border-2 border-[#B8E0D2]/30 h-12"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* General Notes & Recommendations */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💭</span>
                <Label htmlFor="general-notes" className="text-lg font-bold text-[#5A4A42]">General Notes</Label>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                id="general-notes"
                type="text"
                placeholder="Overall observations about student..."
                value={observationSheet.notes}
                onChange={(e) => setObservationSheet({ ...observationSheet, notes: e.target.value })}
                className="rounded-2xl border-2 border-[#FFB5BA]/30 h-14"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <Label htmlFor="recommendations" className="text-lg font-bold text-[#5A4A42]">Recommendations</Label>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                id="recommendations"
                type="text"
                placeholder="Suggestions for home practice..."
                value={observationSheet.recommendations}
                onChange={(e) => setObservationSheet({ ...observationSheet, recommendations: e.target.value })}
                className="rounded-2xl border-2 border-[#FFB5BA]/30 h-14"
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12 px-6 border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10">
              <Clipboard className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button variant="outline" className="rounded-full h-12 px-6 border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/20">
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
          </div>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-8 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Observation
          </Button>
        </div>

        {/* Success Message */}
        {saved && (
          <Card className="rounded-3xl shadow-xl border-4 border-green-200 bg-green-50 mb-8 animate-pulse">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">🎉</span>
                <p className="text-xl font-black text-green-700">
                  Observation saved successfully!
                </p>
                <span className="text-4xl">🎉</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-gradient-to-br from-[#B8E0D2]/30 to-[#FFB5BA]/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <CardTitle className="text-2xl text-[#5A4A42]">Tips for Effective Observations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/80">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-bold text-[#5A4A42]">Be Specific</p>
                  <p className="text-sm text-[#5A4A42]/70">
                    Note exactly what the student can or cannot do
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/80">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-bold text-[#5A4A42]">Include Evidence</p>
                  <p className="text-sm text-[#5A4A42]/70">
                    Reference specific activities or work samples
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/80">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-bold text-[#5A4A42]">Set Goals</p>
                  <p className="text-sm text-[#5A4A42]/70">
                    Identify 1-2 actionable steps for next week
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/80">
                <span className="text-2xl">🌈</span>
                <div>
                  <p className="font-bold text-[#5A4A42]">Be Positive</p>
                  <p className="text-sm text-[#5A4A42]/70">
                    Focus on strengths alongside areas for growth
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
