import * as React from "react"

import { auth } from "@clerk/nextjs/server"

import { NotificationsInbox } from "@/src/components/common/NotificationsInbox"

import { getClientNotifications } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Notificacoes",
  description:
    "Caixa autenticada de notificacoes e avisos operacionais da MAGUI.studio.",
  path: "/notifications",
})

interface NotificationsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps): Promise<React.JSX.Element> {
  const { userId: clerkId } = await auth()

  if (!clerkId) return <div />

  const { page } = await searchParams
  const currentPage = Number(page) || 1

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })

  if (!user) return <div />

  const { notifications, totalPages } = await getClientNotifications(
    user.id,
    currentPage,
    50
  )

  return (
    <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="mx-auto w-full max-w-5xl">
        <NotificationsInbox
          notifications={notifications}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </div>
    </main>
  )
}
