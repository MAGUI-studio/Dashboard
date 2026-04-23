import { cache } from "react"

import { unstable_cache } from "next/cache"

import {
  ApprovalStatus,
  LeadStatus,
  ProjectStatus,
  ScheduledReminderStatus,
  UserRole,
} from "@/src/generated/client/enums"

import { cacheTags } from "@/src/lib/cache-tags"
import prisma from "@/src/lib/prisma"
import { getLeadHealth } from "@/src/lib/utils/lead-health"
import { getProjectHealth } from "@/src/lib/utils/project-health"

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
        activeProjectsCount,
        pendingApprovalsCount,
        activeLeadsCount,
        unreadNotificationsCount,
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
        activeProjectsCount,
        pendingApprovalsCount,
        activeLeadsCount,
        unreadNotificationsCount,
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

    const avgApprovalResult = await prisma.$queryRaw<
      Array<{ avg_hours: number | null }>
    >`
      SELECT 
        EXTRACT(EPOCH FROM AVG("approvedAt" - "createdAt")) / 3600 as avg_hours
      FROM "Update"
      WHERE "approvalStatus" = 'APPROVED' AND "approvedAt" IS NOT NULL
    `

    const averageApprovalHours = Math.round(
      Number(avgApprovalResult[0]?.avg_hours ?? 0)
    )

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

    const silentProjects = await prisma.project.findMany({
      where: {
        status: { not: ProjectStatus.LAUNCHED },
        updatedAt: { lt: new Date(Date.now() - 5 * 86_400_000) },
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        client: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: "asc" },
      take: 4,
    })

    const mappedSilentProjects = silentProjects.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.client.name || p.client.email,
      daysWithoutUpdate: Math.floor(
        (Date.now() - p.updatedAt.getTime()) / 86_400_000
      ),
    }))

    return {
      averageApprovalHours,
      activeProjectsCount,
      silentProjectsCount,
      stagnantLeadsCount,
      projectDistribution,
      leadDistribution,
      silentProjects: mappedSilentProjects,
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
    const [projects, leads] = await Promise.all([
      prisma.project.findMany({
        where: { status: { not: ProjectStatus.LAUNCHED } },
        include: {
          client: { select: { name: true, email: true } },
          updates: {
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          actionItems: {
            where: { status: { not: "COMPLETED" } },
            select: { dueDate: true, status: true },
          },
        },
        take: 10,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.lead.findMany({
        where: { status: { not: LeadStatus.CONVERTIDO } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ])

    const today = new Date()

    const projectHealth = projects
      .map((project) => {
        const pendingApprovalCount = 0 // Optimized out of this view for now
        const overdueActionItemCount = project.actionItems.filter(
          (item) => item.dueDate && item.dueDate < today
        ).length

        const health = getProjectHealth({
          status: project.status,
          progress: project.progress,
          deadline: project.deadline,
          updatedAt: project.updatedAt,
          lastUpdateAt: project.updates[0]?.createdAt ?? null,
          pendingApprovalCount,
          overdueActionItemCount,
        })

        return {
          id: project.id,
          name: project.name,
          clientName: project.client.name || project.client.email,
          progress: project.progress,
          ...health,
        }
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)

    const commercialHealth = leads
      .map((lead) => {
        const health = getLeadHealth({
          status: lead.status,
          source: lead.source,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          lastContactAt: lead.lastContactAt,
          contactName: lead.contactName,
          email: lead.email,
          phone: lead.phone,
          instagram: lead.instagram,
          website: lead.website,
        })

        return {
          id: lead.id,
          companyName: lead.companyName,
          contactName: lead.contactName,
          statusLabel: lead.status,
          ...health,
        }
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)

    return { projectHealth, commercialHealth }
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
  { revalidate: CACHE_TTL.ACTIVITY_FEED, tags: [cacheTags.adminDashboard] }
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

export const getAdminDashboardReminders = unstable_cache(
  async (userId: string) => {
    return prisma.scheduledReminder.findMany({
      where: {
        recipientUserId: userId,
        status: {
          in: [ScheduledReminderStatus.PENDING, ScheduledReminderStatus.SENT],
        },
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
      take: 8,
    })
  },
  ["admin-dashboard-reminders"],
  { revalidate: 60, tags: [cacheTags.adminDashboard] }
)
