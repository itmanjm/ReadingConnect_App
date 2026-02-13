// Achievement and badge-related types

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'phonics' | 'sight_words' | 'fluency' | 'comprehension' | 'streak' | 'milestone'
  requirement: {
    type: 'consecutive_correct' | 'total_correct' | 'phase_complete' | 'streak'
    value: number
    activityType?: 'phonics' | 'sight_words' | 'fluency' | 'comprehension'
    phaseId?: number
  }
  points: number
}

export interface EarnedBadge {
  badgeId: string
  earnedAt: Date
  userId: string
}

export interface AchievementEvent {
  type: 'badge_earned' | 'streak_milestone' | 'phase_complete' | 'mastery_reached'
  badgeId?: string
  message: string
  timestamp: Date
}

export interface AchievementSummary {
  totalBadges: number
  totalPoints: number
  recentBadges: string[]
  progressToNextBadge: {
    badgeId: string
    progress: number
    required: number
  } | null
}

export interface MilestoneCheckInput {
  userId: string
  activityType: 'phonics' | 'sight_words' | 'fluency' | 'comprehension'
  metric: 'consecutive_correct' | 'total_correct' | 'streak'
  value: number
}

export interface MilestoneCheckResult {
  badgesEarned: string[]
  pointsEarned: number
}
