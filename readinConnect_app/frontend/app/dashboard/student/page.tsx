'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Zap } from 'lucide-react';
import Link from 'next/link';
import { BadgeCollection } from '@/components/badges/BadgeCollection';
import { useUserBadges } from '@/lib/hooks/useBadges';

interface StudentProgress {
  words_learned: number;
  words_mastered: number;
  activities_completed: number;
  current_streak: number;
  total_minutes: number;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  completed_at: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  
  const { data: badgesData, isLoading: badgesLoading } = useUserBadges();
  const badges = badgesData?.badges || [];
  const progressToNext = badgesData?.progressToNext || [];
  
  const [progress, setProgress] = useState<StudentProgress>({
    words_learned: 0,
    words_mastered: 0,
    activities_completed: 0,
    current_streak: 0,
    total_minutes: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const totalPoints = progress.words_learned * 10 + progress.words_mastered * 50 + badges.length * 100;
  const completedActivities = progress.activities_completed;
  const earnedBadges = badges.length;

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);

    const unsubscribeProgress = onSnapshot(
      doc(db, 'users', user.uid, 'level_progress', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StudentProgress;
          setProgress(data);
        }
      },
      (error) => {
        console.error('Error fetching progress:', error);
      }
    );

    const unsubscribeActivities = onSnapshot(
      collection(db, 'users', user.uid, 'activities'),
      (snapshot) => {
        const activitiesData = snapshot.docs.map((doc: any) => ({
          docId: doc.id,
          ...doc.data() as Activity
        })).slice(0, 5);
        setRecentActivities(activitiesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching activities:', error);
      }
    );

    return () => {
      unsubscribeProgress();
      unsubscribeActivities();
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading || badgesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Zap className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFE5B4]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
              <span className="text-2xl">📚</span>
            </div>
            <span className="text-xl font-black text-[#5A4A42]">Reading</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#8B7355]">
              {profile?.displayName?.split(' ')[0] || 'Reader'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="rounded-full border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Bye!
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg shadow-[#FFE5B4]/20 mb-4">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-black text-[#5A4A42]">
              Hi, {profile?.displayName?.split(' ')[0] || 'Super Reader'}!
            </h1>
          </div>
          <p className="text-[#8B7355] text-lg">Ready for today&apos;s adventures?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white border-0 shadow-xl shadow-[#FFE5B4]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#FFE5B4] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">⭐</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">{totalPoints}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Your Stars</CardTitle>
              <p className="text-sm text-[#8B7355]">Keep collecting!</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#B8E0D2]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#B8E0D2] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🎮</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">{completedActivities}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Games Played</CardTitle>
              <p className="text-sm text-[#8B7355]">You&apos;re doing great!</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#E8D5E0]/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#E8D5E0] rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
                <span className="text-4xl font-black text-[#5A4A42]">{earnedBadges}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#5A4A42] text-lg">Badges Won</CardTitle>
              <p className="text-sm text-[#8B7355]">Super achievements!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white border-0 shadow-xl shadow-[#FFB5BA]/20 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-[#FFB5BA]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFB5BA]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <CardTitle className="text-[#5A4A42] text-xl">Your Powers</CardTitle>
                  <p className="text-sm text-[#8B7355]">See how strong you&apos;re getting!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {[
                { skill: 'Letter Recognition', progress: 75, emoji: '🔤' },
                { skill: 'Phonics', progress: 60, emoji: '🎵' },
                { skill: 'Sight Words', progress: 45, emoji: '👀' },
                { skill: 'Fluency', progress: 30, emoji: '⚡' },
                { skill: 'Comprehension', progress: 20, emoji: '🧠' },
              ].map((item) => (
                <div key={item.skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="font-bold text-[#5A4A42]">{item.skill}</span>
                    </div>
                    <span className="font-black text-[#FF6B6B]">{item.progress}%</span>
                  </div>
                  <div className="h-3 bg-[#FFE5B4]/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFE5B4] rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#4ECDC4]/20 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-[#4ECDC4]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎮</span>
                </div>
                <div>
                  <CardTitle className="text-[#5A4A42] text-xl">Pick a Game</CardTitle>
                  <p className="text-sm text-[#8B7355]">Choose your adventure!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Link href="/activities/phonics">
                <div className="flex items-center justify-between p-4 bg-[#FFB5BA]/10 rounded-2xl hover:bg-[#FFB5BA]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFB5BA] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Letter Hunt</p>
                      <p className="text-sm text-[#8B7355]">Find letters and win!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#FFB5BA] text-white border-0 rounded-full px-4 py-1">
                    Play!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/sight-words">
                <div className="flex items-center justify-between p-4 bg-[#B8E0D2]/10 rounded-2xl hover:bg-[#B8E0D2]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#B8E0D2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Word Bingo</p>
                      <p className="text-sm text-[#8B7355]">Match and shout BINGO!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#B8E0D2] text-[#5A4A42] border-0 rounded-full px-4 py-1">
                    Play!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/fluency">
                <div className="flex items-center justify-between p-4 bg-[#FFE5B4]/10 rounded-2xl hover:bg-[#FFE5B4]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFE5B4] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">⏱️</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Reading Race</p>
                      <p className="text-sm text-[#8B7355]">How fast can you go?</p>
                    </div>
                  </div>
                  <Badge className="bg-[#FFE5B4] text-[#5A4A42] border-0 rounded-full px-4 py-1">
                    Play!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/word-builder">
                <div className="flex items-center justify-between p-4 bg-[#FF6B6B]/10 rounded-2xl hover:bg-[#FF6B6B]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF6B6B] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🏗️</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Word Builder</p>
                      <p className="text-sm text-[#8B7355]">Build words with letters!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#FF6B6B] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/sound-detective">
                <div className="flex items-center justify-between p-4 bg-[#4ECDC4]/10 rounded-2xl hover:bg-[#4ECDC4]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#4ECDC4] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Sound Detective</p>
                      <p className="text-sm text-[#8B7355]">Find the sounds!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#4ECDC4] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/story-sequencing">
                <div className="flex items-center justify-between p-4 bg-[#9B59B6]/10 rounded-2xl hover:bg-[#9B59B6]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#9B59B6] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🧩</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Story Time</p>
                      <p className="text-sm text-[#8B7355]">Put stories in order!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#9B59B6] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/reading-racetrack">
                <div className="flex items-center justify-between p-4 bg-[#E74C3C]/10 rounded-2xl hover:bg-[#E74C3C]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E74C3C] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🏎️</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Reading Racetrack</p>
                      <p className="text-sm text-[#8B7355]">Race and read fast!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#E74C3C] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/question-quest">
                <div className="flex items-center justify-between p-4 bg-[#F39C12]/10 rounded-2xl hover:bg-[#F39C12]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F39C12] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">❓</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Question Quest</p>
                      <p className="text-sm text-[#8B7355]">Answer story questions!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#F39C12] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/word-pop">
                <div className="flex items-center justify-between p-4 bg-[#3498DB]/10 rounded-2xl hover:bg-[#3498DB]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#3498DB] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🎈</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Word Pop</p>
                      <p className="text-sm text-[#8B7355]">Pop the right words!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#3498DB] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/blend-blaster">
                <div className="flex items-center justify-between p-4 bg-[#E74C3C]/10 rounded-2xl hover:bg-[#E74C3C]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E74C3C] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Blend Blaster</p>
                      <p className="text-sm text-[#8B7355]">Master consonant blends!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#E74C3C] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>

              <Link href="/activities/magic-e">
                <div className="flex items-center justify-between p-4 bg-[#9B59B6]/10 rounded-2xl hover:bg-[#9B59B6]/20 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#9B59B6] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#5A4A42]">Magic E</p>
                      <p className="text-sm text-[#8B7355]">Watch words transform!</p>
                    </div>
                  </div>
                  <Badge className="bg-[#9B59B6] text-white border-0 rounded-full px-4 py-1">
                    NEW!
                  </Badge>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <BadgeCollection userId={user?.uid || ''} />
        </div>
      </main>
    </div>
  )
}
