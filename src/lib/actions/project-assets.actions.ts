"use server"

import { revalidatePath } from "next/cache"

import {
  AssetOrigin,
  AssetType,
  AssetVisibility,
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client/enums"
import { UTApi } from "uploadthing/server"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  createNotification,
  getAuditOriginLabel,
  getCurrentAppUser,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"

import { getDashboardPath } from "./project-action-utils"

export async function deleteProjectAssetAction(
  id: string,
  projectId: string,
  key: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const utapi = new UTApi()

  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!asset) {
      return { error: "Arquivo nao encontrado" }
    }

    await utapi.deleteFiles(key)

    await prisma.asset.delete({
      where: { id },
    })

    await createAuditLog({
      action: "asset.deleted",
      entityType: "Asset",
      entityId: asset.id,
      projectId,
      summary: `Arquivo ${asset.name} removido de ${asset.project.name}.`,
      metadata: {
        before: {
          name: asset.name,
          type: asset.type,
          visibility: asset.visibility,
          origin: asset.origin,
          key: asset.key,
        },
      },
    })

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath(`/admin/projects/${projectId}/assets`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Asset Error:")
    return { error: "Erro ao deletar arquivo" }
  }
}

export async function updateProjectAssetAction(input: {
  id: string
  projectId: string
  name: string
  type: AssetType
  visibility: AssetVisibility
}): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    const current = await prisma.asset.findUnique({
      where: { id: input.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!current || current.projectId !== input.projectId) {
      return { error: "Arquivo nao encontrado" }
    }

    const updated = await prisma.asset.update({
      where: { id: input.id },
      data: {
        name: input.name.trim(),
        type: input.type,
        visibility: input.visibility,
      },
    })

    const visibilityChanged = current.visibility !== updated.visibility

    await createAuditLog({
      action: visibilityChanged ? "asset.visibility_changed" : "asset.updated",
      entityType: "Asset",
      entityId: updated.id,
      projectId: input.projectId,
      summary: visibilityChanged
        ? `Visibilidade do arquivo ${updated.name} alterada em ${current.project.name}.`
        : `Arquivo ${updated.name} atualizado em ${current.project.name}.`,
      metadata: {
        before: {
          name: current.name,
          type: current.type,
          visibility: current.visibility,
        },
        after: {
          name: updated.name,
          type: updated.type,
          visibility: updated.visibility,
        },
      },
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath(`/admin/projects/${input.projectId}/assets`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Asset Error:")
    return { error: "Erro ao atualizar arquivo" }
  }
}

export async function createProjectAssetAction(data: {
  projectId: string
  name: string
  url: string
  key: string
  type: AssetType
  origin?: AssetOrigin
  visibility?: AssetVisibility
  timezone?: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const actor = await getCurrentAppUser()
    const isClient = actor?.role === UserRole.CLIENT

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: {
        id: true,
        name: true,
        clientId: true,
      },
    })

    if (!project) {
      return { error: "Projeto não encontrado" }
    }

    const lastAsset = await prisma.asset.findFirst({
      where: { projectId: data.projectId },
      orderBy: { order: "desc" },
    })

    const nextOrder = lastAsset ? lastAsset.order + 1 : 0

    const asset = await prisma.asset.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        url: data.url,
        key: data.key,
        type: data.type,
        timezone: data.timezone || "America/Sao_Paulo",
        order: nextOrder,
        origin:
          data.origin || (isClient ? AssetOrigin.CLIENT : AssetOrigin.ADMIN),
        visibility: data.visibility || AssetVisibility.CLIENT,
      },
    })

    await Promise.all([
      createAuditLog({
        action: "asset.created",
        entityType: "Asset",
        entityId: asset.id,
        summary: `Arquivo ${asset.name} enviado para ${project.name} por ${isClient ? "cliente" : "admin"}.`,
        actorId: actor?.id,
        actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
        projectId: data.projectId,
        metadata: {
          origin: getAuditOriginLabel({
            actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
            role: actor?.role,
          }),
          type: asset.type,
          assetOrigin: asset.origin,
          visibility: asset.visibility,
          after: {
            type: asset.type,
            assetOrigin: asset.origin,
            visibility: asset.visibility,
            order: asset.order,
          },
          relatedEntities: [
            {
              type: "Project",
              id: project.id,
              label: project.name,
            },
            {
              type: "Asset",
              id: asset.id,
              label: asset.name,
            },
          ],
        },
      }),
      ...(isClient
        ? (await getInternalNotificationRecipients()).map((admin) =>
            createNotification({
              userId: admin.id,
              projectId: data.projectId,
              type: NotificationType.ASSET_UPLOADED,
              title: "Cliente enviou novo arquivo",
              message: `${actor?.name || "O cliente"} enviou "${asset.name}" para o projeto ${project.name}.`,
              ctaPath: `/admin/projects/${data.projectId}/assets`,
            })
          )
        : [
            createNotification({
              userId: project.clientId,
              projectId: data.projectId,
              type: NotificationType.ASSET_UPLOADED,
              title: "Novo arquivo disponível",
              message: `${asset.name} foi adicionado ao repositório do projeto ${project.name}.`,
              ctaPath: getDashboardPath(data.projectId),
            }),
          ]),
    ])

    revalidatePath(`/admin/projects/${data.projectId}`)
    revalidatePath(`/admin/projects/${data.projectId}/assets`)
    revalidatePath("/")
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Asset Error:")
    return { error: "Erro ao registrar arquivo" }
  }
}

export async function updateProjectAssetsOrderAction(
  projectId: string,
  assetIds: string[]
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.$transaction(
      assetIds.map((id, index) =>
        prisma.asset.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    revalidatePath(`/admin/projects/${projectId}/assets`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Assets Order Error:")
    return { error: "Erro ao atualizar ordem dos arquivos" }
  }
}
