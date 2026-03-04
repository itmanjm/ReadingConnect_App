'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, RotateCcw, Trophy, Star, BookOpen } from 'lucide-react';
import { useGameSounds } from '@/lib/hooks/useGameSounds';
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects';
import { useAuthStore } from '@/lib/stores/auth';

interface StoryScene {
  id: string;
  order: number;
  text: string;
  emoji: string;
}

interface Story {
  id: string;
  title: string;
  scenes: StoryScene[];
}

const STORIES: Story[] = [
  {
    id: '1',
    title: 'The Little Seed',
    scenes: [
      { id: 's1-1', order: 1, text: 'A little seed is in the ground.', emoji: '🌱' },
      { id: 's1-2', order: 2, text: 'The rain helps the seed grow.', emoji: '🌧️' },
      { id: 's1-3', order: 3, text: 'The sun shines on the little plant.', emoji: '☀️' },
      { id: 's1-4', order: 4, text: 'A big sunflower blooms!', emoji: '🌻' },
    ],
  },
  {
    id: '2',
    title: 'The Hungry Cat',
    scenes: [
      { id: 's2-1', order: 1, text: 'The cat sees a fish on the table.', emoji: '🐱' },
      { id: 's2-2', order: 2, text: 'The cat jumps up to the table.', emoji: '⬆️' },
      { id: 's2-3', order: 3, text: 'The cat eats the tasty fish.', emoji: '🐟' },
      { id: 's2-4', order: 4, text: 'The cat is happy and full.', emoji: '😺' },
    ],
  },
  {
    id: '3',
    title: 'Building a Snowman',
    scenes: [
      { id: 's3-1', order: 1, text: 'The boy rolls a small snowball.', emoji: '⛄' },
      { id: 's3-2', order: 2, text: 'The snowball gets bigger and bigger.', emoji: '⚪' },
      { id: 's3-3', order: 3, text: 'He stacks three snowballs up.', emoji: '🏔️' },
      { id: 's3-4', order: 4, text: 'The snowman has a carrot nose!', emoji: '🥕' },
    ],
  },
];

export default function StorySequencingGame() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { playCorrect, playWrong, playWin } = useGameSounds();
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [sceneOrder, setSceneOrder] = useState<string[]>([]);
  const [placedScenes, setPlacedScenes] = useState<(StoryScene | null)[]>([]);
  const [availableScenes, setAvailableScenes] = useState<StoryScene[]>([]);
  const [draggedScene, setDraggedScene] = useState<StoryScene | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [startTime] = useState(Date.now());
  
  const currentStory = STORIES[currentStoryIndex];
  const progress = ((currentStoryIndex) / STORIES.length) * 100;
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    initializeStory();
  }, [user, router, currentStoryIndex]);
  
  const initializeStory = () => {
    const shuffled = [...currentStory.scenes].sort(() => Math.random() - 0.5);
    setAvailableScenes(shuffled);
    setPlacedScenes(new Array(currentStory.scenes.length).fill(null));
    setSceneOrder([]);
    setShowFeedback(false);
  };
  
  const handleDragStart = (scene: StoryScene) => {
    setDraggedScene(scene);
  };
  
  const handleDragEnd = () => {
    setDraggedScene(null);
  };
  
  const handleDrop = (positionIndex: number) => {
    if (!draggedScene || placedScenes[positionIndex]) return;
    
    const newPlacedScenes = [...placedScenes];
    newPlacedScenes[positionIndex] = draggedScene;
    setPlacedScenes(newPlacedScenes);
    
    setAvailableScenes(prev => prev.filter(s => s.id !== draggedScene.id));
    setSceneOrder(prev => [...prev, draggedScene.id]);
    
    setDraggedScene(null);
    
    if (newPlacedScenes.every(s => s !== null)) {
      checkAnswer(newPlacedScenes);
    }
  };
  
  const checkAnswer = (scenes: StoryScene[]) => {
    const isCorrect = scenes.every((scene, index) => 
      scene && scene.order === index + 1
    );
    
    setShowFeedback(true);
    
    if (isCorrect) {
      playCorrect();
      setScore(prev => prev + 20);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        moveToNextStory();
      }, 2000);
    } else {
      playWrong();
    }
  };
  
  const moveToNextStory = () => {
    const nextIndex = currentStoryIndex + 1;
    
    if (nextIndex >= STORIES.length) {
      setGameComplete(true);
      playWin();
    } else {
      setCurrentStoryIndex(nextIndex);
    }
  };
  
  const handleReset = () => {
    initializeStory();
  };
  
  const handleGameComplete = () => {
    router.push('/dashboard/student');
  };
  
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Story Master!</h2>
            <p className="text-[#5A4A42]/70 mb-6">You sequenced all the stories!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#B8E0D2]/20 p-3 rounded-xl">
                <span>Score</span>
                <span className="font-bold text-[#FF6B6B]">{score} points</span>
              </div>
              <div className="flex justify-between bg-[#FFB5BA]/20 p-3 rounded-xl">
                <span>Stories</span>
                <span className="font-bold">{STORIES.length}</span>
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
      <div className="absolute top-20 right-20 text-5xl animate-bounce">📖</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse">🧩</div>
      <div className="absolute top-40 left-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>📚</div>
      
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
              Story {currentStoryIndex + 1} of {STORIES.length}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <Progress value={progress} className="h-3 bg-[#B8E0D2]/20" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5A4A42] mb-2">Story Sequencing</h1>
          <p className="text-[#5A4A42]/70">Put the story in the right order!</p>
        </div>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#FF6B6B]/10 px-6 py-3 rounded-full">
            <BookOpen className="h-6 w-6 text-[#FF6B6B]" />
            <span className="text-[#5A4A42] font-bold text-lg">{currentStory.title}</span>
          </div>
        </div>
        
        <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90 mb-8">
          <CardContent className="p-8">
            <div className="mb-8">
              <p className="text-center text-[#5A4A42] mb-4 font-medium">
                Drag the scenes to put them in order (First → Last)
              </p>
              
              <div className="flex justify-center gap-4 mb-6">
                {placedScenes.map((scene, index) => (
                  <div
                    key={index}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    className={`
                      w-40 h-48 rounded-2xl border-4 flex flex-col items-center justify-center p-4 text-center
                      transition-all duration-300
                      ${scene
                        ? showFeedback
                          ? scene.order === index + 1
                            ? 'bg-[#B8E0D2] border-[#B8E0D2]'
                            : 'bg-[#FF6B6B]/20 border-[#FF6B6B]'
                          : 'bg-[#B8E0D2]/20 border-[#B8E0D2]'
                        : 'bg-white border-dashed border-[#B8E0D2]/30'
                      }
                    `}
                  >
                    {scene ? (
                      <>
                        <div className="text-5xl mb-2">{scene.emoji}</div>
                        <p className="text-sm text-[#5A4A42] font-medium">{scene.text}</p>
                        <div className="mt-2 text-xs font-bold text-[#5A4A42]/50">
                          {index + 1 === 1 ? 'First' : index + 1 === placedScenes.length ? 'Last' : `Then`}
                        </div>
                      </>
                    ) : (
                      <span className="text-4xl text-[#B8E0D2]/30">{index + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {availableScenes.length > 0 && (
              <div>
                <p className="text-center text-[#5A4A42] mb-4 font-medium">
                  Scenes to place:
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {availableScenes.map((scene) => (
                    <div
                      key={scene.id}
                      draggable
                      onDragStart={() => handleDragStart(scene)}
                      onDragEnd={handleDragEnd}
                      className={`
                        w-36 h-40 rounded-xl border-3 flex flex-col items-center justify-center p-3 text-center cursor-grab active:cursor-grabbing
                        transition-all duration-200 shadow-md bg-white border-[#FFB5BA]
                        ${draggedScene?.id === scene.id ? 'scale-110 shadow-xl opacity-50' : 'hover:scale-105'}
                      `}
                    >
                      <div className="text-4xl mb-2">{scene.emoji}</div>
                      <p className="text-xs text-[#5A4A42]">{scene.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showFeedback && (
              <div className="text-center mt-6">
                {placedScenes.every((scene, index) => scene?.order === index + 1) ? (
                  <div className="text-[#B8E0D2] text-2xl font-bold animate-bounce">
                    <CheckCircle className="inline h-8 w-8 mr-2" />
                    Perfect! Great sequencing!
                  </div>
                ) : (
                  <div className="text-[#FF6B6B] text-xl">
                    Not quite right. Think about what happens first, next, and last.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-full border-2 border-[#FFE4A1]/50 hover:bg-[#FFE4A1]/10 px-6"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
      
      {showCelebration && (
        <>
          <ConfettiExplosion active={true} />
          <StarBurst active={true} x={50} y={50} />
          <CelebrationMessage message="Great sequencing!" active={true} />
        </>
      )}
    </div>
  );
}
