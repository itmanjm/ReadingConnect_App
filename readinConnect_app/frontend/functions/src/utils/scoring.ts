const PHASE_THRESHOLDS: Record<number, number> = {
  1: 2,
  2: 2,
  3: 3,
  4: 4,
  5: 3,
  6: 5
};

type MasteryStatus = 'new' | 'learning' | 'mastered';

interface LetterMastery {
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

interface MasteryDelta {
  newStatus: MasteryStatus;
  delta: number;
}



export function calculateMasteryDelta(
  letter: string,
  isCorrect: boolean,
  currentMastery: LetterMastery,
  phaseId: number
): MasteryDelta {
  const threshold = PHASE_THRESHOLDS[phaseId];

  if (isCorrect) {
    const newConsecutive = currentMastery.consecutiveCorrect + 1;

    if (newConsecutive >= threshold && currentMastery.status !== 'mastered') {
      return { newStatus: 'mastered', delta: 1 };
    } else if (newConsecutive >= Math.ceil(threshold / 2) && currentMastery.status === 'new') {
      return { newStatus: 'learning', delta: 0 };
    }
    return { newStatus: currentMastery.status, delta: 0 };
  } else {
    if (currentMastery.status === 'mastered') {
      const recentAccuracy = calculateRecentAccuracy(currentMastery);
      if (recentAccuracy < 0.70) {
        return { newStatus: 'learning', delta: -1 };
      }
    }
    return { newStatus: currentMastery.status, delta: 0 };
  }
}

function calculateRecentAccuracy(mastery: LetterMastery): number {
  const recentAttempts = Math.min(mastery.totalAttempts, 10);
  return mastery.correctAttempts / recentAttempts;
}

export const PHASE_DATA = [
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
    description: 'Practice full alphabet',
    letters: [],
    masteryThreshold: 5
  }
] as const;
