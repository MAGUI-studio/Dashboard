"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { SignOutButton } from "@clerk/nextjs"
import { SignOut } from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import { HeaderLanguageSwitcher } from "@/src/components/common/HeaderLanguageSwitcher"
import { HeaderThemeToggle } from "@/src/components/common/HeaderThemeToggle"

interface UserMenuProps {
  viewer: {
    email: string | null
    firstName: string | null
    fullName: string | null
    imageUrl: string | null
    isAdmin: boolean
  }
}

export function UserMenu({ viewer }: UserMenuProps) {
  const t = useTranslations("Sidebar")
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div
      className="hidden lg:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
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
            <div className="hidden lg:grid text-left leading-tight">
              <span className="max-w-40 truncate text-[9px] font-black uppercase tracking-[0.2em] text-foreground/55 group-hover:text-foreground/85 transition-colors">
                {viewer.firstName || viewer.fullName?.split(" ")[0]}
              </span>
              <span className="max-w-40 truncate text-[8px] font-bold tracking-[0.12em] text-muted-foreground/60 transition-colors group-hover:text-muted-foreground/80">
                {viewer.email}
              </span>
            </div>
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
  )
}
