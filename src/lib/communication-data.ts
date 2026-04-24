import { unstable_cache } from "next/cache"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

export const getProjectThreadsCached = (projectId: string) =>
  unstable_cache(
    async () => {
      return prisma.thread.findMany({
        where: { projectId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  avatarUrl: true,
                },
              },
              resolvedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    },
    [`project-threads-${projectId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.projectThreads(projectId)],
    }
  )()

export const getProjectDecisionsCached = (projectId: string) =>
  unstable_cache(
    async () => {
      return prisma.decision.findMany({
        where: { projectId },
        include: {
          decidedBy: {
            select: {
              id: true,
              name: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { decidedAt: "desc" },
      })
    },
    [`project-decisions-${projectId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.projectDecisions(projectId)],
    }
  )()

export const getEntityThreadCached = (entityType: string, entityId: string) =>
  unstable_cache(
    async () => {
      return prisma.thread.findFirst({
        where: { entityType, entityId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })
    },
    [`entity-thread-${entityType}-${entityId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
    }
  )()
