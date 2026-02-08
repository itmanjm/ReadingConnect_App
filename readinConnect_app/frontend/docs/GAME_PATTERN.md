# Game Pattern Documentation

This document defines the standard structure and patterns for all learning games in ReadinConnect. All games should follow these conventions to ensure consistency across the platform.

---

## Table of Contents

1. [Standard Imports](#standard-imports)
2. [Color Palette](#color-palette)
3. [Page Structure](#page-structure)
4. [Sound Integration](#sound-integration)
5. [Navigation & Mute Button](#navigation--mute-button)
6. [Feedback States](#feedback-states)
7. [Game States](#game-states)
8. [Example Implementation](#example-implementation)

---

## Standard Imports

Every game page must import the following:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'
```

### Optional Imports (Game-Specific)

```typescript
import { Check, X, Trophy, Star, Clock, Target } from 'lucide-react'
```

---

## Color Palette

All games must use this consistent pastel color palette:

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Background** | `#FFF8F0` | Page background (warm cream) |
| **Primary** | `#FF6B6B` | Primary actions, highlights (coral) |
| **Secondary** | `#B8E0D2` | Secondary actions, success states (mint) |
| **Accent** | `#FFB5BA` | Accent elements, gradients (peach) |
| **Text** | `#5A4A42` | Primary text color (warm brown) |

### CSS Classes for Common Elements

```typescript
// Page background
<div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">

// Main card
<Card className="max-w-4xl mx-auto rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">

// Primary button (gradient)
className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-12 text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"

// Secondary button (outline)
className="rounded-full border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/20 transition-all"

// Success feedback
className="bg-[#B8E0D2]/30 border-[#B8E0D2]"

// Error feedback
className="bg-[#FFB5BA]/30 border-[#FFB5BA]"
```

---

## Page Structure

### 1. Background with Floating Bubbles

```tsx
<div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
  {/* Floating bubbles background */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute w-32 h-32 bg-[#FFB5BA] rounded-full opacity-20 -top-10 -left-10 animate-pulse" />
    <div className="absolute w-24 h-24 bg-[#B8E0D2] rounded-full opacity-30 top-40 right-10 animate-bounce" style={{ animationDuration: '3s' }} />
    <div className="absolute w-40 h-40 bg-[#FF6B6B] rounded-full opacity-10 bottom-20 left-20" />
    <div className="absolute w-20 h-20 bg-[#B8E0D2] rounded-full opacity-25 top-1/3 left-1/4 animate-pulse" style={{ animationDuration: '2s' }} />
    <div className="absolute w-28 h-28 bg-[#FFB5BA] rounded-full opacity-20 bottom-40 right-1/4 animate-bounce" style={{ animationDuration: '4s' }} />
  </div>
  
  {/* Navigation */}
  {/* Main content */}
</div>
```

### 2. Navigation Bar

```tsx
<nav className="bg-white/80 backdrop-blur-sm border-b-2 border-[#FF6B6B]/20 sticky top-0 z-10">
  <div className="container mx-auto px-4 py-4 flex justify-between items-center">
    {/* Back button */}
    <Button 
      variant="outline" 
      onClick={endGame}
      className="rounded-full border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B] transition-all"
    >
      <ArrowLeft className="h-4 w-4 mr-2 text-[#FF6B6B]" />
      <span className="text-[#5A4A42]">Back to Dashboard</span>
    </Button>

    {/* Right side: Mute button + Score */}
    <div className="flex items-center gap-4">
      {/* Mute button */}
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

      {/* Score display */}
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-[#FF6B6B]/30">
        <span className="text-2xl">⭐</span>
        <span className="text-xl font-bold text-[#5A4A42]">{score}</span>
      </div>
    </div>
  </div>
</nav>
```

### 3. Main Content Area

```tsx
<main className="container mx-auto py-8 px-4 relative z-0">
  <Card className="max-w-4xl mx-auto rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
    <CardHeader className="pb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Icon badge */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFB5BA] to-[#FF6B6B] flex items-center justify-center shadow-lg">
            <span className="text-2xl">🎮</span>
          </div>
          <CardTitle className="text-3xl font-bold text-[#5A4A42]">Game Title</CardTitle>
        </div>
        {/* Optional: New Game / Reset buttons */}
      </div>
    </CardHeader>

    <CardContent className="space-y-8">
      {/* Game content goes here */}
    </CardContent>
  </Card>
</main>
```

---

## Sound Integration

### Hook Setup

```typescript
const { 
  isMuted, 
  toggleMute, 
  playCorrect, 
  playWrong, 
  playStreak, 
  playClick, 
  playStart, 
  playWin 
} = useGameSounds()
```

### Sound Triggers

| Event | Sound Function | Notes |
|-------|---------------|-------|
| **Page load / Game init** | `playStart()` | When game first loads |
| **Button click** | `playClick()` | All button interactions |
| **Correct answer** | `playCorrect()` | When user gets answer right |
| **Wrong answer** | `playWrong()` | When user gets answer wrong |
| **Streak milestone** | `playStreak(count)` | After 3+ correct in a row |
| **Game complete** | `playWin()` | When game ends successfully |
| **Mute toggle** | `playClick()` | When toggling sound on/off |

### Example Usage

```typescript
const handleAnswer = (answer: string) => {
  if (answer === correctAnswer) {
    playCorrect()
    setScore(prev => prev + 1)
    
    // Check for streak
    const newStreak = streak + 1
    setStreak(newStreak)
    if (newStreak >= 3) {
      playStreak(newStreak)
    }
  } else {
    playWrong()
    setStreak(0)
  }
}

const handleButtonClick = () => {
  playClick()
  // ... button logic
}
```

---

## Navigation & Mute Button

### End Game Handler

```typescript
const endGame = () => {
  playClick()
  if (timerRunning) {
    stopTimer() // or any cleanup
  }
  router.push('/dashboard/student')
}
```

### Mute Toggle Handler

```typescript
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
```

---

## Feedback States

### Correct Answer Feedback

```tsx
{showFeedback && feedbackCorrect && (
  <div className="text-center p-8 rounded-2xl border-4 bg-[#B8E0D2]/30 border-[#B8E0D2] animate-in fade-in zoom-in duration-300">
    <Check className="h-20 w-20 text-[#B8E0D2] mx-auto mb-4" strokeWidth={3} />
    <p className="text-3xl font-bold text-[#5A4A42]">Great job! 🌟</p>
  </div>
)}
```

### Wrong Answer Feedback

```tsx
{showFeedback && !feedbackCorrect && (
  <div className="text-center p-8 rounded-2xl border-4 bg-[#FFB5BA]/30 border-[#FFB5BA] animate-in fade-in zoom-in duration-300">
    <X className="h-20 w-20 text-[#FF6B6B] mx-auto mb-4" strokeWidth={3} />
    <p className="text-3xl font-bold text-[#5A4A42]">Keep trying! 💪</p>
  </div>
)}
```

### Game Complete / Win State

```tsx
{gameComplete && (
  <div className="text-center space-y-6 py-8">
    <div className="text-7xl mb-4">🎉</div>
    <div className="text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] bg-clip-text text-transparent">
      You Won!
    </div>
    <Button
      onClick={resetGame}
      className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-12 text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
    >
      Play Again
    </Button>
  </div>
)}
```

---

## Game States

### Standard State Variables

```typescript
const [gameActive, setGameActive] = useState(false)
const [showFeedback, setShowFeedback] = useState(false)
const [feedbackCorrect, setFeedbackCorrect] = useState(false)
const [score, setScore] = useState(0)
const [streak, setStreak] = useState(0)
```

### State Flow

1. **Initialize**: `playStart()`, set `gameActive = true`
2. **User Action**: Play `playClick()`, process input
3. **Check Answer**: 
   - Correct: `playCorrect()`, show success feedback, update streak
   - Wrong: `playWrong()`, show error feedback, reset streak
4. **Next Question**: Auto-advance after delay, or user clicks next
5. **Complete**: `playWin()`, show completion screen

---

## Example Implementation

Here's a minimal example of a new game following all patterns:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Volume2, VolumeX, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'

const QUESTIONS = [
  { question: 'What is 2+2?', answer: '4', options: ['3', '4', '5', '6'] },
  // ... more questions
]

export default function NewGame() {
  const router = useRouter()
  const { isMuted, toggleMute, playCorrect, playWrong, playClick, playStart, playWin } = useGameSounds()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameActive, setGameActive] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)

  const currentQuestion = QUESTIONS[currentIndex]

  useEffect(() => {
    playStart()
  }, [playStart])

  const submitAnswer = useCallback((answer: string) => {
    if (showFeedback) return

    const isCorrect = answer === currentQuestion.answer
    setFeedbackCorrect(isCorrect)
    setShowFeedback(true)

    if (isCorrect) {
      playCorrect()
      setScore(prev => prev + 1)
    } else {
      playWrong()
    }

    setTimeout(() => {
      setShowFeedback(false)
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        playWin()
        setGameActive(false)
      }
    }, 1500)
  }, [showFeedback, currentQuestion, currentIndex, playCorrect, playWrong, playWin])

  const endGame = () => {
    playClick()
    router.push('/dashboard/student')
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      {/* Background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 bg-[#FFB5BA] rounded-full opacity-20 -top-10 -left-10 animate-pulse" />
        <div className="absolute w-24 h-24 bg-[#B8E0D2] rounded-full opacity-30 top-40 right-10 animate-bounce" style={{ animationDuration: '3s' }} />
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
              {isMuted ? <VolumeX className="h-5 w-5 text-[#5A4A42]" /> : <Volume2 className="h-5 w-5 text-[#5A4A42]" />}
            </button>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-[#FF6B6B]/30">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-[#5A4A42]">{score}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4 relative z-0">
        <Card className="max-w-4xl mx-auto rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFB5BA] to-[#FF6B6B] flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎮</span>
              </div>
              <CardTitle className="text-3xl font-bold text-[#5A4A42]">New Game</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {showFeedback ? (
              <div className={`text-center p-8 rounded-2xl border-4 ${feedbackCorrect ? 'bg-[#B8E0D2]/30 border-[#B8E0D2]' : 'bg-[#FFB5BA]/30 border-[#FFB5BA]'} animate-in fade-in zoom-in duration-300`}>
                {feedbackCorrect ? (
                  <Check className="h-20 w-20 text-[#B8E0D2] mx-auto mb-4" strokeWidth={3} />
                ) : (
                  <X className="h-20 w-20 text-[#FF6B6B] mx-auto mb-4" strokeWidth={3} />
                )}
                <p className="text-3xl font-bold text-[#5A4A42]">
                  {feedbackCorrect ? 'Correct! 🌟' : 'Try again! 💪'}
                </p>
              </div>
            ) : gameActive ? (
              <div className="space-y-6">
                <p className="text-2xl text-center font-bold text-[#5A4A42]">{currentQuestion.question}</p>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map(option => (
                    <button
                      key={option}
                      onClick={() => submitAnswer(option)}
                      className="p-6 text-xl font-bold rounded-2xl bg-white border-2 border-[#FFB5BA]/20 hover:border-[#FFB5BA] hover:bg-[#FFB5BA]/5 transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="text-7xl mb-4">🎉</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] bg-clip-text text-transparent">
                  Game Complete!
                </div>
                <p className="text-2xl text-[#5A4A42]">Final Score: {score}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

---

## Quick Reference

### Button Styles

| Type | Style |
|------|-------|
| **Primary Action** | `bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-12 text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105` |
| **Secondary Action** | `rounded-full border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/20 transition-all` |
| **Navigation Back** | `rounded-full border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B] transition-all` |
| **Game Option** | `p-6 text-xl font-bold rounded-2xl bg-white border-2 border-[#FFB5BA]/20 hover:border-[#FFB5BA] hover:bg-[#FFB5BA]/5 transition-all transform hover:scale-[1.02]` |

### Feedback Colors

| State | Background | Border |
|-------|-----------|--------|
| **Success** | `bg-[#B8E0D2]/30` | `border-[#B8E0D2]` |
| **Error** | `bg-[#FFB5BA]/30` | `border-[#FFB5BA]` |
| **Neutral** | `bg-white` | `border-[#FFB5BA]/20` |

### Icon Badges

| Gradient | Usage |
|----------|-------|
| `from-[#FFB5BA] to-[#FF6B6B]` | Primary games, action games |
| `from-[#B8E0D2] to-[#A8D5C7]` | Success-focused games, reading games |
| `from-[#B8E0D2] to-[#FF6B6B]` | Mixed/Quiz games |

---

## File Structure

New games should be placed in:

```
readinConnect_app/frontend/app/activities/{game-name}/page.tsx
```

Shared components:

```
readinConnect_app/frontend/components/GameWrapper.tsx
readinConnect_app/frontend/lib/hooks/useGameSounds.ts
```

---

## Testing Checklist

Before submitting a new game, verify:

- [ ] All buttons have `playClick()` sound
- [ ] Correct/incorrect feedback plays appropriate sounds
- [ ] Game completion plays `playWin()`
- [ ] Mute button toggles sound on/off
- [ ] Background has floating bubbles
- [ ] Colors match the palette
- [ ] Back button returns to dashboard
- [ ] Score display uses star emoji
- [ ] All cards have `rounded-3xl` class
- [ ] Buttons have hover scale effects
- [ ] Feedback uses correct colors (mint/peach)
