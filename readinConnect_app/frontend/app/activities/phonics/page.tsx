import { useState, useEffect } from 'react'
import { submitPhonicsAnswer, checkPhaseAccess } from '@/lib/api/activities'
import type { PhonicsAnswerInput, PhonicsAnswerResult } from '@/types/activities'
import { useAuthStore } from '@/lib/stores/auth'
import { showErrorWithToast } from '@/lib/error-handling'
import { ErrorMessage } from '@/components/ui/error-message'
import { ToastContainer } from '@/components/ui/toast'

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
    } catch (error: unknown) {
      const appError = showErrorWithToast('Error submitting answer:', 'Failed to submit your answer. Please try again.')
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
        </main>
      </div>
    )
  }
}
}
}
