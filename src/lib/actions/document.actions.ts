"use server"

import { revalidatePath } from "next/cache"

import { DocumentStatus, Prisma } from "@/src/generated/client"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { createAuditLog, getCurrentAppUser } from "@/src/lib/project-governance"
import { autentique } from "@/src/lib/signatures/autentique"
import {
  CreateDocumentSchema,
  UpdateDocumentStatusSchema,
} from "@/src/lib/validations/document"

export async function createDocumentAction(
  data: z.infer<typeof CreateDocumentSchema>
) {
  try {
    await protect("admin")
    const user = await getCurrentAppUser()
    if (!user) throw new Error("Unauthorized")

    const validated = CreateDocumentSchema.parse(data)

    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          type: validated.type,
          title: validated.title,
          projectId: validated.projectId,
          clientId: validated.clientId,
          sourceLeadId: validated.sourceLeadId,
          contractedData:
            (validated.contractedData as Prisma.InputJsonValue) || {},
          contractingData:
            (validated.contractingData as Prisma.InputJsonValue) || {},
          commercialData:
            (validated.commercialData as Prisma.InputJsonValue) || {},
          status: DocumentStatus.DRAFT,
          clauses: {
            create: validated.clauses?.map((c) => ({
              title: c.title,
              content: c.content,
              order: c.order,
              isRequired: c.isRequired,
              subclauses: (c.subclauses as Prisma.InputJsonValue) || [],
            })),
          },
          signers: {
            create: validated.signers?.map((s) => ({
              name: s.name,
              email: s.email,
              role: s.role,
              status: "PENDING",
            })),
          },
        },
      })

      // Create initial version
      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          createdById: user.id,
          contentSnapshot: (validated.clauses as Prisma.InputJsonValue) || [],
        },
      })

      await createAuditLog(
        {
          action: "document.created",
          entityType: "Document",
          entityId: doc.id,
          summary: `Documento "${doc.title}" criado por ${user.name}.`,
          actorId: user.id,
          projectId: doc.projectId,
          metadata: { type: doc.type },
        },
        tx
      )

      return doc
    })

    revalidatePath("/admin/documents")
    return { success: true, documentId: document.id }
  } catch (error) {
    logger.error({ error }, "Create Document Error")
    return { error: "Erro ao criar documento" }
  }
}

export async function updateDocumentStatusAction(
  data: z.infer<typeof UpdateDocumentStatusSchema>
) {
  try {
    await protect("admin")
    const user = await getCurrentAppUser()
    if (!user) throw new Error("Unauthorized")

    const validated = UpdateDocumentStatusSchema.parse(data)

    const document = await prisma.document.update({
      where: { id: validated.id },
      data: { status: validated.status },
    })

    await createAuditLog({
      action: "document.status_updated",
      entityType: "Document",
      entityId: document.id,
      summary: `Status do documento "${document.title}" alterado para ${validated.status}.`,
      actorId: user.id,
      projectId: document.projectId,
      metadata: { status: validated.status },
    })

    revalidatePath("/admin/documents")
    revalidatePath(`/admin/documents/${document.id}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Document Status Error")
    return { error: "Erro ao atualizar status do documento" }
  }
}

export async function sendDocumentToSignatureAction(id: string) {
  try {
    await protect("admin")
    const user = await getCurrentAppUser()
    if (!user) throw new Error("Unauthorized")

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        signers: true,
        clauses: { orderBy: { order: "asc" } },
      },
    })

    if (!document) throw new Error("Document not found")
    if (document.status !== DocumentStatus.DRAFT)
      throw new Error("Only drafts can be sent")

    // In a real scenario, we would generate the PDF here and upload it
    // For now, we simulate the Autentique call
    const providerDoc = await autentique.createDocument(
      document.title,
      "https://fake-url.com/doc.pdf",
      document.signers.map((s) => ({
        name: s.name,
        email: s.email,
        role: s.role || "SIGNER",
      }))
    )

    await prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.SENT,
        providerDocId: providerDoc.id,
        providerLink: providerDoc.link,
      },
    })

    await createAuditLog({
      action: "document.sent",
      entityType: "Document",
      entityId: id,
      summary: `Documento "${document.title}" enviado para assinatura via Autentique.`,
      actorId: user.id,
      projectId: document.projectId,
    })

    revalidatePath("/admin/documents")
    revalidatePath(`/admin/documents/${id}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Send Document Error")
    return { error: "Erro ao enviar documento para assinatura" }
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    await protect("admin")
    const user = await getCurrentAppUser()
    if (!user) throw new Error("Unauthorized")

    const doc = await prisma.document.findUnique({
      where: { id },
      select: { title: true, projectId: true },
    })

    await prisma.document.delete({
      where: { id },
    })

    await createAuditLog({
      action: "document.deleted",
      entityType: "Document",
      entityId: id,
      summary: `Documento "${doc?.title}" removido por ${user.name}.`,
      actorId: user.id,
      projectId: doc?.projectId,
    })

    revalidatePath("/admin/documents")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Document Error")
    return { error: "Erro ao excluir documento" }
  }
}
