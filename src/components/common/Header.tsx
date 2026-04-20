"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"

import { Link, usePathname } from "@/src/i18n/navigation"
import { DashboardNotification } from "@/src/types/dashboard"
import { SignOutButton } from "@clerk/nextjs"
import {
  CaretLeft,
  CaretRight,
  ChartLineUp,
  ChartPie,
  CheckCircle,
  CircleNotch,
  ClockCountdown,
  HandsClapping,
  List,
  NewspaperClipping,
  NotePencil,
  Plus,
  ProjectorScreen,
  SignOut,
  Users,
} from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"
import { Textarea } from "@/src/components/ui/textarea"

import { HeaderLanguageSwitcher } from "@/src/components/common/HeaderLanguageSwitcher"
import { HeaderThemeToggle } from "@/src/components/common/HeaderThemeToggle"
import { NotificationsDrawer } from "@/src/components/common/NotificationsDrawer"
import { Logo } from "@/src/components/common/logo"

import {
  approveUpdateAction,
  rejectUpdateAction,
} from "@/src/lib/actions/project.actions"

interface HeaderProps {
  notifications?: DashboardNotification[]
  pendingApprovals?: {
    count: number
    projectId: string
    projectName: string
    lastUpdateId: string
    lastUpdateTitle: string
    lastUpdateDescription: string | null
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("Sidebar")
  const tDashboard = useTranslations("Dashboard")
  const tApp = useTranslations("Approvals")
  const pathname = usePathname()
  const lastRefreshAtRef = React.useRef(0)

  const [isClientsMenuOpen, setIsClientsMenuOpen] = React.useState(false)
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)

  const [isApproving, setIsApproving] = React.useState(false)
  const [isRejecting, setIsRejecting] = React.useState(false)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [feedback, setFeedback] = React.useState("")
  const [currentApprovalIndex, setCurrentApprovalIndex] = React.useState(0)

  const selectedProjectId = searchParams.get("project")

  // Reset index if pendingApprovals changes
  React.useEffect(() => {
    setCurrentApprovalIndex(0)
  }, [pendingApprovals.length])

  const activePendingApproval = pendingApprovals[currentApprovalIndex]
  const primaryNavLabel = viewer?.isAdmin ? t("dashboard") : t("feed")

  const handleNextApproval = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentApprovalIndex((prev) => (prev + 1) % pendingApprovals.length)
  }

  const handlePrevApproval = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentApprovalIndex(
      (prev) => (prev - 1 + pendingApprovals.length) % pendingApprovals.length
    )
  }

  const handleApprove = async () => {
    if (!activePendingApproval) return

    setIsApproving(true)
    const result = await approveUpdateAction(
      activePendingApproval.lastUpdateId,
      activePendingApproval.projectId
    )

    if (result.success) {
      toast.success(tApp("toast.approve_success"))
      setIsSheetOpen(false)
    } else {
      toast.error(result.error ?? tApp("toast.error_approve"))
    }

    setIsApproving(false)
  }

  const handleReject = async () => {
    if (!activePendingApproval) return

    setIsRejecting(true)
    const result = await rejectUpdateAction({
      updateId: activePendingApproval.lastUpdateId,
      projectId: activePendingApproval.projectId,
      feedback,
    })

    if (result.success) {
      toast.success(tApp("toast.reject_success"))
      setFeedback("")
      setIsSheetOpen(false)
    } else {
      toast.error(result.error ?? tApp("toast.error_reject"))
    }

    setIsRejecting(false)
  }

  React.useEffect(() => {
    const refreshNotifications = () => {
      const now = Date.now()

      if (now - lastRefreshAtRef.current < 2_000) {
        return
      }

      lastRefreshAtRef.current = now
      router.refresh()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNotifications()
      }
    }

    window.addEventListener("focus", refreshNotifications)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", refreshNotifications)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [router])

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/60 backdrop-blur-xl"
    >
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

          <nav className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              asChild
              className={`h-8 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                pathname === "/"
                  ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                  : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
              }`}
            >
              <Link href="/">
                {viewer?.isAdmin ? (
                  <ChartPie weight="duotone" className="mr-1.5 size-3.5" />
                ) : (
                  <NewspaperClipping
                    weight="duotone"
                    className="mr-1.5 size-3.5"
                  />
                )}
                {primaryNavLabel}
              </Link>
            </Button>

            {viewer?.isAdmin && (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={`h-8 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    pathname.startsWith("/admin/crm")
                      ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                      : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
                  }`}
                >
                  <Link href="/admin/crm">
                    <ChartLineUp weight="duotone" className="mr-1.5 size-3.5" />
                    CRM
                  </Link>
                </Button>

                <div
                  onMouseEnter={() => setIsClientsMenuOpen(true)}
                  onMouseLeave={() => setIsClientsMenuOpen(false)}
                >
                  <DropdownMenu
                    modal={false}
                    open={isClientsMenuOpen}
                    onOpenChange={setIsClientsMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`h-8 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                          pathname.startsWith("/admin/clients")
                            ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                            : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
                        }`}
                      >
                        <Users weight="duotone" className="mr-1.5 size-3.5" />
                        {t("clients.title")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48 rounded-2xl border-border/40 bg-background/95 p-1.5 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                      <DropdownMenuGroup className="grid gap-0.5">
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                        >
                          <Link
                            href="/admin/clients"
                            className="flex items-center"
                          >
                            <List
                              weight="bold"
                              className="mr-2.5 size-3.5 text-brand-primary/60"
                            />
                            <span className="font-bold uppercase tracking-tight text-[10px]">
                              {t("clients.list")}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                        >
                          <Link
                            href="/admin/clients/register"
                            className="flex items-center"
                          >
                            <Plus
                              weight="bold"
                              className="mr-2.5 size-3.5 text-brand-primary/60"
                            />
                            <span className="font-bold uppercase tracking-tight text-[10px]">
                              {t("clients.create")}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div
                  onMouseEnter={() => setIsProjectsMenuOpen(true)}
                  onMouseLeave={() => setIsProjectsMenuOpen(false)}
                >
                  <DropdownMenu
                    modal={false}
                    open={isProjectsMenuOpen}
                    onOpenChange={setIsProjectsMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`h-8 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                          pathname.startsWith("/admin/projects")
                            ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                            : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
                        }`}
                      >
                        <ProjectorScreen
                          weight="duotone"
                          className="mr-1.5 size-3.5"
                        />
                        {t("projects.title")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48 rounded-2xl border-border/40 bg-background/95 p-1.5 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                      <DropdownMenuGroup className="grid gap-0.5">
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                        >
                          <Link
                            href="/admin/projects"
                            className="flex items-center"
                          >
                            <List
                              weight="bold"
                              className="mr-2.5 size-3.5 text-brand-primary/60"
                            />
                            <span className="font-bold uppercase tracking-tight text-[10px]">
                              {t("projects.list")}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                        >
                          <Link
                            href="/admin/projects/register"
                            className="flex items-center"
                          >
                            <Plus
                              weight="bold"
                              className="mr-2.5 size-3.5 text-brand-primary/60"
                            />
                            <span className="font-bold uppercase tracking-tight text-[10px]">
                              {t("projects.create")}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!viewer ? (
            <div className="size-8 rounded-full bg-muted/20 animate-pulse" />
          ) : (
            <div className="flex items-center gap-3">
              <NotificationsDrawer notifications={notifications} />

              <div
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <DropdownMenu
                  modal={false}
                  open={isUserMenuOpen}
                  onOpenChange={setIsUserMenuOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <button className="group flex items-center gap-2 rounded-full p-1 transition-all outline-none focus-visible:ring-0 focus:ring-0">
                      <Avatar className="size-8 rounded-full border border-brand-primary/20 shadow-sm transition-transform group-hover:scale-105">
                        <AvatarImage
                          src={viewer.imageUrl ?? undefined}
                          alt={viewer.fullName || ""}
                        />
                        <AvatarFallback className="rounded-full bg-brand-primary/10 text-[8px] font-black uppercase text-brand-primary">
                          {viewer.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block truncate text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 group-hover:text-foreground/80 transition-colors">
                        {viewer.firstName || viewer.fullName?.split(" ")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-3xl border-border/40 bg-background/95 p-3 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center gap-4 p-3 mb-2 rounded-2xl bg-muted/5">
                      <Avatar className="h-10 w-10 rounded-full shadow-md">
                        <AvatarImage
                          src={viewer.imageUrl ?? undefined}
                          alt={viewer.fullName || ""}
                        />
                        <AvatarFallback className="rounded-xl text-brand-primary font-black uppercase">
                          {viewer.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left leading-tight overflow-hidden">
                        <span className="truncate font-heading text-sm font-black uppercase tracking-tight text-foreground">
                          {viewer.fullName}
                        </span>
                        <span className="truncate font-sans font-bold text-[9px] text-muted-foreground/60 uppercase tracking-widest">
                          {viewer.email}
                        </span>
                      </div>
                    </div>

                    <div className="lg:hidden p-2 grid gap-1 border-b border-border/10 mb-2">
                      <DropdownMenuItem
                        asChild
                        className="rounded-xl px-4 py-3 outline-none focus:ring-0"
                      >
                        <Link href="/" className="flex items-center">
                          {viewer?.isAdmin ? (
                            <ChartPie
                              weight="duotone"
                              className="mr-3 size-4 text-brand-primary/60"
                            />
                          ) : (
                            <NewspaperClipping
                              weight="duotone"
                              className="mr-3 size-4 text-brand-primary/60"
                            />
                          )}
                          <span className="font-sans font-bold uppercase tracking-widest text-[9px]">
                            {primaryNavLabel}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <div className="grid gap-3 px-3 py-2">
                      <HeaderLanguageSwitcher />
                      <HeaderThemeToggle />
                    </div>

                    <DropdownMenuSeparator className="bg-border/10 my-2" />

                    <SignOutButton>
                      <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer text-red-500 transition-all hover:bg-red-500/5 focus:bg-red-500/5 group/item outline-none focus:ring-0">
                        <SignOut
                          weight="bold"
                          className="size-5 text-red-500/60 group-hover/item:text-red-500"
                        />
                        <span className="font-sans font-bold uppercase tracking-widest text-[9px]">
                          {t("user.signOut")}
                        </span>
                      </DropdownMenuItem>
                    </SignOutButton>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {activePendingApproval && (
          <motion.div
            key={activePendingApproval.projectId}
            initial={{ opacity: 0, y: -14, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ delay: 0.32, duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden border-t border-sky-400/20 bg-linear-to-r from-sky-700 via-sky-600 to-cyan-600 text-white shadow-2xl shadow-sky-950/20"
          >
            <div className="mx-auto flex w-full max-w-440 flex-col gap-2 px-6 py-2 lg:flex-row lg:items-center lg:justify-between lg:px-12">
              <div className="flex min-w-0 flex-1 items-center gap-6">
                {pendingApprovals.length > 1 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevApproval}
                      className="size-6 rounded-full bg-white/5 hover:bg-white/10 text-white border-none transition-all active:scale-90"
                    >
                      <CaretLeft weight="bold" className="size-3" />
                    </Button>
                    <span className="min-w-[40px] text-center font-mono text-[10px] font-bold tracking-tighter text-white/40">
                      {currentApprovalIndex + 1}
                      <span className="mx-1 opacity-20">/</span>
                      {pendingApprovals.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextApproval}
                      className="size-6 rounded-full bg-white/5 hover:bg-white/10 text-white border-none transition-all active:scale-90"
                    >
                      <CaretRight weight="bold" className="size-3" />
                    </Button>
                  </div>
                )}

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                    <ClockCountdown
                      weight="fill"
                      className="size-4 text-white/80"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded bg-amber-600/40 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white ring-1 ring-amber-500/50">
                        {tApp("status.PENDING")}
                      </span>
                      <p className="truncate font-heading text-[10px] font-black uppercase leading-none tracking-widest text-white/60">
                        {activePendingApproval.projectName}
                      </p>
                    </div>
                    <p className="mt-1 truncate font-sans text-xs font-medium leading-none text-white sm:text-sm">
                      {activePendingApproval.lastUpdateTitle}
                    </p>
                  </div>
                </div>
              </div>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    className="h-8 shrink-0 rounded-full border border-white/20 bg-white/10 px-6 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/20 active:scale-95"
                  >
                    {tDashboard("banner.cta")}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[94vw] border-l border-border/30 bg-background/95 p-0 sm:min-w-[38rem] sm:max-w-[40vw]"
                >
                  <SheetHeader className="border-b border-border/20 bg-gradient-to-b from-brand-primary/6 to-transparent px-7 py-7">
                    <div className="flex items-start justify-between gap-5 pr-10">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex size-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                            <ClockCountdown
                              weight="fill"
                              className="size-3.5"
                            />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
                            {activePendingApproval.projectName}
                          </span>
                        </div>
                        <SheetTitle className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                          {activePendingApproval.lastUpdateTitle}
                        </SheetTitle>
                        {activePendingApproval.lastUpdateDescription && (
                          <SheetDescription className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground/60">
                            {activePendingApproval.lastUpdateDescription}
                          </SheetDescription>
                        )}
                      </div>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 border-t border-border/10">
                    <div className="flex flex-col gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            weight="fill"
                            className="size-4 text-emerald-500"
                          />
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/70">
                            {tApp("actions.approve")}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tApp("dialog.description")}
                        </p>
                        <Button
                          onClick={handleApprove}
                          disabled={isApproving}
                          className="h-12 w-full sm:w-auto rounded-full bg-foreground px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background transition-transform"
                        >
                          {isApproving ? (
                            <CircleNotch className="mr-2 size-4 animate-spin" />
                          ) : (
                            <HandsClapping
                              className="mr-2 size-4"
                              weight="fill"
                            />
                          )}
                          {tApp("actions.approve")}
                        </Button>
                      </div>

                      <div className="h-px w-full bg-border/10 my-2" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <NotePencil
                            weight="fill"
                            className="size-4 text-amber-500"
                          />
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/70">
                            {tApp("actions.reject")}
                          </h4>
                        </div>
                        <Textarea
                          value={feedback}
                          onChange={(event) => setFeedback(event.target.value)}
                          className="min-h-[160px] resize-none rounded-2xl border-border/40 bg-muted/10 p-5 text-sm leading-relaxed"
                          placeholder={tApp("dialog.placeholder")}
                        />
                        <Button
                          onClick={handleReject}
                          disabled={isRejecting || feedback.trim().length < 10}
                          variant="outline"
                          className="h-12 w-full sm:w-auto rounded-full border-border/40 bg-background px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-foreground/82 transition-transform hover:bg-background"
                        >
                          {isRejecting ? (
                            <CircleNotch className="mr-2 size-4 animate-spin" />
                          ) : (
                            <NotePencil className="mr-2 size-4" />
                          )}
                          {tApp("actions.send_feedback")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="bg-background/80 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 border-t border-border/10">
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="font-mono text-[10px] font-black uppercase tracking-[0.3em]"
                      >
                        {tApp("actions.cancel")}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
