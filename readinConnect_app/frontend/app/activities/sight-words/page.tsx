'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy, Sparkles, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'
import { ConfettiExplosion, StarBurst, CelebrationMessage } from '@/components/CelebrationEffects'
import { useProgress } from '@/lib/hooks/useProgress'

const DOLCH_WORDS = {
  prePrimer: [
    'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find',
    'for', 'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump',
    'little', 'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red',
    'run', 'said', 'see', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'
  ],
  primer: [
    'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
    'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'him', 'his', 'how', 'just', 'know', 'let',
    'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round',
    'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when', 'will', 'with', 'yes'
  ],
  firstGrade: [
    'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly', 'from',
    'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just', 'know', 'let',
    'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some', 'stop',
    'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when', 'you'
  ],
  secondGrade: [
    'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold',
    'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its',
    'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep', 'tell', 'their',
    'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which', 'why', 'wish', 'work', 'would', 'write', 'your'
  ]
}

const WORD_FAMILIES: Record<string, { family: string; pattern: string }> = {
  'at': { family: '-at', pattern: 'cat, hat, mat, bat, rat, pat, flat, brat, scat' },
  'en': { family: '-en', pattern: 'hen, pen, ten, men, den, then, when' },
  'ig': { family: '-ig', pattern: 'pig, big, dig, fig, wig, sig, rig' },
  'an': { family: '-an', pattern: 'pan, can, man, ran, tan, fan, van, plan' },
  'ot': { family: '-ot', pattern: 'hot, pot, dot, cot, lot, not, rot' },
  'ap': { family: '-ap', pattern: 'map, gap, lap, nap, tap, cap, sap, rap' },
  'et': { family: '-et', pattern: 'wet, net, get, let, met, pet, set, jet, bet' },
  'in': { family: '-in', pattern: 'pin, bin, fin, win, kin, sin, tin, sit, bit' },
  'it': { family: '-it', pattern: 'fit, hit, kit, sit, bit, pit, knit' },
  'op': { family: '-op', pattern: 'top, hop, pop, mop, cop, shop, stop, drop' },
  'ug': { family: '-ug', pattern: 'bug, mug, rug, jug, tug, hug, hug' },
  'un': { family: '-un', pattern: 'fun, run, sun, but, nut, cut, cup, hut' },
  'ut': { family: '-ut', pattern: 'cut, but, nut, shut, gut, put, hut' }
}

const LEVEL_CONFIGS = [
  {
    level: 1,
    name: 'Beginner',
    description: 'Simple words for starting readers',
    ageRange: '4-5 years',
    wordSource: 'prePrimer',
    wordsCount: 8,
    gridSize: '3x3',
    masteryThreshold: 3,
    bingoLines: 3,
    hintsEnabled: true
  },
  {
    level: 2,
    name: 'Intermediate',
    description: 'More words with patterns',
    ageRange: '5-6 years',
    wordSource: 'primer',
    wordsCount: 12,
    gridSize: '3x4',
    masteryThreshold: 3,
    bingoLines: 4,
    hintsEnabled: true
  },
  {
    level: 3,
    name: 'Advanced',
    description: 'Full sight word list',
    ageRange: '6-7 years',
    wordSource: 'firstGrade',
    wordsCount: 16,
    gridSize: '4x4',
    masteryThreshold: 4,
    bingoLines: 5,
    hintsEnabled: false
  },
  {
    level: 4,
    name: 'Expert',
    description: 'Complete Dolch list',
    ageRange: '7-8 years',
    wordSource: 'secondGrade',
    wordsCount: 20,
    gridSize: '4x5',
    masteryThreshold: 5,
    bingoLines: 5,
    hintsEnabled: false
  }
]

export default function SightWordsBingo() {
  const router = useRouter()
  const { isMuted, toggleMute, playCorrect, playWrong, playStreak, playClick, playWin } = useGameSounds()
  const { progress, updateSightWordsProgress, getAgeAppropriateSettings } = useProgress()

  const [currentLevel, setCurrentLevel] = useState(1)
  const [boardWords, setBoardWords] = useState<string[]>([])
  const [targetWord, setTargetWord] = useState('')
  const [markedCells, setMarkedCells] = useState<Set<number>>(new Set())
  const [showWord, setShowWord] = useState(false)
  const [score, setScore] = useState(0)
  const [bingos, setBingos] = useState(0)
  const [streak, setStreak] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [showBingo, setShowBingo] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStarBurst, setShowStarBurst] = useState(false)
  const [showCelebrationMsg, setShowCelebrationMsg] = useState(false)

  const settings = getAgeAppropriateSettings()
  const levelConfig = LEVEL_CONFIGS.find(c => c.level === settings.sightWordsLevel) || LEVEL_CONFIGS[0]

  const initializeBoard = useCallback(() => {
    playClick()
    const wordPool = DOLCH_WORDS[levelConfig.wordSource as keyof typeof DOLCH_WORDS]
    const shuffled = [...wordPool].sort(() => Math.random() - 0.5)
    const selectedWords = shuffled.slice(0, levelConfig.wordsCount)
    setBoardWords(selectedWords)
    const randomWord = selectedWords[Math.floor(Math.random() * selectedWords.length)]
    setTargetWord(randomWord)
    setMarkedCells(new Set())
    setShowWord(false)
    setScore(0)
    setBingos(0)
    setStreak(0)
    setGameActive(true)
    setShowFeedback(false)
    setShowBingo(false)
  }, [levelConfig, playClick])

  useEffect(() => {
    initializeBoard()
  }, [])

  const revealWord = () => {
    playClick()
    setShowWord(true)
  }

  const getWordFamily = (word: string) => {
    const wordLower = word.toLowerCase()

    for (const [suffix, info] of Object.entries(WORD_FAMILIES)) {
      if (wordLower.endsWith(suffix)) {
        return { suffix, ...info }
      }
    }

    return null
  }

  const markCell = (index: number) => {
    if (markedCells.has(index) || showFeedback || !gameActive) return

    const word = boardWords[index]
    const isCorrect = word === targetWord

    setShowFeedback(true)
    setFeedbackCorrect(isCorrect)

    if (isCorrect) {
      playCorrect()

      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > 1 && (newStreak === 3 || newStreak === 5 || newStreak === 10)) {
        playStreak(newStreak)
        setShowStarBurst(true)
        setShowCelebrationMsg(true)
        setTimeout(() => setShowStarBurst(false), 1000)
      }

      setScore((prev) => prev + 1)
      setMarkedCells((prev) => new Set(prev).add(index))

      const newMarked = new Set(markedCells).add(index)
      const gotBingo = checkBingo(newMarked)

      if (gotBingo) {
        playWin()
        setBingos((prev) => prev + 1)
        setShowBingo(true)
        setShowConfetti(true)
        setShowCelebrationMsg(true)
        setTimeout(() => {
          setShowBingo(false)
          setShowConfetti(false)
          setShowCelebrationMsg(false)
        }, 3000)
      } else {
        setTimeout(() => {
          setShowFeedback(false)
          if (newMarked.size < boardWords.length) {
            const nextWordIndex = boardWords.findIndex(w => !newMarked.has(boardWords.indexOf(w)))
            if (nextWordIndex !== -1) {
              setTargetWord(boardWords[nextWordIndex])
            }
          }
        }, 1500)
      }

      updateSightWordsProgress({
        correctAnswers: progress.sightWords.correctAnswers + 1,
        totalGamesPlayed: progress.sightWords.totalGamesPlayed + 1,
        longestStreak: Math.max(progress.sightWords.longestStreak, newStreak)
      })
    } else {
      playWrong()
      setStreak(0)

      updateSightWordsProgress({
        totalGamesPlayed: progress.sightWords.totalGamesPlayed + 1
      })

      setTimeout(() => {
        setShowFeedback(false)
      }, 1500)
    }
  }

  const checkBingo = (marked: Set<number>): boolean => {
    const size = levelConfig.gridSize === '4x5' ? 20 : levelConfig.gridSize === '4x4' ? 16 : levelConfig.gridSize === '3x4' ? 12 : 9
    const rows = levelConfig.gridSize === '4x5' ? 4 : levelConfig.gridSize === '3x4' ? 3 : 3
    const cols = size / rows

    const hasRowBingo = (): boolean => {
      for (let r = 0; r < rows; r++) {
        let allMarked = true
        for (let c = 0; c < cols; c++) {
          if (!marked.has(r * cols + c)) {
            allMarked = false
            break
          }
        }
        if (allMarked) return true
      }
      return false
    }

    const hasColBingo = (): boolean => {
      for (let c = 0; c < cols; c++) {
        let allMarked = true
        for (let r = 0; r < rows; r++) {
          if (!marked.has(r * cols + c)) {
            allMarked = false
            break
          }
        }
        if (allMarked) return true
      }
      return false
    }

    const hasDiag1Bingo = () => {
      for (let i = 0; i < Math.min(rows, cols); i++) {
        if (!marked.has(i * cols + i)) return false
      }
      return true
    }

    const hasDiag2Bingo = () => {
      for (let i = 0; i < Math.min(rows, cols); i++) {
        if (!marked.has(i * cols + (cols - 1 - i))) return false
      }
      return true
    }

    const hasBingo = hasRowBingo() || hasColBingo() || hasDiag1Bingo() || hasDiag2Bingo()

    return hasBingo
  }

  const changeLevel = (newLevel: number) => {
    playClick()
    setCurrentLevel(newLevel)
    setTimeout(() => initializeBoard(), 100)
  }

  const endGame = () => {
    playClick()
    setGameActive(false)
    router.push('/dashboard/student')
  }

  const getGridCols = () => {
    if (levelConfig.gridSize === '4x5') return 5
    if (levelConfig.gridSize === '4x4') return 4
    if (levelConfig.gridSize === '3x4') return 4
    return 3
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <ConfettiExplosion active={showConfetti} />
      <StarBurst active={showStarBurst} x={typeof window !== 'undefined' ? window.innerWidth / 2 : 400} y={200} />
      <CelebrationMessage
        message={showBingo ? `BINGO! ${bingos} Total! 🎊` : `Amazing Streak! 🔥`}
        active={showCelebrationMsg}
        onComplete={() => setShowCelebrationMsg(false)}
      />

      <nav className="bg-white/80 backdrop-blur-sm border-b-2 border-[#FF6B6B]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={endGame}
            className="rounded-full border-2 border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-[#5A4A42]">Back to Dashboard</span>
          </Button>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-white rounded-full shadow-md border-2 border-[#B8E0D2] flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-[#8B7355]" />
              ) : (
                <Volume2 className="h-5 w-5 text-[#4ECDC4]" />
              )}
            </button>

            <div className="flex items-center gap-2 bg-[#FFE5B4] px-4 py-2 rounded-full">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-[#5A4A42]">{score}</span>
            </div>

            <div className="flex items-center gap-2 bg-[#FFB5BA] px-4 py-2 rounded-full">
              <Trophy className="h-5 w-5 text-[#FFB5BA]" />
              <span className="font-bold text-[#5A4A42]">{bingos}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4 relative z-0">
        <Card className="max-w-4xl mx-auto rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#FFB5BA]/10 to-[#FFE5B4]/10 border-b border-[#FFB5BA]/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFB5BA] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-[#5A4A42]">Sight Words Bingo</CardTitle>
                  <p className="text-sm text-[#8B7355]">Level {currentLevel}: {levelConfig.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {currentLevel > 1 && (
                  <Button
                    onClick={() => changeLevel(currentLevel - 1)}
                    variant="outline"
                    className="rounded-full border-2 border-[#B8E0D2] text-[#B8E0D2] hover:bg-[#B8E0D2] hover:text-white"
                  >
                    ← Previous
                  </Button>
                )}

                {currentLevel < 4 && (
                  <Button
                    onClick={() => changeLevel(currentLevel + 1)}
                    variant="outline"
                    className="rounded-full border-2 border-[#4ECDC4] text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-white"
                  >
                    Next →
                  </Button>
                )}

                <Button
                  onClick={initializeBoard}
                  variant="outline"
                  className="rounded-full border-2 border-[#B8E0D2] text-[#B8E0D2] hover:bg-[#B8E0D2] hover:text-white"
                  >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Board
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {showBingo && (
              <div className="text-center">
                <div className="text-7xl mb-4">🎊</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] bg-clip-text text-transparent animate-bounce">
                  BINGO!
                </div>
                <p className="text-2xl text-[#8B7355] mt-4">
                  {bingos} Bingo{bingos === 1 ? '' : 's'} Total!
                </p>
                <Button
                  onClick={initializeBoard}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white text-xl px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 mt-8"
                >
                  Play Again 🎉
                </Button>
              </div>
            )}

            {showFeedback && (
              <div className={`text-center p-8 rounded-3xl ${feedbackCorrect ? 'bg-[#B8E0D2]/20 border-2 border-[#B8E0D2]' : 'bg-[#FFB5BA]/20 border-2 border-[#FFB5BA]'} animate-in fade-in zoom-in duration-300`}>
                {feedbackCorrect ? (
                  <>
                    <Check className="h-20 w-20 text-[#B8E0D2] mx-auto mb-4" strokeWidth={3} />
                    <p className="text-3xl font-bold text-[#5A4A42]">
                      Great job! 🌟
                    </p>
                    <p className="text-xl text-[#8B7355]">
                      "{targetWord}" - correct!
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-20 w-20 text-[#FFB5BA] mx-auto mb-4" />
                    <p className="text-3xl font-bold text-[#5A4A42]">
                      Not quite right
                    </p>
                    <p className="text-xl text-[#8B7355]">
                      The word was "{targetWord}"
                    </p>
                  </>
                )}
              </div>
            )}

            {!showFeedback && gameActive && (
              <div className="text-center space-y-8">
                <div className="bg-gradient-to-r from-[#FF6B6B]/5 via-[#FFE5B4]/5 to-[#B8E0D2]/5 p-8 rounded-3xl border-2 border-[#FFB5BA]/30">
                  <p className="text-xl text-[#5A4A42] mb-4">
                    Find and click: <strong>"{targetWord}"</strong>
                  </p>
                  {showWord && (
                    <p className="text-2xl text-[#FF6B6B] font-bold mt-4">
                      "{targetWord}"
                    </p>
                  )}

                  {!showWord && settings.hintsEnabled && (
                    <button
                      onClick={revealWord}
                      className="text-[#FFE5B4] hover:text-[#FF6B6B] font-bold transition-colors"
                    >
                      💡 Need a hint?
                    </button>
                  )}
                </div>

                <div className="flex justify-center gap-4 mt-4">
                  {getWordFamily(targetWord) && (
                    <div className="bg-[#B8E0D2]/10 px-4 py-2 rounded-2xl">
                      <p className="text-sm text-[#8B7355] font-semibold mb-1">
                        📚 Word Family
                      </p>
                      <p className="text-lg font-bold text-[#5A4A42]">
                        {getWordFamily(targetWord)!.family} Family
                      </p>
                      <p className="text-sm text-[#8B7355]">
                        Pattern: {getWordFamily(targetWord)!.pattern}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`grid gap-3 mx-auto`} style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
                  {boardWords.map((word, index) => {
                    const wordFamily = getWordFamily(word)
                    const isMarked = markedCells.has(index)

                    return (
                      <button
                        key={index}
                        onClick={() => markCell(index)}
                        disabled={markedCells.has(index) || showFeedback || !gameActive}
                        className={`
                          aspect-square text-xl font-bold rounded-2xl p-4
                          transition-all duration-200 transform hover:scale-110 active:scale-95
                          ${isMarked
                            ? 'bg-gradient-to-br from-[#B8E0D2] to-[#4ECDC4] border-2 border-[#4ECDC4] text-white cursor-not-allowed transform scale-95'
                            : 'bg-white border-2 border-[#FFE5B4]/50 hover:border-[#FFB5BA] hover:shadow-lg cursor-pointer'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span>{word}</span>
                          {isMarked && (
                            <Check className="h-6 w-6 text-white mt-1" strokeWidth={2} />
                          )}
                        </div>

                        {wordFamily && isMarked && (
                          <div className="absolute top-1 right-1 text-xs text-[#4ECDC4] bg-[#FFB5BA] px-2 py-1 rounded-full">
                            {wordFamily.family}
                          </div>
                        )}
                      </button>
                  )
                  })}
                </div>

                {streak > 1 && (
                  <div className="text-center mt-6">
                    <div className="inline-flex items-center gap-2 bg-[#FF6B6B] px-4 py-2 rounded-full animate-pulse">
                      <span className="text-xl">🔥</span>
                      <span className="font-bold text-white">{streak} streak!</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
