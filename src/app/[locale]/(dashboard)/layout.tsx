import { DashboardNotification } from "@/src/types/dashboard"
import { auth, currentUser } from "@clerk/nextjs/server"

import { ClientDashboardExperience } from "@/src/components/common/ClientDashboardExperience"
import { DashboardFooter } from "@/src/components/common/DashboardFooter"
import { Header } from "@/src/components/common/Header"
import BackgroundImages from "@/src/components/common/backgroundImages"

import { syncOperationalReminders } from "@/src/lib/operational-reminders"
import prisma from "@/src/lib/prisma"
import { getCurrentAppUser } from "@/src/lib/project-governance"

type PendingApprovalBannerItem = {
  count: number
  projectId: string
  projectName: string
  lastUpdateId: string
  lastUpdateTitle: string
  lastUpdateDescription: string | null
}

type HeaderViewer = {
  email: string | null
  firstName: string | null
  fullName: string | null
  imageUrl: string | null
  isAdmin: boolean
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const { userId } = await auth()

  let notifications: DashboardNotification[] = []
  let pendingApprovals: PendingApprovalBannerItem[] = []
  let viewer: HeaderViewer | null = null

  if (userId) {
    const user = await getCurrentAppUser()
    const clerkUser = await currentUser()

    if (user) {
      viewer = {
        email: clerkUser?.primaryEmailAddress?.emailAddress ?? user.email,
        firstName: clerkUser?.firstName ?? null,
        fullName: clerkUser?.fullName ?? user.name ?? null,
        imageUrl: clerkUser?.imageUrl ?? null,
        isAdmin: user.role === "ADMIN" || user.role === "MEMBER",
      }

      if (viewer.isAdmin) {
        await syncOperationalReminders()
      }

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

      if (user.role === "CLIENT") {
        const rawPendingUpdates = await prisma.update.findMany({
          where: {
            requiresApproval: true,
            approvalStatus: "PENDING",
            project: {
              clientId: user.id,
            },
          },
          select: {
            id: true,
            title: true,
            description: true,
            projectId: true,
            project: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        // Now we map each individual update to a banner item
        pendingApprovals = rawPendingUpdates.map((update) => ({
          count: 1,
          projectId: update.projectId,
          projectName: update.project.name,
          lastUpdateId: update.id,
          lastUpdateTitle: update.title,
          lastUpdateDescription: update.description,
        }))
      }
    }
  }

  return (
    <ClientDashboardExperience>
      <div className="flex flex-col selection:bg-brand-primary/20 selection:text-brand-primary w-full max-w-440 mx-auto">
        <BackgroundImages />
        <Header
          notifications={notifications}
          pendingApprovals={pendingApprovals}
          viewer={viewer}
        />
        <main className="flex flex-1 flex-col overflow-x-hidden">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </ClientDashboardExperience>
  )
}
