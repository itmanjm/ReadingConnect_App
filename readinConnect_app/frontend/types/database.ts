export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string
          teacher_id: string | null
          parent_id: string | null
          reading_level: 'pre-reader' | 'beginner' | 'intermediate' | 'advanced'
          age_range: '4-5' | '6-7' | '8+' | null
          learning_goals: string[]
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          teacher_id?: string | null
          parent_id?: string | null
          reading_level?: 'pre-reader' | 'beginner' | 'intermediate' | 'advanced'
          age_range?: '4-5' | '6-7' | '8+' | null
          learning_goals?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          teacher_id?: string | null
          parent_id?: string | null
          reading_level?: 'pre-reader' | 'beginner' | 'intermediate' | 'advanced'
          age_range?: '4-5' | '6-7' | '8+' | null
          learning_goals?: string[]
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          type: 'phonemic_awareness' | 'phonics' | 'sight_words' | 'vocabulary' | 'fluency' | 'comprehension' | 'enjoyment'
          title: string
          description: string | null
          instructions: string | null
          difficulty_level: 'easy' | 'medium' | 'hard'
          estimated_duration_minutes: number
          is_interactive: boolean
          has_audio: boolean
          is_printable: boolean
          pdf_template_path: string | null
          content_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          type: 'phonemic_awareness' | 'phonics' | 'sight_words' | 'vocabulary' | 'fluency' | 'comprehension' | 'enjoyment'
          title: string
          description?: string | null
          instructions?: string | null
          difficulty_level?: 'easy' | 'medium' | 'hard'
          estimated_duration_minutes?: number
          is_interactive?: boolean
          has_audio?: boolean
          is_printable?: boolean
          pdf_template_path?: string | null
          content_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'phonemic_awareness' | 'phonics' | 'sight_words' | 'vocabulary' | 'fluency' | 'comprehension' | 'enjoyment'
          title?: string
          description?: string | null
          instructions?: string | null
          difficulty_level?: 'easy' | 'medium' | 'hard'
          estimated_duration_minutes?: number
          is_interactive?: boolean
          has_audio?: boolean
          is_printable?: boolean
          pdf_template_path?: string | null
          content_data?: Json
          created_at?: string
        }
      }
      weekly_plans: {
        Row: {
          id: string
          teacher_id: string
          week_number: number
          letter_of_week: string | null
          theme: string | null
          start_date: string
          end_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          week_number: number
          letter_of_week?: string | null
          theme?: string | null
          start_date: string
          end_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          week_number?: number
          letter_of_week?: string | null
          theme?: string | null
          start_date?: string
          end_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      weekly_activities: {
        Row: {
          id: string
          weekly_plan_id: string
          activity_id: string
          day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
          order_in_day: number
          assigned_at: string
        }
        Insert: {
          id?: string
          weekly_plan_id: string
          activity_id: string
          day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
          order_in_day?: number
          assigned_at?: string
        }
        Update: {
          id?: string
          weekly_plan_id?: string
          activity_id?: string
          day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
          order_in_day?: number
          assigned_at?: string
        }
      }
      skill_progress: {
        Row: {
          id: string
          student_id: string
          skill_type: 'letter_recognition' | 'phonemic_awareness' | 'phonics' | 'sight_words' | 'fluency' | 'comprehension' | 'writing' | 'engagement'
          current_level: number
          target_level: number
          last_assessed_at: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          skill_type: 'letter_recognition' | 'phonemic_awareness' | 'phonics' | 'sight_words' | 'fluency' | 'comprehension' | 'writing' | 'engagement'
          current_level?: number
          target_level?: number
          last_assessed_at?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          skill_type?: 'letter_recognition' | 'phonemic_awareness' | 'phonics' | 'sight_words' | 'fluency' | 'comprehension' | 'writing' | 'engagement'
          current_level?: number
          target_level?: number
          last_assessed_at?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      activity_completions: {
        Row: {
          id: string
          student_id: string
          activity_id: string
          weekly_activity_id: string | null
          completed_at: string
          score: number | null
          accuracy_percentage: number | null
          duration_seconds: number | null
          attempts_count: number
          feedback: string | null
          audio_recording_path: string | null
        }
        Insert: {
          id?: string
          student_id: string
          activity_id: string
          weekly_activity_id?: string | null
          completed_at?: string
          score?: number | null
          accuracy_percentage?: number | null
          duration_seconds?: number | null
          attempts_count?: number
          feedback?: string | null
          audio_recording_path?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          activity_id?: string
          weekly_activity_id?: string | null
          completed_at?: string
          score?: number | null
          accuracy_percentage?: number | null
          duration_seconds?: number | null
          attempts_count?: number
          feedback?: string | null
          audio_recording_path?: string | null
        }
      }
      sight_words: {
        Row: {
          id: string
          word: string
          frequency: number
          difficulty_level: 'dolch_preprimer' | 'dolch_primer' | 'dolch_1st' | 'dolch_2nd' | 'dolch_3rd' | 'fry_100' | 'fry_200' | null
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          frequency?: number
          difficulty_level?: 'dolch_preprimer' | 'dolch_primer' | 'dolch_1st' | 'dolch_2nd' | 'dolch_3rd' | 'fry_100' | 'fry_200' | null
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          frequency?: number
          difficulty_level?: 'dolch_preprimer' | 'dolch_primer' | 'dolch_1st' | 'dolch_2nd' | 'dolch_3rd' | 'fry_100' | 'fry_200' | null
          created_at?: string
        }
      }
      sight_word_progress: {
        Row: {
          id: string
          student_id: string
          sight_word_id: string
          mastered: boolean
          mastered_at: string | null
          attempts_count: number
          last_attempted_at: string
        }
        Insert: {
          id?: string
          student_id: string
          sight_word_id: string
          mastered?: boolean
          mastered_at?: string | null
          attempts_count?: number
          last_attempted_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          sight_word_id?: string
          mastered?: boolean
          mastered_at?: string | null
          attempts_count?: number
          last_attempted_at?: string
        }
      }
      phonics_letters: {
        Row: {
          id: string
          letter: string
          phonemes: string[]
          examples: string[]
          audio_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          letter: string
          phonemes?: string[]
          examples?: string[]
          audio_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          letter?: string
          phonemes?: string[]
          examples?: string[]
          audio_path?: string | null
          created_at?: string
        }
      }
      phonics_progress: {
        Row: {
          id: string
          student_id: string
          letter_id: string
          recognizes: boolean
          can_write: boolean
          can_sound: boolean
          last_practiced_at: string
        }
        Insert: {
          id?: string
          student_id: string
          letter_id: string
          recognizes?: boolean
          can_write?: boolean
          can_sound?: boolean
          last_practiced_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          letter_id?: string
          recognizes?: boolean
          can_write?: boolean
          can_sound?: boolean
          last_practiced_at?: string
        }
      }
      vocabulary_words: {
        Row: {
          id: string
          word: string
          definition: string | null
          example_sentence: string | null
          image_url: string | null
          audio_path: string | null
          grade_level: number | null
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          definition?: string | null
          example_sentence?: string | null
          image_url?: string | null
          audio_path?: string | null
          grade_level?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          definition?: string | null
          example_sentence?: string | null
          image_url?: string | null
          audio_path?: string | null
          grade_level?: number | null
          created_at?: string
        }
      }
      vocabulary_mastery: {
        Row: {
          id: string
          student_id: string
          vocabulary_word_id: string
          understands: boolean
          can_use_in_sentence: boolean
          learned_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          vocabulary_word_id: string
          understands?: boolean
          can_use_in_sentence?: boolean
          learned_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          vocabulary_word_id?: string
          understands?: boolean
          can_use_in_sentence?: boolean
          learned_at?: string | null
        }
      }
      fluency_sessions: {
        Row: {
          id: string
          student_id: string
          passage_title: string
          passage_text: string
          words_per_minute: number | null
          accuracy_percentage: number | null
          expression_rating: number | null
          errors_count: number
          reading_duration_seconds: number | null
          audio_recording_path: string | null
          assessed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          student_id: string
          passage_title: string
          passage_text: string
          words_per_minute?: number | null
          accuracy_percentage?: number | null
          expression_rating?: number | null
          errors_count?: number
          reading_duration_seconds?: number | null
          audio_recording_path?: string | null
          assessed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          passage_title?: string
          passage_text?: string
          words_per_minute?: number | null
          accuracy_percentage?: number | null
          expression_rating?: number | null
          errors_count?: number
          reading_duration_seconds?: number | null
          audio_recording_path?: string | null
          assessed_at?: string
          notes?: string | null
        }
      }
      comprehension_questions: {
        Row: {
          id: string
          activity_id: string | null
          question_text: string
          question_type: 'literal' | 'inferential' | 'evaluative'
          correct_answer: string
          options: Json | null
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          activity_id?: string | null
          question_text: string
          question_type: 'literal' | 'inferential' | 'evaluative'
          correct_answer: string
          options?: Json | null
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          activity_id?: string | null
          question_text?: string
          question_type?: 'literal' | 'inferential' | 'evaluative'
          correct_answer?: string
          options?: Json | null
          points?: number
          created_at?: string
        }
      }
      comprehension_responses: {
        Row: {
          id: string
          student_id: string
          question_id: string
          student_answer: string
          is_correct: boolean
          points_earned: number
          answered_at: string
        }
        Insert: {
          id?: string
          student_id: string
          question_id: string
          student_answer: string
          is_correct: boolean
          points_earned?: number
          answered_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          question_id?: string
          student_answer?: string
          is_correct?: boolean
          points_earned?: number
          answered_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          category: 'milestone' | 'streak' | 'skill' | 'engagement'
          criteria: Json
          points_value: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          category: 'milestone' | 'streak' | 'skill' | 'engagement'
          criteria: Json
          points_value?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          category?: 'milestone' | 'streak' | 'skill' | 'engagement'
          criteria?: Json
          points_value?: number
          created_at?: string
        }
      }
      earned_badges: {
        Row: {
          id: string
          student_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          student_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      reward_points: {
        Row: {
          id: string
          student_id: string
          points: number
          earned_from: string | null
          earned_at: string
        }
        Insert: {
          id?: string
          student_id: string
          points?: number
          earned_from?: string | null
          earned_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          points?: number
          earned_from?: string | null
          earned_at?: string
        }
      }
      observation_sheets: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          week_date: string
          observations: Json
          notes: string | null
          recommendations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          week_date: string
          observations?: Json
          notes?: string | null
          recommendations?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          week_date?: string
          observations?: Json
          notes?: string | null
          recommendations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      printable_assets: {
        Row: {
          id: string
          asset_type: 'flashcard' | 'worksheet' | 'progress_sheet' | 'certificate'
          title: string
          description: string | null
          pdf_url: string
          thumbnail_url: string | null
          activity_id: string | null
          age_range: string[]
          created_at: string
        }
        Insert: {
          id?: string
          asset_type: 'flashcard' | 'worksheet' | 'progress_sheet' | 'certificate'
          title: string
          description?: string | null
          pdf_url: string
          thumbnail_url?: string | null
          activity_id?: string | null
          age_range?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          asset_type?: 'flashcard' | 'worksheet' | 'progress_sheet' | 'certificate'
          title?: string
          description?: string | null
          pdf_url?: string
          thumbnail_url?: string | null
          activity_id?: string | null
          age_range?: string[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_student_progress_summary: {
        Args: {
          student_id: string
        }
        Returns: Json
      }
      get_student_total_points: {
        Args: {
          student_id: string
        }
        Returns: number
      }
      get_student_activity_count: {
        Args: {
          student_id: string
          days: number
        }
        Returns: number
      }
      award_badge: {
        Args: {
          student_id: string
          badge_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
