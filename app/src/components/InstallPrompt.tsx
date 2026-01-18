"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return // Don't show anything if prompt isn't available
    }

    try {
      // Show the native install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('App installed successfully')
        setShowButton(false)
        setIsInstalled(true)
      } else {
        console.log('App installation declined')
      }
    } catch (error) {
      console.error('Installation error:', error)
    } finally {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowButton(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (isInstalled || !showButton) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleInstall}
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700 shadow-2xl rounded-full px-6 py-6 gap-2 group relative"
      >
        <Download className="w-5 h-5 group-hover:animate-bounce" />
        <span className="font-semibold">Install App</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          className="absolute -top-2 -right-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </Button>
    </div>
  )
}
