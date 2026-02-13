import { Lock, ChevronRight } from 'lucide-react'

interface PhaseLockProps {
  phaseId: number
  phaseName: string
  isLocked: boolean
  lettersNeeded?: number
  onClick?: () => void
}

export function PhaseLock({ phaseId, phaseName, isLocked, lettersNeeded, onClick }: PhaseLockProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative flex items-center justify-between p-4 rounded-xl border-2
        transition-all duration-200
        ${isLocked 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-white border-[#FFE5B4]/30 hover:border-[#FFE5B4]/50 hover:shadow-lg cursor-pointer'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            {phaseId}
          </div>
          <div className="text-sm">
            {phaseName}
          </div>
        </div>
        
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#4ECDC4]" />
        )}
      </div>
      
      {isLocked && lettersNeeded !== undefined && (
        <div className="text-xs text-gray-500">
          ({lettersNeeded} letters)
        </div>
      )}
    </div>
  )
}
