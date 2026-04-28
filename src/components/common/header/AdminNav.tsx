"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import {
  CaretDown,
  ChartLineUp,
  ChartPie,
  Files,
  House,
  List,
  Plus,
  ProjectorScreen,
  Tag,
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

import {
  type HeaderNavLeaf,
  getAdminHeaderNav,
  getClientHeaderNav,
  isNavItemActive,
} from "./navigation"

interface AdminNavProps {
  isAdmin?: boolean
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
    case "plus":
      return <Plus weight="bold" className={className} />
    case "tag":
      return <Tag weight="bold" className={className} />
    case "list":
    default:
      return <List weight="bold" className={className} />
  }
}

export function AdminNav({ isAdmin }: AdminNavProps) {
  const t = useTranslations("Sidebar")
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = React.useState<string | null>(null)

  const clientItems = getClientHeaderNav(t)
  const adminNav = getAdminHeaderNav(t)

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {isAdmin ? (
        <>
          <Button
            variant="ghost"
            asChild
            className={`h-9 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
              isNavItemActive(pathname, adminNav.dashboard)
                ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                : "text-muted-foreground/55 hover:bg-muted/10 hover:text-foreground"
            }`}
          >
            <Link href={adminNav.dashboard.href}>
              <NavIcon
                icon={adminNav.dashboard.icon}
                className="mr-1.5 size-3.5"
              />
              {adminNav.dashboard.label}
            </Link>
          </Button>

          {adminNav.groups.map((group) => {
            const isActive = group.items.some((item) =>
              isNavItemActive(pathname, item)
            )

            return (
              <div
                key={group.label}
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() =>
                  setOpenGroup((current) =>
                    current === group.label ? null : current
                  )
                }
              >
                <DropdownMenu
                  modal={false}
                  open={openGroup === group.label}
                  onOpenChange={(open) =>
                    setOpenGroup(open ? group.label : null)
                  }
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`h-9 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                        isActive
                          ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                          : "text-muted-foreground/55 hover:bg-muted/10 hover:text-foreground"
                      }`}
                    >
                      <NavIcon icon={group.icon} className="mr-1.5 size-3.5" />
                      {group.label}
                      <CaretDown className="ml-1.5 size-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 rounded-2xl border-border/40 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl"
                  >
                    <DropdownMenuGroup className="grid gap-0.5">
                      {group.items.map((item) => (
                        <DropdownMenuItem
                          key={item.href}
                          asChild
                          className="rounded-lg px-2.5 py-2 outline-none transition-colors focus:bg-brand-primary/10 focus:text-brand-primary"
                        >
                          <Link href={item.href} className="flex items-center">
                            <NavIcon
                              icon={item.icon}
                              className="mr-2.5 size-3.5 text-brand-primary/60"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                              {item.label}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </>
      ) : (
        clientItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={`h-9 rounded-full px-4 text-[8.5px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
              isNavItemActive(pathname, item)
                ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                : "text-muted-foreground/55 hover:bg-muted/10 hover:text-foreground"
            }`}
          >
            <Link href={item.href}>
              <NavIcon icon={item.icon} className="mr-1.5 size-3.5" />
              {item.label}
            </Link>
          </Button>
        ))
      )}
    </nav>
  )
}
