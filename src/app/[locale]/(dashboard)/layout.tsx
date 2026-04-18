import { DashboardNotification } from "@/src/types/dashboard"
import { auth } from "@clerk/nextjs/server"

import { Header } from "@/src/components/common/Header"
import BackgroundImages from "@/src/components/common/backgroundImages"

import prisma from "@/src/lib/prisma"
import { getCurrentAppUser } from "@/src/lib/project-governance"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const { userId } = await auth()

  let notifications: DashboardNotification[] = []

  if (userId) {
    const user = await getCurrentAppUser()

    if (user) {
      const rawNotifications = await prisma.notification.findMany({
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

      notifications = rawNotifications.map((notification) => ({
        ...notification,
        type: notification.type,
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt?.toISOString() ?? null,
      }))
    }
  }

  return (
    <div className="flex min-h-svh flex-col selection:bg-brand-primary/20 selection:text-brand-primary w-full max-w-440 mx-auto">
      <BackgroundImages />
      <Header notifications={notifications} />
      <main className="flex flex-1 flex-col overflow-x-hidden">{children}</main>
    </div>
  )
}
