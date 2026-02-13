'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { clsx } from 'clsx'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="text-green-600" />,
  error: <AlertCircle className="text-red-600" />,
  warning: <AlertCircle className="text-amber-600" />,
  info: <Info className="text-blue-600" />,
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 10)
    const newToast = { ...toast, id, duration: toast.duration ?? DEFAULT_DURATIONS[toast.type] }
    
    setToasts(prev => [...prev, newToast])
    
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}

export function Toast({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = TOAST_ICONS[toast.type]
  
  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 flex items-start space-y-2 pointer-events-none',
        'animate-in slide-in-from-right-4'
      )}
      role="alert"
      aria-live="polite"
    >
      <div
        className={clsx(
          'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg transition-all',
          toast.type === 'success' && 'bg-white border-l-4 border-green-500',
          toast.type === 'error' && 'bg-white border-l-4 border-red-500',
          toast.type === 'warning' && 'bg-white border-l-4 border-amber-500',
          toast.type === 'info' && 'bg-white border-l-4 border-blue-500',
        )}
      >
        <div className="flex-shrink-0">
          {Icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-sm text-gray-900">
              {toast.title}
            </p>
          )}
          <p className="text-sm text-gray-700">
            {toast.message}
          </p>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onRemove()}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()
  
  return (
    <div className="pointer-events-none">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => useToast().removeToast(toast.id)}
        />
      ))}
    </div>
  )
}
