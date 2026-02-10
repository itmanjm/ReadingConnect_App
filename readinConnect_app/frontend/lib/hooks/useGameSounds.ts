'use client'

import { useState, useCallback, useRef } from 'react'

// Kid-friendly sound frequencies (pleasant major scale notes)
const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  B5: 987.77,
}

export function useGameSounds() {
  const [isMuted, setIsMuted] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (isMuted) return
    
    const ctx = initAudioContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    // Soft attack and release for kid-friendly sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }, [isMuted, initAudioContext])

  const playChord = useCallback((frequencies: number[], duration: number) => {
    if (isMuted) return
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => playTone(freq, duration), index * 50)
    })
  }, [isMuted, playTone])

  // Happy "correct" sound - ascending major triad
  const playCorrect = useCallback(() => {
    if (isMuted) return
    playChord([NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5], 0.4)
  }, [isMuted, playChord])

  // Gentle "wrong" sound - descending soft tone
  const playWrong = useCallback(() => {
    if (isMuted) return
    const ctx = initAudioContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(NOTES.A4, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(NOTES.E4, ctx.currentTime + 0.3)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }, [isMuted, initAudioContext])

  // Streak celebration sound - arpeggio
  const playStreak = useCallback((streakCount: number) => {
    if (isMuted) return
    const notes = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5]
    const duration = Math.min(0.1 + streakCount * 0.05, 0.3)
    
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, duration), index * 80)
    })
  }, [isMuted, playTone])

  // Button click sound - soft blip
  const playClick = useCallback(() => {
    if (isMuted) return
    playTone(NOTES.G4, 0.1, 'triangle')
  }, [isMuted, playTone])

  // Game start sound - cheerful fanfare
  const playStart = useCallback(() => {
    if (isMuted) return
    playChord([NOTES.C4, NOTES.E4, NOTES.G4], 0.2)
    setTimeout(() => playChord([NOTES.D4, NOTES.F4, NOTES.A4], 0.2), 150)
    setTimeout(() => playChord([NOTES.E4, NOTES.G4, NOTES.C5], 0.4), 300)
  }, [isMuted, playChord])

  // Game win/complete sound - victory fanfare
  const playWin = useCallback(() => {
    if (isMuted) return
    const ctx = initAudioContext()
    if (!ctx) return

    // Victory arpeggio
    const notes = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C5]
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 0.3), index * 120)
    })
  }, [isMuted, playTone])

  // Level up sound - magical sparkles
  const playLevelUp = useCallback(() => {
    if (isMuted) return
    const ctx = initAudioContext()
    if (!ctx) return

    // High pitched sparkly sound
    const frequencies = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.B5, NOTES.D5, NOTES.F5]
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.value = freq
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
      }, index * 60)
    })
  }, [isMuted, initAudioContext])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  return {
    isMuted,
    toggleMute,
    playCorrect,
    playWrong,
    playStreak,
    playClick,
    playStart,
    playWin,
    playLevelUp,
  }
}
