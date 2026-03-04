'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, CheckCircle, Trophy, Star, Gem } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';

interface Question {
  id: string;
  passage: string;
  question: string;
  options: {
    text: string;
    image: string;
    correct: boolean;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: '1',
    passage: 'Sam has a red ball. He throws the ball to his dog. The dog catches it. Sam is happy.',
    question: 'What color is Sam\'s ball?',
    options: [
      { text: 'Red', image: '🔴', correct: true },
      { text: 'Blue', image: '🔵', correct: false },
      { text: 'Green', image: '🟢', correct: false },
    ],
  },
  {
    id: '2',
    passage: 'The cat sits on the mat. The cat is big and fat. The cat likes to nap.',
    question: 'Where does the cat sit?',
    options: [
      { text: 'On the mat', image: '🧘', correct: true },
      { text: 'On the bed', image: '🛏️', correct: false },
      { text: 'On the chair', image: '🪑', correct: false },
    ],
  },
  {
    id: '3',
    passage: 'It is hot outside. The sun is shining. The boy wants a cold drink.',
    question: 'How is the weather?',
    options: [
      { text: 'Hot', image: '☀️', correct: true },
      { text: 'Cold', image: '❄️', correct: false },
      { text: 'Rainy', image: '🌧️', correct: false },
    ],
  },
  {
    id: '4',
    passage: 'The dog runs fast. The dog sees a cat. The cat runs up a tree.',
    question: 'What does the cat do?',
    options: [
      { text: 'Runs up a tree', image: '🌳', correct: true },
      { text: 'Runs home', image: '🏠', correct: false },
      { text: 'Runs to the dog', image: '🐕', correct: false },
    ],
  },
  {
    id: '5',
    passage: 'Mom is cooking dinner. The food smells good. The family will eat soon.',
    question: 'Who is cooking?',
    options: [
      { text: 'Mom', image: '👩‍🍳', correct: true },
      { text: 'Dad', image: '👨‍🍳', correct: false },
      { text: 'The kids', image: '👧', correct: false },
    ],
  },
  {
    id: '6',
    passage: 'The bird is in the nest. The bird has three eggs. Soon the eggs will hatch.',
    question: 'Where is the bird?',
    options: [
      { text: 'In the nest', image: '🪺', correct: true },
      { text: 'In the tree', image: '🌲', correct: false },
      { text: 'In the sky', image: '☁️', correct: false },
    ],
  },
];

export default function QuestionQuestGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWrong, playWin } = useGameSounds();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gems, setGems] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / QUESTIONS.length) * 100;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
  
  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const correct = currentQuestion.options[index].correct;
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      const points = 15 + Math.min(streak * 3, 15);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setGems(prev => prev + 1);
      
      setCelebrationMessage('Correct! +1 Gem');
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        moveToNextQuestion();
      }, 1500);
    } else {
      playWrong();
      setStreak(0);
      
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
      }, 1500);
    }
  };
  
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= QUESTIONS.length) {
      setGameComplete(true);
      playWin();
    } else {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };
  
  const handleGameComplete = () => {
    router.push('/dashboard/student');
  };
  
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Question Master!</h2>
            <p className="text-[#5A4A42]/70 mb-6">You answered all the questions!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Score</span>
                <span className="font-bold text-[#FF6B6B]">{score} points</span>
              </div>
              <div className="flex justify-between bg-[#FFB5BA]/20 p-3 rounded-xl">
                <span>Gems Collected</span>
                <span className="font-bold text-purple-600">{gems} 💎</span>
              </div>
              <div className="flex justify-between bg-[#FFE4A1]/20 p-3 rounded-xl">
                <span>Correct</span>
                <span className="font-bold">{gems}/{QUESTIONS.length}</span>
              </div>
            </div>
            
            <Button
              onClick={handleGameComplete}
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 text-lg font-bold"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-20 right-20 text-5xl animate-bounce">❓</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">📚</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>💎</div>
      
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/student')}
            className="rounded-full border-2 border-[#FFB5BA]/50 hover:bg-[#FFB5BA]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <Gem className="h-5 w-5 text-purple-500" />
              <span className="font-bold text-purple-600">{gems}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <Star className="h-5 w-5 text-[#FFB5BA]" />
              <span className="font-bold text-[#5A4A42]">{score}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <Progress value={progress} className="h-3 bg-[#B8E0D2]/20" />
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Question Quest</h1>
          <p className="text-[#5A4A42]/70">Read the story and answer the question!</p>
        </div>
        
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-[#FF6B6B]/10 px-4 py-2 rounded-full">
            <BookOpen className="h-5 w-5 text-[#FF6B6B]" />
            <span className="text-[#5A4A42] font-medium">
              Question {currentQuestionIndex + 1} of {QUESTIONS.length}
            </span>
          </div>
        </div>
        
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 mb-6">
          <CardContent className="p-6">
            <div className="bg-[#FFF8F0] rounded-2xl p-6 mb-6">
              <p className="text-xl text-[#5A4A42] leading-relaxed text-center">
                {currentQuestion.passage}
              </p>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#5A4A42]">
                {currentQuestion.question}
              </h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={`
                    h-auto py-6 rounded-2xl flex flex-col items-center gap-3
                    transition-all duration-200
                    ${selectedAnswer === index && showFeedback
                      ? option.correct
                        ? 'bg-[#B8E0D2] hover:bg-[#B8E0D2] text-white border-[#B8E0D2]'
                        : 'bg-[#FF6B6B] hover:bg-[#FF6B6B] text-white border-[#FF6B6B]'
                      : selectedAnswer === index
                        ? 'bg-[#FFB5BA] hover:bg-[#FFB5BA] text-white scale-105'
                        : 'bg-white border-4 border-[#FFB5BA]/30 hover:border-[#FFB5BA] hover:scale-105'
                    }
                    ${showFeedback && option.correct && selectedAnswer !== index
                      ? 'bg-[#B8E0D2]/20 border-[#B8E0D2]'
                      : ''
                    }
                  `}
                  variant="outline"
                >
                  <span className="text-5xl">{option.image}</span>
                  <span className="text-lg font-bold text-[#5A4A42]">{option.text}</span>
                </Button>
              ))}
            </div>
            
            {showFeedback && (
              <div className="text-center mt-6">
                {isCorrect ? (
                  <div className="text-[#B8E0D2] text-2xl font-bold animate-bounce flex items-center justify-center gap-2">
                    <CheckCircle className="h-8 w-8" />
                    Correct! Great reading!
                  </div>
                ) : (
                  <div className="text-[#FF6B6B] text-xl">
                    Not quite. Read the story again!
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {showCelebration && (
        <>
          <ConfettiExplosion active={true} />
          <StarBurst active={true} x={50} y={50} />
          <CelebrationMessage message={celebrationMessage} active={true} />
        </>
      )}
    </div>
  );
}
