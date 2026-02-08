'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Gift, Trophy, Lock, Unlock, ArrowLeft, Sparkles, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useSound } from '@/lib/providers/SoundProvider'
import { ConfettiExplosion, CelebrationMessage } from '@/components/CelebrationEffects'

interface Reward {
  id: string
  name: string
  description: string
  icon: string
  cost: number
  category: 'extra_play' | 'customization' | 'certificate' | 'digital'
  available: boolean
}

const REWARDS: Reward[] = [
  {
    id: 'extra-game-time',
    name: 'Extra Play Time',
    description: 'Unlock bonus activities for the day',
    icon: '🎮',
    cost: 50,
    category: 'extra_play',
    available: true,
  },
  {
    id: 'custom-avatar',
    name: 'Custom Avatar',
    description: 'Choose a special avatar for your profile',
    icon: '👤',
    cost: 100,
    category: 'customization',
    available: true,
  },
  {
    id: 'story-unlock',
    name: 'Bonus Story',
    description: 'Unlock an exclusive story to read',
    icon: '📖',
    cost: 75,
    category: 'extra_play',
    available: true,
  },
  {
    id: 'achievement-cert',
    name: 'Achievement Certificate',
    description: 'Print a certificate for your progress',
    icon: '🏅',
    cost: 150,
    category: 'certificate',
    available: true,
  },
  {
    id: 'rainbow-theme',
    name: 'Rainbow Theme',
    description: 'Unlock colorful app theme',
    icon: '🌈',
    cost: 200,
    category: 'customization',
    available: false,
  },
  {
    id: 'parent-report',
    name: 'Parent Report',
    description: 'Generate progress report for parents',
    icon: '📊',
    cost: 25,
    category: 'certificate',
    available: true,
  },
  {
    id: 'virtual-sticker',
    name: 'Virtual Sticker',
    description: 'Collect a digital sticker for your collection',
    icon: '⭐',
    cost: 30,
    category: 'digital',
    available: true,
  },
  {
    id: 'special-badge-slot',
    name: 'Badge Display',
    description: 'Show off your favorite badge on profile',
    icon: '🏷️',
    cost: 80,
    category: 'customization',
    available: true,
  },
  {
    id: 'classroom-wall',
    name: 'Classroom Wall',
    description: 'Have your work featured on classroom display',
    icon: '🏛️',
    cost: 300,
    category: 'certificate',
    available: false,
  },
]

export default function RewardsPage() {
  const { isMuted, toggleMute, playClick, playHover, playWin, playLevelUp } = useSound()
  const [userPoints, setUserPoints] = useState<number>(65)
  const [claimedRewards, setClaimedRewards] = useState<Set<string>>(new Set())
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebrationMsg, setShowCelebrationMsg] = useState(false)

  const handleClaim = (reward: Reward) => {
    if (userPoints >= reward.cost && reward.available) {
      playWin()
      setUserPoints((prev) => prev - reward.cost)
      setClaimedRewards((prev) => new Set(prev).add(reward.id))
      setSelectedReward(reward)
      setShowConfetti(true)
      setShowCelebrationMsg(true)
      setTimeout(() => {
        setShowConfetti(false)
        setShowCelebrationMsg(false)
      }, 3000)
    }
  }

  const categoryColor = (category: Reward['category']) => {
    switch (category) {
      case 'extra_play':
        return 'bg-[#B8E0D2] text-[#2D6A4F] border-[#98D0C0]'
      case 'customization':
        return 'bg-[#FFB5BA] text-[#8B4557] border-[#FF9AA2]'
      case 'certificate':
        return 'bg-[#FFE5B4] text-[#8B6914] border-[#FFD966]'
      case 'digital':
        return 'bg-[#98D0C0] text-[#2D6A4F] border-[#78C0A8]'
    }
  }

  const getCategoryIcon = (category: Reward['category']) => {
    switch (category) {
      case 'extra_play':
        return '🎮'
      case 'customization':
        return '🎨'
      case 'certificate':
        return '📜'
      case 'digital':
        return '✨'
    }
  }

  const availableRewards = REWARDS.filter(r => r.available)
  const lockedRewards = REWARDS.filter(r => !r.available)
  const claimed = availableRewards.filter(r => claimedRewards.has(r.id))

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative overflow-hidden p-4">
      <ConfettiExplosion active={showConfetti} />
      <CelebrationMessage
        message="Reward Unlocked! 🎉"
        active={showCelebrationMsg}
        onComplete={() => setShowCelebrationMsg(false)}
      />
      
      <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '4s' }}>🎁</div>
      <div className="absolute bottom-40 left-10 text-4xl animate-pulse" style={{ animationDuration: '3s' }}>⭐</div>
      <div className="absolute top-1/3 left-20 text-4xl animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>🎉</div>
      <div className="absolute top-40 left-1/4 w-32 h-32 rounded-full bg-[#B8E0D2]/10 blur-2xl" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-[#FFB5BA]/10 blur-2xl" />

      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#B8E0D2]/20 sticky top-0 z-10 rounded-2xl mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/student" onClick={playClick}>
            <Button 
              variant="outline" 
              onMouseEnter={playHover}
              className="rounded-full border-2 border-[#B8E0D2]/30 hover:bg-[#B8E0D2]/10 hover:border-[#B8E0D2] transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              onMouseEnter={playHover}
              className="rounded-full border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white w-10 h-10 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <div className="text-2xl font-bold text-[#5A4A42] flex items-center gap-2">
              <span>🎁</span> Rewards Store
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#5A4A42] mb-2 flex items-center gap-3">
              <span className="text-5xl">🏪</span>
              Rewards Store
            </h1>
            <p className="text-xl text-[#5A4A42]/70">
              Spend your points on special rewards!
            </p>
          </div>
          <div className="text-right bg-white rounded-2xl p-4 border-4 border-[#FFE5B4] shadow-lg">
            <div className="flex items-center gap-2 justify-end">
              <div className="w-12 h-12 rounded-full bg-[#FFE5B4] flex items-center justify-center">
                <Star className="h-6 w-6 text-[#8B6914]" />
              </div>
              <div className="text-4xl font-bold text-[#5A4A42]">
                {userPoints}
              </div>
            </div>
            <p className="text-sm text-[#5A4A42]/70 mt-1">
              Points Available
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#FFE5B4]/30 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Total Earned
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#FFE5B4] flex items-center justify-center">
                <Star className="h-5 w-5 text-[#8B6914]" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-[#5A4A42] flex items-center gap-2">
                {userPoints + claimed.reduce((sum, r) => sum + r.cost, 0)}
                <span className="text-2xl">⭐</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#FFB5BA]/20 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Points Spent
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#FFB5BA] flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-[#5A4A42] flex items-center gap-2">
                {claimed.reduce((sum, r) => sum + r.cost, 0)}
                <span className="text-2xl">🎁</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#FF6B6B]/10 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Rewards Claimed
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-[#5A4A42] flex items-center gap-2">
                {claimed.length}
                <span className="text-2xl">🏆</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-4 border-white bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-[#B8E0D2]/20 to-transparent">
              <CardTitle className="text-sm font-bold text-[#5A4A42]">
                Available Rewards
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[#B8E0D2] flex items-center justify-center">
                <Unlock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-[#5A4A42] flex items-center gap-2">
                {availableRewards.length}
                <span className="text-2xl">🔓</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#5A4A42] mb-4 flex items-center gap-2">
              <span className="text-3xl">✨</span> Available Rewards
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableRewards.map((reward) => {
                const isClaimed = claimedRewards.has(reward.id)
                const canAfford = userPoints >= reward.cost

                return (
                  <Card
                    key={reward.id}
                    className={`rounded-3xl shadow-lg border-4 transition-all ${
                      isClaimed 
                        ? 'border-[#B8E0D2] bg-[#B8E0D2]/10' 
                        : 'border-white bg-white/90 backdrop-blur-sm hover:shadow-xl'
                    } ${!canAfford && !isClaimed ? 'opacity-70' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">
                          {reward.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-[#5A4A42] flex items-center gap-2">
                            {reward.name}
                            {isClaimed && (
                              <Badge className="bg-[#B8E0D2] text-[#2D6A4F] border-2 border-[#98D0C0] rounded-full">
                                <span className="mr-1">✓</span> Claimed
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge className={`mt-2 rounded-full border-2 ${categoryColor(reward.category)}`}>
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(reward.category)}
                              {reward.category.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <CardDescription className="mb-4 text-[#5A4A42]/70">
                        {reward.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-lg font-bold text-[#5A4A42]">
                          <div className="w-8 h-8 rounded-full bg-[#FFE5B4] flex items-center justify-center">
                            <Star className="h-4 w-4 text-[#8B6914]" />
                          </div>
                          {reward.cost} points
                        </div>
                        {!isClaimed && (
                          <Button
                            onClick={() => handleClaim(reward)}
                            onMouseEnter={playHover}
                            disabled={!canAfford}
                            className={`rounded-full transition-all ${
                              canAfford 
                                ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white shadow-md hover:shadow-lg' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? (
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-4 w-4" /> Claim
                              </span>
                            ) : 'Not Enough Points'}
                          </Button>
                        )}
                        {isClaimed && (
                          <Button variant="outline" disabled className="rounded-full border-2 border-[#B8E0D2] text-[#2D6A4F]">
                            <span className="mr-1">✓</span> Owned
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#5A4A42] mb-4 flex items-center gap-2">
              <span className="text-3xl">🔒</span> Coming Soon
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lockedRewards.map((reward) => (
                <Card
                  key={reward.id}
                  className="rounded-3xl shadow-md border-4 border-dashed border-[#B8E0D2]/30 bg-white/50 opacity-70"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl grayscale opacity-50">
                        {reward.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-[#5A4A42]/60 flex items-center gap-2">
                          {reward.name}
                          <Lock className="h-4 w-4" />
                        </CardTitle>
                        <Badge className="mt-2 rounded-full border-2 bg-gray-100 text-gray-500 border-gray-300">
                          {reward.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CardDescription className="mb-4 text-[#5A4A42]/50">
                      {reward.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-lg font-bold text-[#5A4A42]/50">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Star className="h-4 w-4 text-gray-400" />
                      </div>
                      {reward.cost} points
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {selectedReward && (
          <Card className="mt-8 rounded-3xl shadow-xl border-4 border-[#B8E0D2] bg-[#B8E0D2]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-[#2D6A4F] flex items-center gap-2">
                <span className="text-3xl">🎉</span> Reward Claimed!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-7xl animate-bounce">
                  {selectedReward.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#5A4A42]">
                    {selectedReward.name}
                  </h3>
                  <p className="text-lg text-[#5A4A42]/70 mt-2">
                    {selectedReward.description}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xl font-bold text-[#FF6B6B]">
                  <div className="w-10 h-10 rounded-full bg-[#FFE5B4] flex items-center justify-center">
                    <Star className="h-5 w-5 text-[#8B6914]" />
                  </div>
                  -{selectedReward.cost} points
                </div>
                <Button
                  onClick={() => { playClick(); setSelectedReward(null); }}
                  onMouseEnter={playHover}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] hover:from-[#FF5252] hover:to-[#FF9AA2] text-white rounded-full h-14 px-8 font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" /> Continue Browsing
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
