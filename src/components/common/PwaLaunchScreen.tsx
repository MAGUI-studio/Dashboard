"use client"

import * as React from "react"

export function PwaLaunchScreen(): React.JSX.Element | null {
  const [visible, setVisible] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // Safari iOS fallback
      ("standalone" in window.navigator &&
        Boolean(
          (window.navigator as Navigator & { standalone?: boolean }).standalone
        ))

    if (!isStandalone) return

    setVisible(true)
  }, [])

  React.useEffect(() => {
    if (!visible || !loaded) return

    const timer = window.setTimeout(() => {
      setVisible(false)
    }, 900)

    return () => window.clearTimeout(timer)
  }, [visible, loaded])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[120] bg-background">
      <img
        src="/images/pwa_loading.png"
        alt="MAGUI.studio loading"
        className="h-full w-full object-cover"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
