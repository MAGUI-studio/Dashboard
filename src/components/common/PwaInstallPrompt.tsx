"use client"

import * as React from "react"

import { DownloadSimple, Sparkle, X } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/src/components/ui/button"

import { useIsMobile } from "@/src/hooks/use-mobile"
import { usePwaInstall } from "@/src/hooks/use-pwa-install"

export function PwaInstallPrompt() {
  const isMobile = useIsMobile()
  const [showPrompt, setShowPrompt] = React.useState(false)
  const { canInstall, promptInstall } = usePwaInstall()

  React.useEffect(() => {
    if (!isMobile) return
    if (!canInstall) return

    const timer = window.setTimeout(() => {
      setShowPrompt(true)
    }, 5000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [canInstall, isMobile])

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (installed) {
      setShowPrompt(false)
    }
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 z-50 w-[90%] max-w-[400px] -translate-x-1/2"
        >
          <div className="rounded-[2rem] border border-brand-primary/20 bg-background/90 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Sparkle weight="fill" className="size-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading text-base font-black uppercase tracking-tight text-foreground">
                    Instalar MAGUI App
                  </h4>
                  <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">
                    Tenha acesso rápido, notificações em tempo real e
                    experiência offline.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-muted-foreground/40 hover:text-foreground"
              >
                <X weight="bold" className="size-4" />
              </button>
            </div>

            <Button
              onClick={handleInstall}
              className="mt-6 h-12 w-full rounded-full bg-brand-primary text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02]"
            >
              <DownloadSimple weight="bold" className="mr-2 size-4" /> Instalar
              Agora
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
