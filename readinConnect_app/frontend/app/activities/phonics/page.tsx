'use client'

import { useState, useEffect } from 'react'
import { submitPhonicsAnswer, checkPhaseAccess } from '@/lib/api/activities'
import type { PhonicsAnswerInput, PhonicsAnswerResult } from '@/types/activities'
import { useAuthStore } from '@/lib/stores/auth'

const PHONICS_PHASES = [
  {
    id: 1,
    name: 'Getting Started',
    letters: ['S', 'A', 'T', 'P', 'I', 'N'],
    masteryThreshold: 2
  },
  {
    id: 2,
    name: 'Building Words',
    letters: ['M', 'D', 'G', 'O', 'K', 'E'],
    masteryThreshold: 2
  },
  {
    id: 3,
    name: 'Word Families',
    letters: ['R', 'B', 'F', 'L', 'H', 'U'],
    masteryThreshold: 3
  },
  {
    id: 4,
    name: 'Blends & Digraphs',
    letters: ['CH', 'SH', 'TH', 'NG', 'WH'],
    masteryThreshold: 4
  },
  {
    id: 5,
    name: 'Long Vowels',
    letters: ['A', 'E', 'I', 'O', 'U'],
    masteryThreshold: 3
  },
  {
    id: 6,
    name: 'All Letters',
    letters: [],
    masteryThreshold: 5
  }
]

export default function PhonicsLetterHunt() {
  const { user } = useAuthStore()
  const [currentPhase, setCurrentPhase] = useState(1)
  const [targetLetter, setTargetLetter] = useState('')
  const [targetSound, setTargetSound] = useState('')
  const [showLetter, setShowLetter] = useState(false)
  const [showSound, setShowSound] = useState(true)
  const [score, setScore] = useState(0)
  const [mastery, setMastery] = useState<Record<string, { status: 'new' | 'learning' | 'mastered'; consecutiveCorrect: number }>>({})
  const [phaseAccess, setPhaseAccess] = useState<Record<number, { canAccess: boolean; reason?: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<PhonicsAnswerResult | null>(null)

  useEffect(() => {
    loadPhaseAccess()
  }, [user])

  async function loadPhaseAccess() {
    if (!user) return
    
    const access: Record<number, { canAccess: boolean; reason?: string }> = {}
    for (let i = 1; i <= 6; i++) {
      const result = await checkPhaseAccess(i)
      access[i] = result
    }
    setPhaseAccess(access)
  }

  const startGame = async () => {
    const phaseData = PHONICS_PHASES.find(p => p.id === currentPhase)
    if (!phaseData?.letters || phaseData.letters.length === 0) {
      setCurrentPhase(prev => Math.min(prev + 1, 6))
      return
    }

    const availableLetters = phaseData.letters.filter(letter => !mastery[letter]?.status || mastery[letter]?.status !== 'mastered')
    if (availableLetters.length === 0) {
      setCurrentPhase(prev => Math.min(prev + 1, 6))
      return
    }

    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)]
    setTargetLetter(randomLetter)
    const soundMap: Record<string, string> = {
      'S': 's',
      'A': 'a_short',
      'T': 't',
      'P': 'p',
      'I': 'i_short',
      'N': 'n',
      'M': 'm',
      'D': 'd',
      'G': 'g',
      'O': 'o_short',
      'K': 'k',
      'E': 'e_short',
      'R': 'r',
      'B': 'b',
      'F': 'f',
      'L': 'l',
      'H': 'h',
      'U': 'u_short',
      'CH': 'ch',
      'SH': 'sh',
      'TH': 'th_unvoiced',
      'NG': 'ng',
      'WH': 'wh'
    }
    setTargetSound(soundMap[randomLetter] || randomLetter.toLowerCase())
    setShowLetter(false)
    setShowSound(true)
    setLastResult(null)
  }

  const checkAnswer = async (letter: string) => {
    const phaseData = PHONICS_PHASES.find(p => p.id === currentPhase)
    if (!phaseData) return

    const selectedSound = targetSound
    const isCorrect = letter.toUpperCase() === targetLetter

    setIsSubmitting(true)

    try {
      const result: PhonicsAnswerResult = await submitPhonicsAnswer({
        letter,
        selectedSound,
        phaseId: currentPhase
      })

      setMastery(prev => ({
        ...prev,
        [targetLetter]: {
          status: result.newStatus,
          consecutiveCorrect: isCorrect ? (prev[targetLetter]?.consecutiveCorrect || 0) + 1 : 0
        }
      }))

      if (isCorrect) {
        setScore(prev => prev + 1)
      }

      setLastResult(result)

      if (result.isCorrect) {
        await loadPhaseAccess()
      }

      setTimeout(() => {
        startGame()
      }, 1500)
    } catch (error) {
      console.error('Error submitting answer:', error)
      setLastResult({
        isCorrect: false,
        masteryLevel: 1,
        newStatus: 'new',
        achievements: []
      })
      setTimeout(() => {
        startGame()
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
    const canAccess = phaseAccess[currentPhase]?.canAccess

    if (status === 'mastered') {
      return 'bg-[#B8E0D2] text-white cursor-not-allowed opacity-70'
    }

    if (!canAccess) {
      return 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
    }

    if (isSelected) {
      return 'bg-white border-2 border-[#FFB5BA] scale-105'
    }

    if (status === 'learning') {
      return 'bg-[#FFE5B4]/50 border-2 border-[#FFE5B4] hover:border-[#FFB5BA]'
    }

    return 'bg-white border-2 border-[#FFE5B4]/30 hover:border-[#FFE5B4]/50 transition-all'
  }

  const currentPhaseData = PHONICS_PHASES.find(p => p.id === currentPhase) || PHONICS_PHASES[0]
  const canAccessCurrentPhase = phaseAccess[currentPhase]?.canAccess ?? true

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFB5BA]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button className="text-[#8B7355] hover:text-[#4ECDC4] font-semibold">
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#FFE5B4] px-4 py-2 rounded-full">
              <span className="text-xl">⭐</span>
              <span className="font-black text-[#5A4A42]">{score}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl shadow-[#FFB5BA]/20 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#FFB5BA]/10 to-[#FFE5B4]/10 border-b border-[#FFB5BA]/10 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFB5BA] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#5A4A42]">Phonics: Letter Sounds</h1>
                  <p className="text-sm text-[#8B7355]">Phase {currentPhase}: {currentPhaseData.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPhase(1)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    currentPhase === 1 
                      ? 'bg-[#4ECDC4] text-white' 
                      : 'bg-white border-2 border-[#FFE5B4]/30 text-[#5A4A42] hover:border-[#4ECDC4]'
                  }`}
                >
                  {currentPhase === 1 && '✓'}
                </button>
                <button 
                  onClick={() => setCurrentPhase(2)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    currentPhase === 2 
                      ? 'bg-[#4ECDC4] text-white' 
                      : 'bg-white border-2 border-[#FFE5B4]/30 text-[#5A4A42] hover:border-[#4ECDC4]'
                  }`}
                >
                  {currentPhase === 2 && '✓'}
                </button>
                <button 
                  onClick={() => setCurrentPhase(3)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    currentPhase === 3 
                      ? 'bg-[#4ECDC4] text-white' 
                      : 'bg-white border-2 border-[#FFE5B4]/30 text-[#5A4A42] hover:border-[#4ECDC4]'
                  }`}
                >
                  {currentPhase === 3 && '✓'}
                </button>
                <button 
                  onClick={() => setCurrentPhase(4)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    currentPhase === 4 
                      ? 'bg-[#4ECDC4] text-white' 
                      : 'bg-white border-2 border-[#FFE5B4]/30 text-[#5A4A42] hover:border-[#4ECDC4]'
                  }`}
                >
                  {currentPhase === 4 && '✓'}
                </button>
                <button 
                  onClick={() => setCurrentPhase(5)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    currentPhase === 5 
                      ? 'bg-[#4ECDC4] text-white' 
                      : 'bg-white border-2 border-[#FFE5B4]/30 text-[#5A4A42] hover:border-[#4ECDC4]'
                  }`}
                >
                  {currentPhase === 5 && '✓'}
                </button>
                <button 
                  onClick={() => setCurrentPhase(6)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    currentPhase === 6 
                      ? 'bg-[#4ECDC4] text-white' 
                      : 'bg-white border-2 border-[#FFE5B4]/30 text-[#5A4A42] hover:border-[#4ECDC4]'
                  }`}
                >
                  {currentPhase === 6 && '✓'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-8">
            <div className="text-center space-y-6">
              <p className="text-xl text-[#5A4A42] font-medium mb-4">
                Find the letter that sounds like:
              </p>
              <div className="flex justify-center gap-4">
                {showSound && (
                  <div className="w-20 h-20 bg-[#FF6B6B] hover:bg-[#FF5252] rounded-3xl shadow-xl shadow-[#FF6B6B]/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                    <span className="text-3xl">🔊</span>
                  </div>
                )}
                {showLetter && (
                  <div className="bg-[#FFE5B4]/20 rounded-2xl p-6 inline-block transition-all">
                    <span className="text-4xl font-black text-[#FF6B6B]">{targetLetter}</span>
                  </div>
                )}
              </div>

              {!canAccessCurrentPhase && phaseAccess[currentPhase]?.reason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <p className="text-red-700 font-semibold text-lg mb-2">🔒 Phase Locked</p>
                  <p className="text-red-600">{phaseAccess[currentPhase].reason}</p>
                </div>
              )}

              <div className="grid grid-cols-6 gap-3">
                {currentPhaseData.letters.map((letter) => {
                  const status = getLetterStatus(letter)
                  const isSelected = letter === targetLetter
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => checkAnswer(letter)}
                      disabled={showLetter || !canAccessCurrentPhase || status === 'mastered'}
                      className={`
                        aspect-square text-2xl font-black rounded-2xl
                        transition-all duration-200
                        ${getLetterButtonClass(letter)}
                      `}
                    >
                      {letter}
                      {status === 'mastered' && <span className="absolute top-1 right-1 text-lg">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
