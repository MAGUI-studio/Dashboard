"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
  const t = useTranslations("Sidebar") // Reusing Sidebar translations for simplicity or we can use another namespace

  // Split the pathname into segments
  const segments = pathname.split("/").filter(Boolean)

  // Remove the locale segment (e.g., 'en' or 'pt')
  const segmentsWithoutLocale = segments.slice(1)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/">{t("dashboard")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segmentsWithoutLocale.length > 0 && (
          <BreadcrumbSeparator className="hidden md:block" />
        )}

        {segmentsWithoutLocale.map((segment, index) => {
          const href = `/${segments[0]}/${segmentsWithoutLocale.slice(0, index + 1).join("/")}`
          const isLast = index === segmentsWithoutLocale.length - 1

          // Try to translate the segment
          // We might need a specific mapping for segments to translation keys
          let label = segment.charAt(0).toUpperCase() + segment.slice(1)

          // Example mapping for common segments
          if (segment === "admin") label = "Admin"
          if (segment === "clients") label = t("clients.title")
          if (segment === "register") label = t("clients.create")

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
