import { cache } from "react"

import { unstable_cache } from "next/cache"

import {
  ApprovalStatus,
  LeadStatus,
  ProjectStatus,
  UserRole,
} from "@/src/generated/client/enums"

import { cacheTags } from "@/src/lib/cache-tags"
import prisma from "@/src/lib/prisma"

import { CACHE_TTL } from "@/src/config/cache"

const getAdminProjectRowsCached = (page: number = 1, limit: number = 20) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [projects, totalCount] = await Promise.all([
        prisma.project.findMany({
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
            createdAt: true,
            client: {
              select: {
                clerkId: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.project.count(),
      ])

      return { projects, totalCount, totalPages: Math.ceil(totalCount / limit) }
    },
    ["admin-project-rows", page.toString(), limit.toString()],
    { revalidate: CACHE_TTL.PROJECT_ROWS, tags: [cacheTags.adminProjects] }
  )()

export const getAdminProjectRows = getAdminProjectRowsCached

const getAdminDashboardSummaryCached = (userId: string) =>
  unstable_cache(
    async () => {
      const [
        totalClients,
        activeProjects,
        pendingApprovals,
        activeLeads,
        unreadNotifications,
      ] = await Promise.all([
        prisma.user.count({ where: { role: UserRole.CLIENT } }),
        prisma.project.count({
          where: { status: { not: ProjectStatus.LAUNCHED } },
        }),
        prisma.update.count({
          where: {
            requiresApproval: true,
            approvalStatus: ApprovalStatus.PENDING,
          },
        }),
        prisma.lead.count({
          where: { status: { not: LeadStatus.CONVERTIDO } },
        }),
        prisma.notification.count({ where: { userId, readAt: null } }),
      ])

      return {
        totalClients,
        activeProjects,
        pendingApprovals,
        activeLeads,
        unreadNotifications,
      }
    },
    ["admin-dashboard-summary", userId],
    { revalidate: CACHE_TTL.DASHBOARD, tags: [cacheTags.adminDashboard] }
  )()

export const getAdminDashboardSummary = getAdminDashboardSummaryCached

const getAdminDashboardAttentionCached = unstable_cache(
  async (todayIso: string) => {
    const today = new Date(todayIso)
    const nextSevenDays = new Date(today.getTime() + 7 * 86_400_000)

    const [
      pendingApprovals,
      deadlineProjects,
      stagnantLeads,
      overdueActionItems,
      silentProjects,
    ] = await Promise.all([
      prisma.update.findMany({
        where: {
          requiresApproval: true,
          approvalStatus: ApprovalStatus.PENDING,
        },
        include: { project: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: {
          status: { not: ProjectStatus.LAUNCHED },
          deadline: { gt: today, lt: nextSevenDays },
        },
        select: { id: true, name: true, deadline: true },
        take: 5,
      }),
      prisma.lead.findMany({
        where: {
          status: { in: [LeadStatus.GARIMPAGEM, LeadStatus.CONTATO_REALIZADO] },
          updatedAt: { lt: new Date(today.getTime() - 4 * 86_400_000) },
        },
        select: { id: true, companyName: true, status: true, updatedAt: true },
        take: 5,
      }),
      prisma.actionItem.findMany({
        where: { status: { not: "COMPLETED" }, dueDate: { lt: today } },
        include: { project: { select: { id: true, name: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: { status: { not: ProjectStatus.LAUNCHED } },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          client: { select: { name: true, email: true } },
          updates: {
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
    ])

    // Filter projects without updates for > 8 days
    const projectsNeedingUpdates = silentProjects
      .filter((p) => {
        const lastUpdateAt = p.updates[0]?.createdAt ?? p.updatedAt
        return lastUpdateAt < new Date(today.getTime() - 8 * 86_400_000)
      })
      .slice(0, 5)

    return {
      pendingApprovals,
      deadlineProjects,
      stagnantLeads,
      overdueActionItems,
      projectsNeedingUpdates,
    }
  },
  ["admin-dashboard-attention"],
  { revalidate: CACHE_TTL.DASHBOARD, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardAttention = cache(
  getAdminDashboardAttentionCached
)

const getAdminDashboardAgendaCached = unstable_cache(
  async (todayIso: string) => {
    const today = new Date(todayIso)
    const nextSevenDays = new Date(today.getTime() + 7 * 86_400_000)

    const [deadlines, actionItems, followUps] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: { not: ProjectStatus.LAUNCHED },
          deadline: { gt: today, lt: nextSevenDays },
        },
        select: {
          id: true,
          name: true,
          deadline: true,
          progress: true,
          client: { select: { name: true, email: true } },
        },
        take: 10,
      }),
      prisma.actionItem.findMany({
        where: {
          status: { not: "COMPLETED" },
          dueDate: { gt: today, lt: nextSevenDays },
        },
        include: { project: { select: { id: true, name: true } } },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.lead.findMany({
        where: { nextActionAt: { gt: today, lt: nextSevenDays } },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          nextActionAt: true,
        },
        take: 10,
      }),
    ])

    return { deadlines, actionItems, followUps }
  },
  ["admin-dashboard-agenda"],
  { revalidate: CACHE_TTL.DASHBOARD, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardAgenda = cache(getAdminDashboardAgendaCached)

const getAdminDashboardActivityCached = unstable_cache(
  async () => {
    return prisma.auditLog.findMany({
      include: {
        actor: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    })
  },
  ["admin-dashboard-activity"],
  { revalidate: CACHE_TTL.ACTIVITY_FEED, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardActivity = cache(getAdminDashboardActivityCached)

const getAdminDashboardPerformanceCached = unstable_cache(
  async () => {
    const [
      activeProjectsCount,
      silentProjectsCount,
      projectDistributionCounts,
      leadDistributionCounts,
      stagnantLeadsCount,
    ] = await Promise.all([
      prisma.project.count({
        where: { status: { not: ProjectStatus.LAUNCHED } },
      }),
      prisma.project.count({
        where: {
          status: { not: ProjectStatus.LAUNCHED },
          updatedAt: { lt: new Date(Date.now() - 8 * 86_400_000) },
        },
      }),
      prisma.project.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ["status"],
        where: { status: { not: LeadStatus.DESCARTADO } },
        _count: { _all: true },
      }),
      prisma.lead.count({
        where: {
          status: { in: [LeadStatus.GARIMPAGEM, LeadStatus.CONTATO_REALIZADO] },
          updatedAt: { lt: new Date(Date.now() - 4 * 86_400_000) },
        },
      }),
    ])

    // Calculate Average Approval Time via raw SQL for performance
    const avgApprovalResult = await prisma.$queryRaw<
      Array<{ avg_hours: number | null }>
    >`
      SELECT 
        EXTRACT(EPOCH FROM AVG("approvedAt" - "createdAt")) / 3600 as avg_hours
      FROM "Update"
      WHERE "approvalStatus" = 'APPROVED' AND "approvedAt" IS NOT NULL
    `

    const averageApprovalHours = Number(avgApprovalResult[0]?.avg_hours ?? 0)

    const projectDistribution = Object.values(ProjectStatus).map((status) => ({
      label: status,
      value:
        projectDistributionCounts.find((item) => item.status === status)?._count
          ._all ?? 0,
    }))

    const leadDistribution = Object.values(LeadStatus).map((status) => ({
      label: status,
      value:
        leadDistributionCounts.find((item) => item.status === status)?._count
          ._all ?? 0,
    }))

    return {
      averageApprovalHours,
      activeProjectsCount,
      silentProjectsCount,
      stagnantLeadsCount,
      projectDistribution,
      leadDistribution,
    }
  },
  ["admin-dashboard-performance"],
  { revalidate: CACHE_TTL.DASHBOARD, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardPerformance = cache(
  getAdminDashboardPerformanceCached
)

const getAdminDashboardHealthCached = unstable_cache(
  async () => {
    const [activeProjects, activeLeads] = await Promise.all([
      prisma.project.findMany({
        where: { status: { not: ProjectStatus.LAUNCHED } },
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
          deadline: true,
          updatedAt: true,
          client: { select: { name: true, email: true } },
          updates: {
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
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
                where: {
                  status: { not: "COMPLETED" },
                  dueDate: { lt: new Date() },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.lead.findMany({
        where: { status: { not: LeadStatus.CONVERTIDO } },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          instagram: true,
          website: true,
          status: true,
          source: true,
          createdAt: true,
          updatedAt: true,
          lastContactAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ])

    return { activeProjects, activeLeads }
  },
  ["admin-dashboard-health"],
  { revalidate: CACHE_TTL.DASHBOARD, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardHealth = cache(getAdminDashboardHealthCached)

const getAdminDashboardRecentUpdatesCached = unstable_cache(
  async () => {
    return prisma.update.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
  },
  ["admin-dashboard-recent-updates"],
  { revalidate: CACHE_TTL.DASHBOARD, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardRecentUpdates = cache(
  getAdminDashboardRecentUpdatesCached
)

const getAdminDashboardDueActionItemsCached = unstable_cache(
  async () => {
    return prisma.actionItem.findMany({
      where: {
        dueDate: { not: null },
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
      take: 12,
    })
  },
  ["admin-dashboard-due-action-items"],
  { revalidate: CACHE_TTL.DASHBOARD, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardDueActionItems = cache(
  getAdminDashboardDueActionItemsCached
)
