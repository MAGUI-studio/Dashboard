import { ApprovalStatus, AssetVisibility } from "@/src/generated/client/enums"

import prisma from "@/src/lib/prisma"

export async function getClientProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      OR: [
        { clientId: userId },
        {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getClientProjectById(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { clientId: userId },
        {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
        },
      },
      updates: {
        orderBy: { createdAt: "desc" },
        include: {
          attachments: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      assets: {
        where: {
          visibility: AssetVisibility.CLIENT,
        },
        orderBy: { order: "asc" },
      },
      actionItems: {
        orderBy: { createdAt: "desc" },
      },
      versions: {
        orderBy: { createdAt: "desc" },
      },
      briefingNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function getClientPendingItems(userId: string) {
  const projects = await getClientProjects(userId)
  const projectIds = projects.map((p) => p.id)

  const [pendingApprovals, pendingTasks] = await Promise.all([
    prisma.update.findMany({
      where: {
        projectId: { in: projectIds },
        requiresApproval: true,
        approvalStatus: ApprovalStatus.PENDING,
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
    }),
    prisma.actionItem.findMany({
      where: {
        projectId: { in: projectIds },
        targetRole: "CLIENT",
        status: { not: "COMPLETED" },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
  ])

  return {
    pendingApprovals,
    pendingTasks,
  }
}

export async function getClientHomeData(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { clientId: userId },
        {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const { pendingApprovals, pendingTasks } = await getClientPendingItems(userId)

  // Fetch recent activity across updates and assets
  const projectIds = projects.map((p) => p.id)
  const [recentUpdates, recentAssets] = await Promise.all([
    prisma.update.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: { select: { name: true } } },
    }),
    prisma.asset.findMany({
      where: {
        projectId: { in: projectIds },
        visibility: AssetVisibility.CLIENT,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: { select: { name: true } } },
    }),
  ])

  const activity = [
    ...recentUpdates.map((u) => ({
      id: `update-${u.id}`,
      title: u.title,
      type: "update" as const,
      projectName: u.project.name,
      createdAt: u.createdAt,
      href: `/projects/${u.projectId}/timeline?highlight=${u.id}`,
    })),
    ...recentAssets.map((a) => ({
      id: `asset-${a.id}`,
      title: a.name,
      type: "file" as const,
      projectName: a.project.name,
      createdAt: a.createdAt,
      href: `/projects/${a.projectId}/files`,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  return {
    projects,
    pendingApprovals,
    pendingTasks,
    recentActivity: activity,
  }
}

export async function getClientNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })
}
