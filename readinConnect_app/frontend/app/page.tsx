import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles, Heart, Star, Rainbow } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] overflow-hidden">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#FFB5BA] rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-[#B8E0D2] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-[#FFE5B4] rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-36 h-36 bg-[#E8D5E0] rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8 mb-16">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#FFB5BA] rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
            <div className="absolute -top-2 -right-6 w-16 h-16 bg-[#B8E0D2] rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
            <div className="absolute -bottom-2 left-1/2 w-14 h-14 bg-[#FFE5B4] rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
            
            <h1 className="text-7xl md:text-8xl font-black text-[#5A4A42] tracking-tight relative">
              <span className="inline-block transform hover:scale-105 transition-transform">R</span>
              <span className="inline-block transform hover:scale-105 transition-transform" style={{ color: '#FF6B6B' }}>e</span>
              <span className="inline-block transform hover:scale-105 transition-transform">a</span>
              <span className="inline-block transform hover:scale-105 transition-transform" style={{ color: '#4ECDC4' }}>d</span>
              <span className="inline-block transform hover:scale-105 transition-transform">i</span>
              <span className="inline-block transform hover:scale-105 transition-transform" style={{ color: '#FFE66D' }}>n</span>
              <span className="inline-block transform hover:scale-105 transition-transform">g</span>
            </h1>
          </div>
          
          <p className="text-2xl md:text-3xl text-[#5A4A42] font-medium text-center max-w-2xl">
            Where learning feels like play! 🌟
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/login">
              <Button 
                size="lg" 
                className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white text-xl px-8 py-6 rounded-full shadow-lg shadow-[#FF6B6B]/30 hover:shadow-xl hover:shadow-[#FF6B6B]/40 transition-all hover:-translate-y-1"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Your Adventure
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-[#4ECDC4] text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-white text-xl px-8 py-6 rounded-full transition-all hover:-translate-y-1"
            >
              <Heart className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-16">
          <Card className="bg-white border-0 shadow-xl shadow-[#FFB5BA]/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-[#FFB5BA]/30 transition-all hover:-translate-y-2 group">
            <CardHeader className="pb-2">
              <div className="w-16 h-16 bg-[#FFB5BA] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📚</span>
              </div>
              <CardTitle className="text-[#5A4A42] text-xl">Fun Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#8B7355]">
                Read exciting tales that make learning magical
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#B8E0D2]/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-[#B8E0D2]/30 transition-all hover:-translate-y-2 group">
            <CardHeader className="pb-2">
              <div className="w-16 h-16 bg-[#B8E0D2] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎮</span>
              </div>
              <CardTitle className="text-[#5A4A42] text-xl">Cool Games</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#8B7355]">
                Play while you learn with awesome activities
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#FFE5B4]/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-[#FFE5B4]/30 transition-all hover:-translate-y-2 group">
            <CardHeader className="pb-2">
              <div className="w-16 h-16 bg-[#FFE5B4] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">⭐</span>
              </div>
              <CardTitle className="text-[#5A4A42] text-xl">Earn Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#8B7355]">
                Collect stars and badges for every achievement
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl shadow-[#E8D5E0]/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-[#E8D5E0]/30 transition-all hover:-translate-y-2 group">
            <CardHeader className="pb-2">
              <div className="w-16 h-16 bg-[#E8D5E0] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🚀</span>
              </div>
              <CardTitle className="text-[#5A4A42] text-xl">Level Up</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#8B7355]">
                Watch yourself grow smarter every day
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-[#5A4A42] text-center mb-8 flex items-center justify-center gap-3">
            <Rainbow className="h-8 w-8 text-[#FF6B6B]" />
            Pick Your Adventure!
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/activities/phonics">
              <Card className="bg-[#FFB5BA] border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">🎯</span>
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-2xl">Letter Hunt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">
                    Find letters and learn their sounds!
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/activities/sight-words">
              <Card className="bg-[#B8E0D2] border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">🎉</span>
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-[#5A4A42] text-2xl">Word Bingo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#5A4A42]/90">
                    Match words and shout BINGO!
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/activities/fluency">
              <Card className="bg-[#FFE5B4] border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">⏱️</span>
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-5 w-5 text-[#5A4A42]" />
                    </div>
                  </div>
                  <CardTitle className="text-[#5A4A42] text-2xl">Reading Race</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#5A4A42]/90">
                    How fast can you read?
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/activities/comprehension">
              <Card className="bg-[#E8D5E0] border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">📚</span>
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-[#5A4A42] text-2xl">Story Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#5A4A42]/90">
                    Answer fun questions about stories!
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="text-center mt-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-[#8B7355] mb-4">
            <Star className="h-5 w-5 text-[#FFE66D] fill-[#FFE66D]" />
            <Star className="h-5 w-5 text-[#FFE66D] fill-[#FFE66D]" />
            <Star className="h-5 w-5 text-[#FFE66D] fill-[#FFE66D]" />
            <Star className="h-5 w-5 text-[#FFE66D] fill-[#FFE66D]" />
            <Star className="h-5 w-5 text-[#FFE66D] fill-[#FFE66D]" />
          </div>
          <p className="text-lg text-[#5A4A42]">
            Loved by <span className="font-bold text-[#FF6B6B]">10,000+</span> young readers and their families!
          </p>
        </div>
      </main>
    </div>
  )
}
