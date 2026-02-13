// Activity-related types

export type ActivityType = 'phonics' | 'sight_words' | 'fluency' | 'comprehension'

export interface PhonicsAnswerInput {
  letter: string
  selectedSound: string
  phaseId: number
}

export interface PhonicsAnswerResult {
  isCorrect: boolean
  masteryLevel: number
  newStatus: 'new' | 'learning' | 'mastered'
  achievements: string[]
  phaseUnlocked?: number
}

export interface SightWordAnswerInput {
  word: string
  level: 'pre-primer' | 'primer' | 'grade-1' | 'grade-2'
}

export interface SightWordAnswerResult {
  isCorrect: boolean
  isMastered: boolean
  consecutiveCorrect: number
}

export interface FluencySessionInput {
  passageId: string
  words: number
  correctWords: number
  timeSeconds: number
  ageGroup: number
}

export interface FluencySessionResult {
  wpm: number
  accuracy: number
  isImprovement: boolean
  previousWpm?: number
}

export interface ComprehensionQuestionInput {
  passageId: string
  questionId: string
  answer: string
  questionType: 'literal' | 'inferential' | 'evaluative'
}

export interface ComprehensionAnswerResult {
  isCorrect: boolean
  accuracyByType: {
    literal: { correct: number; total: number }
    inferential: { correct: number; total: number }
    evaluative: { correct: number; total: number }
  }
}

export interface ActivitySession {
  activityType: ActivityType
  startedAt: Date
  answers: Array<{
    question: string
    answer: string
    isCorrect: boolean
    timestamp: Date
  }>
  completedAt?: Date
}
