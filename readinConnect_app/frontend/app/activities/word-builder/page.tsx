'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, RotateCcw, Trophy, Star, Sparkles } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';
import { CVCWord, getWordsByCriteria, getLetterTiles } from '@/lib/data/cvcWords';
import { playCVCWord } from '@/lib/audio/edgeTTSPhonics';

interface WordBuilderState {
  currentWordIndex: number;
  placedLetters: (string | null)[];
  availableLetters: string[];
  attempts: number;
  score: number;
  streak: number;
  hintsUsed: number;
  gameComplete: boolean;
}

interface GameResults {
  wordsCompleted: number;
  totalScore: number;
  accuracy: number;
  hintsUsed: number;
  timeSpent: number;
}

export default function WordBuilderGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWrong, playWin } = useGameSounds();
  
  const [words, setWords] = useState<CVCWord[]>([]);
  const [gameState, setGameState] = useState<WordBuilderState>({
    currentWordIndex: 0,
    placedLetters: [null, null, null],
    availableLetters: [],
    attempts: 0,
    score: 0,
    streak: 0,
    hintsUsed: 0,
    gameComplete: false,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [startTime] = useState(Date.now());
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  
  const currentWord = words[gameState.currentWordIndex];
  const progress = ((gameState.currentWordIndex) / words.length) * 100;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    const gameWords = getWordsByCriteria({
      wordFamilies: ['-at', '-an', '-ap'],
      difficulty: 1,
      count: 10,
    });
    
    setWords(gameWords);
    if (gameWords.length > 0) {
      setGameState(prev => ({
        ...prev,
        availableLetters: getLetterTiles(gameWords[0]),
      }));
    }
  }, [user, router]);
  
  const handleDragStart = (letter: string) => {
    setDraggedLetter(letter);
  };
  
  const handleDragEnd = () => {
    setDraggedLetter(null);
  };
  
  const handleDrop = (slotIndex: number) => {
    if (!draggedLetter || !currentWord) return;
    
    const correctLetter = currentWord.phonemes[slotIndex];
    
    if (draggedLetter === correctLetter) {
      handleCorrectLetter(slotIndex, draggedLetter);
    } else {
      handleIncorrectLetter();
    }
    
    setDraggedLetter(null);
  };
  
  const handleCorrectLetter = (slotIndex: number, letter: string) => {
    playCorrect();
    
    const newPlacedLetters = [...gameState.placedLetters];
    newPlacedLetters[slotIndex] = letter;
    
    const newAvailableLetters = gameState.availableLetters.filter((l, i) => {
      if (l === letter) {
        const index = gameState.availableLetters.indexOf(letter);
        return i !== index;
      }
      return true;
    });
    
    setGameState(prev => ({
      ...prev,
      placedLetters: newPlacedLetters,
      availableLetters: newAvailableLetters,
      streak: prev.streak + 1,
    }));
    
    if (hintIndex === slotIndex) {
      setHintIndex(null);
    }
    
    if (!newPlacedLetters.includes(null)) {
      setTimeout(() => handleWordComplete(), 500);
    }
  };
  
  const handleIncorrectLetter = () => {
    playWrong();
    setGameState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      streak: 0,
    }));
  };
  
  const handleWordComplete = () => {
    if (!currentWord) return;
    
    const basePoints = 10;
    const streakBonus = Math.min(gameState.streak * 2, 10);
    const hintPenalty = hintIndex !== null ? 3 : 0;
    const wordScore = basePoints + streakBonus - hintPenalty;
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + Math.max(wordScore, 5),
    }));
    
    setCelebrationMessage(`Great job! "${currentWord.word.toUpperCase()}"`);
    setShowCelebration(true);
    
    setTimeout(() => {
      setShowCelebration(false);
      moveToNextWord();
    }, 2000);
  };
  
  const moveToNextWord = () => {
    const nextIndex = gameState.currentWordIndex + 1;
    
    if (nextIndex >= words.length) {
      setGameState(prev => ({ ...prev, gameComplete: true }));
      playWin();
    } else {
      const nextWord = words[nextIndex];
      setGameState(prev => ({
        ...prev,
        currentWordIndex: nextIndex,
        placedLetters: [null, null, null],
        availableLetters: getLetterTiles(nextWord),
        attempts: 0,
        hintIndex: null,
      }));
    }
  };
  
  const handleHint = () => {
    if (!currentWord || hintIndex !== null) return;
    
    const emptyIndices = gameState.placedLetters
      .map((letter, index) => letter === null ? index : -1)
      .filter(index => index !== -1);
    
    if (emptyIndices.length > 0) {
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      setHintIndex(randomIndex);
      setGameState(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }));
    }
  };
  
  const handleReset = () => {
    if (!currentWord) return;
    
    setGameState(prev => ({
      ...prev,
      placedLetters: [null, null, null],
      availableLetters: getLetterTiles(currentWord),
      attempts: 0,
      streak: 0,
      hintIndex: null,
    }));
  };
  
  const handleSpeakWord = () => {
    if (currentWord) {
      playCVCWord(currentWord.word);
    }
  };
  
  const handleGameComplete = () => {
    const results: GameResults = {
      wordsCompleted: gameState.currentWordIndex + 1,
      totalScore: gameState.score,
      accuracy: Math.round(((gameState.currentWordIndex + 1) / (gameState.currentWordIndex + 1 + gameState.attempts)) * 100),
      hintsUsed: gameState.hintsUsed,
      timeSpent: Math.floor((Date.now() - startTime) / 1000),
    };
    
    console.log('Game Complete!', results);
    router.push('/dashboard/student');
  };
  
  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🏗️</div>
          <p className="text-[#5A4A42]">Loading words...</p>
        </div>
      </div>
    );
  }
  
  if (gameState.gameComplete) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Amazing!</h2>
            <p className="text-[#5A4A42]/70 mb-6">You built all the words!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Score</span>
                <span className="font-bold text-[#FF6B6B]">{gameState.score} points</span>
              </div>
              <div className="flex justify-between bg-[#FFB5BA]/20 p-3 rounded-xl">
                <span>Words Built</span>
                <span className="font-bold">{words.length}</span>
              </div>
              <div className="flex justify-between bg-[#FFE4A1]/20 p-3 rounded-xl">
                <span>Hints Used</span>
                <span className="font-bold">{gameState.hintsUsed}</span>
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
      <div className="absolute top-20 right-20 text-5xl animate-bounce">🏗️</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">📚</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>✏️</div>
      
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
              <span className="font-bold text-[#5A4A42]">{gameState.score}</span>
            </div>
            <div className="text-sm text-[#5A4A42]/70">
              Word {gameState.currentWordIndex + 1} of {words.length}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <Progress value={progress} className="h-3 bg-[#B8E0D2]/20" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Word Builder</h1>
          <p className="text-[#5A4A42]/70">Drag the letters to build the word!</p>
        </div>
        
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 mb-8">
          <CardContent className="p-8">
            <div className="flex justify-center mb-8">
              <div className="text-8xl animate-pulse">
                {currentWord.word === 'cat' && '🐱'}
                {currentWord.word === 'hat' && '🎩'}
                {currentWord.word === 'mat' && '🧘'}
                {currentWord.word === 'bat' && '🦇'}
                {currentWord.word === 'rat' && '🐭'}
                {currentWord.word === 'sat' && '🪑'}
                {currentWord.word === 'fat' && '🍔'}
                {currentWord.word === 'pat' && '👋'}
                {currentWord.word === 'can' && '🥫'}
                {currentWord.word === 'man' && '👨'}
                {currentWord.word === 'pan' && '🍳'}
                {currentWord.word === 'van' && '🚐'}
                {currentWord.word === 'fan' && '💨'}
                {currentWord.word === 'cap' && '🧢'}
                {currentWord.word === 'map' && '🗺️'}
                {currentWord.word === 'tap' && '🚰'}
                {currentWord.word === 'lap' && '🏃'}
                {currentWord.word === 'nap' && '😴'}
                {currentWord.word === 'dad' && '👨‍👧'}
                {currentWord.word === 'bad' && '👎'}
                {currentWord.word === 'had' && '✅'}
                {currentWord.word === 'mad' && '😠'}
                {currentWord.word === 'sad' && '😢'}
                {currentWord.word === 'bag' && '🛍️'}
                {currentWord.word === 'tag' && '🏷️'}
                {currentWord.word === 'wag' && '🐕'}
                {currentWord.word === 'rag' && '🧹'}
                {currentWord.word === 'jam' && '🍓'}
                {currentWord.word === 'ham' && '🍖'}
                {currentWord.word === 'dam' && '🌊'}
                {currentWord.word === 'sit' && '🪑'}
                {currentWord.word === 'pit' && '🕳️'}
                {currentWord.word === 'hit' && '👊'}
                {currentWord.word === 'bit' && '🦷'}
                {currentWord.word === 'fit' && '✅'}
                {currentWord.word === 'pin' && '📌'}
                {currentWord.word === 'win' && '🏆'}
                {currentWord.word === 'tin' && '🥫'}
                {currentWord.word === 'fin' && '🐟'}
                {currentWord.word === 'bin' && '🗑️'}
                {currentWord.word === 'big' && '🐘'}
                {currentWord.word === 'pig' && '🐷'}
                {currentWord.word === 'dig' && '⛏️'}
                {currentWord.word === 'wig' && '👩‍🦰'}
                {currentWord.word === 'fig' && '🍇'}
                {!['cat','hat','mat','bat','rat','sat','fat','pat','can','man','pan','van','fan','cap','map','tap','lap','nap','dad','bad','had','mad','sad','bag','tag','wag','rag','jam','ham','dam','sit','pit','hit','bit','fit','pin','win','tin','fin','bin','big','pig','dig','wig','fig'].includes(currentWord.word) && '📖'}
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mb-8">
              {gameState.placedLetters.map((letter, index) => (
                <div
                  key={index}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`
                    w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 flex items-center justify-center text-4xl font-bold
                    transition-all duration-300
                    ${letter 
                      ? 'bg-[#B8E0D2] border-[#B8E0D2] text-white scale-105' 
                      : hintIndex === index
                        ? 'bg-[#FFE4A1]/50 border-[#FFB5BA] border-dashed animate-pulse'
                        : 'bg-white border-[#B8E0D2]/30 border-dashed'
                    }
                  `}
                >
                  {letter ? letter.toUpperCase() : ''}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-4">
              {gameState.availableLetters.map((letter, index) => (
                <div
                  key={`${letter}-${index}`}
                  draggable={!gameState.placedLetters.includes(letter)}
                  onDragStart={() => handleDragStart(letter)}
                  onDragEnd={handleDragEnd}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-3 flex items-center justify-center text-3xl font-bold cursor-grab active:cursor-grabbing
                    transition-all duration-200 shadow-md
                    ${gameState.placedLetters.includes(letter)
                      ? 'opacity-30 cursor-not-allowed'
                      : draggedLetter === letter
                        ? 'bg-[#FF6B6B] text-white scale-110 shadow-lg'
                        : 'bg-white border-[#FFB5BA] hover:scale-105 hover:shadow-lg'
                    }
                  `}
                >
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleSpeakWord}
            className="rounded-full border-2 border-[#B8E0D2]/50 hover:bg-[#B8E0D2]/10 px-6"
          >
            <Volume2 className="h-5 w-5 mr-2" />
            Hear Word
          </Button>
          
          <Button
            variant="outline"
            onClick={handleHint}
            disabled={hintIndex !== null}
            className="rounded-full border-2 border-[#FFB5BA]/50 hover:bg-[#FFB5BA]/10 px-6"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Hint (-3 pts)
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-full border-2 border-[#FFE4A1]/50 hover:bg-[#FFE4A1]/10 px-6"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
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
