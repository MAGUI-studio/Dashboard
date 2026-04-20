"use client"

import * as React from "react"

import { usePathname, useSearchParams } from "next/navigation"

import { motion } from "framer-motion"

import { Preloader } from "@/src/components/common/Preloader"

interface ClientDashboardExperienceProps {
  children: React.ReactNode
}

export function ClientDashboardExperience({
  children,
}: ClientDashboardExperienceProps): React.JSX.Element {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isReady, setIsReady] = React.useState(false)

  const experienceKey = React.useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams]
  )

  const handleComplete = React.useCallback(() => {
    setIsReady(true)
  }, [])

  React.useEffect(() => {
    setIsReady(false)
  }, [experienceKey])

  return (
    <React.Fragment key={experienceKey}>
      <Preloader onComplete={handleComplete} />

      {isReady ? (
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        >
          {children}
        </motion.div>
      ) : null}
    </React.Fragment>
  )
}
