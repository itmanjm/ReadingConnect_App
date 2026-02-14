export type MasteryStatus = 'new' | 'learning' | 'mastered';

export interface LetterMastery {
  letter: string;
  phase: number;
  status: MasteryStatus;
  consecutiveCorrect: number;
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptAt: Date;
  masteredAt?: Date;
  regressionCount: number;
}

export interface MasteryDelta {
  newStatus: MasteryStatus;
  delta: number;
}

export type ActivityType = 'phonics' | 'sight_words' | 'fluency' | 'comprehension';

export interface PhonicsAnswerInput {
  letter: string;
  selectedSound: string;
  phaseId: number;
}

export interface PhonicsAnswerResult {
  isCorrect: boolean;
  masteryLevel: number;
  newStatus: MasteryStatus;
  achievements: string[];
  phaseUnlocked?: number;
}

export interface PhaseAccessResult {
  canAccess: boolean;
  reason?: string;
}

export interface SightWordAnswerInput {
  word: string;
  level: 'pre-primer' | 'primer' | 'grade-1' | 'grade-2';
  isCorrect: boolean;
}

export interface SightWordAnswerResult {
  isCorrect: boolean;
  isMastered: boolean;
  consecutiveCorrect: number;
  totalAttempts: number;
  newLevelUnlocked: boolean;
  achievements: string[];
}

export interface FluencySessionInput {
  passageId: string;
  words: number;
  correctWords: number;
  timeSeconds: number;
  ageGroup: number;
}

export interface FluencySessionResult {
  wpm: number;
  accuracy: number;
  isImprovement: boolean;
  previousWpm?: number;
  currentLevel: number;
}

export interface ComprehensionQuestionInput {
  passageId: string;
  questionId: string;
  answer: string;
  questionType: 'literal' | 'inferential' | 'evaluative';
}

export interface ComprehensionAnswerResult {
  isCorrect: boolean;
  accuracyByType: {
    literal: { correct: number; total: number };
    inferential: { correct: number; total: number };
    evaluative: { correct: number; total: number };
  };
  overallAccuracy: number;
  currentLevel: number;
}
