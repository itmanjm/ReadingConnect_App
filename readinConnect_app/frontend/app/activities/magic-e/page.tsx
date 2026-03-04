'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy, Star, Sparkles, Wand2 } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';
import { speakCVCWord } from '@/lib/audio/googleTTS';

const MAGIC_E_PAIRS = [
  { short: 'cap', long: 'cape', emoji: '🦸' },
  { short: 'tap', long: 'tape', emoji: '📼' },
  { short: 'mad', long: 'made', emoji: '🏗️' },
  { short: 'hat', long: 'hate', emoji: '😠' },
  { short: 'can', long: 'cane', emoji: '🍬' },
  { short: 'pin', long: 'pine', emoji: '🌲' },
  { short: 'win', long: 'wine', emoji: '🍷' },
  { short: 'bit', long: 'bite', emoji: '🦷' },
  { short: 'hop', long: 'hope', emoji: '🤞' },
  { short: 'not', long: 'note', emoji: '🎵' },
  { short: 'cut', long: 'cute', emoji: '🥰' },
  { short: 'tub', long: 'tube', emoji: '🧪' },
];

interface Question {
  shortWord: string;
  longWord: string;
  emoji: string;
  image: string;
}

const getRandomQuestions = (count: number): Question[] => {
  const shuffled = [...MAGIC_E_PAIRS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(pair => ({
    shortWord: pair.short,
    longWord: pair.long,
    emoji: pair.emoji,
    image: pair.emoji,
  }));
};

export default function MagicEGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWrong, playWin } = useGameSounds();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showMagic, setShowMagic] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      setQuestions(getRandomQuestions(10));
    }
  }, [user, router]);
  
  const castMagic = () => {
    if (!currentQuestion || showMagic) return;
    
    setShowMagic(true);
    playCorrect();
    
    const points = 15 + Math.min(streak * 2, 10);
    setScore(prev => prev + points);
    setStreak(prev => prev + 1);
    
    speakCVCWord(currentQuestion.longWord);
    
    setTimeout(() => {
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        setShowMagic(false);
        
        if (currentIndex + 1 >= questions.length) {
          setGameComplete(true);
          playWin();
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, 1500);
    }, 1500);
  };
  
  const handleGameComplete = () => {
    router.push('/dashboard/student');
  };
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">✨</div>
          <p className="text-[#5A4A42]">Loading magic...</p>
        </div>
      </div>
    );
  }
  
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🧙‍♀️</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Magic Master!</h2>
            <p className="text-[#5A4A42]/70 mb-6">You mastered the Magic E!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Magic Score</span>
                <span className="font-bold text-[#FF6B6B]">{score}</span>
              </div>
              <div className="flex justify-between bg-[#FFB5BA]/20 p-3 rounded-xl">
                <span>Words Transformed</span>
                <span className="font-bold">{questions.length}</span>
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
      <div className="absolute top-20 right-20 text-5xl animate-bounce">✨</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">🪄</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>🔮</div>
      
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
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>
        
        <div className="w-full h-3 bg-[#FFE5B4]/30 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Magic E</h1>
          <p className="text-[#5A4A42]/70">Watch the magic happen!</p>
        </div>
        
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{currentQuestion.image}</div>
              
              <div className="flex items-center justify-center gap-4 text-4xl font-black mb-6">
                {!showMagic ? (
                  <>
                    <span className="text-[#5A4A42]">{currentQuestion.shortWord}</span>
                    <span className="text-[#FFB5BA]">+</span>
                    <span className="text-[#9B59B6]">e</span>
                    <span className="text-[#FFB5BA]">=</span>
                    <span className="text-gray-300">???</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 line-through">{currentQuestion.shortWord}</span>
                    <Sparkles className="h-8 w-8 text-[#9B59B6] animate-pulse" />
                    <span className="text-[#9B59B6] text-5xl">{currentQuestion.longWord}</span>
                  </>
                )}
              </div>
              
              {!showMagic && (
                <Button
                  onClick={castMagic}
                  className="rounded-full bg-gradient-to-r from-[#9B59B6] to-[#E74C3C] hover:from-[#8E44AD] hover:to-[#C0392B] text-white px-12 py-8 text-2xl font-bold shadow-lg shadow-purple-500/30"
                >
                  <Wand2 className="h-8 w-8 mr-3" />
                  Cast Magic Spell!
                </Button>
              )}
              
              {showMagic && (
                <div className="text-2xl font-bold text-[#9B59B6] animate-bounce">
                  ✨ Abracadabra! ✨
                </div>
              )}
            </div>
            
            <div className="bg-[#FFF8F0] rounded-2xl p-6 text-center">
              <p className="text-[#5A4A42] mb-2">
                <strong>Magic E Rule:</strong>
              </p>
              <p className="text-[#8B7355]">
                When you add <strong className="text-[#9B59B6]">e</strong> to the end of a word, 
                it makes the vowel say its <strong>name</strong> (long sound)!
              </p>
              <div className="mt-4 flex justify-center gap-8 text-sm">
                <div className="text-center">
                  <span className="block text-2xl mb-1">cap</span>
                  <span className="text-[#8B7355]">short a (/ă/)</span>
                </div>
                <div className="text-2xl text-[#FFB5BA]">→</div>
                <div className="text-center">
                  <span className="block text-2xl mb-1 text-[#9B59B6]">cape</span>
                  <span className="text-[#8B7355]">long a (/ā/)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-[#5A4A42]/60 text-sm">
            Streak: {streak} 🔥
          </p>
        </div>
      </div>
      
      {showCelebration && (
        <>
          <ConfettiExplosion active={true} />
          <StarBurst active={true} x={50} y={50} />
          <CelebrationMessage message="Magical!" active={true} />
        </>
      )}
    </div>
  );
}
