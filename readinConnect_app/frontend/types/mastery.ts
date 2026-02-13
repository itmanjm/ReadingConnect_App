// Mastery-related types

export type MasteryStatus = 'new' | 'learning' | 'mastered'

export interface LetterMastery {
  letter: string
  phase: number
  status: MasteryStatus
  consecutiveCorrect: number
  totalAttempts: number
  correctAttempts: number
  lastAttemptAt: Date
  masteredAt?: Date
  regressionCount: number
}

export interface PhaseProgress {
  phaseId: number
  letters: string[]
  masteryThreshold: number
  masteredCount: number
  isUnlocked: boolean
  completedAt?: Date
}

export interface MasteryDelta {
  newStatus: MasteryStatus
  delta: number
}

export interface MasteryUpdate {
  letter: string
  isCorrect: boolean
  phaseId: number
  masteryLevel: number
  newStatus: MasteryStatus
  timestamp: Date
}
