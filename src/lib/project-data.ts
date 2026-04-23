import { unstable_cache } from "next/cache"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

export const getProjectForLifecycleCached = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
          clientId: true,
        },
      })
    },
    ["project-lifecycle", id],
    { revalidate: 60, tags: [cacheTags.adminProject(id)] }
  )()

export const getProjectForTimelineCached = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          clientId: true,
        },
      })
    },
    ["project-timeline-meta", id],
    { revalidate: 60, tags: [cacheTags.adminProject(id)] }
  )()

export const getProjectForExportCached = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          client: {
            select: {
              name: true,
              email: true,
              companyName: true,
            },
          },
        },
      })
    },
    ["project-export-meta", id],
    { revalidate: 60, tags: [cacheTags.adminProject(id)] }
  )()

export const getProjectApprovalEventsCached = (projectId: string) =>
  unstable_cache(
    async () => {
      return prisma.approvalEvent.findMany({
        where: {
          update: {
            projectId,
          },
        },
        include: {
          actor: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
          update: {
            select: {
              title: true,
              approvalStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    },
    ["project-approval-events", projectId],
    { revalidate: 60, tags: [cacheTags.projectTimeline(projectId)] }
  )()

export const getProjectBriefingMetaCached = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          briefing: true,
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    },
    ["project-briefing-meta", id],
    { revalidate: 60, tags: [cacheTags.projectBriefing(id)] }
  )()

export const getAdminProjectOverview = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              avatarUrl: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  companyName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              updates: true,
              assets: true,
              actionItems: true,
            },
          },
        },
      })
    },
    ["admin-project-overview", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.adminProject(id)],
    }
  )()

export const getAdminProjectTimeline = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.update.findMany({
        where: { projectId: id },
        include: {
          attachments: true,
          approvalEvents: {
            include: {
              actor: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    },
    ["admin-project-timeline", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.projectTimeline(id)],
    }
  )()

export const getAdminProjectAudit = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.auditLog.findMany({
        where: { projectId: id },
        include: { actor: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    },
    ["admin-project-audit", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.adminProject(id)],
    }
  )()

export const getAdminProjectAssets = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        include: {
          assets: {
            orderBy: { order: "asc" },
          },
        },
      })
    },
    ["admin-project-assets", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.projectAssets(id), cacheTags.adminProjects],
    }
  )()
