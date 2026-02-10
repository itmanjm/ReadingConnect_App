'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PhonicsProgress {
  masteredLetters: string[]
  currentPhase: number
  totalAttempts: number
  correctAnswers: number
  streak: number
  lastPlayed: string
}

export interface SightWordsProgress {
  masteredWords: {
    prePrimer: string[]
    primer: string[]
    firstGrade: string[]
    secondGrade: string[]
  }
  currentLevel: number
  longestStreak: number
  totalGamesPlayed: number
  correctAnswers: number
  lastPlayed: string
}

export interface FluencyProgress {
  bestWPM: {
    age4to5: number
    age5to6: number
    age6to7: number
    age7to8: number
  }
  averageWPM: number
  averageAccuracy: number
  passageCompletions: number
  lastPlayed: string
}

export interface ComprehensionProgress {
  passagesCompleted: number
  questionsAnswered: number
  accuracyByType: {
    literal: { correct: number; total: number }
    inferential: { correct: number; total: number }
    evaluative: { correct: number; total: number }
  }
  currentLevel: number
  lastPlayed: string
}

export interface StudentProgress {
  age?: number
  developmentalStage?: 1 | 2 | 3 | 4
  phonics: PhonicsProgress
  sightWords: SightWordsProgress
  fluency: FluencyProgress
  comprehension: ComprehensionProgress
  lastUpdated: string
}

const STORAGE_KEY = 'readinconnect_progress'

const DEVELOPMENTAL_STAGES = {
  AGE_4_TO_5: 1,
  AGE_5_TO_6: 2,
  AGE_6_TO_7: 3,
  AGE_7_TO_8: 4
} as const

const DEFAULT_PROGRESS: StudentProgress = {
  phonics: {
    masteredLetters: [],
    currentPhase: 1,
    totalAttempts: 0,
    correctAnswers: 0,
    streak: 0,
    lastPlayed: ''
  },
  sightWords: {
    masteredWords: {
      prePrimer: [],
      primer: [],
      firstGrade: [],
      secondGrade: []
    },
    currentLevel: 1,
    longestStreak: 0,
    totalGamesPlayed: 0,
    correctAnswers: 0,
    lastPlayed: ''
  },
  fluency: {
    bestWPM: {
      age4to5: 0,
      age5to6: 0,
      age6to7: 0,
      age7to8: 0
    },
    averageWPM: 0,
    averageAccuracy: 0,
    passageCompletions: 0,
    lastPlayed: ''
  },
  comprehension: {
    passagesCompleted: 0,
    questionsAnswered: 0,
    accuracyByType: {
      literal: { correct: 0, total: 0 },
      inferential: { correct: 0, total: 0 },
      evaluative: { correct: 0, total: 0 }
    },
    currentLevel: 1,
    lastPlayed: ''
  },
  lastUpdated: new Date().toISOString()
}

const AGE_SETTINGS = {
  [DEVELOPMENTAL_STAGES.AGE_4_TO_5]: {
    phonicsPhase: 1,
    sightWordsLevel: 1,
    sightWordsGridSize: '3x3' as const,
    fluencyTargetWPM: 20,
    fluencyPassageLength: 'short' as const,
    comprehensionLevel: 1,
    hintsEnabled: true,
    slowerPace: true
  },
  [DEVELOPMENTAL_STAGES.AGE_5_TO_6]: {
    phonicsPhase: 2,
    sightWordsLevel: 2,
    sightWordsGridSize: '3x4' as const,
    fluencyTargetWPM: 30,
    fluencyPassageLength: 'medium' as const,
    comprehensionLevel: 2,
    hintsEnabled: true,
    slowerPace: false
  },
  [DEVELOPMENTAL_STAGES.AGE_6_TO_7]: {
    phonicsPhase: 3,
    sightWordsLevel: 3,
    sightWordsGridSize: '4x4' as const,
    fluencyTargetWPM: 50,
    fluencyPassageLength: 'long' as const,
    comprehensionLevel: 3,
    hintsEnabled: false,
    slowerPace: false
  },
  [DEVELOPMENTAL_STAGES.AGE_7_TO_8]: {
    phonicsPhase: 4,
    sightWordsLevel: 4,
    sightWordsGridSize: '4x5' as const,
    fluencyTargetWPM: 75,
    fluencyPassageLength: 'extra-long' as const,
    comprehensionLevel: 4,
    hintsEnabled: false,
    slowerPace: false
  }
}

export function useProgress() {
  const [progress, setProgressState] = useState<StudentProgress>(DEFAULT_PROGRESS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setProgressState(parsed)
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...progress,
          lastUpdated: new Date().toISOString()
        }))
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
    }
  }, [progress, isLoaded])

  const updatePhonicsProgress = useCallback((updates: Partial<PhonicsProgress>) => {
    setProgressState(prev => ({ ...prev, phonics: { ...prev.phonics, ...updates } }))
  }, [])

  const updateSightWordsProgress = useCallback((updates: Partial<SightWordsProgress>) => {
    setProgressState(prev => ({ ...prev, sightWords: { ...prev.sightWords, ...updates } }))
  }, [])

  const updateFluencyProgress = useCallback((updates: Partial<FluencyProgress>) => {
    setProgressState(prev => ({ ...prev, fluency: { ...prev.fluency, ...updates } }))
  }, [])

  const updateComprehensionProgress = useCallback((updates: Partial<ComprehensionProgress>) => {
    setProgressState(prev => ({ ...prev, comprehension: { ...prev.comprehension, ...updates } }))
  }, [])

  const updateStudentInfo = useCallback((updates: { age?: number; developmentalStage?: 1 | 2 | 3 | 4 }) => {
    setProgressState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetProgress = useCallback(() => {
    setProgressState(DEFAULT_PROGRESS)
  }, [])

  const getDevelopmentalStageFromAge = useCallback((age: number): 1 | 2 | 3 | 4 => {
    if (age >= 4 && age <= 5) return DEVELOPMENTAL_STAGES.AGE_4_TO_5
    if (age >= 5 && age <= 6) return DEVELOPMENTAL_STAGES.AGE_5_TO_6
    if (age >= 6 && age <= 7) return DEVELOPMENTAL_STAGES.AGE_6_TO_7
    if (age >= 7 && age <= 8) return DEVELOPMENTAL_STAGES.AGE_7_TO_8
    return DEVELOPMENTAL_STAGES.AGE_4_TO_5
  }, [])

  const getAgeAppropriateSettings = useCallback(() => {
    return AGE_SETTINGS[progress.developmentalStage || 1]
  }, [progress.developmentalStage])

  return {
    progress,
    isLoaded,
    updatePhonicsProgress,
    updateSightWordsProgress,
    updateFluencyProgress,
    updateComprehensionProgress,
    updateStudentInfo,
    resetProgress,
    getDevelopmentalStageFromAge,
    getAgeAppropriateSettings
  }
}
