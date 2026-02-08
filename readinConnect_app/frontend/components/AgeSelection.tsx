'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

interface AgeSelectionProps {
  onAgeSelect: (age: number) => void
  currentAge?: number
}

const AGE_OPTIONS = [
  { age: 4, label: '4 years old', description: 'Just starting to learn letters', stage: 'Pre-reader' },
  { age: 5, label: '5 years old', description: 'Learning letter sounds and basic words', stage: 'Beginner' },
  { age: 6, label: '6 years old', description: 'Reading simple stories and sight words', stage: 'Intermediate' },
  { age: 7, label: '7 years old', description: 'Building fluency and comprehension', stage: 'Intermediate' },
  { age: 8, label: '8 years old', description: 'Reading independently with confidence', stage: 'Advanced' },
]

export function AgeSelection({ onAgeSelect, currentAge }: AgeSelectionProps) {
  const [selectedAge, setSelectedAge] = useState<number | null>(currentAge || null)

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age)
    setTimeout(() => onAgeSelect(age), 100)
  }

  const getButtonClass = (option: typeof AGE_OPTIONS[0]) => {
    const isSelected = selectedAge === option.age
    const isCurrent = currentAge === option.age

    if (isSelected) {
      return 'relative p-6 rounded-2xl border-3 text-left transition-all duration-200 bg-gradient-to-br from-[#FF6B6B] to-[#FFB5BA] border-[#FF6B6B] transform scale-105 shadow-xl shadow-[#FF6B6B]/30'
    }
    if (isCurrent) {
      return 'relative p-6 rounded-2xl border-3 text-left transition-all duration-200 bg-[#B8E0D2] border-[#B8E0D2] shadow-lg'
    }
    return 'relative p-6 rounded-2xl border-3 text-left transition-all duration-200 bg-white border-[#FFE5B4]/50 hover:border-[#FFB5BA] hover:shadow-lg'
  }

  const getAgeBoxClass = (option: typeof AGE_OPTIONS[0]) => {
    const isSelected = selectedAge === option.age
    const isCurrent = currentAge === option.age

    if (isSelected) {
      return 'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-white text-[#FF6B6B]'
    }
    if (isCurrent) {
      return 'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-[#FF6B6B] text-white'
    }
    return 'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-[#FFE5B4] text-[#5A4A42]'
  }

  const getTitleClass = (option: typeof AGE_OPTIONS[0]) => {
    const isSelected = selectedAge === option.age
    const isCurrent = currentAge === option.age

    if (isSelected || isCurrent) {
      return 'text-white'
    }
    return 'text-[#5A4A42]'
  }

  const getTextClass = (option: typeof AGE_OPTIONS[0]) => {
    const isSelected = selectedAge === option.age
    const isCurrent = currentAge === option.age

    if (isSelected) {
      return 'text-white/80'
    }
    if (isCurrent) {
      return 'text-white'
    }
    return 'text-[#8B7355]'
  }

  const getBadgeClass = (option: typeof AGE_OPTIONS[0]) => {
    const isSelected = selectedAge === option.age

    if (isSelected) {
      return 'px-3 py-1 rounded-full text-xs font-bold bg-white text-[#FF6B6B]'
    }
    return 'px-3 py-1 rounded-full text-xs font-bold bg-[#FFE5B4] text-[#5A4A42]'
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#FF6B6B]/20 rounded-3xl">
      <CardContent className="p-8 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#5A4A42] mb-2">How old are you?</h2>
          <p className="text-lg text-[#8B7355]">Select your age so we can show you the right activities!</p>
        </div>

        <div className="grid gap-4">
          {AGE_OPTIONS.map((option) => {
            const isSelected = selectedAge === option.age
            const isCurrent = currentAge === option.age

            return (
              <button
                key={option.age}
                onClick={() => handleAgeSelect(option.age)}
                className={getButtonClass(option)}
              >
                <div className="flex items-start gap-4">
                  <div className={getAgeBoxClass(option)}>
                    {option.age}
                  </div>

                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${getTitleClass(option)}`}>
                      {option.label}
                    </h3>
                    <p className={`text-sm mb-2 ${getTextClass(option)}`}>
                      {option.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={getBadgeClass(option)}>
                        {option.stage}
                      </span>
                      {isCurrent && (
                        <span className="text-xs text-[#B8E0D2] bg-white px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <ChevronRight className="h-8 w-8 text-white animate-pulse" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
