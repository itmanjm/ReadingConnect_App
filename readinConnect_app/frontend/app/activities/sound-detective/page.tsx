'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, Star, Trophy, Sparkles, Target } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';
import { playCVCWord } from '@/lib/audio/edgeTTSPhonics';

interface SoundQuestion {
  id: string;
  word: string;
  phonemes: string[];
  targetPosition: 'beginning' | 'middle' | 'end';
  correctAnswer: string;
  options: string[];
  image: string;
}

const QUESTIONS: SoundQuestion[] = [
  {
    id: '1',
    word: 'cat',
    phonemes: ['c', 'a', 't'],
    targetPosition: 'beginning',
    correctAnswer: 'c',
    options: ['c', 'a', 't'],
    image: '🐱',
  },
  {
    id: '2',
    word: 'hat',
    phonemes: ['h', 'a', 't'],
    targetPosition: 'beginning',
    correctAnswer: 'h',
    options: ['h', 'a', 't'],
    image: '🎩',
  },
  {
    id: '3',
    word: 'mat',
    phonemes: ['m', 'a', 't'],
    targetPosition: 'beginning',
    correctAnswer: 'm',
    options: ['m', 'a', 't'],
    image: '🧘',
  },
  {
    id: '4',
    word: 'bat',
    phonemes: ['b', 'a', 't'],
    targetPosition: 'beginning',
    correctAnswer: 'b',
    options: ['b', 'a', 't'],
    image: '🦇',
  },
  {
    id: '5',
    word: 'sat',
    phonemes: ['s', 'a', 't'],
    targetPosition: 'beginning',
    correctAnswer: 's',
    options: ['s', 'a', 't'],
    image: '🪑',
  },
  {
    id: '6',
    word: 'can',
    phonemes: ['c', 'a', 'n'],
    targetPosition: 'end',
    correctAnswer: 'n',
    options: ['c', 'a', 'n'],
    image: '🥫',
  },
  {
    id: '7',
    word: 'man',
    phonemes: ['m', 'a', 'n'],
    targetPosition: 'end',
    correctAnswer: 'n',
    options: ['m', 'a', 'n'],
    image: '👨',
  },
  {
    id: '8',
    word: 'cap',
    phonemes: ['c', 'a', 'p'],
    targetPosition: 'end',
    correctAnswer: 'p',
    options: ['c', 'a', 'p'],
    image: '🧢',
  },
  {
    id: '9',
    word: 'map',
    phonemes: ['m', 'a', 'p'],
    targetPosition: 'end',
    correctAnswer: 'p',
    options: ['m', 'a', 'p'],
    image: '🗺️',
  },
  {
    id: '10',
    word: 'sit',
    phonemes: ['s', 'i', 't'],
    targetPosition: 'middle',
    correctAnswer: 'i',
    options: ['s', 'i', 't'],
    image: '🪑',
  },
  {
    id: '11',
    word: 'pig',
    phonemes: ['p', 'i', 'g'],
    targetPosition: 'middle',
    correctAnswer: 'i',
    options: ['p', 'i', 'g'],
    image: '🐷',
  },
  {
    id: '12',
    word: 'big',
    phonemes: ['b', 'i', 'g'],
    targetPosition: 'middle',
    correctAnswer: 'i',
    options: ['b', 'i', 'g'],
    image: '🐘',
  },
];

export default function SoundDetectiveGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWrong, playWin } = useGameSounds();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [startTime] = useState(Date.now());
  
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / QUESTIONS.length) * 100;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
  
  const getPositionText = (position: string) => {
    switch (position) {
      case 'beginning':
        return 'FIRST';
      case 'middle':
        return 'MIDDLE';
      case 'end':
        return 'LAST';
      default:
        return position;
    }
  };
  
  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      const points = 10 + Math.min(streak * 2, 10);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      
      setCelebrationMessage('Great listening!');
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
  
  const handleSpeakWord = () => {
    if (currentQuestion) {
      playCVCWord(currentQuestion.word);
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
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Excellent Detective Work!</h2>
            <p className="text-[#5A4A42]/70 mb-6">You found all the sounds!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Score</span>
                <span className="font-bold text-[#FF6B6B]">{score} points</span>
              </div>
              <div className="flex justify-between bg-[#FFB5BA]/20 p-3 rounded-xl">
                <span>Questions</span>
                <span className="font-bold">{QUESTIONS.length}</span>
              </div>
              <div className="flex justify-between bg-[#FFE4A1]/20 p-3 rounded-xl">
                <span>Best Streak</span>
                <span className="font-bold">{streak}</span>
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
      <div className="absolute top-20 right-20 text-5xl animate-bounce">🔍</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">👂</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>🔊</div>
      
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
              <Star className="h-5 w-5 text-[#FFB5BA]" />
              <span className="font-bold text-[#5A4A42]">{score}</span>
            </div>
            <div className="text-sm text-[#5A4A42]/70">
              Question {currentQuestionIndex + 1} of {QUESTIONS.length}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <Progress value={progress} className="h-3 bg-[#B8E0D2]/20" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Sound Detective</h1>
          <p className="text-[#5A4A42]/70">Listen carefully and find the sound!</p>
        </div>
        
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-[#FF6B6B]/10 px-4 py-2 rounded-full mb-4">
                <Target className="h-5 w-5 text-[#FF6B6B]" />
                <span className="text-[#5A4A42] font-medium">
                  Find the {getPositionText(currentQuestion.targetPosition)} sound
                </span>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="text-8xl animate-pulse">
                {currentQuestion.image}
              </div>
            </div>
            
            <div className="text-center mb-8">
              <Button
                onClick={handleSpeakWord}
                className="rounded-full bg-[#B8E0D2] hover:bg-[#B8E0D2]/80 text-[#5A4A42] px-8 py-6 text-xl font-bold"
              >
                <Volume2 className="h-6 w-6 mr-2" />
                {currentQuestion.word.toUpperCase()}
              </Button>
            </div>
            
            <div className="flex justify-center gap-6">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`
                    w-24 h-24 sm:w-28 sm:h-28 rounded-2xl text-4xl font-bold
                    transition-all duration-200
                    ${selectedAnswer === option && showFeedback
                      ? isCorrect
                        ? 'bg-[#B8E0D2] text-white scale-110'
                        : 'bg-[#FF6B6B] text-white'
                      : selectedAnswer === option
                        ? 'bg-[#FFB5BA] text-white scale-105'
                        : 'bg-white border-4 border-[#FFB5BA]/30 hover:border-[#FFB5BA] hover:scale-105'
                    }
                    ${showFeedback && option === currentQuestion.correctAnswer && selectedAnswer !== option
                      ? 'bg-[#B8E0D2]/30 border-[#B8E0D2]'
                      : ''
                    }
                  `}
                  variant="outline"
                >
                  {option.toUpperCase()}
                </Button>
              ))}
            </div>
            
            {showFeedback && (
              <div className="text-center mt-6">
                {isCorrect ? (
                  <div className="text-[#B8E0D2] text-2xl font-bold animate-bounce">
                    ✓ Correct! Great listening!
                  </div>
                ) : (
                  <div className="text-[#FF6B6B] text-xl">
                    Try again! Listen carefully to the {getPositionText(currentQuestion.targetPosition).toLowerCase()} sound.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-[#5A4A42]/60 text-sm">
            Tap the word to hear it again
          </p>
        </div>
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
