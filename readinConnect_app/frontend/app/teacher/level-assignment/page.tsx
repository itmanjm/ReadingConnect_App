'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/auth';

interface ReadingLevel {
  id?: string;
  level_id: string;
  level_name: string;
  age_range: string;
  lexile_min: number;
  lexile_max: number;
  fry_readability_range: string;
  description: string;
  estimated_duration_weeks: number;
  min_cvc_words: number;
}

export default function ReadingLevelAssignment() {
  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ReadingLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const levelsQuery = query(collection(db, 'reading_levels'));
    const unsubscribeLevels = onSnapshot(levelsQuery, (snapshot) => {
      const levelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as ReadingLevel
      }));
      setLevels(levelsData);
    });

    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    });

    return () => {
      unsubscribeLevels();
      unsubscribeStudents();
    };
  }, []);

  const handleAssignLevel = async (studentId: string, levelId: string) => {
    try {
      setSaving(true);
      const studentRef = doc(db, 'users', studentId);
      
      await updateDoc(studentRef, {
        current_reading_level: levelId,
        updated_at: new Date().toISOString()
      });

      console.log(`✅ Assigned level ${levelId} to student ${studentId}`);
      setSaving(false);
    } catch (error) {
      console.error('Error assigning level:', error);
      setSaving(false);
      alert('Failed to assign reading level');
    }
  };

  const getLevelName = (levelId: string): string => {
    const level = levels.find(l => l.level_id === levelId);
    return level?.level_name || levelId;
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] p-8">
      <nav className="bg-white/90 backdrop-blur-sm border-b-4 border-[#FF6B6B]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#FF6B6B]">📚 Reading Level Assignment</h1>
          <button
            onClick={() => window.location.href = '/dashboard/teacher'}
            className="text-[#5A4A42] hover:text-[#FF6B6B]"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="container mx-auto py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-[#5A4A42] mb-6">Select Reading Level</h2>
            <div className="space-y-4">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level)}
                  disabled={loading || saving}
                  className={`
                    w-full p-6 rounded-2xl border-4 transition-all text-left
                    ${selectedLevel?.id === level.id
                      ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] border-[#FF6B6B] text-white shadow-lg'
                      : 'bg-white border-[#FFB5BA]/30 hover:bg-[#FFB5BA]/10 hover:border-[#FF6B6B]'
                    } 
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-bold text-lg">
                      {level.level_name}
                    </span>
                    <span className="text-xs bg-[#B8E0D2] text-white px-2 py-1 rounded-full">
                      {level.age_range}
                    </span>
                  </div>
                  <div className="text-sm text-[#5A4A42]/80">
                    <p><strong>Lexile:</strong> {level.lexile_min}-{level.lexile_max}</p>
                    <p><strong>Fry Readability:</strong> {level.fry_readability_range}</p>
                    <p className="mt-2">{level.description}</p>
                    <p className="text-xs text-[#8B7355] mt-2">
                      {level.min_cvc_words} CVC words • {level.estimated_duration_weeks} weeks
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedLevel && (
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#5A4A42] mb-6">Assign to Students</h2>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-[#FF6B6B]/20 p-6">
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#FFB5BA]/30 hover:border-[#B8E0D2] bg-white"
                    >
                      <div>
                        <p className="font-bold text-[#5A4A42]">{student.full_name || student.email}</p>
                        <p className="text-sm text-[#8B7355]">
                          Current Level: <strong>{getLevelName(student.current_reading_level)}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignLevel(student.id, selectedLevel.level_id)}
                        disabled={saving}
                        className="bg-gradient-to-r from-[#B8E0D2] to-[#98D0C0] hover:from-[#A8D5BA] hover:to-[#7CC7C0] text-white font-bold py-2 px-4 rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!selectedLevel && students.length === 0 && (
            <div className="lg:col-span-3 text-center py-16">
              <p className="text-[#8B7355]">Select a reading level to see student list</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
