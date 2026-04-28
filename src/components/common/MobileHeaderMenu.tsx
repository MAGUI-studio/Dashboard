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
        className="w-full border-l border-border/30 bg-background/90 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-md"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border/10 p-8 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-heading text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
                {t("menu")}
              </SheetTitle>
              <SheetClose className="rounded-2xl bg-muted/5 p-3 transition-colors hover:bg-muted/10">
                <X weight="bold" className="size-6" />
              </SheetClose>
            </div>

            <div className="mt-12 flex items-center gap-5 rounded-[2rem] bg-brand-primary/5 p-6 ring-1 ring-brand-primary/10">
              <Avatar className="h-16 w-16 rounded-2xl border border-brand-primary/20 shadow-xl">
                <AvatarImage
                  src={viewer.imageUrl ?? undefined}
                  alt={viewer.fullName || ""}
                />
                <AvatarFallback className="rounded-2xl bg-brand-primary/10 text-xl font-black uppercase text-brand-primary">
                  {viewer.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate font-heading text-xl font-black uppercase tracking-tight text-foreground">
                  {viewer.fullName}
                </span>
                <span className="truncate font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">
                  {viewer.email}
                </span>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <nav className="grid gap-3">
              {viewer.isAdmin ? (
                <>
                  <SheetClose asChild>
                    <Link
                      href={adminNav.dashboard.href}
                      className={`flex h-16 items-center gap-5 rounded-3xl px-6 transition-all active:scale-[0.98] ${
                        isNavItemActive(pathname, adminNav.dashboard)
                          ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                          : "bg-muted/5 text-muted-foreground/60 hover:bg-muted/10 hover:text-foreground"
                      }`}
                    >
                      <NavIcon
                        icon={adminNav.dashboard.icon}
                        className="size-7"
                      />
                      <span className="font-sans text-xs font-black uppercase tracking-[0.3em]">
                        {adminNav.dashboard.label}
                      </span>
                    </Link>
                  </SheetClose>

                  {adminNav.groups.map((group) => {
                    const defaultOpen = group.items.some((item) =>
                      isNavItemActive(pathname, item)
                    )

                    return (
                      <Collapsible
                        key={group.label}
                        defaultOpen={defaultOpen}
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger className="flex h-16 w-full items-center justify-between rounded-3xl bg-muted/5 px-6 text-left transition-all hover:bg-muted/10">
                          <div className="flex items-center gap-5">
                            <NavIcon
                              icon={group.icon}
                              className="size-7 text-brand-primary"
                            />
                            <span className="font-sans text-xs font-black uppercase tracking-[0.3em] text-foreground">
                              {group.label}
                            </span>
                          </div>
                          <CaretDown className="size-5 text-muted-foreground/50 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-3 grid gap-3 pl-6">
                          {group.items.map((item) => (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={`flex min-h-[56px] items-center gap-4 rounded-[1.5rem] px-5 transition-all active:scale-[0.98] ${
                                  isNavItemActive(pathname, item)
                                    ? "bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20"
                                    : "bg-muted/5 text-muted-foreground/60 hover:bg-muted/10 hover:text-foreground"
                                }`}
                              >
                                <NavIcon icon={item.icon} className="size-5" />
                                <div className="flex flex-col">
                                  <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-tight">
                                      {item.description}
                                    </span>
                                  )}
                                </div>
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
