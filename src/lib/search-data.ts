import { Prisma } from "@/src/generated/client/client"

import prisma from "./prisma"

export type SearchUserResult = {
  clerkId: string
  name: string | null
  email: string
  companyName: string | null
}

export type SearchProjectResult = {
  id: string
  name: string
  status: string
  client: { name: string | null; email: string }
}

export type SearchLeadResult = {
  id: string
  companyName: string
  contactName: string | null
  status: string
}

export type SearchUpdateResult = {
  id: string
  title: string
  project: { id: string; name: string }
}

export type SearchAssetResult = {
  id: string
  name: string
  type: string
  project: { id: string; name: string }
}

export type SearchActivityResult = {
  id: string
  summary: string
  entityType: string
  projectId: string | null
  project: { id: string; name: string } | null
}

export async function searchAdminEntities(
  query: string,
  take: number = 5
): Promise<{
  users: SearchUserResult[]
  projects: SearchProjectResult[]
  leads: SearchLeadResult[]
  updates: SearchUpdateResult[]
}> {
  const normalizedQuery = query.trim()
  if (!normalizedQuery || normalizedQuery.length < 3) {
    return { users: [], projects: [], leads: [], updates: [] }
  }

  const results = await prisma.searchDocument.findMany({
    where: {
      OR: [
        { title: { contains: normalizedQuery, mode: "insensitive" } },
        { subtitle: { contains: normalizedQuery, mode: "insensitive" } },
        { body: { contains: normalizedQuery, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: take * 4,
  })

  return {
    users: results
      .filter((r) => r.entityType === "User")
      .map((r) => {
        const meta = (r.metadata as Prisma.JsonObject) || {}
        return {
          clerkId: r.entityId,
          name: r.title,
          email: String(meta.email || ""),
          companyName: r.subtitle,
        }
      })
      .slice(0, take),
    projects: results
      .filter((r) => r.entityType === "Project")
      .map((r) => {
        const meta = (r.metadata as Prisma.JsonObject) || {}
        return {
          id: r.entityId,
          name: r.title,
          status: String(meta.status || ""),
          client: {
            name: r.subtitle || "",
            email: String(meta.clientEmail || ""),
          },
        }
      })
      .slice(0, take),
    leads: results
      .filter((r) => r.entityType === "Lead")
      .map((r) => {
        const meta = (r.metadata as Prisma.JsonObject) || {}
        return {
          id: r.entityId,
          companyName: r.title,
          contactName: r.subtitle,
          status: String(meta.status || ""),
        }
      })
      .slice(0, take),
    updates: results
      .filter((r) => r.entityType === "Update")
      .map((r) => {
        return {
          id: r.entityId,
          title: r.title,
          project: {
            id: r.projectId!,
            name: r.subtitle!,
          },
        }
      })
      .slice(0, take),
  }
}

export async function searchAdminFullEntities(
  query: string,
  take: number = 5
): Promise<{
  assets: SearchAssetResult[]
  activities: SearchActivityResult[]
}> {
  const normalizedQuery = query.trim()
  if (!normalizedQuery || normalizedQuery.length < 3) {
    return { assets: [], activities: [] }
  }

  const results = await prisma.searchDocument.findMany({
    where: {
      OR: [
        { title: { contains: normalizedQuery, mode: "insensitive" } },
        { subtitle: { contains: normalizedQuery, mode: "insensitive" } },
        { body: { contains: normalizedQuery, mode: "insensitive" } },
      ],
    },
    take: take * 4,
  })

  return {
    assets: results
      .filter((r) => r.entityType === "Asset")
      .map((r) => {
        const meta = (r.metadata as Prisma.JsonObject) || {}
        return {
          id: r.entityId,
          name: r.title,
          type: String(meta.type || "DOCUMENT"),
          project: { id: r.projectId!, name: r.subtitle! },
        }
      })
      .slice(0, take),
    activities: results
      .filter((r) => r.entityType === "AuditLog")
      .map((r) => {
        const meta = (r.metadata as Prisma.JsonObject) || {}
        return {
          id: r.entityId,
          summary: r.title,
          entityType: r.subtitle!,
          projectId: r.projectId,
          project: r.projectId
            ? { id: r.projectId, name: String(meta.projectName || "") }
            : null,
        }
      })
      .slice(0, take),
  }
}
