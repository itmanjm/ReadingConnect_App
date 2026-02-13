'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Volume2, RotateCcw, VolumeX, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects'
import { usePhonemeAudio } from '@/lib/hooks/usePhonemeAudio'
import { useProgress } from '@/lib/hooks/useProgress'

const PHONICS_PHASES = [
  {
    id: 1,
    name: 'Getting Started',
    phonemes: ['s', 'a_short', 't', 'p', 'i_short', 'n'],
    description: 'Most common letters',
    letters: ['S', 'A', 'T', 'P', 'I', 'N'],
    masteryThreshold: 2
  },
  {
    id: 2,
    name: 'Building Words',
    phonemes: ['m', 'd', 'g', 'o_short', 'k', 'e_short'],
    description: 'Add consonants to build CVC words',
    letters: ['M', 'D', 'G', 'O', 'K', 'E'],
    masteryThreshold: 2
  },
  {
    id: 3,
    name: 'Word Families',
    phonemes: ['r', 'b', 'f', 'l', 'h', 'u_short'],
    description: 'Learn word family patterns',
    letters: ['R', 'B', 'F', 'L', 'H', 'U'],
    masteryThreshold: 3
  },
  {
    id: 4,
    name: 'Blends & Digraphs',
    phonemes: ['ch', 'sh', 'th_unvoiced', 'th_voiced', 'ng', 'wh'],
    description: 'Advanced letter combinations',
    letters: ['CH', 'SH', 'TH', 'NG', 'WH'],
    masteryThreshold: 4
  },
  {
    id: 5,
    name: 'Long Vowels',
    phonemes: ['a_long', 'e_long', 'i_long', 'o_long', 'u_long'],
    description: 'Learn long vowel sounds',
    letters: ['A', 'E', 'I', 'O', 'U'],
    masteryThreshold: 3
  },
  {
    id: 6,
    name: 'All Letters',
    phonemes: [],
    description: 'Practice the full alphabet',
    letters: [],
    masteryThreshold: 5
  }
]

const EXAMPLE_WORDS: Record<string, { word: string; uses: string[] }> = {
  'S': { word: 'Sun', uses: ['snake', 'seven', 'see'] },
  'A': { word: 'Cat', uses: ['hat', 'mat', 'bat'] },
  'T': { word: 'Top', uses: ['pot', 'hot', 'cot'] },
  'P': { word: 'Pan', uses: ['cat', 'hat', 'map'] },
  'I': { word: 'Pig', uses: ['dig', 'big', 'sit'] },
  'N': { word: 'Net', uses: ['nap', 'not', 'hot'] },
  'M': { word: 'Map', uses: ['hat', 'cat', 'bat'] },
  'D': { word: 'Dog', uses: ['log', 'fog', 'dot'] },
  'G': { word: 'Goat', uses: ['got', 'log', 'bag'] },
  'O': { word: 'Fox', uses: ['hot', 'pot', 'dog'] },
  'B': { word: 'Bus', uses: ['bat', 'sun', 'cup'] },
  'F': { word: 'Fan', uses: ['fat', 'fun', 'pan'] },
  'L': { word: 'Log', uses: ['hat', 'cat', 'dog'] },
  'H': { word: 'Hat', uses: ['hot', 'cat', 'bag'] },
  'R': { word: 'Rat', uses: ['hat', 'cat', 'bat'] },
  'U': { word: 'Cup', uses: ['fun', 'run', 'sun'] },
  'CH': { word: 'Chip', uses: ['chat', 'chin', 'chop'] },
  'SH': { word: 'Ship', uses: ['sheep', 'shoe', 'shop'] },
  'TH': { word: 'Three', uses: ['thank', 'think', 'both'] },
  'WH': { word: 'Wheel', uses: ['white', 'when', 'what'] },
  'NG': { word: 'Song', uses: ['sing', 'long', 'ring'] }
}

export default function PhonicsLetterHunt() {
  const router = useRouter()
  const { isMuted, toggleMute, playCorrect, playWrong, playStreak, playClick, playStart } = useGameSounds()
  const { playPhoneme, playLetterExample, getPhonemeInfo } = usePhonemeAudio()
  const { progress, updatePhonicsProgress, getAgeAppropriateSettings, isLoaded } = useProgress()

  const [currentPhase, setCurrentPhase] = useState(1)
  const [targetPhoneme, setTargetPhoneme] = useState('')
  const [targetLetter, setTargetLetter] = useState('')
  const [showLetter, setShowLetter] = useState(false)
  const [showPhoneme, setShowPhoneme] = useState(true)
  const [score, setScore] = useState(0)
  const [mastery, setMastery] = useState<Record<string, number>>({})
  const [streak, setStreak] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStarBurst, setShowStarBurst] = useState(false)
  const [showCelebrationMsg, setShowCelebrationMsg] = useState(false)
  const [gameActive, setGameActive] = useState(false)

  const settings = getAgeAppropriateSettings()

  const currentPhaseData = PHONICS_PHASES.find(p => p.id === currentPhase) || PHONICS_PHASES[0]

  const startGame = useCallback(() => {
    if (!currentPhaseData?.phonemes || currentPhaseData.phonemes.length === 0) {
      setCurrentPhase(prev => Math.min(prev + 1, PHONICS_PHASES.length))
      return
    }

    const availablePhonemes = currentPhaseData.phonemes.filter(p => !progress.phonics.masteredLetters.includes(p))
    if (availablePhonemes.length === 0) {
      setCurrentPhase(prev => Math.min(prev + 1, PHONICS_PHASES.length))
      return
    }

    const randomPhoneme = availablePhonemes[Math.floor(Math.random() * availablePhonemes.length)]
    setTargetPhoneme(randomPhoneme)

    const phonemeInfo = getPhonemeInfo ? getPhonemeInfo(randomPhoneme) : null
    setTargetLetter(phonemeInfo?.symbol?.toUpperCase() || randomPhoneme.toUpperCase())

    setShowLetter(false)
    setShowPhoneme(true)
    setShowConfetti(false)
    setShowStarBurst(false)
    setShowCelebrationMsg(false)
    setGameActive(true)
  }, [currentPhase, progress])

  useEffect(() => {
    if (isLoaded) {
      startGame()
      playStart()
    }
  }, [isLoaded])

  const revealLetter = () => {
    setShowLetter(true)
    setShowPhoneme(false)
  }

  const hidePhoneme = () => {
    setShowPhoneme(false)
  }

  const checkAnswer = (letter: string) => {
    const isCorrect = letter.toUpperCase() === targetLetter
    setShowLetter(true)
    setShowPhoneme(false)

    if (isCorrect) {
      playCorrect()

      setStreak((prev) => {
        const newStreak = prev + 1
        if (newStreak > 1) {
          playStreak(newStreak)
          if (newStreak === 3 || newStreak === 5 || newStreak === 10) {
            setShowStarBurst(true)
            setShowCelebrationMsg(true)
            setTimeout(() => setShowStarBurst(false), 1000)
          }
        }
        return newStreak
      })

      setScore((prev) => prev + 1)

      setMastery((prev) => {
        const currentMastery = prev[targetLetter] || 0
        return {
          ...prev,
          [targetLetter]: Math.min(currentMastery + 1, 5)
        }
      })

      updatePhonicsProgress({
        masteredLetters: [...new Set([...progress.phonics.masteredLetters, targetLetter])],
        correctAnswers: progress.phonics.correctAnswers + 1,
        totalAttempts: progress.phonics.totalAttempts + 1,
        streak: Math.max(progress.phonics.streak, streak)
      })

      setShowConfetti(true)

      setTimeout(() => {
        setShowConfetti(false)
        startGame()
      }, 1500)
    } else {
      playWrong()
      setStreak(0)
      setMastery((prev) => ({
        ...prev,
        [targetLetter]: 0
      }))

      updatePhonicsProgress({
        totalAttempts: progress.phonics.totalAttempts + 1,
        streak: 0
      })

      setTimeout(() => {
        setShowLetter(false)
        setShowPhoneme(true)
      }, 1500)
    }
  }

  const getLetterStatus = (letter: string) => {
    const currentMastery = mastery[letter] || 0
    if (currentMastery >= 5) return 'mastered'
    if (currentMastery >= 3) return 'learning'
    return 'new'
  }

  const getLetterButtonClass = (letter: string) => {
    const letterMastery = mastery[letter] || 0
    const status = getLetterStatus(letter)
    const isSelected = letter === targetLetter

    if (status === 'mastered') {
      return 'bg-[#B8E0D2] text-white cursor-not-allowed transform scale-95'
    }
    if (status === 'learning') {
      return 'bg-[#FFE5B4]/50 border-2 border-[#FFE5B4]'
    }
    if (isSelected) {
      return 'bg-white border-2 border-[#FFB5BA]'
    }
    return 'bg-white border-2 border-[#FFE5B4]/30 hover:border-[#FFB5BA]'
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFB5BA]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/student')}
            className="rounded-full border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-[#8B7355]" />
              ) : (
                <Volume2 className="h-5 w-5 text-[#4ECDC4]" />
              )}
            </button>

            <div className="flex items-center gap-2 bg-[#FFE5B4] px-4 py-2 rounded-full">
              <span className="text-xl">⭐</span>
              <span className="font-black text-[#5A4A42]">{score}</span>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-2 bg-[#FF6B6B] px-4 py-2 rounded-full animate-pulse">
                <span className="text-xl">🔥</span>
                <span className="font-black text-white">{streak} streak!</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 relative">
        <ConfettiExplosion active={showConfetti} />
        <StarBurst
          active={showStarBurst}
          x={typeof window !== 'undefined' ? window.innerWidth / 2 : 400}
          y={typeof window !== 'undefined' ? window.innerHeight / 2 : 300}
        />
        <CelebrationMessage
          message={streak >= 5 ? "Amazing Streak! 🔥" : "Great Job! ⭐"}
          active={showCelebrationMsg}
          onComplete={() => setShowCelebrationMsg(false)}
        />

        <Card className="max-w-4xl mx-auto bg-white border-0 shadow-2xl shadow-[#FFB5BA]/20 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#FFB5BA]/10 to-[#FFE5B4]/10 border-b border-[#FFB5BA]/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFB5BA] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-[#5A4A42]">Phonics: Letter Sounds</CardTitle>
                  <p className="text-sm text-[#8B7355]">Phase {currentPhase}: {currentPhaseData.name}</p>
                </div>
              </div>

              <Button
                onClick={() => { playClick(); setCurrentPhase(1); setMastery({}); }}
                variant="outline"
                className="rounded-full border-2 border-[#B8E0D2] text-[#B8E0D2] hover:bg-[#B8E0D2]/20 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            <div className="text-center space-y-6">
              <div>
                <p className="text-xl text-[#5A4A42] font-medium mb-4">
                  Find the letter that sounds like:
                </p>
                <div className="flex justify-center gap-4">
                  {showPhoneme && (
                    <button
                      onClick={() => playPhoneme(targetPhoneme, isMuted)}
                      className="w-24 h-24 bg-[#FF6B6B] hover:bg-[#FF5252] rounded-3xl shadow-xl shadow-[#FF6B6B]/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    >
                      <Volume2 className="h-12 w-12 text-white" />
                    </button>
                  )}
                  {showLetter && (
                    <div className="bg-[#FFE5B4]/20 rounded-2xl p-6 inline-block">
                      <span className="text-4xl font-black text-[#FF6B6B]">{targetLetter}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={revealLetter}
                    className="text-[#FFE5B4] hover:text-[#FF6B6B] font-bold transition-colors"
                  >
                    💡 Show letter
                  </button>
                  {!showLetter && (
                    <button
                      onClick={hidePhoneme}
                      className="text-[#B8E0D2] hover:text-[#4ECDC4] font-bold transition-colors"
                    >
                      🔊 Show sound
                    </button>
                  )}
                </div>
              </div>

              {EXAMPLE_WORDS[targetLetter] && (
                <div className="bg-[#B8E0D2]/10 p-6 rounded-2xl">
                  <p className="text-sm text-[#8B7355] mb-3">
                    The letter <strong>"{targetLetter}"</strong> makes the <span className="text-[#4ECDC4]">/æ/</span> sound in words like:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {EXAMPLE_WORDS[targetLetter].uses.map((word, idx) => (
                      <span key={idx} className="bg-white px-3 py-1 rounded-lg text-sm text-[#5A4A42]">
                        "{word}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-6 gap-3">
              {currentPhaseData.letters.map((letter) => {
                const status = getLetterStatus(letter)
                const isSelected = letter === targetLetter

                return (
                  <button
                    key={letter}
                    onClick={() => { playClick(); checkAnswer(letter); }}
                    disabled={showLetter || (status === 'mastered')}
                    className={`
                      aspect-square text-2xl font-black rounded-2xl
                      transition-all duration-200 transform hover:scale-110 active:scale-95
                      ${getLetterButtonClass(letter)}
                    `}
                  >
                    {letter}
                    {status === 'mastered' && <span className="absolute top-1 right-1 text-lg">✓</span>}
                  </button>
                )
              })}
            </div>

            {!gameActive && (
              <div className="text-center space-y-6">
                <div className="text-8xl font-black text-[#FF6B6B] animate-bounce">
                  {targetLetter}
                </div>
                 <p className="text-2xl text-[#8B7355]">
                  Great job! You found the <strong>{getPhonemeInfo(targetPhoneme)?.symbol || targetLetter}</strong> sound!
                </p>
                <Button
                  onClick={() => { playClick(); startGame(); }}
                  className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white text-xl px-8 py-6 rounded-full shadow-xl shadow-[#FF6B6B]/30"
                >
                  Play Again 🎮
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
