"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import { SignOutButton, useUser } from "@clerk/nextjs"
import {
  CaretDown,
  ChartPie,
  Files,
  Gear,
  Plus,
  ProjectorScreen,
  SignOut,
  UserCircle,
  Users,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/src/components/ui/sidebar"
import { Skeleton } from "@/src/components/ui/skeleton"

import { AdminOnly } from "@/src/components/common/can"
import { Logo } from "@/src/components/common/logo"

import { usePermissions } from "@/src/hooks/use-permissions"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const { isLoaded } = usePermissions()
  const t = useTranslations("Sidebar")
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  // Close mobile sidebar on navigation
  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent"
            >
              <Link href="/">
                <Logo width={140} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <ChartPie weight="duotone" />
                    <span>{t("dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <AdminOnly
                loadingFallback={
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <Skeleton className="size-4 shrink-0" />
                      <Skeleton className="h-4 w-24" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                }
              >
                <Collapsible
                  asChild
                  defaultOpen={pathname.toString().startsWith("/admin/clients")}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={t("clients.title")}>
                        <Users weight="duotone" />
                        <span>{t("clients.title")}</span>
                        <CaretDown
                          weight="duotone"
                          className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === "/admin/clients"}
                          >
                            <Link href="/admin/clients">
                              <Files weight="duotone" />
                              <span>{t("clients.list")}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === "/admin/clients/register"}
                          >
                            <Link href="/admin/clients/register">
                              <Plus weight="duotone" />
                              <span>{t("clients.create")}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible
                  asChild
                  defaultOpen={pathname
                    .toString()
                    .startsWith("/admin/projects")}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={t("projects.title")}>
                        <ProjectorScreen weight="duotone" />
                        <span>{t("projects.title")}</span>
                        <CaretDown
                          weight="duotone"
                          className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === "/admin/projects"}
                          >
                            <Link href="/admin/projects">
                              <Files weight="duotone" />
                              <span>{t("projects.list")}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === "/admin/projects/register"}
                          >
                            <Link href="/admin/projects/register">
                              <Plus weight="duotone" />
                              <span>{t("projects.create")}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </AdminOnly>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {!isLoaded ? (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="grid flex-1 gap-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName || ""}
                      />
                      <AvatarFallback className="rounded-lg text-[10px] font-black uppercase">
                        {user?.fullName?.charAt(0) ||
                          user?.primaryEmailAddress?.emailAddress.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold uppercase tracking-tight text-[11px]">
                        {user?.fullName}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground/60">
                        {user?.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>
                    <CaretDown weight="duotone" className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName || ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.fullName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle weight="duotone" />
                    <span>{t("user.profile")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Gear weight="duotone" />
                    <span>{t("user.settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton>
                    <DropdownMenuItem>
                      <SignOut weight="duotone" />
                      <span>{t("user.signOut")}</span>
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
