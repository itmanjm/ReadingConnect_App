'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy, Star, Volume2 } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';

const SIGHT_WORDS = [
  'the', 'and', 'a', 'to', 'is', 'you', 'that', 'it', 'he', 'was',
  'for', 'on', 'are', 'as', 'with', 'his', 'they', 'I', 'at', 'be',
  'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not',
  'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'use',
];

interface Balloon {
  id: string;
  word: string;
  x: number;
  speed: number;
  color: string;
}

const BALLOON_COLORS = ['#FF6B6B', '#B8E0D2', '#FFE4A1', '#FFB5BA', '#4ECDC4', '#95E1D3'];

export default function WordPopGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWrong, playWin } = useGameSounds();
  
  const [targetWord, setTargetWord] = useState('');
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [wordsPopped, setWordsPopped] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [level, setLevel] = useState(1);
  
  const maxStrikes = 3;
  const targetWordsPerLevel = 5;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
  
  const getRandomWord = () => SIGHT_WORDS[Math.floor(Math.random() * SIGHT_WORDS.length)];
  
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setWordsPopped(0);
    setLevel(1);
    setGameComplete(false);
    setBalloons([]);
    pickNewTarget();
  };
  
  const pickNewTarget = () => {
    const newTarget = getRandomWord();
    setTargetWord(newTarget);
  };
  
  const createBalloon = useCallback(() => {
    const isTarget = Math.random() < 0.4;
    const word = isTarget ? targetWord : getRandomWord();
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      word,
      x: Math.random() * 80 + 10,
      speed: 1 + level * 0.5,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    };
  }, [targetWord, level]);
  
  useEffect(() => {
    if (!gameActive || gameComplete) return;
    
    const interval = setInterval(() => {
      setBalloons(prev => {
        const updated = prev.map(b => ({
          ...b,
          y: (b as any).y ? (b as any).y - b.speed : 100,
        }));
        
        const filtered = updated.filter(b => (b as any).y > -10);
        
        if (filtered.length < 3 + level) {
          filtered.push(createBalloon() as any);
        }
        
        return filtered;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameActive, gameComplete, createBalloon, level]);
  
  const handlePop = (balloonId: string, word: string) => {
    if (!gameActive) return;
    
    if (word === targetWord) {
      playCorrect();
      const points = 10 + Math.min(streak, 5) * 2;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setWordsPopped(prev => prev + 1);
      
      setCelebrationMessage('+' + points);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 500);
      
      if ((wordsPopped + 1) % targetWordsPerLevel === 0) {
        setLevel(prev => prev + 1);
      }
      
      pickNewTarget();
    } else {
      playWrong();
      setStrikes(prev => prev + 1);
      setStreak(0);
      
      if (strikes + 1 >= maxStrikes) {
        setGameActive(false);
        setGameComplete(true);
        playWin();
      }
    }
    
    setBalloons(prev => prev.filter(b => b.id !== balloonId));
  };
  
  const handleGameComplete = () => {
    router.push('/dashboard/student');
  };
  
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎈</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Great Popping!</h2>
            <p className="text-[#5A4A42]/70 mb-6">You know your sight words!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Final Score</span>
                <span className="font-bold text-[#FF6B6B]">{score}</span>
              </div>
              <div className="flex justify-between bg-[#FFB5BA]/20 p-3 rounded-xl">
                <span>Words Popped</span>
                <span className="font-bold">{wordsPopped}</span>
              </div>
              <div className="flex justify-between bg-[#FFE4A1]/20 p-3 rounded-xl">
                <span>Level Reached</span>
                <span className="font-bold">{level}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={startGame}
                className="flex-1 bg-[#B8E0D2] hover:bg-[#B8E0D2]/80 text-[#5A4A42] rounded-full h-14 text-lg font-bold"
              >
                Play Again
              </Button>
              <Button
                onClick={handleGameComplete}
                className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 text-lg font-bold"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      {!gameActive ? (
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">🎈</div>
              <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Word Pop</h1>
              <p className="text-[#5A4A42]/70 mb-6">
                Pop the balloons with the target word! Don\'t let the wrong ones float away!
              </p>
              
              <div className="space-y-2 mb-6 text-sm text-[#5A4A42]/60">
                <p>🎯 Pop the TARGET word</p>
                <p>⚡ Speed increases each level</p>
                <p>❌ 3 wrong pops = Game Over</p>
              </div>
              
              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 text-xl font-bold"
              >
                Start Game
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="absolute top-4 left-4 z-20">
            <Button
              variant="outline"
              onClick={() => setGameActive(false)}
              className="rounded-full border-2 border-[#FFB5BA]/50 hover:bg-[#FFB5BA]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quit
            </Button>
          </div>
          
          <div className="absolute top-4 right-4 z-20 flex gap-3">
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-lg">
              <span className="text-2xl">❌</span>
              <span className="font-bold text-[#FF6B6B]">{strikes}/{maxStrikes}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-lg">
              <Star className="h-5 w-5 text-[#FFB5BA]" />
              <span className="font-bold text-[#5A4A42]">{score}</span>
            </div>
          </div>
          
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 text-center">
            <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-lg">
              <p className="text-sm text-[#5A4A42]/60 mb-1">POP THE WORD:</p>
              <p className="text-4xl font-black text-[#FF6B6B]">{targetWord.toUpperCase()}</p>
            </div>
            <div className="mt-2 bg-[#FFE4A1]/80 px-4 py-1 rounded-full inline-block">
              <span className="text-sm font-bold text-[#5A4A42]">Level {level}</span>
            </div>
          </div>
          
          <div className="relative h-screen w-full overflow-hidden">
            {balloons.map((balloon) => (
              <div
                key={balloon.id}
                onClick={() => handlePop(balloon.id, balloon.word)}
                className="absolute cursor-pointer transition-transform hover:scale-110 active:scale-95"
                style={{
                  left: `${balloon.x}%`,
                  bottom: `${(balloon as any).y || 0}%`,
                  animation: `float ${10 / balloon.speed}s linear`,
                }}
              >
                <div
                  className="w-24 h-32 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ backgroundColor: balloon.color }}
                >
                  {balloon.word}
                </div>
                <div
                  className="w-1 h-12 mx-auto"
                  style={{ backgroundColor: balloon.color }}
                />
              </div>
            ))}
          </div>
        </>
      )}
      
      {showCelebration && (
        <>
          <ConfettiExplosion active={true} />
          <StarBurst active={true} x={50} y={50} />
          <CelebrationMessage message={celebrationMessage} active={true} />
        </>
      )}
      
      <style jsx>{`
        @keyframes float {
          from {
            transform: translateY(100vh);
          }
          to {
            transform: translateY(-200px);
          }
        }
      `}</style>
    </div>
  );
}
