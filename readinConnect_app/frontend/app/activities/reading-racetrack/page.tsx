'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, RotateCcw, Trophy, Star, Clock, Car, Flag } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';

interface Passage {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  level: 1 | 2 | 3;
}

const PASSAGES: Passage[] = [
  {
    id: '1',
    title: 'The Big Cat',
    text: 'The big cat sat on the mat. The cat is fat. The fat cat sat.',
    wordCount: 19,
    level: 1,
  },
  {
    id: '2',
    title: 'My Dog',
    text: 'I have a dog. My dog can run. My dog can run fast. I love my dog.',
    wordCount: 20,
    level: 1,
  },
  {
    id: '3',
    title: 'The Sun',
    text: 'The sun is hot. The sun is bright. We like the sun. The sun helps plants grow.',
    wordCount: 21,
    level: 1,
  },
  {
    id: '4',
    title: 'A Red Ball',
    text: 'I see a red ball. The ball is big. I can kick the ball. The ball rolls fast.',
    wordCount: 22,
    level: 2,
  },
  {
    id: '5',
    title: 'The Blue Bird',
    text: 'A blue bird sits in the tree. The bird can sing. The bird sings a pretty song.',
    wordCount: 23,
    level: 2,
  },
];

interface RoundResult {
  round: number;
  wpm: number;
  timeSeconds: number;
}

export default function ReadingRacetrackGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWin } = useGameSounds();
  
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isReading, setIsReading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const currentPassage = PASSAGES[currentPassageIndex];
  const progress = ((currentPassageIndex) / PASSAGES.length) * 100;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReading && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isReading, startTime]);
  
  const calculateWPM = (wordCount: number, timeSeconds: number): number => {
    if (timeSeconds === 0) return 0;
    const minutes = timeSeconds / 60;
    return Math.round(wordCount / minutes);
  };
  
  const handleStartReading = () => {
    setIsReading(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };
  
  const handleFinishReading = () => {
    if (!startTime) return;
    
    const endTime = Date.now();
    const timeSeconds = Math.floor((endTime - startTime) / 1000);
    const wpm = calculateWPM(currentPassage.wordCount, timeSeconds);
    
    const newResult: RoundResult = {
      round,
      wpm,
      timeSeconds,
    };
    
    setResults(prev => [...prev, newResult]);
    setIsReading(false);
    
    if (round < 3) {
      setRound(prev => prev + 1);
      setCelebrationMessage(`Round ${round} complete! ${wpm} WPM`);
      setShowCelebration(true);
      playCorrect();
      
      setTimeout(() => {
        setShowCelebration(false);
        setElapsedTime(0);
        setStartTime(null);
      }, 2000);
    } else {
      setGameComplete(true);
      playWin();
    }
  };
  
  const handleNextPassage = () => {
    const nextIndex = currentPassageIndex + 1;
    
    if (nextIndex >= PASSAGES.length) {
      router.push('/dashboard/student');
    } else {
      setCurrentPassageIndex(nextIndex);
      setRound(1);
      setResults([]);
      setElapsedTime(0);
      setStartTime(null);
      setIsReading(false);
      setGameComplete(false);
    }
  };
  
  const handleReset = () => {
    setRound(1);
    setResults([]);
    setElapsedTime(0);
    setStartTime(null);
    setIsReading(false);
    setGameComplete(false);
  };
  
  const getBestWPM = () => {
    if (results.length === 0) return 0;
    return Math.max(...results.map(r => r.wpm));
  };
  
  const getAverageWPM = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length);
  };
  
  const getMedal = () => {
    const bestWPM = getBestWPM();
    if (bestWPM >= 60) return { type: 'gold', label: 'Gold', color: 'text-yellow-500' };
    if (bestWPM >= 40) return { type: 'silver', label: 'Silver', color: 'text-gray-400' };
    return { type: 'bronze', label: 'Bronze', color: 'text-orange-600' };
  };
  
  if (gameComplete) {
    const medal = getMedal();
    const improvement = results.length > 1 
      ? results[results.length - 1].wpm - results[0].wpm 
      : 0;
    
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className={`text-6xl mb-4 ${medal.color}`}>🏆</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">{medal.label} Medal!</h2>
            <p className="text-[#5A4A42]/70 mb-6">Great reading speed!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#FFE4A1]/20 p-3 rounded-xl">
                <span>Best Speed</span>
                <span className="font-bold text-[#FF6B6B]">{getBestWPM()} WPM</span>
              </div>
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Average</span>
                <span className="font-bold">{getAverageWPM()} WPM</span>
              </div>
              {improvement > 0 && (
                <div className="flex justify-between bg-green-100 p-3 rounded-xl">
                  <span>Improvement</span>
                  <span className="font-bold text-green-600">+{improvement} WPM</span>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleNextPassage}
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 text-lg font-bold"
            >
              <Trophy className="h-5 w-5 mr-2" />
              {currentPassageIndex < PASSAGES.length - 1 ? 'Next Passage' : 'Finish'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-20 right-20 text-5xl animate-bounce">🏎️</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">🏁</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>⚡</div>
      
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
            <div className="text-sm text-[#5A4A42]/70">
              Passage {currentPassageIndex + 1} of {PASSAGES.length}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <Progress value={progress} className="h-3 bg-[#B8E0D2]/20" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Reading Racetrack</h1>
          <p className="text-[#5A4A42]/70">Read fast and beat your time!</p>
        </div>
        
        {results.length > 0 && (
          <div className="mb-6 flex justify-center gap-4">
            {results.map((result, index) => (
              <div key={index} className="bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm text-[#5A4A42]/70">Round {result.round}:</span>
                <span className="font-bold text-[#FF6B6B] ml-2">{result.wpm} WPM</span>
              </div>
            ))}
          </div>
        )}
        
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 mb-8">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Car className="h-6 w-6 text-[#FF6B6B]" />
                <span className="text-[#5A4A42] font-bold">Round {round} of 3</span>
              </div>
              <div className="flex items-center gap-2 bg-[#FFE4A1]/20 px-4 py-2 rounded-full">
                <Clock className="h-5 w-5 text-[#FF6B6B]" />
                <span className="font-bold text-[#5A4A42] text-xl">
                  {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] transition-all duration-300"
                  style={{ width: `${Math.min((elapsedTime / 30) * 100, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-[#5A4A42]/60 mt-2">
                Tap words to hear them as you read
              </p>
            </div>
            
            <div className="bg-[#FFF8F0] rounded-2xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-[#5A4A42] mb-4 text-center">
                {currentPassage.title}
              </h2>
              <p className="text-3xl text-[#5A4A42] leading-relaxed text-center">
                {currentPassage.text.split(' ').map((word, index) => (
                  <span 
                    key={index} 
                    className="inline-block mr-2 cursor-pointer hover:text-[#FF6B6B] transition-colors"
                    onClick={() => {}}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              {!isReading ? (
                <Button
                  onClick={handleStartReading}
                  className="rounded-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white px-8 py-6 text-xl font-bold"
                >
                  <Play className="h-6 w-6 mr-2" />
                  {round === 1 ? 'Start Reading' : `Read Again (Round ${round})`}
                </Button>
              ) : (
                <Button
                  onClick={handleFinishReading}
                  className="rounded-full bg-[#B8E0D2] hover:bg-[#B8E0D2]/90 text-[#5A4A42] px-8 py-6 text-xl font-bold"
                >
                  <Flag className="h-6 w-6 mr-2" />
                  I Finished!
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {round > 1 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-full border-2 border-[#FFE4A1]/50 hover:bg-[#FFE4A1]/10 px-6"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Start Over
            </Button>
          </div>
        )}
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
