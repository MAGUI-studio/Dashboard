import * as React from "react"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/src/lib/prisma"
import { getTranslations } from "next-intl/server"
import { getClientNotifications } from "@/src/lib/client-projects"
import { NotificationsInbox } from "@/src/components/common/NotificationsInbox"
import { DashboardNotification } from "@/src/types/dashboard"

export default async function NotificationsPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Notifications")
  const { userId } = await auth()

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const notifications = await getClientNotifications(user.id)

  return (
    <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="mx-auto w-full max-w-5xl">
        <NotificationsInbox 
          notifications={notifications as unknown as DashboardNotification[]} 
        />
      </div>
    </main>
  )
}
