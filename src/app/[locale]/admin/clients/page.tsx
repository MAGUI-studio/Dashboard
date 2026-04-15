import * as React from "react"

import { getTranslations } from "next-intl/server"
import Link from "next/link"

import { clerkClient } from "@clerk/nextjs/server"

import { Button } from "@/src/components/ui/button"

export default async function ClientsPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Admin.clients")
  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({
    orderBy: "-created_at",
    limit: 10,
  })

  return (
    <main className="flex min-h-svh flex-col gap-8 bg-background p-6 lg:p-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
            Management
          </p>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-5xl">
            {t("title")}
          </h1>
        </div>
        <Button asChild className="rounded-full px-8 uppercase tracking-widest">
          <Link href="/admin/clients/create">{t("create")}</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/10 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("table.name")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("table.email")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("table.role")}
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-muted/10"
                >
                  <td className="px-6 py-4">
                    <span className="font-sans text-sm font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-sans text-xs text-muted-foreground">
                      {user.emailAddresses[0]?.emailAddress}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-brand-primary/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                      {(user.publicMetadata?.role as string) || "client"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] font-black uppercase tracking-widest"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
