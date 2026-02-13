// Teacher feedback system types

export type FeedbackCategory = 'bug' | 'feature_request' | 'content_issue' | 'ux_issue' | 'other'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix'

export interface TeacherFeedback {
  id: string
  teacherId: string
  category: FeedbackCategory
  priority: FeedbackPriority
  title: string
  description: string
  stepsToReproduce?: string[]
  screenshots?: string[]
  studentId?: string
  activityType?: 'phonics' | 'sight_words' | 'fluency' | 'comprehension'
  status: FeedbackStatus
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolution?: string
}

export interface FeedbackStats {
  totalOpen: number
  byCategory: Record<FeedbackCategory, number>
  byPriority: Record<FeedbackPriority, number>
  avgResolutionTime: number
}

export interface SubmitFeedbackInput {
  category: FeedbackCategory
  priority: FeedbackPriority
  title: string
  description: string
  stepsToReproduce?: string[]
  screenshots?: string[]
  studentId?: string
  activityType?: 'phonics' | 'sight_words' | 'fluency' | 'comprehension'
}

export interface FeedbackInput {
  teacherId: string
  category: FeedbackCategory
  priority: FeedbackPriority
  title: string
  description: string
  stepsToReproduce?: string[]
  screenshots?: string[]
  studentId?: string
  activityType?: 'phonics' | 'sight_words' | 'fluency' | 'comprehension'
  status: FeedbackStatus
  createdAt: Date
  updatedAt: Date
}
