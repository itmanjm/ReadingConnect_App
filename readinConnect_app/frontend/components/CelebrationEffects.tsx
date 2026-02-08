'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  rotation: number
  scale: number
}

const colors = ['#FF6B6B', '#B8E0D2', '#FFE5B4', '#FFB5BA', '#4ECDC4', '#FFE66D']

export function ConfettiExplosion({ 
  active, 
  onComplete 
}: { 
  active: boolean
  onComplete?: () => void 
}) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }))
      setPieces(newPieces)
      
      setTimeout(() => {
        setPieces([])
        onComplete?.()
      }, 3000)
    }
  }, [active, onComplete])

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            y: -20, 
            x: `${piece.x}%`,
            rotate: 0,
            scale: 0 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            rotate: piece.rotation + 720,
            scale: piece.scale 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 2 + Math.random() * 1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{
            position: 'fixed',
            left: 0,
            width: 12,
            height: 12,
            backgroundColor: piece.color,
            borderRadius: '2px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      ))}
    </AnimatePresence>
  )
}

export function StarBurst({ active, x, y }: { active: boolean; x: number; y: number }) {
  const [stars, setStars] = useState<{ id: number; angle: number }[]>([])

  useEffect(() => {
    if (active) {
      setStars(Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i * 45) * (Math.PI / 180)
      })))
      setTimeout(() => setStars([]), 800)
    }
  }, [active])

  return (
    <AnimatePresence>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ 
            scale: 0, 
            x, 
            y,
            opacity: 1 
          }}
          animate={{ 
            scale: [0, 1.5, 0],
            x: x + Math.cos(star.angle) * 60,
            y: y + Math.sin(star.angle) * 60,
            opacity: [1, 1, 0]
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed text-2xl z-50 pointer-events-none"
          style={{ left: 0, top: 0 }}
        >
          ⭐
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

export function FloatingEmoji({ 
  emoji, 
  x, 
  y,
  delay = 0 
}: { 
  emoji: string
  x: number
  y: number
  delay?: number
}) {
  return (
    <motion.div
      initial={{ scale: 0, x, y, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 1],
        y: y - 50,
        opacity: [0, 1, 0]
      }}
      transition={{ 
        duration: 1.5,
        delay,
        ease: "easeOut"
      }}
      className="fixed text-4xl z-50 pointer-events-none"
      style={{ left: 0, top: 0 }}
    >
      {emoji}
    </motion.div>
  )
}

export function CelebrationMessage({ 
  message, 
  active,
  onComplete 
}: { 
  message: string
  active: boolean
  onComplete?: () => void
}) {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] text-white text-4xl font-black px-8 py-4 rounded-3xl shadow-2xl animate-bounce">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
