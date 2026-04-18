import * as React from "react"

import { auth } from "@clerk/nextjs/server"

import { NotificationsInbox } from "@/src/components/common/NotificationsInbox"

import prisma from "@/src/lib/prisma"

export default async function NotificationsPage(): Promise<React.JSX.Element> {
  const { userId } = await auth()

  if (!userId) {
    return <div />
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
    },
  })

  if (!user) {
    return <div />
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <NotificationsInbox
        notifications={notifications.map((notification) => ({
          ...notification,
          createdAt: notification.createdAt.toISOString(),
          readAt: notification.readAt?.toISOString() ?? null,
        }))}
      />
    </main>
  )
}
