'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Volume2, RotateCcw, VolumeX, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects'
import { submitPhonicsAnswer, checkPhaseAccess } from '@/lib/api/activities'
import { trackActivity } from '@/lib/api/badges'
import type { PhonicsAnswerResult } from '@/types/activities'
import { playPhoneme, getPhonemeInfo as getEdgeTTSPhonemeInfo, preloadPhonemes, getAllPhonemes } from '@/lib/audio/edgeTTSPhonics'
import { useCVCWords, useCVCWordFamilies, CVCWord } from '@/lib/hooks/useCVCWords'
import { useAuthStore } from '@/lib/stores/auth'

const PHONICS_PHASES = [
  {
    id: 1,
    name: 'Getting Started',
    phonemes: ['s', 'a', 't', 'p', 'i', 'n'],
    description: 'Most common letters',
    letters: ['S', 'A', 'T', 'P', 'I', 'N'],
    masteryThreshold: 2
  },
  {
    id: 2,
    name: 'Building Words',
    phonemes: ['c', 'k', 'e', 'h', 'r', 'm', 'd'],
    description: 'Add consonants to build CVC words',
    letters: ['C', 'K', 'E', 'H', 'R', 'M', 'D'],
    masteryThreshold: 2
  },
  {
    id: 3,
    name: 'Word Families',
    phonemes: ['g', 'o', 'u', 'l', 'f', 'b'],
    description: 'Learn word family patterns',
    letters: ['G', 'O', 'U', 'L', 'F', 'B'],
    masteryThreshold: 3
  },
  {
    id: 4,
    name: 'Vowel Teams',
    phonemes: ['ai', 'ee', 'ie', 'oa', 'or', 'j'],
    description: 'Advanced letter combinations',
    letters: ['AI', 'EE', 'IE', 'OA', 'OR', 'J'],
    masteryThreshold: 4
  },
  {
    id: 5,
    name: 'Advanced Phonemes',
    phonemes: ['z', 'w', 'ng', 'v', 'oo_long', 'oo_short', 'y', 'x', 'ch', 'sh', 'th_unvoiced', 'th_voiced'],
    description: 'More complex sounds',
    letters: ['Z', 'W', 'NG', 'V', 'OO', 'Y', 'X', 'CH', 'SH', 'TH'],
    masteryThreshold: 4
  },
  {
    id: 6,
    name: 'All Letters',
    phonemes: ['qu', 'ou', 'oi', 'ue', 'er', 'ar'],
    description: 'Practice the full alphabet',
    letters: ['QU', 'OU', 'OI', 'UE', 'ER', 'AR'],
    masteryThreshold: 5
  }
]

const EXAMPLE_WORDS: Record<string, { word: string; uses: string[] }> = {
  'S': { word: 'Snake', uses: ['seven', 'see', 'sand'] },
  'A': { word: 'Apple', uses: ['hat', 'mat', 'cat'] },
  'T': { word: 'Tennis', uses: ['pot', 'hot', 'cot'] },
  'P': { word: 'Puff', uses: ['pan', 'pig', 'pen'] },
  'I': { word: 'Insect', uses: ['pig', 'dig', 'big'] },
  'N': { word: 'Net', uses: ['nap', 'not', 'nut'] },
  'C': { word: 'Castanet', uses: ['cat', 'cot', 'cup'] },
  'K': { word: 'Kite', uses: ['kit', 'kin', 'key'] },
  'E': { word: 'Egg', uses: ['net', 'met', 'set'] },
  'H': { word: 'Hat', uses: ['hot', 'hit', 'hut'] },
  'R': { word: 'Rat', uses: ['run', 'red', 'rug'] },
  'M': { word: 'Map', uses: ['man', 'met', 'mat'] },
  'D': { word: 'Drum', uses: ['dog', 'dig', 'dad'] },
  'G': { word: 'Goat', uses: ['got', 'gap', 'get'] },
  'O': { word: 'Orange', uses: ['pot', 'hot', 'cot'] },
  'U': { word: 'Umbrella', uses: ['up', 'us', 'ug'] },
  'L': { word: 'Log', uses: ['let', 'lot', 'lap'] },
  'F': { word: 'Fan', uses: ['fat', 'fun', 'fit'] },
  'B': { word: 'Ball', uses: ['bat', 'bed', 'bag'] },
  'AI': { word: 'Rain', uses: ['pain', 'main', 'tail'] },
  'EE': { word: 'Tree', uses: ['see', 'bee', 'free'] },
  'IE': { word: 'Pie', uses: ['tie', 'lie', 'die'] },
  'OA': { word: 'Boat', uses: ['coat', 'goat', 'road'] },
  'OR': { word: 'Corn', uses: ['fork', 'horn', 'born'] },
  'J': { word: 'Jelly', uses: ['jet', 'jar', 'jam'] },
  'Z': { word: 'Zip', uses: ['zoo', 'zebra', 'zero'] },
  'W': { word: 'Wind', uses: ['wet', 'win', 'web'] },
  'NG': { word: 'Ring', uses: ['sing', 'long', 'bang'] },
  'V': { word: 'Van', uses: ['vet', 'vat', 'vase'] },
  'OO': { word: 'Moon/Book', uses: ['soon', 'food', 'look', 'cook'] },
  'Y': { word: 'Yoyo', uses: ['yes', 'you', 'yard'] },
  'X': { word: 'Box', uses: ['fox', 'mix', 'fix'] },
  'CH': { word: 'Church', uses: ['chip', 'chat', 'chop'] },
  'SH': { word: 'Ship', uses: ['sheep', 'shoe', 'shop'] },
  'TH': { word: 'Thumb/This', uses: ['thank', 'think', 'that', 'this'] },
  'QU': { word: 'Queen', uses: ['quit', 'quiz', 'quick'] },
  'OU': { word: 'Out', uses: ['house', 'mouse', 'mouth'] },
  'OI': { word: 'Coin', uses: ['boil', 'soil', 'oil'] },
  'UE': { word: 'Blue', uses: ['true', 'due', 'glue'] },
  'ER': { word: 'Her', uses: ['term', 'fern', 'herb'] },
  'AR': { word: 'Car', uses: ['star', 'far', 'bar']
  }
}

export default function PhonicsLetterHunt() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isMuted, toggleMute, playCorrect, playWrong, playStreak, playClick, playStart } = useGameSounds()
  const { words: cvcWords, loading: cvcLoading, error: cvcError } = useCVCWords('kindergarten', 100)
  const { families: wordFamilies, loading: familiesLoading } = useCVCWordFamilies('kindergarten')

  useEffect(() => {
    // Preload all phonemes for faster playback
    preloadPhonemes(getAllPhonemes())
  }, [])

  const [currentPhase, setCurrentPhase] = useState(1)
  const [targetPhoneme, setTargetPhoneme] = useState('')
  const [targetLetter, setTargetLetter] = useState('')
  const [targetWord, setTargetWord] = useState<CVCWord | null>(null)
  const [showLetter, setShowLetter] = useState(false)
  const [showPhoneme, setShowPhoneme] = useState(true)
  const [score, setScore] = useState(0)
  const [mastery, setMastery] = useState<Record<string, { status: 'new' | 'learning' | 'mastered'; consecutiveCorrect: number }>>({})
  const [streak, setStreak] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStarBurst, setShowStarBurst] = useState(false)
  const [showCelebrationMsg, setShowCelebrationMsg] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [phaseAccess, setPhaseAccess] = useState<Record<number, { canAccess: boolean; reason?: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentPhaseData = PHONICS_PHASES.find(p => p.id === currentPhase) || PHONICS_PHASES[0]

  useEffect(() => {
    loadPhaseAccess()
    startGame()
    playStart()
  }, [user])

  const loadPhaseAccess = async () => {
    if (!user) return

    const access: Record<number, { canAccess: boolean; reason?: string }> = {}
    for (let i = 1; i <= 6; i++) {
      try {
        const result = await checkPhaseAccess(i)
        access[i] = result
      } catch (error: unknown) {
        console.error('Error checking phase access:', error)
        access[i] = { canAccess: false, reason: 'Could not verify phase access' }
      }
    }
    setPhaseAccess(access)
  }

  const getCVCWordForLetter = useCallback((letter: string): CVCWord | null => {
    const lowerLetter = letter.toLowerCase()
    const matchingWords = cvcWords.filter(w => 
      w.letter1.toLowerCase() === lowerLetter ||
      w.letter2.toLowerCase() === lowerLetter ||
      w.letter3.toLowerCase() === lowerLetter
    )
    return matchingWords.length > 0 ? matchingWords[0] : null
  }, [cvcWords])

  const getWordFamilyForLetter = useCallback((letter: string) => {
    const word = getCVCWordForLetter(letter)
    if (!word) return null
    return wordFamilies.find(f => f.family === word.word_family)
  }, [getCVCWordForLetter, wordFamilies])

  const startGame = useCallback(() => {
    if (!currentPhaseData?.phonemes || currentPhaseData.phonemes.length === 0) {
      setCurrentPhase(prev => Math.min(prev + 1, PHONICS_PHASES.length))
      return
    }

    const masteredPhonemes = Object.entries(mastery)
      .filter(([_, data]) => data.status === 'mastered')
      .map(([letter, _]) => letter.toLowerCase())

    const availablePhonemes = currentPhaseData.phonemes.filter(p => !masteredPhonemes.includes(p))
    if (availablePhonemes.length === 0) {
      setCurrentPhase(prev => Math.min(prev + 1, PHONICS_PHASES.length))
      return
    }

    const randomPhoneme = availablePhonemes[Math.floor(Math.random() * availablePhonemes.length)]
    setTargetPhoneme(randomPhoneme)

    const phonemeInfo = getEdgeTTSPhonemeInfo(randomPhoneme)
    const letter = phonemeInfo?.symbol?.toUpperCase() || randomPhoneme.toUpperCase()
    setTargetLetter(letter)

    const cvcWord = getCVCWordForLetter(letter)
    setTargetWord(cvcWord)

    setShowLetter(false)
    setShowPhoneme(true)
    setShowConfetti(false)
    setShowStarBurst(false)
    setShowCelebrationMsg(false)
    setGameActive(true)
  }, [currentPhase, mastery, getCVCWordForLetter])

  const revealLetter = () => {
    setShowLetter(true)
    setShowPhoneme(false)
  }

  const hidePhoneme = () => {
    setShowPhoneme(false)
  }

  const checkAnswer = async (letter: string) => {
    const isCorrect = letter.toUpperCase() === targetLetter
    setShowLetter(true)
    setShowPhoneme(false)
    setIsSubmitting(true)

    const selectedSound = targetPhoneme
    const phaseData = PHONICS_PHASES.find(p => p.id === currentPhase)

    try {
      const result: PhonicsAnswerResult = await submitPhonicsAnswer({
        letter,
        selectedSound,
        phaseId: currentPhase
      })

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

        setMastery((prev) => ({
          ...prev,
          [targetLetter]: {
            status: result.newStatus,
            consecutiveCorrect: (prev[targetLetter]?.consecutiveCorrect || 0) + 1
          }
        }))

        setShowConfetti(true)

        try {
          await trackActivity({
            activityType: 'phonics',
            score: 1,
            duration: 30
          })
        } catch (error) {
          console.error('Error tracking activity:', error)
        }

        if (result.isCorrect) {
          await loadPhaseAccess()
        }

        setTimeout(() => {
          setShowConfetti(false)
          startGame()
        }, 1500)
      } else {
        playWrong()
        setStreak(0)
        setMastery((prev) => ({
          ...prev,
          [targetLetter]: {
            status: result.newStatus,
            consecutiveCorrect: 0
          }
        }))

        setTimeout(() => {
          setShowLetter(false)
          setShowPhoneme(true)
        }, 1500)
      }
    } catch (error: unknown) {
      console.error('Error submitting answer:', error)
      playWrong()
      setStreak(0)

      setTimeout(() => {
        setShowLetter(false)
        setShowPhoneme(true)
      }, 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLetterStatus = (letter: string) => {
    const status = mastery[letter]?.status || 'new'
    return status
  }

  const getLetterButtonClass = (letter: string) => {
    const status = getLetterStatus(letter)
    const isSelected = letter === targetLetter
    const canAccess = phaseAccess[currentPhase]?.canAccess ?? true

    if (status === 'mastered') {
      return 'bg-[#B8E0D2] text-white cursor-not-allowed transform scale-95'
    }
    if (!canAccess) {
      return 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
    }
    if (status === 'learning') {
      return 'bg-[#FFE5B4]/50 border-2 border-[#FFE5B4]'
    }
    if (isSelected) {
      return 'bg-white border-2 border-[#FFB5BA] scale-105'
    }
    return 'bg-white border-2 border-[#FFE5B4]/30 hover:border-[#FFB5BA]/50 transition-all'
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
                      onClick={() => {
                        if (!isMuted) {
                          const phonemeInfo = getEdgeTTSPhonemeInfo(targetPhoneme)
                          if (phonemeInfo) {
                            playPhoneme(targetPhoneme)
                          }
                        }
                      }}
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

              {targetWord && (
                <div className="bg-[#B8E0D2]/10 p-6 rounded-2xl">
                  <p className="text-sm text-[#8B7355] mb-3">
                    The letter <strong>"{targetLetter}"</strong> is in words like:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {getWordFamilyForLetter(targetLetter)?.words.slice(0, 6).map((word, idx) => (
                      <span key={idx} className="bg-white px-3 py-1 rounded-lg text-sm text-[#5A4A42] font-bold">
                        "{word.word}"
                      </span>
                    ))}
                  </div>
                  {getWordFamilyForLetter(targetLetter) && (
                    <p className="text-xs text-[#4ECDC4] mt-3 text-center">
                      📚 {getWordFamilyForLetter(targetLetter)!.family.toUpperCase()} word family
                    </p>
                  )}
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
                  Great job! You found the <strong>{getEdgeTTSPhonemeInfo(targetPhoneme)?.symbol || targetLetter}</strong> sound!
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
