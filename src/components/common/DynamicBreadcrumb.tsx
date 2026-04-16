"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"

import { AppPathnames } from "@/src/i18n/config"
import { Link } from "@/src/i18n/navigation"
import { CaretRight, List } from "@phosphor-icons/react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const t = useTranslations("Sidebar")

  // Split the pathname into segments
  const segments = pathname.split("/").filter(Boolean)

  // Remove the locale segment (e.g., 'en' or 'pt')
  const segmentsWithoutLocale = segments.slice(1)

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1.5 sm:gap-2">
        <BreadcrumbItem>
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-2 py-1 transition-colors hover:bg-muted/40">
            <List weight="bold" className="size-3 text-muted-foreground/60" />
            <BreadcrumbLink
              asChild
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-brand-primary"
            >
              <Link href="/">{t("dashboard")}</Link>
            </BreadcrumbLink>
          </div>
        </BreadcrumbItem>

        {segmentsWithoutLocale.length > 0 && (
          <BreadcrumbSeparator className="text-muted-foreground/30">
            <CaretRight weight="bold" />
          </BreadcrumbSeparator>
        )}

        {segmentsWithoutLocale.map((segment, index) => {
          const href =
            `/${segmentsWithoutLocale.slice(0, index + 1).join("/")}` as AppPathnames
          const isLast = index === segmentsWithoutLocale.length - 1

          let label = segment.charAt(0).toUpperCase() + segment.slice(1)

          if (segment === "admin") label = "Admin"
          if (segment === "clients") label = t("clients.title")
          if (segment === "register") label = t("clients.create")

          return (
            <React.Fragment key={segment}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-foreground">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-brand-primary"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Link href={href as any}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="text-muted-foreground/30">
                  <CaretRight weight="bold" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
