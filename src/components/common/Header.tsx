"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Link, usePathname } from "@/src/i18n/navigation"
import { DashboardNotification } from "@/src/types/dashboard"
import { SignOutButton, useUser } from "@clerk/nextjs"
import {
  ChartLineUp,
  ChartPie,
  Gear,
  List,
  Plus,
  ProjectorScreen,
  SignOut,
  UserCircle,
  Users,
} from "@phosphor-icons/react"

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

import { NotificationsDrawer } from "@/src/components/common/NotificationsDrawer"
import { AdminOnly } from "@/src/components/common/can"
import { LanguageSwitcher } from "@/src/components/common/languageSwitcher"
import { Logo } from "@/src/components/common/logo"
import { ThemeToggle } from "@/src/components/common/themeToggle"

import { usePermissions } from "@/src/hooks/use-permissions"

interface HeaderProps {
  notifications?: DashboardNotification[]
}

export function Header({ notifications = [] }: HeaderProps): React.JSX.Element {
  const { user } = useUser()
  const { isLoaded } = usePermissions()
  const router = useRouter()
  const t = useTranslations("Sidebar")
  const pathname = usePathname()
  const lastRefreshAtRef = React.useRef(0)

  const [isClientsMenuOpen, setIsClientsMenuOpen] = React.useState(false)
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)

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
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-440 items-center justify-between px-6 lg:px-12">
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
                <ChartPie weight="duotone" className="mr-1.5 size-3.5" />
                {t("dashboard")}
              </Link>
            </Button>

            <AdminOnly>
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
            </AdminOnly>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {!isLoaded ? (
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
                          src={user?.imageUrl}
                          alt={user?.fullName || ""}
                        />
                        <AvatarFallback className="rounded-full bg-brand-primary/10 text-[8px] font-black uppercase text-brand-primary">
                          {user?.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block truncate text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 group-hover:text-foreground/80 transition-colors">
                        {user?.firstName || user?.fullName?.split(" ")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-[2rem] border-border/40 bg-background/95 p-3 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center gap-4 p-3 mb-2 rounded-2xl bg-muted/5">
                      <Avatar className="h-10 w-10 rounded-xl border-2 border-brand-primary/20 shadow-md">
                        <AvatarImage
                          src={user?.imageUrl}
                          alt={user?.fullName || ""}
                        />
                        <AvatarFallback className="rounded-xl text-brand-primary font-black uppercase">
                          {user?.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left leading-tight overflow-hidden">
                        <span className="truncate font-heading text-sm font-black uppercase tracking-tight text-foreground">
                          {user?.fullName}
                        </span>
                        <span className="truncate font-sans font-bold text-[9px] text-muted-foreground/60 uppercase tracking-widest">
                          {user?.primaryEmailAddress?.emailAddress}
                        </span>
                      </div>
                    </div>

                    <div className="lg:hidden p-2 grid gap-1 border-b border-border/10 mb-2">
                      <DropdownMenuItem
                        asChild
                        className="rounded-xl px-4 py-3 outline-none focus:ring-0"
                      >
                        <Link href="/" className="flex items-center">
                          <ChartPie
                            weight="duotone"
                            className="mr-3 size-4 text-brand-primary/60"
                          />
                          <span className="font-sans font-bold uppercase tracking-widest text-[9px]">
                            {t("dashboard")}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <div className="grid gap-1 mt-1">
                      <DropdownMenuItem className="rounded-xl px-4 py-2.5 cursor-pointer transition-all hover:bg-brand-primary/5 focus:bg-brand-primary/5 group/item outline-none focus:ring-0">
                        <UserCircle
                          weight="duotone"
                          className="size-5 text-brand-primary/60 group-hover/item:text-brand-primary"
                        />
                        <span className="font-sans font-bold uppercase tracking-widest text-[9px]">
                          {t("user.profile")}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl px-4 py-2.5 cursor-pointer transition-all hover:bg-brand-primary/5 focus:bg-brand-primary/5 group/item outline-none focus:ring-0">
                        <Gear
                          weight="duotone"
                          className="size-5 text-brand-primary/60 group-hover/item:text-brand-primary"
                        />
                        <span className="font-sans font-bold uppercase tracking-widest text-[9px]">
                          {t("user.settings")}
                        </span>
                      </DropdownMenuItem>
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
      </div>
    </header>
  )
}
