"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import { SignOutButton } from "@clerk/nextjs"
import {
  ChartLineUp,
  ChartPie,
  House,
  List,
  ProjectorScreen,
  SignOut,
  Users,
  X,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
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

interface MobileHeaderMenuProps {
  viewer: {
    email: string | null
    firstName: string | null
    fullName: string | null
    imageUrl: string | null
    isAdmin: boolean
  } | null
}

export function MobileHeaderMenu({
  viewer,
}: MobileHeaderMenuProps): React.JSX.Element {
  const t = useTranslations("Sidebar")
  const pathname = usePathname()

  if (!viewer)
    return (
      <div className="size-9 rounded-full bg-muted/20 animate-pulse lg:hidden" />
    )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full bg-muted/5 hover:bg-muted/10 lg:hidden focus-visible:ring-0"
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
              <SheetClose className="rounded-full p-2 hover:bg-muted/10 transition-colors">
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
              <div className="grid flex-1 text-left leading-tight overflow-hidden">
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
              <SheetClose asChild>
                <Link
                  href="/"
                  className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                    pathname === "/"
                      ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                      : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                  }`}
                >
                  {viewer.isAdmin ? (
                    <ChartPie weight="duotone" className="size-6" />
                  ) : (
                    <House weight="duotone" className="size-6" />
                  )}
                  <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                    {viewer.isAdmin ? t("dashboard") : t("client.home")}
                  </span>
                </Link>
              </SheetClose>

              {!viewer.isAdmin && (
                <SheetClose asChild>
                  <Link
                    href="/projects"
                    className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                      pathname.startsWith("/projects")
                        ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                        : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                    }`}
                  >
                    <ProjectorScreen weight="duotone" className="size-6" />
                    <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                      {t("client.projects")}
                    </span>
                  </Link>
                </SheetClose>
              )}

              {viewer.isAdmin && (
                <>
                  <div className="my-4 h-px bg-border/5" />

                  <SheetClose asChild>
                    <Link
                      href="/admin/crm"
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        pathname.startsWith("/admin/crm")
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <ChartLineUp weight="duotone" className="size-6" />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {t("commercial.title")}
                      </span>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/admin/crm/register"
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        pathname === "/admin/crm/register"
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <ChartLineUp weight="duotone" className="size-6" />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {t("commercial.create")}
                      </span>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/admin/crm/proposals"
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        pathname.startsWith("/admin/crm/proposals")
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <ChartLineUp weight="duotone" className="size-6" />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {t("commercial.proposals")}
                      </span>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/admin/crm/proposals/new"
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        pathname === "/admin/crm/proposals/new"
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <ChartLineUp weight="duotone" className="size-6" />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {t("commercial.proposal_create")}
                      </span>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/admin/clients"
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        pathname.startsWith("/admin/clients")
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <Users weight="duotone" className="size-6" />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {t("clients.title")}
                      </span>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/admin/projects"
                      className={`flex h-14 items-center gap-4 rounded-2xl px-5 transition-all active:scale-[0.98] ${
                        pathname.startsWith("/admin/projects")
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                      }`}
                    >
                      <ProjectorScreen weight="duotone" className="size-6" />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
                        {t("projects.title")}
                      </span>
                    </Link>
                  </SheetClose>
                </>
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
