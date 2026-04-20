"use server"

import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

export type GlobalSearchResult = {
  id: string
  type: "client" | "project" | "lead" | "update"
  title: string
  subtitle: string
  meta: string
  targetId: string
}

export async function searchAdminGlobal(
  query: string
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
          { companyName: { contains: normalizedQuery, mode: "insensitive" } },
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

  return [
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
    })),
  ]
}
