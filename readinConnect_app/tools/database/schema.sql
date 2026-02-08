-- ============================================================================
-- ReadinConnect App - Database Schema
-- ============================================================================
-- Version: 1.0
-- Created: 2026-02-07
-- Description: Complete database schema for literacy education platform
--
-- Tables:
--   - profiles, students (user management)
--   - activities, weekly_plans, weekly_activities (activity system)
--   - skill_progress, activity_completions (progress tracking)
--   - sight_words, sight_word_progress (sight word mastery)
--   - phonics_letters, phonics_progress (phonics tracking)
--   - vocabulary_words, vocabulary_mastery (vocabulary tracking)
--   - fluency_sessions (reading fluency records)
--   - comprehension_questions, comprehension_responses (quizzes)
--   - badges, earned_badges, reward_points (gamification)
--   - observation_sheets (teacher logs)
--   - printable_assets (PDF resources)
--
-- Security: Row-level security (RLS) enabled on all user data tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- PROFILES TABLE
-- Extends Supabase auth.users with additional fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- STUDENTS
-- ============================================================================

-- STUDENTS TABLE
-- Student profiles linked to teachers and parents
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reading_level TEXT CHECK (reading_level IN ('pre-reader', 'beginner', 'intermediate', 'advanced')) DEFAULT 'pre-reader',
  age_range TEXT CHECK (age_range IN ('4-5', '6-7', '8+')),
  learning_goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for students
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_reading_level ON public.students(reading_level);

-- Comment for students
COMMENT ON TABLE public.students IS 'Student profiles linked to teachers and parents';

-- ============================================================================
-- ACTIVITIES
-- ============================================================================

-- ACTIVITIES TABLE
-- Library of activities across 7 learning areas
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('phonemic_awareness', 'phonics', 'sight_words', 'vocabulary', 'fluency', 'comprehension', 'enjoyment')),
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  estimated_duration_minutes INTEGER DEFAULT 10,
  is_interactive BOOLEAN DEFAULT FALSE,
  has_audio BOOLEAN DEFAULT FALSE,
  is_printable BOOLEAN DEFAULT FALSE,
  pdf_template_path TEXT,
  content_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_difficulty ON public.activities(difficulty_level);

-- ============================================================================
-- WEEKLY PLANS
-- ============================================================================

-- WEEKLY PLANS TABLE
-- Teacher-created learning schedules
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  letter_of_week CHAR(1),
  theme TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for weekly plans
CREATE INDEX IF NOT EXISTS idx_weekly_plans_teacher_id ON public.weekly_plans(teacher_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_dates ON public.weekly_plans(start_date, end_date);

-- ============================================================================
-- WEEKLY ACTIVITIES
-- ============================================================================

-- WEEKLY ACTIVITIES TABLE
-- Activities assigned to specific days in weekly plans
CREATE TABLE IF NOT EXISTS public.weekly_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weekly_plan_id UUID NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id),
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
  order_in_day INTEGER DEFAULT 0,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for weekly activities
CREATE INDEX IF NOT EXISTS idx_weekly_activities_weekly_plan_id ON public.weekly_activities(weekly_plan_id);
CREATE INDEX IF NOT EXISTS idx_weekly_activities_day ON public.weekly_activities(day_of_week);

-- ============================================================================
-- SKILL PROGRESS
-- ============================================================================

-- SKILL PROGRESS TABLE
-- Tracks progress across 8 skill areas per student
CREATE TABLE IF NOT EXISTS public.skill_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('letter_recognition', 'phonemic_awareness', 'phonics', 'sight_words', 'fluency', 'comprehension', 'writing', 'engagement')),
  current_level INTEGER DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
  target_level INTEGER DEFAULT 5 CHECK (target_level >= 1 AND target_level <= 10),
  last_assessed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, skill_type)
);

-- Indexes for skill progress
CREATE INDEX IF NOT EXISTS idx_skill_progress_student_id ON public.skill_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_skill_type ON public.skill_progress(skill_type);

-- ============================================================================
-- ACTIVITY COMPLETIONS
-- ============================================================================

-- ACTIVITY COMPLETIONS TABLE
-- Records of completed activities with scores
CREATE TABLE IF NOT EXISTS public.activity_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id),
  weekly_activity_id UUID REFERENCES public.weekly_activities(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  accuracy_percentage INTEGER CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  duration_seconds INTEGER,
  attempts_count INTEGER DEFAULT 1,
  feedback TEXT,
  audio_recording_path TEXT
);

-- Indexes for activity completions
CREATE INDEX IF NOT EXISTS idx_activity_completions_student_id ON public.activity_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_activity_id ON public.activity_completions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_completed_at ON public.activity_completions(completed_at);

-- ============================================================================
-- SIGHT WORDS
-- ============================================================================

-- SIGHT WORDS TABLE
-- Master list of sight words (Dolch, Fry)
CREATE TABLE IF NOT EXISTS public.sight_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL UNIQUE,
  frequency INTEGER DEFAULT 0,
  difficulty_level TEXT CHECK (difficulty_level IN ('dolch_preprimer', 'dolch_primer', 'dolch_1st', 'dolch_2nd', 'dolch_3rd', 'fry_100', 'fry_200')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sight words
CREATE INDEX IF NOT EXISTS idx_sight_words_difficulty ON public.sight_words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_sight_words_frequency ON public.sight_words(frequency DESC);

-- SIGHT WORD PROGRESS TABLE
-- Tracks sight word mastery per student
CREATE TABLE IF NOT EXISTS public.sight_word_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  sight_word_id UUID NOT NULL REFERENCES public.sight_words(id) ON DELETE CASCADE,
  mastered BOOLEAN DEFAULT FALSE,
  mastered_at TIMESTAMP WITH TIME ZONE,
  attempts_count INTEGER DEFAULT 0,
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, sight_word_id)
);

-- Indexes for sight word progress
CREATE INDEX IF NOT EXISTS idx_sight_word_progress_student_id ON public.sight_word_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_sight_word_progress_mastered ON public.sight_word_progress(student_id, mastered);
CREATE INDEX IF NOT EXISTS idx_sight_word_progress_sight_word_id ON public.sight_word_progress(sight_word_id);

-- ============================================================================
-- PHONICS LETTERS
-- ============================================================================

-- PHONICS LETTERS TABLE
-- Alphabet letters with phonemes and examples
CREATE TABLE IF NOT EXISTS public.phonics_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  letter CHAR(1) NOT NULL UNIQUE,
  phonemes TEXT[] DEFAULT '{}',
  examples TEXT[] DEFAULT '{}',
  audio_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PHONICS PROGRESS TABLE
-- Tracks letter recognition per student
CREATE TABLE IF NOT EXISTS public.phonics_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  letter_id UUID NOT NULL REFERENCES public.phonics_letters(id) ON DELETE CASCADE,
  recognizes BOOLEAN DEFAULT FALSE,
  can_write BOOLEAN DEFAULT FALSE,
  can_sound BOOLEAN DEFAULT FALSE,
  last_practiced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, letter_id)
);

-- Indexes for phonics progress
CREATE INDEX IF NOT EXISTS idx_phonics_progress_student_id ON public.phonics_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_phonics_progress_letter_id ON public.phonics_progress(letter_id);

-- ============================================================================
-- VOCABULARY
-- ============================================================================

-- VOCABULARY WORDS TABLE
-- Vocabulary words with definitions and examples
CREATE TABLE IF NOT EXISTS public.vocabulary_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL UNIQUE,
  definition TEXT,
  example_sentence TEXT,
  image_url TEXT,
  audio_path TEXT,
  grade_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VOCABULARY MASTERY TABLE
-- Tracks vocabulary understanding per student
CREATE TABLE IF NOT EXISTS public.vocabulary_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  vocabulary_word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  understands BOOLEAN DEFAULT FALSE,
  can_use_in_sentence BOOLEAN DEFAULT FALSE,
  learned_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, vocabulary_word_id)
);

-- Indexes for vocabulary mastery
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery_student_id ON public.vocabulary_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery_vocabulary_word_id ON public.vocabulary_mastery(vocabulary_word_id);

-- ============================================================================
-- FLUENCY SESSIONS
-- ============================================================================

-- FLUENCY SESSIONS TABLE
-- Reading fluency records with WPM and accuracy
CREATE TABLE IF NOT EXISTS public.fluency_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  passage_title TEXT NOT NULL,
  passage_text TEXT NOT NULL,
  words_per_minute INTEGER,
  accuracy_percentage INTEGER CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  expression_rating INTEGER CHECK (expression_rating >= 1 AND expression_rating <= 5),
  errors_count INTEGER DEFAULT 0,
  reading_duration_seconds INTEGER,
  audio_recording_path TEXT,
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Indexes for fluency sessions
CREATE INDEX IF NOT EXISTS idx_fluency_sessions_student_id ON public.fluency_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_fluency_sessions_assessed_at ON public.fluency_sessions(assessed_at DESC);

-- ============================================================================
-- COMPREHENSION
-- ============================================================================

-- COMPREHENSION QUESTIONS TABLE
-- Questions linked to activities or standalone
CREATE TABLE IF NOT EXISTS public.comprehension_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('literal', 'inferential', 'evaluative')),
  correct_answer TEXT NOT NULL,
  options JSONB,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for comprehension questions
CREATE INDEX IF NOT EXISTS idx_comprehension_questions_activity_id ON public.comprehension_questions(activity_id);
CREATE INDEX IF NOT EXISTS idx_comprehension_questions_type ON public.comprehension_questions(question_type);

-- COMPREHENSION RESPONSES TABLE
-- Student answers to comprehension questions
CREATE TABLE IF NOT EXISTS public.comprehension_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.comprehension_questions(id),
  student_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for comprehension responses
CREATE INDEX IF NOT EXISTS idx_comprehension_responses_student_id ON public.comprehension_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_comprehension_responses_question_id ON public.comprehension_responses(question_id);

-- ============================================================================
-- GAMIFICATION: BADGES & REWARDS
-- ============================================================================

-- BADGES TABLE
-- Achievable badges with criteria
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  category TEXT CHECK (category IN ('milestone', 'streak', 'skill', 'engagement')),
  criteria JSONB NOT NULL,
  points_value INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for badges
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);

-- EARNED BADGES TABLE
-- Badges earned by students
CREATE TABLE IF NOT EXISTS public.earned_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- Indexes for earned badges
CREATE INDEX IF NOT EXISTS idx_earned_badges_student_id ON public.earned_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_earned_badges_badge_id ON public.earned_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_earned_badges_earned_at ON public.earned_badges(earned_at DESC);

-- REWARD POINTS TABLE
-- Points earned by students
CREATE TABLE IF NOT EXISTS public.reward_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  earned_from TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reward points
CREATE INDEX IF NOT EXISTS idx_reward_points_student_id ON public.reward_points(student_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_earned_at ON public.reward_points(earned_at DESC);

-- ============================================================================
-- TEACHER TOOLS
-- ============================================================================

-- OBSERVATION SHEETS TABLE
-- Weekly observation logs for teachers
CREATE TABLE IF NOT EXISTS public.observation_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  week_date DATE NOT NULL,
  observations JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for observation sheets
CREATE INDEX IF NOT EXISTS idx_observation_sheets_teacher_id ON public.observation_sheets(teacher_id);
CREATE INDEX IF NOT EXISTS idx_observation_sheets_student_id ON public.observation_sheets(student_id);
CREATE INDEX IF NOT EXISTS idx_observation_sheets_week_date ON public.observation_sheets(week_date DESC);

-- ============================================================================
-- PRINTABLE ASSETS
-- ============================================================================

-- PRINTABLE ASSETS TABLE
-- PDF resources for download/printing
CREATE TABLE IF NOT EXISTS public.printable_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type TEXT CHECK (asset_type IN ('flashcard', 'worksheet', 'progress_sheet', 'certificate')),
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  thumbnail_url TEXT,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  age_range TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for printable assets
CREATE INDEX IF NOT EXISTS idx_printable_assets_type ON public.printable_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_printable_assets_activity_id ON public.printable_assets(activity_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all user-facing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sight_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phonics_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluency_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprehension_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_sheets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- PROFILES: Users can view own profile; teachers can view their students
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Teachers can view their students"
  ON public.profiles
  FOR SELECT
  USING (
    id IN (
      SELECT profile_id FROM public.students
      WHERE teacher_id = auth.uid()
    )
  );

-- STUDENTS: Can view own data; teacher can view their students
CREATE POLICY "Students can view own data"
  ON public.students
  FOR SELECT
  USING (profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Teachers can view their students"
  ON public.students
  FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create students"
  ON public.students
  FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their students"
  ON public.students
  FOR UPDATE
  USING (teacher_id = auth.uid());

-- ACTIVITIES: Public read access (shared content)
CREATE POLICY "Public read access to activities"
  ON public.activities
  FOR SELECT
  USING (true);

-- WEEKLY PLANS: Teachers can manage their own plans
CREATE POLICY "Teachers can manage their weekly plans"
  ON public.weekly_plans
  FOR ALL
  USING (teacher_id = auth.uid());

-- WEEKLY ACTIVITIES: Teachers can manage activities in their plans
CREATE POLICY "Teachers can manage weekly activities"
  ON public.weekly_activities
  FOR ALL
  USING (
    weekly_plan_id IN (
      SELECT id FROM public.weekly_plans
      WHERE teacher_id = auth.uid()
    )
  );

-- SKILL PROGRESS: Student can view own; teacher can view students'
CREATE POLICY "Students can view own progress"
  ON public.skill_progress
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student progress"
  ON public.skill_progress
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can update progress"
  ON public.skill_progress
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update progress"
  ON public.skill_progress
  FOR UPDATE
  USING (true);

-- ACTIVITY COMPLETIONS: Students can view own; teachers can view students'
CREATE POLICY "Students can view own completions"
  ON public.activity_completions
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student completions"
  ON public.activity_completions
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can create completions"
  ON public.activity_completions
  FOR INSERT
  WITH CHECK (true);

-- SIGHT WORD PROGRESS: Students can view own; teachers can view students'
CREATE POLICY "Students can view own sight word progress"
  ON public.sight_word_progress
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student sight word progress"
  ON public.sight_word_progress
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can update sight word progress"
  ON public.sight_word_progress
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sight word progress"
  ON public.sight_word_progress
  FOR UPDATE
  USING (true);

-- PHONICS PROGRESS: Students can view own; teachers can view students'
CREATE POLICY "Students can view own phonics progress"
  ON public.phonics_progress
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student phonics progress"
  ON public.phonics_progress
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can update phonics progress"
  ON public.phonics_progress
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update phonics progress"
  ON public.phonics_progress
  FOR UPDATE
  USING (true);

-- VOCABULARY MASTERY: Students can view own; teachers can view students'
CREATE POLICY "Students can view own vocabulary mastery"
  ON public.vocabulary_mastery
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student vocabulary mastery"
  ON public.vocabulary_mastery
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can update vocabulary mastery"
  ON public.vocabulary_mastery
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update vocabulary mastery"
  ON public.vocabulary_mastery
  FOR UPDATE
  USING (true);

-- FLUENCY SESSIONS: Students can view own; teachers can view students'
CREATE POLICY "Students can view own fluency sessions"
  ON public.fluency_sessions
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student fluency sessions"
  ON public.fluency_sessions
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can create fluency sessions"
  ON public.fluency_sessions
  FOR INSERT
  WITH CHECK (true);

-- COMPREHENSION RESPONSES: Students can view own; teachers can view students'
CREATE POLICY "Students can view own comprehension responses"
  ON public.comprehension_responses
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student comprehension responses"
  ON public.comprehension_responses
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can create comprehension responses"
  ON public.comprehension_responses
  FOR INSERT
  WITH CHECK (true);

-- EARNED BADGES: Students can view own; teachers can view students'
CREATE POLICY "Students can view own badges"
  ON public.earned_badges
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student badges"
  ON public.earned_badges
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can award badges"
  ON public.earned_badges
  FOR INSERT
  WITH CHECK (true);

-- REWARD POINTS: Students can view own; teachers can view students'
CREATE POLICY "Students can view own points"
  ON public.reward_points
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Teachers can view student points"
  ON public.reward_points
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid()));

CREATE POLICY "System can award points"
  ON public.reward_points
  FOR INSERT
  WITH CHECK (true);

-- OBSERVATION SHEETS: Teachers can manage their own
CREATE POLICY "Teachers can manage observation sheets"
  ON public.observation_sheets
  FOR ALL
  USING (teacher_id = auth.uid());

-- PRINTABLE ASSETS: Public read access
CREATE POLICY "Public read access to printable assets"
  ON public.printable_assets
  FOR SELECT
  USING (true);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_progress_updated_at
  BEFORE UPDATE ON public.skill_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_observation_sheets_updated_at
  BEFORE UPDATE ON public.observation_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR COMMON QUERIES
-- ============================================================================

-- Function: Get student's overall progress
CREATE OR REPLACE FUNCTION get_student_progress_summary(p_student_id UUID)
RETURNS TABLE (
  skill_type TEXT,
  current_level INTEGER,
  target_level INTEGER,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.skill_type,
    sp.current_level,
    sp.target_level,
    ROUND((sp.current_level::NUMERIC / sp.target_level::NUMERIC) * 100, 1)
  FROM public.skill_progress sp
  WHERE sp.student_id = p_student_id
  ORDER BY sp.skill_type;
END;
$$ LANGUAGE plpgsql;

-- Function: Get student's total points
CREATE OR REPLACE FUNCTION get_student_total_points(p_student_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(points), 0)
    FROM public.reward_points
    WHERE student_id = p_student_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Get student's recent activity count
CREATE OR REPLACE FUNCTION get_student_activity_count(p_student_id UUID, p_days INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.activity_completions
    WHERE student_id = p_student_id
    AND completed_at >= NOW() - (p_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Award badge to student
CREATE OR REPLACE FUNCTION award_badge(p_student_id UUID, p_badge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_badged BOOLEAN;
BEGIN
  -- Check if student already has badge
  SELECT EXISTS (
    SELECT 1 FROM public.earned_badges
    WHERE student_id = p_student_id AND badge_id = p_badge_id
  ) INTO v_already_badged;

  IF v_already_badged THEN
    RETURN FALSE;
  END IF;

  -- Award badge
  INSERT INTO public.earned_badges (student_id, badge_id)
  VALUES (p_student_id, p_badge_id);

  -- Add badge points
  INSERT INTO public.reward_points (student_id, points, earned_from)
  SELECT p_student_id, points_value, 'Badge: ' || name
  FROM public.badges
  WHERE id = p_badge_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert sample sight words (Dolch Pre-Primer)
INSERT INTO public.sight_words (word, frequency, difficulty_level) VALUES
  ('the', 1000, 'dolch_preprimer'),
  ('and', 800, 'dolch_preprimer'),
  ('a', 750, 'dolch_preprimer'),
  ('to', 700, 'dolch_preprimer'),
  ('in', 650, 'dolch_preprimer'),
  ('is', 600, 'dolch_preprimer'),
  ('you', 550, 'dolch_preprimer'),
  ('that', 500, 'dolch_preprimer'),
  ('it', 480, 'dolch_preprimer'),
  ('he', 450, 'dolch_preprimer'),
  ('was', 420, 'dolch_preprimer'),
  ('for', 400, 'dolch_preprimer'),
  ('on', 380, 'dolch_preprimer'),
  ('are', 360, 'dolch_preprimer'),
  ('as', 340, 'dolch_preprimer'),
  ('with', 320, 'dolch_preprimer'),
  ('his', 300, 'dolch_preprimer'),
  ('they', 280, 'dolch_preprimer'),
  ('I', 260, 'dolch_preprimer'),
  ('at', 240, 'dolch_preprimer'),
  ('be', 230, 'dolch_preprimer')
ON CONFLICT (word) DO NOTHING;

-- Insert phonics letters
INSERT INTO public.phonics_letters (letter, phonemes, examples, audio_path) VALUES
  ('A', ARRAY['æ', 'eɪ'], ARRAY['apple', 'ate', 'ant'], '/audio/letters/A.mp3'),
  ('B', ARRAY['b'], ARRAY['ball', 'bat', 'bear'], '/audio/letters/B.mp3'),
  ('C', ARRAY['k', 's'], ARRAY['cat', 'city', 'cup'], '/audio/letters/C.mp3'),
  ('D', ARRAY['d'], ARRAY['dog', 'duck', 'door'], '/audio/letters/D.mp3'),
  ('E', ARRAY['e', 'iː'], ARRAY['egg', 'eat', 'end'], '/audio/letters/E.mp3'),
  ('F', ARRAY['f'], ARRAY['fish', 'fox', 'fun'], '/audio/letters/F.mp3'),
  ('G', ARRAY['g', 'dʒ'], ARRAY['goat', 'giraffe', 'game'], '/audio/letters/G.mp3'),
  ('H', ARRAY['h'], ARRAY['hat', 'hen', 'home'], '/audio/letters/H.mp3'),
  ('I', ARRAY['ɪ', 'aɪ'], ARRAY['igloo', 'ice', 'inch'], '/audio/letters/I.mp3'),
  ('J', ARRAY['dʒ'], ARRAY['jellyfish', 'jump', 'jar'], '/audio/letters/J.mp3'),
  ('K', ARRAY['k'], ARRAY['kite', 'key', 'king'], '/audio/letters/K.mp3'),
  ('L', ARRAY['l'], ARRAY['lion', 'lamb', 'lake'], '/audio/letters/L.mp3'),
  ('M', ARRAY['m'], ARRAY['moon', 'mouse', 'milk'], '/audio/letters/M.mp3'),
  ('N', ARRAY['n'], ARRAY['nest', 'nut', 'night'], '/audio/letters/N.mp3'),
  ('O', ARRAY['ɒ', 'oʊ'], ARRAY['octopus', 'owl', 'orange'], '/audio/letters/O.mp3'),
  ('P', ARRAY['p'], ARRAY['pig', 'pen', 'pan'], '/audio/letters/P.mp3'),
  ('Q', ARRAY['kw'], ARRAY['queen', 'quilt', 'quiet'], '/audio/letters/Q.mp3'),
  ('R', ARRAY['r'], ARRAY['rabbit', 'rain', 'red'], '/audio/letters/R.mp3'),
  ('S', ARRAY['s'], ARRAY['sun', 'snake', 'star'], '/audio/letters/S.mp3'),
  ('T', ARRAY['t'], ARRAY['tiger', 'tree', 'top'], '/audio/letters/T.mp3'),
  ('U', ARRAY['ʌ', 'juː'], ARRAY['umbrella', 'unicorn', 'up'], '/audio/letters/U.mp3'),
  ('V', ARRAY['v'], ARRAY['van', 'violin', 'vase'], '/audio/letters/V.mp3'),
  ('W', ARRAY['w'], ARRAY['wolf', 'water', 'whale'], '/audio/letters/W.mp3'),
  ('X', ARRAY['ks', 'z'], ARRAY['xylophone', 'box', 'fox'], '/audio/letters/X.mp3'),
  ('Y', ARRAY['j', 'aɪ'], ARRAY['yarn', 'yoyo', 'yellow'], '/audio/letters/Y.mp3'),
  ('Z', ARRAY['z'], ARRAY['zebra', 'zoo', 'zipper'], '/audio/letters/Z.mp3')
ON CONFLICT (letter) DO NOTHING;

-- Insert sample badges
INSERT INTO public.badges (name, description, icon_url, category, criteria, points_value) VALUES
  ('First Steps', 'Complete your first activity', '/badges/first_steps.png', 'milestone', '{"activity_count": 1}'::jsonb, 10),
  ('Getting Started', 'Complete 5 activities', '/badges/getting_started.png', 'milestone', '{"activity_count": 5}'::jsonb, 25),
  ('Dedicated Reader', 'Complete 25 activities', '/badges/dedicated_reader.png', 'milestone', '{"activity_count": 25}'::jsonb, 100),
  ('Alphabet Master', 'Recognize all 26 letters', '/badges/alphabet_master.png', 'skill', '{"skill_type": "letter_recognition", "target_level": 10}'::jsonb, 75),
  ('Sight Word Star', 'Master 20 sight words', '/badges/sight_word_star.png', 'skill', '{"skill_type": "sight_words", "target_count": 20}'::jsonb, 50),
  ('Phonics Pro', 'Master phonics sounds', '/badges/phonics_pro.png', 'skill', '{"skill_type": "phonics", "target_level": 8}'::jsonb, 75),
  ('Reading Champion', 'Read 100 words per minute', '/badges/reading_champion.png', 'skill', '{"skill_type": "fluency", "target_wpm": 100}'::jsonb, 150),
  ('Day Warrior', 'Use app for 3 days in a row', '/badges/day_warrior.png', 'streak', '{"day_streak": 3}'::jsonb, 50),
  ('Week Warrior', 'Use app for 7 days in a row', '/badges/week_warrior.png', 'streak', '{"day_streak": 7}'::jsonb, 200),
  ('Bookworm', 'Read 10 stories', '/badges/bookworm.png', 'engagement', '{"stories_read": 10}'::jsonb, 75),
  ('Quiz Master', 'Score 90%+ on 5 quizzes', '/badges/quiz_master.png', 'engagement', '{"quizzes_mastered": 5, "min_score": 90}'::jsonb, 100)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
