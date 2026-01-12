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

    // Show button anyway after 2 seconds (even if event doesn't fire)
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback: show instructions
      alert('To install:\n\n1. Click the ⋮ menu (top-right)\n2. Select "Install AIU Smart Cafe"\n\nOr look for the install icon in the address bar')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowButton(false)
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
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
