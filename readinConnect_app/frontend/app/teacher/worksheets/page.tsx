'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, FileText, BookOpen, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCVCWords, useCVCWordFamilies, CVCWord } from '@/lib/hooks/useCVCWords'
import { 
  generateCVCWorksheet, 
  generateWordFamilyWorksheet, 
  generateAlphabetWorksheet,
  downloadPDF,
  WorksheetOptions 
} from '@/lib/utils/pdfGenerator'

type WorksheetType = 'cvc' | 'word-family' | 'alphabet'

interface WorksheetConfig {
  type: WorksheetType
  title: string
  wordCount: number
  includeTrace: boolean
  includeWrite: boolean
}

export default function WorksheetGenerator() {
  const router = useRouter()
  const { words: cvcWords, loading: cvcLoading } = useCVCWords('kindergarten', 100)
  const { families: wordFamilies, loading: familiesLoading } = useCVCWordFamilies('kindergarten')
  
  const [selectedType, setSelectedType] = useState<WorksheetType>('cvc')
  const [worksheetTitle, setWorksheetTitle] = useState('CVC Word Practice')
  const [wordCount, setWordCount] = useState(12)
  const [includeTrace, setIncludeTrace] = useState(true)
  const [includeWrite, setIncludeWrite] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedWords, setSelectedWords] = useState<CVCWord[]>([])

  useEffect(() => {
    if (cvcWords.length > 0) {
      const shuffled = [...cvcWords].sort(() => Math.random() - 0.5)
      setSelectedWords(shuffled.slice(0, wordCount))
    }
  }, [cvcWords, wordCount])

  useEffect(() => {
    const titles: Record<WorksheetType, string> = {
      'cvc': 'CVC Word Practice',
      'word-family': 'Word Family Practice',
      'alphabet': 'Alphabet Practice'
    }
    setWorksheetTitle(titles[selectedType])
  }, [selectedType])

  const handleGeneratePDF = async () => {
    setGenerating(true)
    
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      let doc
      
      const options: WorksheetOptions = {
        title: worksheetTitle,
        studentName: true,
        dateLine: true,
        fontSize: 24,
        includeTrace,
        includeWrite,
        includeBox: true,
        wordsPerRow: 3
      }

      switch (selectedType) {
        case 'cvc':
          doc = generateCVCWorksheet(selectedWords, options)
          downloadPDF(doc, `cvc-worksheet-${Date.now()}`)
          break
          
        case 'word-family':
          doc = generateWordFamilyWorksheet(wordFamilies.slice(0, 4), options)
          downloadPDF(doc, `word-family-worksheet-${Date.now()}`)
          break
          
        case 'alphabet':
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
          doc = generateAlphabetWorksheet(letters, options)
          downloadPDF(doc, `alphabet-worksheet-${Date.now()}`)
          break
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate worksheet. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const loading = cvcLoading || familiesLoading

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#FFB5BA]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard/teacher')}
            className="flex items-center gap-2 text-[#5A4A42] hover:text-[#FF6B6B] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-[#5A4A42]">Worksheet Generator</h1>
          <div className="w-24" />
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden">
            <div className="bg-gradient-to-r from-[#FFB5BA]/20 to-[#FFE5B4]/20 p-6 border-b border-[#FFB5BA]/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#5A4A42]">Create Worksheets</h2>
                  <p className="text-[#8B7355]">Generate printable PDF worksheets for your students</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-[#FF6B6B] border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-[#8B7355]">Loading word data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setSelectedType('cvc')}
                      className={`p-6 rounded-2xl border-4 transition-all ${
                        selectedType === 'cvc'
                          ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] border-[#FF6B6B] text-white'
                          : 'bg-white border-[#FFB5BA]/30 hover:border-[#FF6B6B] text-[#5A4A42]'
                      }`}
                    >
                      <BookOpen className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-bold">CVC Words</h3>
                      <p className={`text-sm ${selectedType === 'cvc' ? 'text-white/80' : 'text-[#8B7355]'}`}>
                        {cvcWords.length} words available
                      </p>
                    </button>

                    <button
                      onClick={() => setSelectedType('word-family')}
                      className={`p-6 rounded-2xl border-4 transition-all ${
                        selectedType === 'word-family'
                          ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] border-[#FF6B6B] text-white'
                          : 'bg-white border-[#FFB5BA]/30 hover:border-[#FF6B6B] text-[#5A4A42]'
                      }`}
                    >
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-bold">Word Families</h3>
                      <p className={`text-sm ${selectedType === 'word-family' ? 'text-white/80' : 'text-[#8B7355]'}`}>
                        {wordFamilies.length} families available
                      </p>
                    </button>

                    <button
                      onClick={() => setSelectedType('alphabet')}
                      className={`p-6 rounded-2xl border-4 transition-all ${
                        selectedType === 'alphabet'
                          ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] border-[#FF6B6B] text-white'
                          : 'bg-white border-[#FFB5BA]/30 hover:border-[#FF6B6B] text-[#5A4A42]'
                      }`}
                    >
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-bold">Alphabet</h3>
                      <p className={`text-sm ${selectedType === 'alphabet' ? 'text-white/80' : 'text-[#8B7355]'}`}>
                        A-Z Practice
                      </p>
                    </button>
                  </div>

                  <div className="bg-[#FFF8F0] rounded-2xl p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#5A4A42] mb-2">
                        Worksheet Title
                      </label>
                      <input
                        type="text"
                        value={worksheetTitle}
                        onChange={(e) => setWorksheetTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB5BA]/30 focus:border-[#FF6B6B] outline-none text-[#5A4A42]"
                      />
                    </div>

                    {selectedType === 'cvc' && (
                      <div>
                        <label className="block text-sm font-bold text-[#5A4A42] mb-2">
                          Number of Words ({wordCount})
                        </label>
                        <input
                          type="range"
                          min="6"
                          max="30"
                          step="6"
                          value={wordCount}
                          onChange={(e) => setWordCount(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-[#8B7355]">
                          <span>6</span>
                          <span>12</span>
                          <span>18</span>
                          <span>24</span>
                          <span>30</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeTrace}
                          onChange={(e) => setIncludeTrace(e.target.checked)}
                          className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                        />
                        <span className="text-[#5A4A42]">Include tracing box</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeWrite}
                          onChange={(e) => setIncludeWrite(e.target.checked)}
                          className="w-5 h-5 rounded border-[#FFB5BA] text-[#FF6B6B] focus:ring-[#FF6B6B]"
                        />
                        <span className="text-[#5A4A42]">Include writing box</span>
                      </label>
                    </div>
                  </div>

                  {selectedType === 'cvc' && selectedWords.length > 0 && (
                    <div className="bg-[#B8E0D2]/10 rounded-2xl p-6">
                      <h3 className="font-bold text-[#5A4A42] mb-4">Preview Words</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedWords.map((word) => (
                          <span
                            key={word.id}
                            className="bg-white px-3 py-1 rounded-lg text-sm font-bold text-[#5A4A42]"
                          >
                            {word.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedType === 'word-family' && wordFamilies.length > 0 && (
                    <div className="bg-[#B8E0D2]/10 rounded-2xl p-6">
                      <h3 className="font-bold text-[#5A4A42] mb-4">Word Families</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {wordFamilies.slice(0, 8).map((family) => (
                          <div key={family.family} className="bg-white rounded-xl p-4">
                            <span className="text-[#FF6B6B] font-bold">-{family.family}</span>
                            <p className="text-xs text-[#8B7355] mt-1">
                              {family.words.length} words
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGeneratePDF}
                    disabled={generating || loading}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      generating || loading
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-[#FF6B6B] to-[#FFB5BA] text-white hover:shadow-xl hover:scale-[1.02]'
                    }`}
                  >
                    {generating ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-6 w-6" />
                        Download PDF Worksheet
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
