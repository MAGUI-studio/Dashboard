import { unstable_cache } from "next/cache"

import { ApprovalStatus } from "@/src/generated/client/enums"

import { env } from "@/src/config/env"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

const dataCacheTtl = env.DATA_CACHE_TTL_SECONDS

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
  { revalidate: dataCacheTtl }
)

export const getClientHomeData = (userId: string) =>
  unstable_cache(
    async () => getClientHomeDataCached(userId),
    ["client-home-data", userId],
    {
      revalidate: dataCacheTtl,
      tags: [cacheTags.clientHome, cacheTags.clientProjects],
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
  { revalidate: dataCacheTtl }
)

export const getClientProjects = (userId: string) =>
  unstable_cache(
    async () => getClientProjectsCached(userId),
    ["client-projects", userId],
    { revalidate: dataCacheTtl, tags: [cacheTags.clientProjects] }
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
  { revalidate: dataCacheTtl }
)

export const getClientProjectById = (id: string, userId: string) =>
  unstable_cache(
    async () => getClientProjectByIdCached(id, userId),
    ["client-project-detail", id, userId],
    {
      revalidate: dataCacheTtl,
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
      revalidate: dataCacheTtl,
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
      revalidate: dataCacheTtl,
      tags: [cacheTags.clientProject, `client:project:${id}`],
    }
  )()

export const getClientProjectTimeline = (id: string, userId: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id, clientId: userId },
        select: {
          id: true,
          name: true,
          updates: {
            orderBy: { createdAt: "desc" },
            include: { attachments: true },
          },
        },
      })
    },
    ["client-project-timeline", id, userId],
    {
      revalidate: dataCacheTtl,
      tags: [
        cacheTags.clientProject,
        cacheTags.projectTimeline(id),
        `client:project:${id}`,
      ],
    }
  )()

export const getClientProjectFiles = (id: string, userId: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id, clientId: userId },
        select: {
          id: true,
          name: true,
          assets: {
            orderBy: { order: "asc" },
          },
        },
      })
    },
    ["client-project-files", id, userId],
    {
      revalidate: dataCacheTtl,
      tags: [
        cacheTags.clientProject,
        cacheTags.projectAssets(id),
        `client:project:${id}`,
      ],
    }
  )()

export const getClientProjectTasks = (id: string, userId: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id, clientId: userId },
        select: {
          id: true,
          name: true,
          actionItems: {
            where: { targetRole: "CLIENT" },
            orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          },
        },
      })
    },
    ["client-project-tasks", id, userId],
    {
      revalidate: dataCacheTtl,
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
        },
      })
    },
    ["client-project-approvals", id, userId],
    {
      revalidate: dataCacheTtl,
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
        },
      })
    },
    ["client-project-briefing", id, userId],
    {
      revalidate: dataCacheTtl,
      tags: [
        cacheTags.clientProject,
        cacheTags.projectBriefing(id),
        `client:project:${id}`,
      ],
    }
  )()

export const getClientNotificationsCached = unstable_cache(
  async (userId: string) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  },
  ["client-notifications"],
  { revalidate: 60 }
)

export const getClientNotifications = (userId: string) =>
  unstable_cache(
    async () => getClientNotificationsCached(userId),
    ["client-notifications", userId],
    { revalidate: 60, tags: [cacheTags.clientNotifications] }
  )()
