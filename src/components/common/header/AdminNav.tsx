"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import {
  ChartLineUp,
  ChartPie,
  Files,
  House,
  List,
  Plus,
  ProjectorScreen,
  Users,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

interface AdminNavProps {
  isAdmin?: boolean
}

export function AdminNav({ isAdmin }: AdminNavProps) {
  const t = useTranslations("Sidebar")
  const pathname = usePathname()

  const [isClientsOpen, setIsClientsOpen] = React.useState(false)
  const [isCommercialOpen, setIsCommercialOpen] = React.useState(false)
  const [isDocumentsOpen, setIsDocumentsOpen] = React.useState(false)
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(false)

  return (
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
          {isAdmin ? (
            <ChartPie weight="duotone" className="mr-1.5 size-3.5" />
          ) : (
            <House weight="duotone" className="mr-1.5 size-3.5" />
          )}
          {isAdmin ? t("dashboard") : t("client.home")}
        </Link>
      </Button>

      {!isAdmin && (
        <Button
          variant="ghost"
          asChild
          className={`h-8 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
            pathname.startsWith("/projects")
              ? "bg-brand-primary/10 text-brand-primary shadow-sm"
              : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
          }`}
        >
          <Link href="/projects">
            <ProjectorScreen weight="duotone" className="mr-1.5 size-3.5" />
            {t("client.projects")}
          </Link>
        </Button>
      )}

      {isAdmin && (
        <>
          <div
            onMouseEnter={() => setIsCommercialOpen(true)}
            onMouseLeave={() => setIsCommercialOpen(false)}
          >
            <DropdownMenu
              modal={false}
              open={isCommercialOpen}
              onOpenChange={setIsCommercialOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`h-8 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    pathname.startsWith("/admin/crm")
                      ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                      : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
                  }`}
                >
                  <ChartLineUp weight="duotone" className="mr-1.5 size-3.5" />
                  {t("commercial.title")}
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
                    <Link href="/admin/crm" className="flex items-center">
                      <List
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t("commercial.list")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                  >
                    <Link
                      href="/admin/crm/register"
                      className="flex items-center"
                    >
                      <Plus
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t("commercial.create")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                  >
                    <Link
                      href="/admin/crm/proposals"
                      className="flex items-center"
                    >
                      <List
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t("commercial.proposals")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                  >
                    <Link
                      href="/admin/crm/proposals/new"
                      className="flex items-center"
                    >
                      <Plus
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t("commercial.proposal_create")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div
            onMouseEnter={() => setIsClientsOpen(true)}
            onMouseLeave={() => setIsClientsOpen(false)}
          >
            <DropdownMenu
              modal={false}
              open={isClientsOpen}
              onOpenChange={setIsClientsOpen}
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
                    <Link href="/admin/clients" className="flex items-center">
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
            onMouseEnter={() => setIsDocumentsOpen(true)}
            onMouseLeave={() => setIsDocumentsOpen(false)}
          >
            <DropdownMenu
              modal={false}
              open={isDocumentsOpen}
              onOpenChange={setIsDocumentsOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`h-8 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    pathname.startsWith("/admin/documents")
                      ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                      : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
                  }`}
                >
                  <Files weight="duotone" className="mr-1.5 size-3.5" />
                  {t("documents.title")}
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
                    <Link href="/admin/documents" className="flex items-center">
                      <List
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t("documents.list")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg px-2.5 py-2 cursor-pointer transition-colors focus:bg-brand-primary/10 focus:text-brand-primary outline-none focus:ring-0"
                  >
                    <Link
                      href="/admin/documents/new"
                      className="flex items-center"
                    >
                      <Plus
                        weight="bold"
                        className="mr-2.5 size-3.5 text-brand-primary/60"
                      />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t("documents.create")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div
            onMouseEnter={() => setIsProjectsOpen(true)}
            onMouseLeave={() => setIsProjectsOpen(false)}
          >
            <DropdownMenu
              modal={false}
              open={isProjectsOpen}
              onOpenChange={setIsProjectsOpen}
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
                    <Link href="/admin/projects" className="flex items-center">
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
  )
}
