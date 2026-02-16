'use client'

import { X, AlertTriangle } from 'lucide-react'
import { Button } from './button'
import type { AppError } from '@/lib/errors'

interface ErrorMessageProps {
  error: AppError | string
  onDismiss?: () => void
  title?: string
  variant?: 'default' | 'inline'
}

export function ErrorMessage({
  error,
  onDismiss,
  title,
  variant = 'default'
}: ErrorMessageProps) {
  const message = typeof error === 'string' ? error : error.message
  const displayTitle = title || (typeof error === 'object' && error !== null && 'code' in error ? `Error: ${error.code}` : 'Error')

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{displayTitle}</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-2 text-red-600 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 my-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {displayTitle}
          </h3>
          
          <p className="text-red-700 leading-relaxed">
            {message}
          </p>
          
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="mt-4"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
