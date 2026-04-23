import { unstable_cache } from "next/cache"

import { ApprovalStatus } from "@/src/generated/client/enums"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

export const getClientHomeDataCached = unstable_cache(
  async (userId: string) => {
    const projects = await prisma.project.findMany({
      where: { clientId: userId },
      include: {
        updates: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { attachments: true },
        },
        _count: {
          select: {
            updates: {
              where: {
                requiresApproval: true,
                approvalStatus: ApprovalStatus.PENDING,
              },
            },
            actionItems: {
              where: { status: "PENDING" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return { projects }
  },
  ["client-home-data"],
  { revalidate: CACHE_TTL.PROJECT_DETAILS }
)

export const getClientHomeData = (userId: string) =>
  unstable_cache(
    async () => getClientHomeDataCached(userId),
    ["client-home-data", userId],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.clientHome, cacheTags.clientProjects],
    }
  )()

export const getClientHomePending = (userId: string) =>
  unstable_cache(
    async () => {
      const projects = await prisma.project.findMany({
        where: { clientId: userId },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              updates: {
                where: {
                  requiresApproval: true,
                  approvalStatus: ApprovalStatus.PENDING,
                },
              },
              actionItems: {
                where: {
                  status: "PENDING",
                  targetRole: "CLIENT",
                },
              },
            },
          },
        },
      })

      return projects.filter(
        (p) => p._count.updates > 0 || p._count.actionItems > 0
      )
    },
    ["client-home-pending", userId],
    {
      revalidate: CACHE_TTL.NOTIFICATIONS,
      tags: [cacheTags.clientPendingApprovals, cacheTags.clientHome],
    }
  )()

export const getClientHomeActivity = (userId: string) =>
  unstable_cache(
    async () => {
      return prisma.auditLog.findMany({
        where: {
          project: { clientId: userId },
        },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    },
    ["client-home-activity", userId],
    {
      revalidate: CACHE_TTL.ACTIVITY_FEED,
      tags: [cacheTags.clientHome],
    }
  )()

export const getClientPendingItems = (projectIds: string[]) =>
  unstable_cache(
    async () => {
      return prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: {
          id: true,
          _count: {
            select: {
              updates: {
                where: {
                  requiresApproval: true,
                  approvalStatus: ApprovalStatus.PENDING,
                },
              },
              actionItems: {
                where: { status: "PENDING", targetRole: "CLIENT" },
              },
            },
          },
        },
      })
    },
    ["client-pending-items", ...[...projectIds].sort()],
    {
      revalidate: CACHE_TTL.NOTIFICATIONS,
      tags: [cacheTags.clientPendingApprovals],
    }
  )()

export const getClientProjectsCached = unstable_cache(
  async (userId: string) => {
    return prisma.project.findMany({
      where: { clientId: userId },
      select: {
        id: true,
        name: true,
        status: true,
        progress: true,
        updatedAt: true,
        client: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })
  },
  ["client-projects"],
  { revalidate: CACHE_TTL.PROJECT_DETAILS }
)

export const getClientProjects = (userId: string) =>
  unstable_cache(
    async () => getClientProjectsCached(userId),
    ["client-projects", userId],
    { revalidate: CACHE_TTL.PROJECT_DETAILS, tags: [cacheTags.clientProjects] }
  )()

export const getClientProjectByIdCached = unstable_cache(
  async (id: string, userId: string) => {
    return prisma.project.findUnique({
      where: { id, clientId: userId },
      include: {
        client: true,
        updates: {
          orderBy: { createdAt: "desc" },
          include: { attachments: true },
        },
        assets: {
          orderBy: { order: "asc" },
        },
        actionItems: {
          orderBy: { dueDate: "asc" },
        },
        briefingNotes: {
          orderBy: { createdAt: "desc" },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })
  },
  ["client-project-detail"],
  { revalidate: CACHE_TTL.PROJECT_DETAILS }
)

export const getClientProjectById = (id: string, userId: string) =>
  unstable_cache(
    async () => getClientProjectByIdCached(id, userId),
    ["client-project-detail", id, userId],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.clientProject, `client:project:${id}`],
    }
  )()

export const getClientProjectBreadcrumb = (id: string, userId: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id, clientId: userId },
        select: {
          id: true,
          name: true,
        },
      })
    },
    ["client-project-breadcrumb", id, userId],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.clientProject, `client:project:${id}`],
    }
  )()

export const getClientProjectOverview = (id: string, userId: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id, clientId: userId },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          progress: true,
          deadline: true,
          updates: {
            where: {
              requiresApproval: true,
              approvalStatus: ApprovalStatus.PENDING,
            },
            select: {
              id: true,
              title: true,
              requiresApproval: true,
              approvalStatus: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          actionItems: {
            where: { targetRole: "CLIENT" },
            select: {
              id: true,
              title: true,
              targetRole: true,
            },
            orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
            take: 1,
          },
          _count: {
            select: {
              assets: true,
              updates: true,
              actionItems: {
                where: { targetRole: "CLIENT" },
              },
            },
          },
        },
      })
    },
    ["client-project-overview", id, userId],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.clientProject, `client:project:${id}`],
    }
  )()

export const getClientProjectTimeline = (
  id: string,
  userId: string,
  page: number = 1,
  limit: number = 20
) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [project, totalCount] = await Promise.all([
        prisma.project.findUnique({
          where: { id, clientId: userId },
          select: {
            id: true,
            name: true,
            updates: {
              orderBy: { createdAt: "desc" },
              include: { attachments: true },
              skip,
              take: limit,
            },
          },
        }),
        prisma.update.count({ where: { projectId: id } }),
      ])
      return project
        ? { ...project, totalCount, totalPages: Math.ceil(totalCount / limit) }
        : null
    },
    ["client-project-timeline", id, userId, page.toString(), limit.toString()],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [
        cacheTags.clientProject,
        cacheTags.projectTimeline(id),
        `client:project:${id}`,
      ],
    }
  )()

export const getClientProjectFiles = (
  id: string,
  userId: string,
  page: number = 1,
  limit: number = 30
) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [project, totalCount] = await Promise.all([
        prisma.project.findUnique({
          where: { id, clientId: userId },
          select: {
            id: true,
            name: true,
            assets: {
              orderBy: { order: "asc" },
              skip,
              take: limit,
            },
          },
        }),
        prisma.asset.count({ where: { projectId: id } }),
      ])
      return project
        ? { ...project, totalCount, totalPages: Math.ceil(totalCount / limit) }
        : null
    },
    ["client-project-files", id, userId, page.toString(), limit.toString()],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [
        cacheTags.clientProject,
        cacheTags.projectAssets(id),
        `client:project:${id}`,
      ],
    }
  )()

export const getClientProjectTasks = (
  id: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [project, totalCount] = await Promise.all([
        prisma.project.findUnique({
          where: { id, clientId: userId },
          select: {
            id: true,
            name: true,
            actionItems: {
              where: { targetRole: "CLIENT" },
              orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
              skip,
              take: limit,
            },
          },
        }),
        prisma.actionItem.count({
          where: { projectId: id, targetRole: "CLIENT" },
        }),
      ])
      return project
        ? { ...project, totalCount, totalPages: Math.ceil(totalCount / limit) }
        : null
    },
    ["client-project-tasks", id, userId, page.toString(), limit.toString()],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.clientProject, `client:project:${id}`],
    }
  )()

export const getClientProjectApprovals = (id: string, userId: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id, clientId: userId },
        select: {
          id: true,
          name: true,
          updates: {
            where: { requiresApproval: true },
            orderBy: { createdAt: "desc" },
            include: { attachments: true },
          },
          _count: {
            select: {
              updates: {
                where: { requiresApproval: true },
              },
            },
          },
        },
      })
    },
    ["client-project-approvals", id, userId],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [
        cacheTags.clientProject,
        cacheTags.projectTimeline(id),
        `client:project:${id}`,
      ],
    }
  )()

export const getClientProjectBriefing = (id: string, userId: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id, clientId: userId },
        select: {
          id: true,
          name: true,
          briefing: true,
          briefingNotes: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              briefingNotes: true,
            },
          },
        },
      })
    },
    ["client-project-briefing", id, userId],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [
        cacheTags.clientProject,
        cacheTags.projectBriefing(id),
        `client:project:${id}`,
      ],
    }
  )()

const getClientNotificationsCached = (
  userId: string,
  page: number = 1,
  limit: number = 50
) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
      ])
      return {
        notifications,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    },
    ["client-notifications", userId, page.toString(), limit.toString()],
    { revalidate: 60, tags: [cacheTags.clientNotifications] }
  )()

export const getClientNotifications = getClientNotificationsCached
