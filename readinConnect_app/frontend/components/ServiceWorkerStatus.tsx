'use client'

import { useState } from 'react'
import { useServiceWorker } from '@/lib/hooks/useServiceWorker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, WifiOff, Wifi, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Component to display service worker status and handle updates
 * Shows online/offline status and update availability
 */
export function ServiceWorkerStatus() {
  const {
    loading,
    error,
    updateAvailable,
    activateUpdate
  } = useServiceWorker({
    onSuccess: (registration) => {
      console.log('Service worker registered:', registration)
    },
    onUpdate: (registration) => {
      console.log('Service worker update available:', registration)
    }
  })

  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  // Listen for online/offline events
  useState(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  // Don't render while loading or if no service worker support
  if (loading || (!isServiceWorkerSupported())) {
    return null
  }

  // Show update notification
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right">
        <div className="bg-white border-2 border-[#FFB5BA] rounded-2xl shadow-xl p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="bg-[#FFE5B4] p-2 rounded-full">
              <RefreshCw className="h-5 w-5 text-[#FF6B6B] animate-spin" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#5A4A42] mb-1">Update Available</h4>
              <p className="text-sm text-[#8B7355] mb-3">
                A new version with phoneme audio improvements is ready to install.
              </p>
              <Button
                onClick={activateUpdate}
                className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show offline status
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right">
        <div className="bg-[#FFE5B4] border-2 border-[#FFB5BA] rounded-2xl shadow-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">
              <WifiOff className="h-5 w-5 text-[#FF6B6B]" />
            </div>
            <div>
              <h4 className="font-bold text-[#5A4A42]">Offline Mode</h4>
              <p className="text-sm text-[#8B7355]">
                Phoneme audio is cached and available offline
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show online status badge (in development or when explicitly enabled)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-[#B8E0D2]">
          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3 text-[#B8E0D2]" />
            <span className="text-xs">Online - SW Active</span>
          </div>
        </Badge>
      </div>
    )
  }

  // Show error status
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="destructive" className="animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">Service Worker Error</span>
          </div>
        </Badge>
      </div>
    )
  }

  return null
}

/**
 * Check if service worker is supported
 */
function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}
