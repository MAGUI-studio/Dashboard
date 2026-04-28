"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import { SignOutButton } from "@clerk/nextjs"
import {
  CaretDown,
  ChartLineUp,
  ChartPie,
  Files,
  House,
  List,
  ProjectorScreen,
  SignOut,
  Tag,
  Users,
  X,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"

import { HeaderLanguageSwitcher } from "@/src/components/common/HeaderLanguageSwitcher"
import { HeaderThemeToggle } from "@/src/components/common/HeaderThemeToggle"
import {
  type HeaderNavLeaf,
  getAdminHeaderNav,
  getClientHeaderNav,
  isNavItemActive,
} from "@/src/components/common/header/navigation"

interface MobileHeaderMenuProps {
  viewer: {
    email: string | null
    firstName: string | null
    fullName: string | null
    imageUrl: string | null
    isAdmin: boolean
  } | null
}

function NavIcon({
  icon,
  className,
}: {
  icon: HeaderNavLeaf["icon"]
  className?: string
}) {
  switch (icon) {
    case "dashboard":
      return <ChartPie weight="duotone" className={className} />
    case "home":
      return <House weight="duotone" className={className} />
    case "crm":
      return <ChartLineUp weight="duotone" className={className} />
    case "clients":
      return <Users weight="duotone" className={className} />
    case "documents":
      return <Files weight="duotone" className={className} />
    case "projects":
      return <ProjectorScreen weight="duotone" className={className} />
    case "tag":
      return <Tag weight="bold" className={className} />
    case "list":
    case "plus":
    default:
      return <List weight="duotone" className={className} />
  }
}

export function MobileHeaderMenu({
  viewer,
}: MobileHeaderMenuProps): React.JSX.Element {
  const t = useTranslations("Sidebar")
  const pathname = usePathname()

  if (!viewer) {
    return (
      <div className="size-9 animate-pulse rounded-full bg-muted/20 lg:hidden" />
    )
  }

  const adminNav = getAdminHeaderNav(t)
  const clientNav = getClientHeaderNav(t)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full bg-muted/5 hover:bg-muted/10 lg:hidden"
          aria-label={t("menu")}
        >
          <List weight="bold" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full border-l border-border/30 bg-background p-0 sm:max-w-sm"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border/10 p-5 pt-8 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-heading text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                {t("menu")}
              </SheetTitle>
              <SheetClose className="rounded-full p-2 transition-colors hover:bg-muted/10">
                <X weight="bold" className="size-5" />
              </SheetClose>
            </div>

            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-muted/5 p-4">
              <Avatar className="h-12 w-12 rounded-full border border-brand-primary/20 shadow-md">
                <AvatarImage
                  src={viewer.imageUrl ?? undefined}
                  alt={viewer.fullName || ""}
                />
                <AvatarFallback className="rounded-full bg-brand-primary/10 text-xs font-black uppercase text-brand-primary">
                  {viewer.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate font-heading text-base font-black uppercase tracking-tight text-foreground">
                  {viewer.fullName}
                </span>
                <span className="truncate font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {viewer.email}
                </span>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5">
            <nav className="grid gap-2">
              {viewer.isAdmin ? (
                <>
                  <SheetClose asChild>
                    <Link
                      href={adminNav.dashboard.href}
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        isNavItemActive(pathname, adminNav.dashboard)
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <NavIcon
                        icon={adminNav.dashboard.icon}
                        className="size-6"
                      />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {adminNav.dashboard.label}
                      </span>
                    </Link>
                  </SheetClose>

                  {adminNav.groups.map((group) => {
                    const defaultOpen = group.items.some((item) =>
                      isNavItemActive(pathname, item)
                    )

                    return (
                      <Collapsible key={group.label} defaultOpen={defaultOpen}>
                        <CollapsibleTrigger className="flex h-14 w-full items-center justify-between rounded-2xl px-5 text-left transition-all hover:bg-muted/5">
                          <div className="flex items-center gap-4">
                            <NavIcon
                              icon={group.icon}
                              className="size-6 text-brand-primary/70"
                            />
                            <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                              {group.label}
                            </span>
                          </div>
                          <CaretDown className="size-4 text-muted-foreground/50" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 grid gap-2 pl-4">
                          {group.items.map((item) => (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 transition-all active:scale-[0.98] ${
                                  isNavItemActive(pathname, item)
                                    ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                                    : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                                }`}
                              >
                                <NavIcon icon={item.icon} className="size-4" />
                                <span className="font-sans text-[10px] font-black uppercase tracking-[0.18em]">
                                  {item.label}
                                </span>
                              </Link>
                            </SheetClose>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  })}
                </>
              ) : (
                clientNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        isNavItemActive(pathname, item)
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <NavIcon icon={item.icon} className="size-6" />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {item.label}
                      </span>
                    </Link>
                  </SheetClose>
                ))
              )}
            </nav>

            <div className="mt-8 grid gap-4 border-t border-border/10 pt-8">
              <div className="px-2">
                <HeaderLanguageSwitcher />
              </div>
              <div className="px-2">
                <HeaderThemeToggle />
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-border/10 p-5">
            <SignOutButton>
              <button className="group flex w-full items-center gap-4 rounded-2xl bg-red-500/5 p-4 text-red-500 transition-all active:scale-[0.98]">
                <SignOut
                  weight="bold"
                  className="size-6 opacity-60 group-hover:opacity-100"
                />
                <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                  {t("user.signOut")}
                </span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
