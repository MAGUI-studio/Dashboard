import * as React from "react"

import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { clerkClient } from "@clerk/nextjs/server"
import { UserPlus } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ClientsTable } from "@/src/components/admin/ClientsTable"

import { isAdmin } from "@/src/lib/permissions"

export default async function ClientsPage(): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const t = await getTranslations("Admin.clients")
  const client = await clerkClient()

  const { data: allUsers } = await client.users.getUserList({
    limit: 100,
  })

  // Map to serializable data for Client Component
  const serializableUsers = allUsers.map((user) => ({
    id: user.id,
    imageUrl: user.imageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddresses: user.emailAddresses.map((e) => ({
      emailAddress: e.emailAddress,
    })),
    publicMetadata: user.publicMetadata as { role?: string },
  }))

  return (
    <main className="relative flex min-h-svh flex-col gap-10 bg-background/50 p-6 lg:p-12 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            {t("description")}
          </p>
        </div>

        <Button
          asChild
          className="group relative h-14 overflow-hidden rounded-full px-10 font-sans font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-primary/20"
        >
          <Link
            href="/admin/clients/register"
            className="flex items-center gap-3"
          >
            <UserPlus
              weight="duotone"
              className="size-5 transition-transform group-hover:rotate-12"
            />
            <span>{t("create")}</span>
          </Link>
        </Button>
      </div>

      <ClientsTable initialUsers={serializableUsers} />
    </main>
  )
}
