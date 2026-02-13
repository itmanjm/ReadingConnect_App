'use client'

import { useEffect, useState } from 'react'
import { useBadgeStore, Badge, EarnedBadge, getRarityColor, getRarityLabel } from '@/lib/stores/badges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, Award, Star, Trophy } from 'lucide-react'

interface BadgeCollectionProps {
  userId: string
}

export function BadgeCollection({ userId }: BadgeCollectionProps) {
  const { availableBadges, earnedBadges, loadUserBadges, loading } = useBadgeStore()
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadUserBadges(userId)
  }, [userId, loadUserBadges])

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId))
  
  const filteredBadges = activeTab === 'all' 
    ? availableBadges 
    : activeTab === 'earned'
    ? availableBadges.filter(b => earnedBadgeIds.has(b.id))
    : availableBadges.filter(b => !earnedBadgeIds.has(b.id))

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mastery': return '📚'
      case 'streak': return '🔥'
      case 'activity': return '🎮'
      case 'level': return '🏆'
      default: return '⭐'
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B6B]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white border-0 shadow-xl shadow-[#FFB5BA]/20 rounded-3xl">
      <CardHeader className="border-b border-[#FFB5BA]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD966] to-[#FEF083] rounded-2xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <CardTitle className="text-[#5A4A42] text-xl">Your Badges</CardTitle>
              <p className="text-sm text-[#8B7355]">
                {earnedBadges.length} of {availableBadges.length} earned
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#FFE5B4] px-4 py-2 rounded-full">
            <Star className="h-5 w-5 text-[#FF6B6B]" />
            <span className="font-bold text-[#5A4A42]">
              {earnedBadges.reduce((sum, b) => {
                const badge = availableBadges.find(ab => ab.id === b.badgeId)
                return sum + (badge?.points || 0)
              }, 0)} points
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#FFF8F0]">
            <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-[#FF6B6B] data-[state=active]:text-white">
              All ({availableBadges.length})
            </TabsTrigger>
            <TabsTrigger value="earned" className="rounded-full data-[state=active]:bg-[#B8E0D2] data-[state=active]:text-white">
              Earned ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked" className="rounded-full data-[state=active]:bg-[#8B7355] data-[state=active]:text-white">
              Locked ({availableBadges.length - earnedBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBadges.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id)
                const earnedBadge = earnedBadges.find(b => b.badgeId === badge.id)
                
                return (
                  <div
                    key={badge.id}
                    className={`
                      relative p-4 rounded-2xl border-2 transition-all duration-300
                      ${isEarned 
                        ? 'bg-white border-[#B8E0D2] shadow-lg hover:scale-105' 
                        : 'bg-gray-50 border-gray-200 opacity-75'
                      }
                    `}
                  >
                    {!isEarned && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className={`
                        w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-3
                        ${isEarned ? 'bg-gradient-to-br from-[#FFE5B4] to-[#FFB5BA]' : 'bg-gray-200'}
                      `}>
                        {badge.icon}
                      </div>
                      
                      <h3 className={`
                        font-bold text-sm mb-1
                        ${isEarned ? 'text-[#5A4A42]' : 'text-gray-500'}
                      `}>
                        {badge.name}
                      </h3>
                      
                      <p className="text-xs text-[#8B7355] mb-2 line-clamp-2">
                        {badge.description}
                      </p>
                      
                      <div className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
                        ${getRarityColor(badge.rarity)}
                      `}>
                        <Award className="h-3 w-3" />
                        {getRarityLabel(badge.rarity)}
                      </div>
                      
                      {isEarned && earnedBadge && (
                        <p className="text-xs text-[#B8E0D2] mt-2">
                          Earned {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                      
                      {!isEarned && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#FFB5BA] rounded-full"
                              style={{ width: '0%' }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Locked</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export function BadgeNotification({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full">
      <Card className="bg-gradient-to-r from-[#FFD966] to-[#FEF083] border-2 border-yellow-400 shadow-xl">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="text-4xl">{badge.icon}</div>
          <div>
            <p className="font-bold text-yellow-800">Badge Earned!</p>
            <p className="text-yellow-700">{badge.name}</p>
            <p className="text-sm text-yellow-600">+{badge.points} points</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-2 text-yellow-700 hover:text-yellow-900"
          >
            ✕
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export function RecentBadges({ userId }: { userId: string }) {
  const { earnedBadges, availableBadges, loadUserBadges } = useBadgeStore()

  useEffect(() => {
    loadUserBadges(userId)
  }, [userId, loadUserBadges])

  const recentBadges = earnedBadges
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 3)

  if (recentBadges.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-lg rounded-2xl">
        <CardContent className="p-6 text-center">
          <p className="text-[#8B7355]">Complete activities to earn your first badge!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {recentBadges.map((earned) => {
        const badge = availableBadges.find(b => b.id === earned.badgeId)
        if (!badge) return null
        
        return (
          <div 
            key={earned.badgeId}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#FFE5B4]/30"
          >
            <div className="text-2xl">{badge.icon}</div>
            <div className="flex-1">
              <p className="font-bold text-[#5A4A42]">{badge.name}</p>
              <p className="text-xs text-[#8B7355]">{badge.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#B8E0D2]">+{badge.points} pts</p>
              <p className="text-xs text-gray-400">
                {new Date(earned.earnedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
