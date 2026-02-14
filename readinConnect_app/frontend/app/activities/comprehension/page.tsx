'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Check, X, Volume2, VolumeX, BookOpen, Star, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'
import { ConfettiExplosion, CelebrationMessage } from '@/components/CelebrationEffects'
import { useSubmitComprehensionAnswer, useCompleteComprehensionPassage } from '@/lib/hooks/useActivities'
import { useTrackActivity } from '@/lib/hooks/useBadges'
import type { ComprehensionAnswerResult } from '@/lib/api/activities'

type QuestionType = 'literal' | 'inferential' | 'evaluative'

interface Question {
  question: string
  type: QuestionType
  options: string[]
  correct: string
  points: number
  explanation: string
}

interface Passage {
  title: string
  content: string
  ageGroup: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  questions: Question[]
}

// Age-appropriate passages with QAR questions
const PASSAGES: Passage[] = [
  {
    title: 'The Little Cat',
    content: 'The cat sat on the mat. The cat was soft and white. The cat liked to sleep. The cat purred when it was happy.',
    ageGroup: '4-5 years',
    level: 'beginner',
    questions: [
      {
        question: 'Where did the cat sit?',
        type: 'literal',
        options: ['On the chair', 'On the mat', 'On the bed', 'On the floor'],
        correct: 'On the mat',
        points: 1,
        explanation: 'This is a "Right There" question. The answer is directly in the text: "The cat sat on the mat."'
      },
      {
        question: 'What color was the cat?',
        type: 'literal',
        options: ['Black', 'Brown', 'White', 'Gray'],
        correct: 'White',
        points: 1,
        explanation: 'This is a "Right There" question. The text says: "The cat was soft and white."'
      },
      {
        question: 'What did the cat do when it was happy?',
        type: 'literal',
        options: ['It slept', 'It ate', 'It purred', 'It played'],
        correct: 'It purred',
        points: 1,
        explanation: 'This is a "Right There" question. The text says: "The cat purred when it was happy."'
      }
    ]
  },
  {
    title: 'A Happy Dog',
    content: 'Max is a big brown dog. He likes to play in the park. Max runs fast and catches balls. He loves to meet new friends.',
    ageGroup: '5-6 years',
    level: 'intermediate',
    questions: [
      {
        question: 'What does Max like to do at the park?',
        type: 'literal',
        options: ['Sleep', 'Play', 'Eat', 'Swim'],
        correct: 'Play',
        points: 1,
        explanation: 'This is a "Right There" question. The text says: "Max likes to play in the park."'
      },
      {
        question: 'What kind of animal is Max?',
        type: 'literal',
        options: ['Cat', 'Bird', 'Dog', 'Fish'],
        correct: 'Dog',
        points: 1,
        explanation: 'This is a "Right There" question. The text says: "Max is a big brown dog."'
      },
      {
        question: 'Why does Max catch balls?',
        type: 'inferential',
        options: ['He is hungry', 'He likes to play', 'He is tired', 'He is scared'],
        correct: 'He likes to play',
        points: 2,
        explanation: 'This is a "Think and Search" question. The text says Max likes to play, so we infer he catches balls because he enjoys playing.'
      }
    ]
  },
  {
    title: 'The Friendly Turtle',
    content: 'Timmy the turtle lived in a small pond. He had a green shell and moved very slowly. One day, a fish asked Timmy to race. Timmy smiled and said, "I may be slow, but I never give up!" They had a friendly race. The fish swam fast, but Timmy kept going. At the end, both were happy because they had fun together.',
    ageGroup: '6-7 years',
    level: 'advanced',
    questions: [
      {
        question: 'Where did Timmy live?',
        type: 'literal',
        options: ['In a river', 'In a pond', 'In the ocean', 'On land'],
        correct: 'In a pond',
        points: 1,
        explanation: 'This is a "Right There" question. The text says: "Timmy the turtle lived in a small pond."'
      },
      {
        question: 'Why were both Timmy and the fish happy at the end?',
        type: 'inferential',
        options: ['They won the race', 'They had fun together', 'They were fast', 'They slept'],
        correct: 'They had fun together',
        points: 2,
        explanation: 'This is a "Think and Search" question. The text says: "At the end, both were happy because they had fun together."'
      },
      {
        question: 'What did Timmy mean when he said, "I never give up"?',
        type: 'inferential',
        options: ['He always stops', 'He keeps trying', 'He is lazy', 'He runs fast'],
        correct: 'He keeps trying',
        points: 2,
        explanation: 'This is a "Think and Search" question. "Never give up" means you keep trying even when things are hard.'
      },
      {
        question: 'What lesson can we learn from this story?',
        type: 'evaluative',
        options: ['Winning is everything', 'Speed is most important', 'Fun matters more than winning', 'Don\'t race'],
        correct: 'Fun matters more than winning',
        points: 3,
        explanation: 'This is an "On My Own" question. From the story, we learn that having fun together is more important than who wins the race.'
      }
    ]
  },
  {
    title: 'The Garden Adventure',
    content: 'Lily loved gardening. Every morning, she went to her garden to check on her plants. She had tomatoes, carrots, and sunflowers. One morning, Lily saw a small caterpillar on a tomato plant. At first, she was worried it would hurt her plants. But then she remembered what her teacher said: "Caterpillars turn into beautiful butterflies that help flowers grow." Lily watched the caterpillar every day. After a week, she saw a chrysalis. When it finally opened, a lovely butterfly flew out. The butterfly visited all her sunflowers. Lily learned that sometimes things that seem different can be wonderful helpers.',
    ageGroup: '7-8 years',
    level: 'expert',
    questions: [
      {
        question: 'What plants did Lily have in her garden?',
        type: 'literal',
        options: ['Roses, tulips, daisies', 'Tomatoes, carrots, sunflowers', 'Apples, bananas, oranges', 'Trees, bushes, grass'],
        correct: 'Tomatoes, carrots, sunflowers',
        points: 1,
        explanation: 'This is a "Right There" question. The text says: "She had tomatoes, carrots, and sunflowers."'
      },
      {
        question: 'Why was Lily worried about the caterpillar at first?',
        type: 'inferential',
        options: ['She thought it was ugly', 'She thought it would hurt her plants', 'She was scared of bugs', 'She wanted to catch it'],
        correct: 'She thought it would hurt her plants',
        points: 2,
        explanation: 'This is a "Think and Search" question. The text says: "At first, she was worried it would hurt her plants."'
      },
      {
        question: 'What was the caterpillar doing on the tomato plant?',
        type: 'inferential',
        options: ['Eating tomatoes', 'Resting on a leaf', 'Building a home', 'Looking for food'],
        correct: 'Resting on a leaf',
        points: 2,
        explanation: 'This is a "Think and Search" question. We infer the caterpillar was resting because it later turned into a chrysalis, which is part of its lifecycle.'
      },
      {
        question: 'How did Lily\'s feelings about the caterpillar change by the end?',
        type: 'evaluative',
        options: ['She was more scared', 'She was happy she didn\'t remove it', 'She was sad it left', 'She wanted more caterpillars'],
        correct: 'She was happy she didn\'t remove it',
        points: 3,
        explanation: 'This is an "On My Own" question. Lily learned that the caterpillar became a helpful butterfly, so she was likely happy she left it alone.'
      }
    ]
  }
]

export default function ComprehensionQuiz() {
  const router = useRouter()
  const { isMuted, toggleMute, playCorrect, playWrong, playClick, playWin } = useGameSounds()
  const submitComprehensionAnswer = useSubmitComprehensionAnswer()
  const completeComprehensionPassage = useCompleteComprehensionPassage()
  const trackActivity = useTrackActivity()

  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [answers, setAnswers] = useState<Array<{ passage: string, question: string, correct: boolean, points: number, explanation: string }>>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebrationMsg, setShowCelebrationMsg] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentPassage = PASSAGES[currentPassageIndex]
  const currentQuestion = currentPassage.questions[currentQuestionIndex]
  const maxScore = currentPassage.questions.reduce((sum, q) => sum + q.points, 0)

  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false)
        setShowExplanation(true)

        if (feedbackCorrect) {
          if (currentQuestionIndex < currentPassage.questions.length - 1) {
            setTimeout(() => {
              setCurrentQuestionIndex((prev) => prev + 1)
              setSelectedAnswer(null)
              setShowExplanation(false)
            }, 2000)
          } else {
            playWin()
            const finalPercentage = Math.round(((score + currentQuestion.points) / maxScore) * 100)
            if (finalPercentage >= 80) {
              setShowConfetti(true)
              setShowCelebrationMsg(true)
            }
            setQuizComplete(true)
            
            completeComprehensionPassage.mutate({
              passageId: `passage-${currentPassageIndex + 1}`,
              score: score + currentQuestion.points,
              totalQuestions: currentPassage.questions.length
            })
            
            trackActivity.mutate({
              activityType: 'comprehension',
              score: finalPercentage,
              duration: 0
            })
          }
        } else {
          setTimeout(() => {
            setShowExplanation(false)
            if (currentQuestionIndex < currentPassage.questions.length - 1) {
              setCurrentQuestionIndex((prev) => prev + 1)
              setSelectedAnswer(null)
            } else {
              setQuizComplete(true)
              
              const finalPercentage = Math.round((score / maxScore) * 100)
              completeComprehensionPassage.mutate({
                passageId: `passage-${currentPassageIndex + 1}`,
                score: score,
                totalQuestions: currentPassage.questions.length
              })
              
              trackActivity.mutate({
                activityType: 'comprehension',
                score: finalPercentage,
                duration: 0
              })
            }
          }, 3000)
        }
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [showFeedback, feedbackCorrect, currentQuestionIndex, playWin, score, currentQuestion, maxScore, completeComprehensionPassage, trackActivity, currentPassageIndex, currentPassage.questions.length])

  const submitAnswer = useCallback(async (answer: string) => {
    if (showFeedback || isSubmitting) return

    const isCorrect = answer === currentQuestion.correct
    setSelectedAnswer(answer)
    setShowFeedback(true)
    setFeedbackCorrect(isCorrect)
    setIsSubmitting(true)

    try {
      const result: ComprehensionAnswerResult = await submitComprehensionAnswer.mutateAsync({
        passageId: `passage-${currentPassageIndex + 1}`,
        questionId: `question-${currentQuestionIndex + 1}`,
        answer: answer,
        questionType: currentQuestion.type,
        isCorrect: isCorrect
      })

      if (isCorrect) {
        playCorrect()
        setScore((prev) => prev + currentQuestion.points)
      } else {
        playWrong()
      }

      setAnswers((prev) => [
        ...prev,
        {
          passage: currentPassage.title,
          question: currentQuestion.question,
          correct: isCorrect,
          points: isCorrect ? currentQuestion.points : 0,
          explanation: currentQuestion.explanation
        }
      ])
    } catch (error) {
      console.error('Error submitting comprehension answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [showFeedback, isSubmitting, currentQuestion, currentPassage.title, currentPassageIndex, currentQuestionIndex, submitComprehensionAnswer, playCorrect, playWrong])

  const resetQuiz = () => {
    playClick()
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowFeedback(false)
    setFeedbackCorrect(false)
    setQuizComplete(false)
    setAnswers([])
    setShowExplanation(false)
  }

  const nextPassage = () => {
    playClick()
    if (currentPassageIndex < PASSAGES.length - 1) {
      setCurrentPassageIndex((prev) => prev + 1)
      setCurrentQuestionIndex(0)
      setScore(0)
      setShowFeedback(false)
      setQuizComplete(false)
      setAnswers([])
      setShowExplanation(false)
    } else {
      router.push('/dashboard/student')
    }
  }

  const endGame = () => {
    playClick()
    router.push('/dashboard/student')
  }

  const getQuestionTypeStyle = (type: QuestionType) => {
    switch (type) {
      case 'literal':
        return 'bg-[#B8E0D2] text-white'
      case 'inferential':
        return 'bg-[#FFB5BA] text-white'
      case 'evaluative':
        return 'bg-[#FF6B6B] text-white'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'literal':
        return 'Right There'
      case 'inferential':
        return 'Think and Search'
      case 'evaluative':
        return 'On My Own'
      default:
        return 'Question'
    }
  }

  const percentage = Math.round((score / maxScore) * 100)

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <ConfettiExplosion active={showConfetti} />
      <CelebrationMessage
        message={percentage >= 80 ? "Reading Star! 🌟" : "Great Job! ⭐"}
        active={showCelebrationMsg}
        onComplete={() => setShowCelebrationMsg(false)}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 bg-[#FFB5BA] rounded-full opacity-20 -top-10 -left-10 animate-pulse" />
        <div className="absolute w-24 h-24 bg-[#B8E0D2] rounded-full opacity-30 top-40 right-10 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute w-40 h-40 bg-[#FF6B6B] rounded-full opacity-10 bottom-20 left-20" />
        <div className="absolute w-20 h-20 bg-[#B8E0D2] rounded-full opacity-25 top-1/3 left-1/4 animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute w-28 h-28 bg-[#FFB5BA] rounded-full opacity-20 bottom-40 right-1/4 animate-bounce" style={{ animationDuration: '4s' }} />
      </div>

      <nav className="bg-white/80 backdrop-blur-sm border-b-2 border-[#FF6B6B]/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={endGame}
            className="rounded-full border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B] transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-[#FF6B6B]" />
            <span className="text-[#5A4A42]">Back to Dashboard</span>
          </Button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { playClick(); toggleMute(); }}
              className="w-10 h-10 rounded-full bg-white shadow-md border-2 border-[#B8E0D2] flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-[#5A4A42]" />
              ) : (
                <Volume2 className="h-5 w-5 text-[#5A4A42]" />
              )}
            </button>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-[#FF6B6B]/30">
              <Star className="h-5 w-5 text-[#FFB5BA]" fill="#FFB5BA" />
              <span className="text-xl font-bold text-[#5A4A42]">{score} / {maxScore}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4 relative z-0">
        <Card className="max-w-4xl mx-auto rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B8E0D2] to-[#FF6B6B] flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-[#5A4A42]">Reading Comprehension</CardTitle>
                  <p className="text-sm text-[#5A4A42]/70 mt-1">{currentPassage.title} • {currentPassage.ageGroup}</p>
                </div>
              </div>
              {!quizComplete && (
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  className="rounded-full border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/20 transition-all"
                >
                  <RotateCcw className="h-4 w-4 mr-2 text-[#5A4A42]" />
                  <span className="text-[#5A4A42]">Restart Quiz</span>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {!quizComplete ? (
              <>
                <div className="bg-gradient-to-r from-[#B8E0D2]/20 to-[#FFB5BA]/20 p-8 rounded-3xl border-2 border-[#B8E0D2]/20">
                  <h3 className="text-xl font-bold text-[#5A4A42] mb-4">📖 Read the Story:</h3>
                  <p className="text-lg text-[#5A4A42] leading-relaxed">{currentPassage.content}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#5A4A42]">
                    Question {currentQuestionIndex + 1} of {currentPassage.questions.length}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getQuestionTypeStyle(currentQuestion.type)}`}>
                    {getQuestionTypeLabel(currentQuestion.type)}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-[#FF6B6B]/5 via-[#FFB5BA]/5 to-[#B8E0D2]/5 p-8 rounded-3xl border-2 border-[#B8E0D2]/20">
                  <p className="text-2xl font-bold text-[#5A4A42] mb-4">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.type === 'inferential' && (
                    <p className="text-base text-[#5A4A42]/70 italic bg-white/50 p-3 rounded-xl">
                      💡 Use clues from the text to answer
                    </p>
                  )}
                  {currentQuestion.type === 'evaluative' && (
                    <p className="text-base text-[#5A4A42]/70 italic bg-white/50 p-3 rounded-xl">
                      💡 Share your opinion based on what you read
                    </p>
                  )}
                </div>

                {showFeedback && (
                  <div className={`text-center p-8 rounded-2xl border-4 ${feedbackCorrect ? 'bg-[#B8E0D2]/30 border-[#B8E0D2]' : 'bg-[#FFB5BA]/30 border-[#FFB5BA]'} animate-in fade-in zoom-in duration-300`}>
                    {feedbackCorrect ? (
                      <>
                        <Check className="h-20 w-20 text-[#B8E0D2] mx-auto mb-4" strokeWidth={3} />
                        <p className="text-3xl font-bold text-[#5A4A42]">
                          Correct! +{currentQuestion.points} points
                        </p>
                      </>
                    ) : (
                      <>
                        <X className="h-20 w-20 text-[#FF6B6B] mx-auto mb-4" strokeWidth={3} />
                        <p className="text-3xl font-bold text-[#5A4A42] mb-2">
                          Not quite right
                        </p>
                        <p className="text-xl text-[#5A4A42]/70">
                          The correct answer was: {currentQuestion.correct}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {showExplanation && (
                  <div className="bg-gradient-to-r from-[#B8E0D2]/20 to-[#B8E0D2]/10 p-6 rounded-2xl border-2 border-[#B8E0D2]/30 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <Award className="h-6 w-6 text-[#B8E0D2] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-[#5A4A42] mb-2">Why?</p>
                        <p className="text-[#5A4A42]/80 leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!showFeedback && !showExplanation && (
                  <div className="grid gap-4">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => submitAnswer(option)}
                        className={`
                          p-5 text-left rounded-2xl border-2 text-lg font-semibold
                          transition-all duration-200 transform hover:scale-[1.02]
                          ${
                            selectedAnswer === option
                              ? 'bg-[#B8E0D2]/20 border-[#B8E0D2] text-[#5A4A42]'
                              : 'bg-white border-[#FFB5BA]/20 hover:border-[#FFB5BA] hover:bg-[#FFB5BA]/5 text-[#5A4A42]'
                          }
                        `}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-8">
                <div className="text-7xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] bg-clip-text text-transparent">
                  {percentage}%
                </div>
                <p className="text-2xl text-[#5A4A42]">
                  You scored {score} out of {maxScore} points!
                </p>

                {percentage >= 80 && (
                  <div className="bg-gradient-to-r from-[#B8E0D2]/20 to-[#B8E0D2]/10 p-8 rounded-3xl border-2 border-[#B8E0D2]/30">
                    <p className="text-3xl font-bold text-[#5A4A42]">🎉 Excellent Work!</p>
                    <p className="text-lg text-[#5A4A42]/70 mt-2">
                      You're a reading comprehension star!
                    </p>
                  </div>
                )}

                {percentage >= 60 && percentage < 80 && (
                  <div className="bg-gradient-to-r from-[#FFB5BA]/20 to-[#FFB5BA]/10 p-8 rounded-3xl border-2 border-[#FFB5BA]/30">
                    <p className="text-3xl font-bold text-[#5A4A42]">👍 Good Job!</p>
                    <p className="text-lg text-[#5A4A42]/70 mt-2">
                      You're getting better at understanding!
                    </p>
                  </div>
                )}

                {percentage < 60 && (
                  <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#FFB5BA]/10 p-8 rounded-3xl border-2 border-[#FF6B6B]/20">
                    <p className="text-3xl font-bold text-[#5A4A42]">💪 Keep Practicing!</p>
                    <p className="text-lg text-[#5A4A42]/70 mt-2">
                      Reading comprehension takes time. You'll improve!
                    </p>
                  </div>
                )}

                <div className="bg-white p-6 rounded-2xl border-2 border-[#B8E0D2]/20">
                  <h3 className="font-bold text-xl text-[#5A4A42] mb-4">Question Review:</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {answers.map((answer, index) => (
                      <div key={index} className="bg-[#FFF8F0] p-4 rounded-xl border-2 border-[#B8E0D2]/10">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`
                            h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0
                            ${answer.correct ? 'bg-[#B8E0D2] text-white' : 'bg-[#FFB5BA] text-white'}
                          `}>
                            {answer.correct ? '✓' : '✗'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#5A4A42]">{answer.question}</p>
                            <p className="text-xs text-[#5A4A42]/60 mt-1">{answer.points} points</p>
                          </div>
                        </div>
                        {!answer.correct && (
                          <div className="mt-3 pt-3 border-t border-[#B8E0D2]/20">
                            <p className="text-sm text-[#5A4A42]/80 italic">{answer.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-10 text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Try Again
                  </Button>
                  {currentPassageIndex < PASSAGES.length - 1 ? (
                    <Button
                      onClick={nextPassage}
                      variant="outline"
                      className="rounded-full h-14 px-10 text-xl font-semibold border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/10 transition-all"
                    >
                      Next Story
                    </Button>
                  ) : (
                    <Button
                      onClick={endGame}
                      variant="outline"
                      className="rounded-full h-14 px-10 text-xl font-semibold border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/10 transition-all"
                    >
                      Back to Dashboard
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
