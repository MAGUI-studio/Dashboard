import { cache } from "react"

import { unstable_cache } from "next/cache"

import { UserRole } from "@/src/generated/client/enums"

import { env } from "@/src/config/env"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

const dataCacheTtl = env.DATA_CACHE_TTL_SECONDS

const getAdminClientOptionsCached = unstable_cache(
  async () => {
    return prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
      },
      orderBy: [{ companyName: "asc" }, { name: "asc" }],
    })
  },
  ["admin-client-options"],
  { revalidate: dataCacheTtl, tags: [cacheTags.adminClientOptions] }
)

export const getAdminClientOptions = cache(getAdminClientOptionsCached)

const getAdminClientRowsCached = (page: number = 1, limit: number = 50) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [clients, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: { role: UserRole.CLIENT },
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            _count: {
              select: {
                projects: true,
              },
            },
            projects: {
              select: {
                id: true,
                status: true,
              },
            },
          },
          orderBy: { name: "asc" },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: { role: UserRole.CLIENT } }),
      ])
      return { clients, totalCount, totalPages: Math.ceil(totalCount / limit) }
    },
    ["admin-client-rows", page.toString(), limit.toString()],
    { revalidate: dataCacheTtl, tags: [cacheTags.adminClientOptions] }
  )()

export const getAdminClientRows = getAdminClientRowsCached

const getAdminClientDetailsCached = unstable_cache(
  async (clerkId: string) => {
    return prisma.user.findUnique({
      where: { clerkId },
      include: {
        projects: {
          include: {
            client: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    })
  },
  ["admin-client-details"],
  { revalidate: dataCacheTtl, tags: [cacheTags.adminClientOptions] }
)

export const getAdminClientDetails = (id: string) =>
  unstable_cache(
    async () => getAdminClientDetailsCached(id),
    ["admin-client-details", id],
    {
      revalidate: dataCacheTtl,
      tags: [cacheTags.adminClient(id), cacheTags.adminClientOptions],
    }
  )()
