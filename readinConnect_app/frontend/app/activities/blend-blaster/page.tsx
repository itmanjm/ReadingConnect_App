'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy, Star, Rocket, Zap, Target } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';
import { playCVCWord } from '@/lib/audio/edgeTTSPhonics';

const BLEND_WORDS = {
  bl: ['black', 'blue', 'block', 'blow', 'blanket'],
  cl: ['clap', 'cloud', 'clown', 'clock', 'clean'],
  fl: ['flag', 'flower', 'fly', 'flip', 'flame'],
  gl: ['glass', 'glue', 'glow', 'globe', 'glad'],
  pl: ['plane', 'play', 'plug', 'planet', 'plus'],
  sl: ['sleep', 'slide', 'slow', 'slip', 'sled'],
  br: ['bread', 'brown', 'brush', 'brick', 'break'],
  cr: ['cry', 'crow', 'crown', 'crab', 'crawl'],
  dr: ['draw', 'drive', 'drop', 'dress', 'drink'],
  fr: ['frog', 'friend', 'fruit', 'freeze', 'frame'],
  gr: ['green', 'grape', 'grass', 'grow', 'grand'],
  pr: ['prince', 'princess', 'pray', 'present', 'price'],
  tr: ['tree', 'train', 'truck', 'trip', 'trail'],
};

const BLEND_LIST = Object.keys(BLEND_WORDS) as Array<keyof typeof BLEND_WORDS>;

interface Question {
  word: string;
  blend: string;
  emoji: string;
}

const getRandomQuestions = (count: number): Question[] => {
  const questions: Question[] = [];
  const emojis: Record<string, string> = {
    black: '⬛', blue: '🔵', block: '🧱', blow: '💨', blanket: '🛏️',
    clap: '👏', cloud: '☁️', clown: '🤡', clock: '⏰', clean: '🧹',
    flag: '🚩', flower: '🌸', fly: '🦋', flip: '🤸', flame: '🔥',
    glass: '🥛', glue: '🔧', glow: '✨', globe: '🌍', glad: '😊',
    plane: '✈️', play: '🎮', plug: '🔌', planet: '🪐', plus: '➕',
    sleep: '😴', slide: '🛝', slow: '🐢', slip: '🍌', sled: '🛷',
    bread: '🍞', brown: '🟫', brush: '🖌️', brick: '🧱', break: '💔',
    cry: '😢', crow: '🐦‍⬛', crown: '👑', crab: '🦀', crawl: '🐛',
    draw: '🎨', drive: '🚗', drop: '💧', dress: '👗', drink: '🥤',
    frog: '🐸', friend: '👫', fruit: '🍎', freeze: '🧊', frame: '🖼️',
    green: '🟢', grape: '🍇', grass: '🌱', grow: '🌳', grand: '👴',
    prince: '🤴', princess: '👸', pray: '🙏', present: '🎁', price: '🏷️',
    tree: '🌲', train: '🚂', truck: '🚛', trip: '✈️', trail: '🥾',
  };
  
  while (questions.length < count) {
    const randomBlend = BLEND_LIST[Math.floor(Math.random() * BLEND_LIST.length)];
    const words = BLEND_WORDS[randomBlend];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    if (!questions.find(q => q.word === randomWord)) {
      questions.push({
        word: randomWord,
        blend: randomBlend,
        emoji: emojis[randomWord] || '📖',
      });
    }
  }
  
  return questions;
};

export default function BlendBlasterGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWrong, playWin } = useGameSounds();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      setQuestions(getRandomQuestions(10));
    }
  }, [user, router]);
  
  const getDistractors = (correctBlend: string): string[] => {
    const distractors = BLEND_LIST.filter(b => b !== correctBlend);
    const shuffled = [...distractors].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  };
  
  const handleAnswer = (blend: string) => {
    if (showFeedback || !currentQuestion) return;
    
    const correct = blend === currentQuestion.blend;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      playCorrect();
      const points = 15 + Math.min(streak * 2, 10);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCelebrationMessage(`+${points} points!`);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        nextQuestion();
      }, 1500);
    } else {
      playWrong();
      setStreak(0);
      setTimeout(() => {
        setShowFeedback(false);
      }, 1000);
    }
  };
  
  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameComplete(true);
      playWin();
    } else {
      setCurrentIndex(prev => prev + 1);
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
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🚀</div>
          <p className="text-[#5A4A42]">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Blast Master!</h2>
            <p className="text-[#5A4A42]/70 mb-6">You conquered the blends!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Score</span>
                <span className="font-bold text-[#FF6B6B]">{score}</span>
              </div>
              <div className="flex justify-between bg-[#FFB5BA]/20 p-3 rounded-xl">
                <span>Blends Mastered</span>
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
  
  const options = [currentQuestion.blend, ...getDistractors(currentQuestion.blend)]
    .sort(() => Math.random() - 0.5);
  
  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-20 right-20 text-5xl animate-bounce">🚀</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">⚡</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>
      
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
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Blend Blaster</h1>
          <p className="text-[#5A4A42]/70">Find the blend in the word!</p>
        </div>
        
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-[#FF6B6B]/10 px-4 py-2 rounded-full">
            <Target className="h-5 w-5 text-[#FF6B6B]" />
            <span className="text-[#5A4A42] font-medium">Which blend starts this word?</span>
          </div>
        </div>
        
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{currentQuestion.emoji}</div>
              <Button
                onClick={handleSpeakWord}
                variant="outline"
                className="rounded-full text-2xl font-bold px-8 py-6 border-2 border-[#B8E0D2]/50 hover:bg-[#B8E0D2]/10"
              >
                <Zap className="h-6 w-6 mr-2 text-[#FF6B6B]" />
                {currentQuestion.word.toUpperCase()}
              </Button>
            </div>
            
            <div className="flex justify-center gap-6">
              {options.map((blend) => (
                <Button
                  key={blend}
                  onClick={() => handleAnswer(blend)}
                  disabled={showFeedback}
                  className={`
                    w-28 h-28 rounded-2xl text-3xl font-black
                    transition-all duration-200
                    ${showFeedback && blend === currentQuestion.blend
                      ? 'bg-[#B8E0D2] text-white scale-110'
                      : 'bg-white border-4 border-[#FFB5BA]/30 hover:border-[#FFB5BA] hover:scale-105'
                    }
                  `}
                  variant="outline"
                >
                  <div className="flex flex-col items-center">
                    <Rocket className="h-8 w-8 mb-2" />
                    {blend.toUpperCase()}
                  </div>
                </Button>
              ))}
            </div>
            
            {showFeedback && (
              <div className="text-center mt-6">
                {isCorrect ? (
                  <div className="text-[#B8E0D2] text-2xl font-bold animate-bounce">
                    🚀 Blast! That&apos;s correct!
                  </div>
                ) : (
                  <div className="text-[#FF6B6B] text-xl">
                    💥 Oops! Try again!
                  </div>
                )}
              </div>
            )}
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
          <CelebrationMessage message={celebrationMessage} active={true} />
        </>
      )}
    </div>
  );
}
