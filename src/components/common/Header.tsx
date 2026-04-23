"use client"

import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import {
  DashboardNotification,
  DashboardUpdateAttachment,
} from "@/src/types/dashboard"
import { AnimatePresence, motion } from "framer-motion"

import { GlobalSearch } from "@/src/components/common/GlobalSearch"
import { MobileHeaderMenu } from "@/src/components/common/MobileHeaderMenu"
import { NotificationsDrawer } from "@/src/components/common/NotificationsDrawer"
import { Logo } from "@/src/components/common/logo"

import { AdminNav } from "./header/AdminNav"
import { ApprovalBanner } from "./header/ApprovalBanner"
import { UserMenu } from "./header/UserMenu"

interface HeaderProps {
  notifications?: DashboardNotification[]
  pendingApprovals?: {
    count: number
    projectId: string
    projectName: string
    lastUpdateId: string
    lastUpdateTitle: string
    lastUpdateDescription: string | null
    attachments: DashboardUpdateAttachment[]
  }[]
  viewer?: {
    email: string | null
    firstName: string | null
    fullName: string | null
    imageUrl: string | null
    isAdmin: boolean
  } | null
}

export function Header({
  notifications = [],
  pendingApprovals = [],
  viewer = null,
}: HeaderProps): React.JSX.Element {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/30 bg-background drop-shadow-xl"
    >
      <AnimatePresence>
        {pendingApprovals.length > 0 && (
          <ApprovalBanner approvals={pendingApprovals} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
        className="mx-auto flex h-20 w-full max-w-440 items-center justify-between px-6 lg:px-12"
      >
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="transition-all hover:opacity-60 active:scale-95 outline-none focus-visible:ring-0"
          >
            <Logo width={130} height={30} />
          </Link>

          <AdminNav isAdmin={viewer?.isAdmin} />
        </div>

        <div className="flex items-center gap-4">
          {!viewer ? (
            <div className="size-8 rounded-full bg-muted/20 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2 lg:gap-3">
              {viewer.isAdmin ? <GlobalSearch /> : null}
              <NotificationsDrawer notifications={notifications} />
              <MobileHeaderMenu viewer={viewer} />
              <UserMenu viewer={viewer} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.header>
  )
}
