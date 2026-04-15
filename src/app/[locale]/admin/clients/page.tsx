import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import { clerkClient } from "@clerk/nextjs/server"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

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
          <Link href="/admin/clients/register">{t("create")}</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/10 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.name")}
              </TableHead>
              <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.email")}
              </TableHead>
              <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.role")}
              </TableHead>
              <TableHead className="px-6 h-12 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-border/20 transition-colors hover:bg-muted/10"
              >
                <TableCell className="px-6 py-4">
                  <span className="font-sans text-sm font-bold text-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="font-sans text-xs text-muted-foreground">
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    variant="secondary"
                    className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-transparent text-[10px] font-black uppercase tracking-widest"
                  >
                    {(user.publicMetadata?.role as string) || "client"}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] font-black uppercase tracking-widest"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
