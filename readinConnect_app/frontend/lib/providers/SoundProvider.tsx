'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

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

interface SoundContextType {
  isMuted: boolean
  toggleMute: () => void
  playCorrect: () => void
  playWrong: () => void
  playStreak: (streakCount: number) => void
  playClick: () => void
  playStart: () => void
  playWin: () => void
  playLevelUp: () => void
  playHover: () => void
  playNavigate: () => void
}

const SoundContext = createContext<SoundContextType | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (isMuted) return
    
    const ctx = initAudioContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05)
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

  const playCorrect = useCallback(() => {
    if (isMuted) return
    playChord([NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5], 0.4)
  }, [isMuted, playChord])

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

  const playStreak = useCallback((streakCount: number) => {
    if (isMuted) return
    const notes = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5]
    const duration = Math.min(0.1 + streakCount * 0.05, 0.3)
    
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, duration), index * 80)
    })
  }, [isMuted, playTone])

  const playClick = useCallback(() => {
    if (isMuted) return
    playTone(NOTES.G4, 0.1, 'triangle', 0.2)
  }, [isMuted, playTone])

  const playHover = useCallback(() => {
    if (isMuted) return
    playTone(NOTES.C5, 0.08, 'sine', 0.08)
  }, [isMuted, playTone])

  const playNavigate = useCallback(() => {
    if (isMuted) return
    playTone(NOTES.E4, 0.15, 'sine', 0.15)
    setTimeout(() => playTone(NOTES.G4, 0.15, 'sine', 0.15), 100)
  }, [isMuted, playTone])

  const playStart = useCallback(() => {
    if (isMuted) return
    playChord([NOTES.C4, NOTES.E4, NOTES.G4], 0.2)
    setTimeout(() => playChord([NOTES.D4, NOTES.F4, NOTES.A4], 0.2), 150)
    setTimeout(() => playChord([NOTES.E4, NOTES.G4, NOTES.C5], 0.4), 300)
  }, [isMuted, playChord])

  const playWin = useCallback(() => {
    if (isMuted) return
    const notes = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C5]
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 0.3), index * 120)
    })
  }, [isMuted, playTone])

  const playLevelUp = useCallback(() => {
    if (isMuted) return
    const ctx = initAudioContext()
    if (!ctx) return

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

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playCorrect,
        playWrong,
        playStreak,
        playClick,
        playHover,
        playNavigate,
        playStart,
        playWin,
        playLevelUp,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
