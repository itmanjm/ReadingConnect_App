'use client'

import { useCallback } from 'react'

interface Phoneme {
  symbol: string
  description: string
  frequency: number
  duration: number
}

const PHONEMES: Record<string, Phoneme> = {
  // Vowels (short vowels first, then long vowels)
  'a_short': { symbol: 'æ', description: 'Short a (as in cat)', frequency: 250, duration: 0.5 },
  'a_long': { symbol: 'eɪ', description: 'Long a (as in cake)', frequency: 293, duration: 0.5 },
  'e_short': { symbol: 'e', description: 'Short e (as in bed)', frequency: 329, duration: 0.5 },
  'e_long': { symbol: 'i', description: 'Long e (as in see)', frequency: 392, duration: 0.5 },
  'i_short': { symbol: 'ɪ', description: 'Short i (as in pig)', frequency: 261, duration: 0.5 },
  'i_long': { symbol: 'aɪ', description: 'Long i (as in pie)', frequency: 349, duration: 0.5 },
  'o_short': { symbol: 'ɑ', description: 'Short o (as in hot)', frequency: 246, duration: 0.5 },
  'o_long': { symbol: 'oʊ', description: 'Long o (as in moon)', frequency: 349, duration: 0.5 },
  'u_short': { symbol: 'ʌ', description: 'Short u (as in cup)', frequency: 230, duration: 0.5 },
  'u_long': { symbol: 'u', description: 'Long u (as in flute)', frequency: 349, duration: 0.5 },

  // Consonants - most common first
  's': { symbol: 's', description: 's sound', frequency: 300, duration: 0.3 },
  't': { symbol: 't', description: 't sound', frequency: 400, duration: 0.3 },
  'p': { symbol: 'p', description: 'p sound (unvoiced)', frequency: 500, duration: 0.3 },
  'i_consonant': { symbol: 'ɪ', description: 'i sound (consonant)', frequency: 261, duration: 0.3 },
  'n': { symbol: 'n', description: 'n sound', frequency: 350, duration: 0.3 },
  'k': { symbol: 'k', description: 'k sound (hard)', frequency: 200, duration: 0.3 },
  'e_consonant': { symbol: 'e', description: 'e sound (consonant)', frequency: 329, duration: 0.3 },
  'h': { symbol: 'h', description: 'h sound', frequency: 150, duration: 0.3 },
  'r': { symbol: 'r', description: 'r sound', frequency: 400, duration: 0.3 },
  'm': { symbol: 'm', description: 'm sound', frequency: 300, duration: 0.3 },
  'd': { symbol: 'd', description: 'd sound', frequency: 450, duration: 0.3 },
  'g': { symbol: 'ɡ', description: 'g sound (hard)', frequency: 200, duration: 0.3 },
  'o_consonant': { symbol: 'ɔ', description: 'o sound (consonant)', frequency: 246, duration: 0.3 },
  'l': { symbol: 'l', description: 'l sound', frequency: 350, duration: 0.3 },
  'f': { symbol: 'f', description: 'f sound', frequency: 500, duration: 0.3 },
  'b': { symbol: 'b', description: 'b sound (voiced)', frequency: 300, duration: 0.3 },

  // Digraphs and blends (advanced)
  'ch': { symbol: 'ʧ', description: 'ch sound', frequency: 600, duration: 0.4 },
  'sh': { symbol: 'ʃ', description: 'sh sound', frequency: 450, duration: 0.4 },
  'th_unvoiced': { symbol: 'θ', description: 'th sound (thin)', frequency: 800, duration: 0.4 },
  'th_voiced': { symbol: 'ð', description: 'th sound (this)', frequency: 600, duration: 0.4 },
  'ng': { symbol: 'ŋ', description: 'ng sound', frequency: 200, duration: 0.4 },
  'wh': { symbol: 'hw', description: 'wh sound', frequency: 400, duration: 0.4 },
}

export function usePhonemeAudio() {
  const playPhoneme = useCallback((phonemeKey: string, isMuted: boolean) => {
    if (isMuted) return

    const phoneme = PHONEMES[phonemeKey]
    if (!phoneme) {
      console.warn(`Phoneme not found: ${phonemeKey}`)
      return
    }

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContext()

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = phoneme.frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + phoneme.duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + phoneme.duration)
    } catch (error) {
      console.error('Failed to play phoneme:', error)
    }
  }, [])

  const playLetterExample = useCallback((letter: string, isMuted: boolean) => {
    if (isMuted) return

    const letterToPhonemes: Record<string, string[]> = {
      'a': ['a_short'],
      'A': ['a_long'],
      'e': ['e_short'],
      'E': ['e_long'],
      'i': ['i_short'],
      'I': ['i_long'],
      'o': ['o_short'],
      'O': ['o_long'],
      'u': ['u_short'],
      'U': ['u_long'],
      'b': ['b'],
      'c': ['k', 's'],
      'd': ['d'],
      'f': ['f'],
      'g': ['g'],
      'h': ['h'],
      'j': ['dʒ', 'ʒ'],
      'k': ['k'],
      'l': ['l'],
      'm': ['m'],
      'n': ['n'],
      'p': ['p'],
      'q': ['k', 'w'],
      'r': ['r'],
      's': ['s'],
      't': ['t'],
      'v': ['v'],
      'w': ['w'],
      'x': ['k', 's'],
      'y': ['j'],
      'z': ['z'],
    }

    const phonemes = letterToPhonemes[letter] || ['s']
    phonemes.forEach((phoneme, index) => {
      setTimeout(() => playPhoneme(phoneme, isMuted), index * 300)
    })
  }, [playPhoneme])

  const getPhonemeInfo = useCallback((phonemeKey: string) => {
    return PHONEMES[phonemeKey]
  }, [])

  return {
    playPhoneme,
    playLetterExample,
    getPhonemeInfo,
    availablePhonemes: Object.keys(PHONEMES)
  }
}
