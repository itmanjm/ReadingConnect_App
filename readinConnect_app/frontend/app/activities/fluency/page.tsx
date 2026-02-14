'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Clock, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'
import { ConfettiExplosion, CelebrationMessage } from '@/components/CelebrationEffects'
import { useSubmitFluencySession } from '@/lib/hooks/useActivities'
import { useTrackActivity } from '@/lib/hooks/useBadges'

const PASSAGES = [
  {
    id: 'passage-1',
    title: 'The Cat',
    text: 'The cat sat on the mat. The cat likes to nap. The cat is soft and warm. The cat plays with a ball.',
    wordCount: 26
  },
  {
    id: 'passage-2',
    title: 'The Dog',
    text: 'The dog likes to run. The dog likes to play. The dog is happy. The dog has a big tail.',
    wordCount: 23
  },
  {
    id: 'passage-3',
    title: 'The Sun',
    text: 'The sun is bright. The sun is hot. The sun comes up in the morning. The sun goes down at night.',
    wordCount: 21
  }
]

export default function FluencyTimer() {
  const router = useRouter()
  const { isMuted, toggleMute, playClick, playStart, playWin } = useGameSounds()
  const submitFluencySession = useSubmitFluencySession()
  const trackActivity = useTrackActivity()
  const [currentPassage, setCurrentPassage] = useState(PASSAGES[0])
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [wordsPerMinute, setWordsPerMinute] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [errorCount, setErrorCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebrationMsg, setShowCelebrationMsg] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startTimer = useCallback(() => {
    playStart()
    setTimerRunning(true)
    setCompleted(false)
    setTimeElapsed(0)
    setErrorCount(0)
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const elapsed = Date.now() - startTimeRef.current
        return Math.floor(elapsed / 1000)
      })
    }, 100)
  }, [playStart])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setTimerRunning(false)
    calculateResults()
  }, [])

  const calculateResults = async () => {
    const timeInMinutes = timeElapsed / 60
    if (timeInMinutes > 0) {
      const wpm = Math.round(currentPassage.wordCount / timeInMinutes)
      const correctWords = Math.max(0, currentPassage.wordCount - errorCount)
      const accuracyCalc = Math.max(0, Math.round(100 - (errorCount / currentPassage.wordCount) * 100))
      
      setWordsPerMinute(wpm)
      setAccuracy(accuracyCalc)
      
      setIsSubmitting(true)
      try {
        await submitFluencySession.mutateAsync({
          passageId: currentPassage.id,
          words: currentPassage.wordCount,
          correctWords: correctWords,
          timeSeconds: timeElapsed,
          ageGroup: 5
        })
        
        await trackActivity.mutateAsync({
          activityType: 'fluency',
          score: wpm,
          duration: timeElapsed
        })
        
        if (wpm >= 40 && accuracyCalc >= 80) {
          playWin()
          setShowConfetti(true)
          setShowCelebrationMsg(true)
        }
      } catch (error) {
        console.error('Error submitting fluency session:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
    setCompleted(true)
  }

  const selectPassage = (passage: typeof PASSAGES[0]) => {
    if (timerRunning) return
    playClick()
    setCurrentPassage(passage)
    resetState()
  }

  const resetState = () => {
    playClick()
    setTimerRunning(false)
    setTimeElapsed(0)
    setCompleted(false)
    setWordsPerMinute(null)
    setAccuracy(null)
    setErrorCount(0)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const endGame = () => {
    playClick()
    if (timerRunning) {
      stopTimer()
    }
    router.push('/dashboard/student')
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <ConfettiExplosion active={showConfetti} />
      <CelebrationMessage
        message={wordsPerMinute && wordsPerMinute >= 60 ? "Amazing Speed! 🌟" : "Great Reading! 👍"}
        active={showCelebrationMsg}
        onComplete={() => setShowCelebrationMsg(false)}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 bg-[#B8E0D2] rounded-full opacity-20 -top-10 -left-10 animate-pulse" />
        <div className="absolute w-24 h-24 bg-[#FFB5BA] rounded-full opacity-30 top-40 right-10 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute w-40 h-40 bg-[#FF6B6B] rounded-full opacity-10 bottom-20 left-20" />
        <div className="absolute w-20 h-20 bg-[#B8E0D2] rounded-full opacity-25 top-1/3 left-1/4 animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute w-28 h-28 bg-[#FFB5BA] rounded-full opacity-20 bottom-40 right-1/4 animate-bounce" style={{ animationDuration: '4s' }} />
      </div>

      <nav className="bg-white/80 backdrop-blur-sm border-b-2 border-[#FF6B6B]/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={endGame}
            className="rounded-full border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B] transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-[#FF6B6B]" />
            <span className="text-[#5A4A42]">Back to Dashboard</span>
          </Button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { playClick(); toggleMute(); }}
              className="w-10 h-10 rounded-full bg-white shadow-md border-2 border-[#B8E0D2] flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-[#5A4A42]" />
              ) : (
                <Volume2 className="h-5 w-5 text-[#5A4A42]" />
              )}
            </button>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-[#FF6B6B]/30">
              <Clock className="h-5 w-5 text-[#FF6B6B]" />
              <span className="text-xl font-bold text-[#5A4A42]">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4 relative z-0">
        <Card className="max-w-4xl mx-auto rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B8E0D2] to-[#FFB5BA] flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📖</span>
                </div>
                <CardTitle className="text-3xl font-bold text-[#5A4A42]">Reading Fluency</CardTitle>
              </div>
              {!completed && (
                <Button 
                  onClick={resetState} 
                  variant="outline"
                  className="rounded-full border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/20 transition-all"
                >
                  <RotateCcw className="h-4 w-4 mr-2 text-[#5A4A42]" />
                  <span className="text-[#5A4A42]">Reset</span>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PASSAGES.map((passage) => (
                <Button
                  key={passage.title}
                  onClick={() => selectPassage(passage)}
                  variant={currentPassage.title === passage.title ? 'default' : 'outline'}
                  className={currentPassage.title === passage.title 
                    ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-2xl h-14 text-lg font-semibold shadow-md' 
                    : 'rounded-2xl h-14 text-lg font-semibold border-2 border-[#B8E0D2]/30 hover:border-[#B8E0D2] hover:bg-[#B8E0D2]/10 transition-all'
                  }
                  disabled={timerRunning}
                >
                  {passage.title}
                </Button>
              ))}
            </div>

            {!completed ? (
              <>
                <div className="bg-gradient-to-r from-[#FF6B6B]/5 via-[#FFB5BA]/5 to-[#B8E0D2]/5 p-8 rounded-3xl border-2 border-[#FFB5BA]/20">
                  <h3 className="text-2xl font-bold mb-6 text-[#5A4A42]">
                    {currentPassage.title}
                  </h3>
                  <p className="text-2xl leading-relaxed text-[#5A4A42] font-medium">
                    {currentPassage.text}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {!timerRunning ? (
                    <Button
                      onClick={startTimer}
                      className="bg-gradient-to-r from-[#B8E0D2] to-[#A8D5C7] hover:from-[#A8D5C7] hover:to-[#98CAB7] text-white rounded-full h-16 px-10 text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Play className="h-6 w-6 mr-3" fill="white" />
                      Start Reading
                    </Button>
                  ) : (
                    <Button
                      onClick={stopTimer}
                      className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-16 px-10 text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Pause className="h-6 w-6 mr-3" fill="white" />
                      Stop Reading
                    </Button>
                  )}

                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-md border-2 border-[#FFB5BA]/20">
                    <Target className="h-5 w-5 text-[#FFB5BA]" />
                    <span className="text-lg font-semibold text-[#5A4A42]">Errors:</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => { playClick(); setErrorCount(num); }}
                          className={`h-10 w-10 rounded-xl font-bold transition-all ${
                            errorCount >= num 
                              ? 'bg-gradient-to-br from-[#FFB5BA] to-[#FF6B6B] text-white shadow-md' 
                              : 'bg-gray-100 text-gray-400 border-2 border-gray-200 hover:border-[#FFB5BA]/50'
                          }`}
                        >
                          {errorCount >= num ? '✓' : num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-8">
                <div className="text-6xl mb-4">
                  {wordsPerMinute && wordsPerMinute >= 60 ? '🌟' : wordsPerMinute && wordsPerMinute >= 40 ? '👍' : '💪'}
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <Card className="rounded-2xl border-2 border-[#B8E0D2]/30 bg-gradient-to-br from-white to-[#B8E0D2]/10">
                    <CardContent className="pt-6 text-center">
                      <div className="text-5xl font-bold text-[#B8E0D2]">
                        {wordsPerMinute}
                      </div>
                      <p className="text-[#5A4A42] mt-2 font-medium">Words Per Minute</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-2 border-[#FFB5BA]/30 bg-gradient-to-br from-white to-[#FFB5BA]/10">
                    <CardContent className="pt-6 text-center">
                      <div className="text-5xl font-bold text-[#FFB5BA]">
                        {accuracy}%
                      </div>
                      <p className="text-[#5A4A42] mt-2 font-medium">Accuracy</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-r from-[#FF6B6B]/10 via-[#FFB5BA]/10 to-[#B8E0D2]/10 p-8 rounded-3xl">
                  <p className="text-2xl font-bold text-[#5A4A42] mb-3">
                    {wordsPerMinute && wordsPerMinute >= 60 ? 'Excellent! 🌟' : ''}
                    {wordsPerMinute && wordsPerMinute >= 40 && wordsPerMinute < 60 ? 'Good job! 👍' : ''}
                    {wordsPerMinute && wordsPerMinute < 40 ? 'Keep practicing! 💪' : ''}
                  </p>
                  <p className="text-lg text-[#5A4A42]/70">
                    {currentPassage.wordCount} words in {formatTime(timeElapsed)}
                  </p>
                </div>

                <Button
                  onClick={resetState}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-12 text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Try Another Passage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
