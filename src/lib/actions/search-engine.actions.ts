"use server"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

export async function rebuildSearchIndexAction() {
  try {
    await protect("admin")

    const [users, projects, leads, assets, updates, auditLogs] =
      await Promise.all([
        prisma.user.findMany(),
        prisma.project.findMany({ include: { client: true } }),
        prisma.lead.findMany(),
        prisma.asset.findMany({ include: { project: true } }),
        prisma.update.findMany({ include: { project: true } }),
        prisma.auditLog.findMany({
          include: { project: true },
          take: 500,
          orderBy: { createdAt: "desc" },
        }),
      ])

    await prisma.searchDocument.deleteMany()

    const documents = [
      ...users.map((u) => ({
        entityType: "User",
        entityId: u.clerkId, // for users we use clerkId as target
        title: u.name || u.email,
        subtitle: u.companyName,
        body: `${u.email} ${u.phone || ""} ${u.position || ""}`,
        metadata: { email: u.email },
      })),
      ...projects.map((p) => ({
        entityType: "Project",
        entityId: p.id,
        projectId: p.id,
        title: p.name,
        subtitle: p.client.name || p.client.email,
        body: p.description || "",
        metadata: { status: p.status, clientEmail: p.client.email },
      })),
      ...leads.map((l) => ({
        entityType: "Lead",
        entityId: l.id,
        title: l.companyName,
        subtitle: l.contactName,
        body: `${l.email || ""} ${l.phone || ""} ${l.notes || ""}`,
        metadata: { status: l.status },
      })),
      ...assets.map((a) => ({
        entityType: "Asset",
        entityId: a.id,
        projectId: a.projectId,
        title: a.name,
        subtitle: a.project.name,
        body: a.key,
        metadata: { type: a.type },
      })),
      ...updates.map((u) => ({
        entityType: "Update",
        entityId: u.id,
        projectId: u.projectId,
        title: u.title,
        subtitle: u.project.name,
        body: u.description || "",
      })),
      ...auditLogs.map((l) => ({
        entityType: "AuditLog",
        entityId: l.id,
        projectId: l.projectId,
        title: l.summary,
        subtitle: l.entityType,
        body: l.action,
        metadata: { projectName: l.project?.name },
      })),
    ]

    if (documents.length > 0) {
      await prisma.searchDocument.createMany({
        data: documents,
      })
    }

    return { success: true, count: documents.length }
  } catch (error) {
    logger.error({ error }, "Rebuild Search Index Error")
    return { success: false, error: "Failed to rebuild search index" }
  }
}
