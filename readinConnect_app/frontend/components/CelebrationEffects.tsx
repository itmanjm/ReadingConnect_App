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

// Achievement Celebration Components
interface AchievementCelebrationProps {
  achievement: {
    icon: string
    title: string
    description: string
    points?: number
  } | null
  show: boolean
  onDismiss: () => void
}

export function AchievementCelebration({ achievement, show, onDismiss }: AchievementCelebrationProps) {
  const [animation, setAnimation] = useState<'idle' | 'entering' | 'celebrating' | 'exiting'>('idle')

  useEffect(() => {
    if (show && achievement) {
      setAnimation('entering')
      
      const enterTimer = setTimeout(() => {
        setAnimation('celebrating')
      }, 300)

      const dismissTimer = setTimeout(() => {
        setAnimation('exiting')
        setTimeout(() => {
          onDismiss()
        }, 500)
      }, 4000)

      return () => {
        clearTimeout(enterTimer)
        clearTimeout(dismissTimer)
      }
    }
  }, [show, achievement, onDismiss])

  if (!show || !achievement) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        opacity: animation === 'idle' ? 0 : animation === 'exiting' ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />
      
      <div 
        className={`
          relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden
          transform transition-all duration-500
          ${animation === 'entering' ? 'scale-50 opacity-0' : ''}
          ${animation === 'celebrating' ? 'scale-100 opacity-100' : ''}
          ${animation === 'exiting' ? 'scale-110 opacity-0' : ''}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFB5BA]/20 via-[#FFE5B4]/20 to-[#B8E0D2]/20" />
        
        <div className="relative p-8 text-center">
          <div className={`
              text-8xl mb-4 animate-bounce
              ${animation === 'celebrating' ? 'animate-pulse' : ''}
            `}
            style={{ 
              animationDuration: animation === 'celebrating' ? '0.5s' : '1s'
            }}
          >
            {achievement.icon}
          </div>

          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-[#4ECDC4] text-white text-sm font-bold rounded-full">
              Achievement Unlocked!
            </span>
          </div>

          <h2 className="text-2xl font-black text-[#5A4A42] mb-2">
            {achievement.title}
          </h2>

          <p className="text-[#8B7355] mb-4">
            {achievement.description}
          </p>

          {achievement.points && (
            <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#5A4A42] px-4 py-2 rounded-full font-bold">
              <span className="text-xl">⭐</span>
              <span>+{achievement.points} points</span>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={onDismiss}
              className="bg-[#FF6B6B] text-white px-8 py-3 rounded-full font-bold hover:bg-[#FF5252] transition-colors flex items-center gap-2 mx-auto"
            >
              Awesome!
            </button>
          </div>
        </div>

        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD700] rounded-full opacity-20 animate-ping" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#4ECDC4] rounded-full opacity-20 animate-pulse" />
        <div className="absolute top-1/2 -right-16 w-24 h-24 bg-[#FFB5BA] rounded-full opacity-20 animate-bounce" />
      </div>
    </div>
  )
}

interface MilestoneProgressProps {
  title: string
  icon: string
  current: number
  goal: number
  description?: string
}

export function MilestoneProgress({ title, icon, current, goal, description }: MilestoneProgressProps) {
  const progress = Math.min(100, (current / goal) * 100)
  const remaining = Math.max(0, goal - current)

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-[#FFB5BA]/30">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h4 className="font-bold text-[#5A4A42]">{title}</h4>
          {description && <p className="text-xs text-[#8B7355]">{description}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#8B7355]">{current} / {goal}</span>
          <span className="text-[#FF6B6B] font-bold">{remaining} to go</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

interface AchievementCardProps {
  achievement: {
    icon: string
    title: string
    description: string
    points?: number
    unlocked?: boolean
  }
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-xl p-4 transition-all duration-300
      ${achievement.unlocked 
        ? 'bg-gradient-to-br from-[#B8E0D2]/30 to-[#4ECDC4]/30 border-2 border-[#4ECDC4]' 
        : 'bg-gray-100 border-2 border-gray-300 opacity-60'
      }
    `}>
      <div className="flex items-center gap-4">
        <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center text-3xl
          ${achievement.unlocked ? 'bg-white shadow-lg' : 'bg-gray-200'}
        `}>
          {achievement.unlocked ? achievement.icon : '🔒'}
        </div>
        
        <div className="flex-1">
          <h4 className={`font-bold ${achievement.unlocked ? 'text-[#5A4A42]' : 'text-gray-400'}`}>
            {achievement.unlocked ? achievement.title : 'Locked'}
          </h4>
          <p className={`text-sm ${achievement.unlocked ? 'text-[#8B7355]' : 'text-gray-400'}`}>
            {achievement.unlocked ? achievement.description : 'Keep practicing to unlock!'}
          </p>
          {achievement.unlocked && achievement.points && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#FFD700] text-[#5A4A42] text-xs font-bold rounded-full">
              +{achievement.points} pts
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
