'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ArrowLeft, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AVAILABLE_GAMES = [
  { id: 'word-builder', name: 'Word Builder', icon: '🏗️', category: 'Phonics' },
  { id: 'sound-detective', name: 'Sound Detective', icon: '🔍', category: 'Phonemic Awareness' },
  { id: 'story-sequencing', name: 'Story Sequencing', icon: '🧩', category: 'Comprehension' },
  { id: 'reading-racetrack', name: 'Reading Racetrack', icon: '🏎️', category: 'Fluency' },
  { id: 'question-quest', name: 'Question Quest', icon: '❓', category: 'Comprehension' },
  { id: 'word-pop', name: 'Word Pop', icon: '🎈', category: 'Sight Words' },
  { id: 'blend-blaster', name: 'Blend Blaster', icon: '🚀', category: 'Phonics' },
  { id: 'magic-e', name: 'Magic E', icon: '✨', category: 'Phonics' },
];

interface GameConfig {
  gameId: string;
  order: number;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [sequentialUnlock, setSequentialUnlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadStudents();
  }, [user, router]);

  const loadStudents = async () => {
    try {
      const functions = getFunctions();
      const getTeacherStudentsFn = httpsCallable(functions, 'getTeacherStudents');
      const result = await getTeacherStudentsFn({});
      setStudents((result.data as any).students || []);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  const toggleGame = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateAssignment = async () => {
    if (!title || selectedGames.length === 0 || selectedStudents.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const functions = getFunctions();
      const createAssignmentFn = httpsCallable(functions, 'createAssignment');
      
      const games: GameConfig[] = selectedGames.map((gameId, index) => ({
        gameId,
        order: index + 1,
      }));

      await createAssignmentFn({
        title,
        description,
        games,
        targetStudentIds: selectedStudents,
        dueDate: dueDate || null,
        settings: {
          sequentialUnlock,
          allowReplay: true,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/teacher/assignments');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-4 border-white bg-white/90">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">Assignment Created!</h2>
            <p className="text-[#5A4A42]/70">Your students can now see this assignment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/assignments')}
            className="rounded-full border-2 border-[#FFB5BA]/50 hover:bg-[#FFB5BA]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#5A4A42]">Create Assignment</h1>
          <div className="w-24"></div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-[#FF6B6B] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className="w-8 h-1 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90">
            <CardHeader>
              <CardTitle className="text-2xl text-[#5A4A42]">Step 1: Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-[#5A4A42] font-medium">Assignment Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Week 3: Short Vowels"
                  className="mt-2 rounded-xl border-2 border-[#B8E0D2]/30"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-[#5A4A42] font-medium">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description for students"
                  className="mt-2 rounded-xl border-2 border-[#B8E0D2]/30"
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-[#5A4A42] font-medium">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 rounded-xl border-2 border-[#B8E0D2]/30"
                />
              </div>
              <Button 
                onClick={() => setStep(2)}
                disabled={!title}
                className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white rounded-full h-12 text-lg font-bold"
              >
                Continue to Games
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90">
            <CardHeader>
              <CardTitle className="text-2xl text-[#5A4A42]">Step 2: Select Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <button
                  onClick={() => setSequentialUnlock(!sequentialUnlock)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    sequentialUnlock ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'border-gray-300'
                  }`}>
                    {sequentialUnlock && <span className="text-white">✓</span>}
                  </div>
                  <span className="text-[#5A4A42]">Students must complete games in order</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {AVAILABLE_GAMES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => toggleGame(game.id)}
                    className={`p-4 rounded-2xl border-4 cursor-pointer transition-all ${
                      selectedGames.includes(game.id)
                        ? 'border-[#FF6B6B] bg-[#FF6B6B]/10'
                        : 'border-gray-200 hover:border-[#FFB5BA]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{game.icon}</span>
                      <div>
                        <p className="font-bold text-[#5A4A42]">{game.name}</p>
                        <p className="text-sm text-[#8B7355]">{game.category}</p>
                      </div>
                      {selectedGames.includes(game.id) && (
                        <CheckCircle className="ml-auto h-6 w-6 text-[#FF6B6B]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 rounded-full h-12"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={selectedGames.length === 0}
                  className="flex-1 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white rounded-full h-12 text-lg font-bold"
                >
                  Continue to Students
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-3xl shadow-xl border-4 border-white bg-white/90">
            <CardHeader>
              <CardTitle className="text-2xl text-[#5A4A42]">Step 3: Select Students</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-center text-[#8B7355] py-8">No students assigned to you yet.</p>
              ) : (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => {
                        if (selectedStudents.length === students.length) {
                          setSelectedStudents([]);
                        } else {
                          setSelectedStudents(students.map(s => s.id));
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedStudents.length === students.length ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'border-gray-300'
                      }`}>
                        {selectedStudents.length === students.length && <span className="text-white">✓</span>}
                      </div>
                      <span className="font-medium text-[#5A4A42]">Select All Students</span>
                    </button>
                  </div>
                  
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        selectedStudents.includes(student.id)
                          ? 'border-[#FF6B6B] bg-[#FF6B6B]/10'
                          : 'border-gray-200 hover:border-[#FFB5BA]/50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-[#B8E0D2] rounded-full flex items-center justify-center text-lg">
                        {student.displayName?.[0] || '👤'}
                      </div>
                      <div>
                        <p className="font-bold text-[#5A4A42]">{student.displayName || 'Student'}</p>
                        <p className="text-sm text-[#8B7355]">{student.email}</p>
                      </div>
                      {selectedStudents.includes(student.id) && (
                        <CheckCircle className="ml-auto h-6 w-6 text-[#FF6B6B]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl">
                  {error}
                </div>
              )}
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 rounded-full h-12"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleCreateAssignment}
                  disabled={loading || selectedStudents.length === 0}
                  className="flex-1 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white rounded-full h-12 text-lg font-bold"
                >
                  {loading ? 'Creating...' : 'Create Assignment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
