"use server"

import { UserRole } from "@/src/generated/client"

import prisma from "@/src/lib/prisma"
import { createAuditLog, getCurrentAppUser } from "@/src/lib/project-governance"
import { revalidateMaguiConnectProfile } from "@/src/lib/revalidate"

import {
  type MaguiConnectLinkInput,
  type MaguiConnectProfileInput,
} from "../validations/maguiConnect"

async function ensureMaguiConnectAccess(targetUserId?: string) {
  const user = await getCurrentAppUser()
  if (!user) throw new Error("Unauthorized")

  if (
    targetUserId &&
    user.role !== UserRole.ADMIN &&
    user.id !== targetUserId
  ) {
    throw new Error("Unauthorized")
  }

  return { user, targetUserId: targetUserId ?? user.id }
}

function toNullable(value?: string | null) {
  return value && value.trim().length > 0 ? value.trim() : null
}

async function ensureOwnProfile(userId: string, fallbackName?: string | null) {
  const profile = await prisma.maguiConnectProfile.findUnique({
    where: { userId },
  })

  if (profile) return profile

  return prisma.maguiConnectProfile.create({
    data: {
      userId,
      displayName: fallbackName?.trim() || "MAGUI Connect",
      themeBackground: "#0a0a0a",
      themeForeground: "#f5f5f5",
    },
  })
}

export async function createMaguiConnectProfileForUserAction(
  targetUserId: string
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, email: true },
  })

  if (!targetUser) {
    throw new Error("Cliente nao encontrado")
  }

  const profile = await ensureOwnProfile(targetUser.id, targetUser.name)

  await createAuditLog({
    action: "magui-connect.profile_created",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: `Cadastro do Magui Connect criado manualmente para ${targetUser.name ?? targetUser.email}.`,
  })

  revalidateMaguiConnectProfile(targetUser.id)

  return profile
}

async function saveMaguiConnectProfile(
  targetUserId: string,
  input: MaguiConnectProfileInput
) {
  const existingProfile = await prisma.maguiConnectProfile.findUnique({
    where: { userId: targetUserId },
    select: { id: true },
  })

  const description = toNullable(input.description)

  if (existingProfile) {
    return prisma.maguiConnectProfile.update({
      where: { userId: targetUserId },
      data: {
        displayName: input.title,
        headline: description,
      },
    })
  }

  return prisma.maguiConnectProfile.create({
    data: {
      userId: targetUserId,
      displayName: input.title,
      headline: description,
    },
  })
}

export async function upsertOwnMaguiConnectProfileAction(
  input: MaguiConnectProfileInput
) {
  const { user } = await ensureMaguiConnectAccess()
  const profile = await saveMaguiConnectProfile(user.id, input)

  await createAuditLog({
    action: "magui-connect.profile_updated",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: `Cadastro do Magui Connect atualizado por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return profile
}

export async function upsertMaguiConnectProfileForUserAction(
  targetUserId: string,
  input: MaguiConnectProfileInput
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, email: true },
  })

  if (!targetUser) {
    throw new Error("Cliente nao encontrado")
  }

  const profile = await saveMaguiConnectProfile(targetUser.id, input)

  await createAuditLog({
    action: "magui-connect.profile_updated_by_admin",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: `Cadastro do Magui Connect de ${targetUser.name ?? targetUser.email} atualizado por admin.`,
  })

  revalidateMaguiConnectProfile(targetUser.id)

  return profile
}

export async function createOwnMaguiConnectLinkAction(
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess()
  const profile = await ensureOwnProfile(user.id, user.name)

  const last = await prisma.maguiConnectLink.aggregate({
    where: { profileId: profile.id },
    _max: { sortOrder: true },
  })

  const link = await prisma.maguiConnectLink.create({
    data: {
      profileId: profile.id,
      label: input.label,
      url: input.url,
      icon: null,
      isActive: true,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  })

  await createAuditLog({
    action: "magui-connect.link_created",
    entityType: "MaguiConnectLink",
    entityId: link.id,
    actorId: user.id,
    summary: `Link do Magui Connect criado por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return link
}

export async function updateOwnMaguiConnectLinkAction(
  linkId: string,
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess()
  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    include: { profile: true },
  })
  if (!link || link.profile.userId !== user.id)
    throw new Error("Link nao encontrado")

  const updated = await prisma.maguiConnectLink.update({
    where: { id: linkId },
    data: {
      label: input.label,
      url: input.url,
      icon: null,
      isActive: true,
    },
  })

  await createAuditLog({
    action: "magui-connect.link_updated",
    entityType: "MaguiConnectLink",
    entityId: updated.id,
    actorId: user.id,
    summary: `Link do Magui Connect atualizado por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return updated
}

export async function deleteOwnMaguiConnectLinkAction(linkId: string) {
  const { user } = await ensureMaguiConnectAccess()
  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    include: { profile: true },
  })
  if (!link || link.profile.userId !== user.id)
    throw new Error("Link nao encontrado")

  await prisma.maguiConnectLink.delete({ where: { id: linkId } })

  await createAuditLog({
    action: "magui-connect.link_deleted",
    entityType: "MaguiConnectLink",
    entityId: linkId,
    actorId: user.id,
    summary: `Link do Magui Connect removido por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)
}

export async function reorderOwnMaguiConnectLinksAction(linkIds: string[]) {
  const { user } = await ensureMaguiConnectAccess()
  const profile = await ensureOwnProfile(user.id, user.name)

  await prisma.$transaction(
    linkIds.map((id, index) =>
      prisma.maguiConnectLink.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )

  await createAuditLog({
    action: "magui-connect.links_reordered",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: "Ordem dos links do Magui Connect atualizada.",
  })

  revalidateMaguiConnectProfile(user.id)
}

export async function createMaguiConnectLinkForUserAction(
  targetUserId: string,
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true },
  })
  if (!targetUser) throw new Error("Cliente nao encontrado")

  const profile = await ensureOwnProfile(targetUser.id, targetUser.name)
  const last = await prisma.maguiConnectLink.aggregate({
    where: { profileId: profile.id },
    _max: { sortOrder: true },
  })

  const link = await prisma.maguiConnectLink.create({
    data: {
      profileId: profile.id,
      label: input.label,
      url: input.url,
      icon: null,
      isActive: true,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  })

  await createAuditLog({
    action: "magui-connect.link_created_by_admin",
    entityType: "MaguiConnectLink",
    entityId: link.id,
    actorId: user.id,
    summary: `Link do Magui Connect criado por admin para ${targetUser.name ?? targetUser.id}.`,
  })

  revalidateMaguiConnectProfile(targetUser.id)

  return link
}

export async function updateMaguiConnectLinkForUserAction(
  targetUserId: string,
  linkId: string,
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    include: { profile: true },
  })
  if (!link || link.profile.userId !== targetUserId) {
    throw new Error("Link nao encontrado")
  }

  const updated = await prisma.maguiConnectLink.update({
    where: { id: linkId },
    data: {
      label: input.label,
      url: input.url,
      icon: null,
      isActive: true,
    },
  })

  await createAuditLog({
    action: "magui-connect.link_updated_by_admin",
    entityType: "MaguiConnectLink",
    entityId: updated.id,
    actorId: user.id,
    summary: "Link do Magui Connect atualizado por admin.",
  })

  revalidateMaguiConnectProfile(targetUserId)

  return updated
}

export async function deleteMaguiConnectLinkForUserAction(
  targetUserId: string,
  linkId: string
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    include: { profile: true },
  })
  if (!link || link.profile.userId !== targetUserId) {
    throw new Error("Link nao encontrado")
  }

  await prisma.maguiConnectLink.delete({ where: { id: linkId } })

  await createAuditLog({
    action: "magui-connect.link_deleted_by_admin",
    entityType: "MaguiConnectLink",
    entityId: linkId,
    actorId: user.id,
    summary: "Link do Magui Connect removido por admin.",
  })

  revalidateMaguiConnectProfile(targetUserId)
}
