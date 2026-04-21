import * as React from "react"

import { redirect } from "next/navigation"

import { AdminSearchPage } from "@/src/components/admin/AdminSearchPage"

import { isAdmin } from "@/src/lib/permissions"
import { searchAdminGlobal } from "@/src/lib/actions/search.actions"

export default async function AdminSearchRoute({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const initialQuery = resolvedSearchParams?.q?.trim() ?? ""
  const initialResults =
    initialQuery.length >= 2
      ? await searchAdminGlobal(initialQuery, "full")
      : []

  return (
    <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <AdminSearchPage
        initialQuery={initialQuery}
        initialResults={initialResults}
      />
    </main>
  )
}
