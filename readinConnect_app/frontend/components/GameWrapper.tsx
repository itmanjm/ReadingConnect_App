'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameSounds } from '@/lib/hooks/useGameSounds'

interface GameWrapperProps {
  children: ReactNode
  title: string
  icon: string
  score?: number
  scoreLabel?: string
  scoreIcon?: ReactNode
  showNewGame?: boolean
  onNewGame?: () => void
  showReset?: boolean
  onReset?: () => void
  headerGradient?: 'coral' | 'mint' | 'peach' | 'mixed'
}

const gradients = {
  coral: 'from-[#FF6B6B] to-[#FFB5BA]',
  mint: 'from-[#B8E0D2] to-[#A8D5C7]',
  peach: 'from-[#FFB5BA] to-[#FF6B6B]',
  mixed: 'from-[#B8E0D2] to-[#FF6B6B]'
}

export function GameWrapper({
  children,
  title,
  icon,
  score,
  scoreLabel = 'Score',
  scoreIcon,
  showNewGame = false,
  onNewGame,
  showReset = false,
  onReset,
  headerGradient = 'coral'
}: GameWrapperProps) {
  const router = useRouter()
  const { isMuted, toggleMute, playClick } = useGameSounds()

  const handleBack = () => {
    playClick()
    router.push('/dashboard/student')
  }

  const handleMuteToggle = () => {
    playClick()
    toggleMute()
  }

  const handleNewGame = () => {
    playClick()
    onNewGame?.()
  }

  const handleReset = () => {
    playClick()
    onReset?.()
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 bg-[#FFB5BA] rounded-full opacity-20 -top-10 -left-10 animate-pulse" />
        <div className="absolute w-24 h-24 bg-[#B8E0D2] rounded-full opacity-30 top-40 right-10 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute w-40 h-40 bg-[#FF6B6B] rounded-full opacity-10 bottom-20 left-20" />
        <div className="absolute w-20 h-20 bg-[#B8E0D2] rounded-full opacity-25 top-1/3 left-1/4 animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute w-28 h-28 bg-[#FFB5BA] rounded-full opacity-20 bottom-40 right-1/4 animate-bounce" style={{ animationDuration: '4s' }} />
      </div>

      <nav className="bg-white/80 backdrop-blur-sm border-b-2 border-[#FF6B6B]/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="rounded-full border-2 border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B] transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-[#FF6B6B]" />
            <span className="text-[#5A4A42]">Back to Dashboard</span>
          </Button>

          <div className="flex items-center gap-4">
            <button
              onClick={handleMuteToggle}
              className="w-10 h-10 rounded-full bg-white shadow-md border-2 border-[#B8E0D2] flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-[#5A4A42]" />
              ) : (
                <Volume2 className="h-5 w-5 text-[#5A4A42]" />
              )}
            </button>

            {score !== undefined && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-[#FF6B6B]/30">
                {scoreIcon || <span className="text-2xl">⭐</span>}
                <span className="text-xl font-bold text-[#5A4A42]">{score}</span>
                {scoreLabel && <span className="text-sm text-[#5A4A42]/60 hidden sm:inline">{scoreLabel}</span>}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4 relative z-0">
        <Card className="max-w-4xl mx-auto rounded-3xl shadow-xl border-4 border-white bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[headerGradient]} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{icon}</span>
                </div>
                <CardTitle className="text-3xl font-bold text-[#5A4A42]">{title}</CardTitle>
              </div>
              <div className="flex gap-2">
                {showReset && (
                  <Button 
                    onClick={handleReset} 
                    variant="outline"
                    className="rounded-full border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/20 transition-all"
                  >
                    <span className="text-[#5A4A42]">Reset</span>
                  </Button>
                )}
                {showNewGame && (
                  <Button 
                    onClick={handleNewGame} 
                    variant="outline"
                    className="rounded-full border-2 border-[#B8E0D2] hover:bg-[#B8E0D2]/20 transition-all"
                  >
                    <span className="text-[#5A4A42]">New Game</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
