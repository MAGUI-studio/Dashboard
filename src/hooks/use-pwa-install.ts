"use client"

import * as React from "react"

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        Boolean(
          (window.navigator as Navigator & { standalone?: boolean }).standalone
        ))

    setIsStandalone(standalone)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const canInstall = !isStandalone && deferredPrompt !== null
  const installStatus = isStandalone
    ? "installed"
    : canInstall
      ? "available"
      : "manual"

  const promptInstall = React.useCallback(async () => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsStandalone(true)
      return true
    }

    return false
  }, [deferredPrompt])

  return {
    canInstall,
    installStatus,
    isStandalone,
    promptInstall,
  }
}
