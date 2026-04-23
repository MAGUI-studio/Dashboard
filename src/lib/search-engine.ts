import { Prisma } from "@/src/generated/client/client"

import prisma from "./prisma"

export type SearchEntityType =
  | "User"
  | "Project"
  | "Lead"
  | "Asset"
  | "Update"
  | "AuditLog"

export async function updateSearchDocument(data: {
  entityType: SearchEntityType
  entityId: string
  projectId?: string | null
  title: string
  subtitle?: string | null
  body?: string | null
  metadata?: Prisma.InputJsonValue
}) {
  return prisma.searchDocument.upsert({
    where: {
      // Since we don't have a unique constraint on entityType/entityId in schema yet,
      // we'll find and update or create.
      id:
        (
          await prisma.searchDocument.findFirst({
            where: { entityType: data.entityType, entityId: data.entityId },
            select: { id: true },
          })
        )?.id ?? "new-id",
    },
    update: {
      projectId: data.projectId,
      title: data.title,
      subtitle: data.subtitle,
      body: data.body,
      metadata: data.metadata,
      updatedAt: new Date(),
    },
    create: {
      entityType: data.entityType,
      entityId: data.entityId,
      projectId: data.projectId,
      title: data.title,
      subtitle: data.subtitle,
      body: data.body,
      metadata: data.metadata,
    },
  })
}

export async function deleteSearchDocument(
  entityType: SearchEntityType,
  entityId: string
) {
  return prisma.searchDocument.deleteMany({
    where: { entityType, entityId },
  })
}
