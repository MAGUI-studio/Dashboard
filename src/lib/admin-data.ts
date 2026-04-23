import { cache } from "react"

import { unstable_cache } from "next/cache"

import { ProjectStatus } from "@/src/generated/client/enums"

import { cacheTags } from "@/src/lib/cache-tags"
import prisma from "@/src/lib/prisma"

import { env } from "@/src/config/env"

const dataCacheTtl = env.DATA_CACHE_TTL_SECONDS

const getAdminProjectRowsCached = unstable_cache(
  async () => {
    return prisma.project.findMany({
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
    })
  },
  ["admin-project-rows"],
  { revalidate: dataCacheTtl, tags: [cacheTags.adminProjects] }
)

export const getAdminProjectRows = cache(getAdminProjectRowsCached)

const getAdminDashboardSummaryCached = unstable_cache(
  async (_todayIso: string) => {
    // _todayIso is used in cache key
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
      prisma.lead.count({ where: { status: { not: LeadStatus.CONVERTIDO } } }),
      prisma.notification.count({ where: { readAt: null } }),
    ])

    return {
      totalClients,
      activeProjects,
      pendingApprovals,
      activeLeads,
      unreadNotifications,
    }
  },
  ["admin-dashboard-summary"],
  { revalidate: 60, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardSummary = cache(getAdminDashboardSummaryCached)

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
  { revalidate: 60, tags: [cacheTags.adminDashboard] }
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
  { revalidate: 60, tags: [cacheTags.adminDashboard] }
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
  { revalidate: 30, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardActivity = cache(getAdminDashboardActivityCached)

const getAdminDashboardPerformanceCached = unstable_cache(
  async () => {
    const [
      approvedUpdates,
      convertedLeads,
      activeProjectsCount,
      silentProjectsCount,
      allProjects,
      allLeads,
    ] = await Promise.all([
      prisma.update.findMany({
        where: {
          requiresApproval: true,
          approvalStatus: ApprovalStatus.APPROVED,
          approvedAt: { not: null },
        },
        select: { createdAt: true, approvedAt: true },
        take: 50,
      }),
      prisma.lead.findMany({
        where: { convertedAt: { not: null } },
        select: { createdAt: true, convertedAt: true },
        take: 50,
      }),
      prisma.project.count({
        where: { status: { not: ProjectStatus.LAUNCHED } },
      }),
      prisma.project.count({
        where: {
          status: { not: ProjectStatus.LAUNCHED },
          updatedAt: { lt: new Date(Date.now() - 8 * 86_400_000) },
        },
      }),
      prisma.project.findMany({ select: { status: true } }),
      prisma.lead.findMany({
        where: { status: { not: LeadStatus.DESCARTADO } },
        select: { status: true },
      }),
    ])

    return {
      approvedUpdates,
      convertedLeads,
      activeProjectsCount,
      silentProjectsCount,
      projectDistribution: allProjects,
      leadDistribution: allLeads,
    }
  },
  ["admin-dashboard-performance"],
  { revalidate: 300, tags: [cacheTags.adminDashboard] }
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
  { revalidate: 60, tags: [cacheTags.adminDashboard] }
)

export const getAdminDashboardHealth = cache(getAdminDashboardHealthCached)
