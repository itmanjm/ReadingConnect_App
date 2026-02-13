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
