"use server"

import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

export type GlobalSearchResult = {
  id: string
  type: "client" | "project" | "lead" | "update" | "asset" | "activity"
  title: string
  subtitle: string
  meta: string
  targetId: string
  targetTab?: "timeline" | "assets" | "audit"
  highlightId?: string
}

const truncate = (value: string, max = 72) =>
  value.length > max ? `${value.slice(0, max - 1)}...` : value

export async function searchAdminGlobal(
  query: string,
  mode: "quick" | "full" = "full"
): Promise<GlobalSearchResult[]> {
  await protect(["admin", "member"])

  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const [users, projects, leads, updates] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { email: { contains: normalizedQuery, mode: "insensitive" } },
          {
            companyName: {
              contains: normalizedQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        clerkId: true,
        name: true,
        email: true,
        companyName: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { description: { contains: normalizedQuery, mode: "insensitive" } },
          {
            client: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
          {
            client: {
              email: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        status: true,
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { companyName: { contains: normalizedQuery, mode: "insensitive" } },
          { contactName: { contains: normalizedQuery, mode: "insensitive" } },
          { phone: { contains: normalizedQuery, mode: "insensitive" } },
          { instagram: { contains: normalizedQuery, mode: "insensitive" } },
          { email: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        status: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.update.findMany({
      where: {
        OR: [
          { title: { contains: normalizedQuery, mode: "insensitive" } },
          { description: { contains: normalizedQuery, mode: "insensitive" } },
          {
            project: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const quickResults: GlobalSearchResult[] = [
    ...users.map((user) => ({
      id: `client-${user.clerkId}`,
      type: "client" as const,
      title: user.name || user.companyName || user.email,
      subtitle: user.email,
      meta: user.companyName || "Cliente",
      targetId: user.clerkId,
    })),
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      type: "project" as const,
      title: project.name,
      subtitle: project.client.name || project.client.email,
      meta: project.status,
      targetId: project.id,
    })),
    ...leads.map((lead) => ({
      id: `lead-${lead.id}`,
      type: "lead" as const,
      title: lead.companyName,
      subtitle: lead.contactName || "Sem contato principal",
      meta: lead.status,
      targetId: lead.id,
    })),
    ...updates.map((update) => ({
      id: `update-${update.id}`,
      type: "update" as const,
      title: update.title,
      subtitle: update.project.name,
      meta: "Update",
      targetId: update.project.id,
      targetTab: "timeline" as const,
      highlightId: update.id,
    })),
  ]

  if (mode === "quick") {
    return quickResults
  }

  const [assets, activities] = await Promise.all([
    prisma.asset.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { key: { contains: normalizedQuery, mode: "insensitive" } },
          {
            project: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: {
        OR: [
          { summary: { contains: normalizedQuery, mode: "insensitive" } },
          { entityType: { contains: normalizedQuery, mode: "insensitive" } },
          { action: { contains: normalizedQuery, mode: "insensitive" } },
          {
            project: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        summary: true,
        entityType: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return [
    ...quickResults,
    ...assets.map((asset) => ({
      id: `asset-${asset.id}`,
      type: "asset" as const,
      title: asset.name,
      subtitle: asset.project.name,
      meta: `Arquivo - ${asset.type}`,
      targetId: asset.project.id,
      targetTab: "assets" as const,
    })),
    ...activities
      .filter((activity) => activity.project)
      .map((activity) => ({
        id: `activity-${activity.id}`,
        type: "activity" as const,
        title: truncate(activity.summary, 72),
        subtitle: activity.project!.name,
        meta: `Atividade - ${activity.entityType}`,
        targetId: activity.project!.id,
        targetTab: "audit" as const,
      })),
  ]
}
