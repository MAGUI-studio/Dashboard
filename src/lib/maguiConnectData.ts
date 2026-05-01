import { unstable_cache } from "next/cache"

import { MaguiConnectLink, MaguiConnectProfile } from "@/src/generated/client"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

type PublicMaguiConnectProfile = MaguiConnectProfile & {
  links: MaguiConnectLink[]
}

export async function getAdminMaguiConnectProfileByClerkId(clerkId: string) {
  return prisma.maguiConnectProfile.findFirst({
    where: { user: { clerkId } },
    include: {
      links: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })
}

export async function getAdminMaguiConnectProfileByUserId(userId: string) {
  return prisma.maguiConnectProfile.findUnique({
    where: { userId },
    include: {
      links: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })
}

export async function getOwnMaguiConnectProfile(userId: string) {
  return unstable_cache(
    async () => {
      return prisma.maguiConnectProfile.findUnique({
        where: { userId },
        include: {
          links: {
            orderBy: { sortOrder: "asc" },
          },
        },
      })
    },
    ["own-magui-connect-profile", userId],
    {
      revalidate: CACHE_TTL.USER_PREFERENCES,
      tags: [cacheTags.maguiConnectProfile(userId)],
    }
  )()
}

export async function getPublicMaguiConnectByDomain(domain: string) {
  return unstable_cache(
    async () => {
      const profile = await prisma.maguiConnectProfile.findUnique({
        where: { domain },
        include: {
          links: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      })

      if (!profile) return null

      return formatPublicPayload(profile)
    },
    ["public-magui-connect-domain", domain],
    {
      revalidate: CACHE_TTL.DASHBOARD,
      tags: [cacheTags.maguiConnectPublicByDomain(domain)],
    }
  )()
}

export async function getPublicMaguiConnectBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const profile = await prisma.maguiConnectProfile.findUnique({
        where: { slug },
        include: {
          links: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      })

      if (!profile) return null

      return formatPublicPayload(profile)
    },
    ["public-magui-connect-slug", slug],
    {
      revalidate: CACHE_TTL.DASHBOARD,
      tags: [cacheTags.maguiConnectPublicBySlug(slug)],
    }
  )()
}

function formatPublicPayload(profile: PublicMaguiConnectProfile) {
  return {
    profile: {
      id: profile.id,
      title: profile.displayName,
      description: profile.headline,
      displayName: profile.displayName,
      headline: profile.headline,
      domain: profile.domain,
      slug: profile.slug,
    },
    links: profile.links.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      sortOrder: link.sortOrder,
    })),
  }
}
