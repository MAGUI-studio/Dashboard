import { unstable_cache } from "next/cache"

import { CACHE_TTL } from "@/src/config/cache"

import prisma from "./prisma"

export const getProjectHandoffCached = (projectId: string) =>
  unstable_cache(
    async () => {
      return prisma.projectHandoff.findUnique({
        where: { projectId },
        include: {
          proposal: {
            include: {
              items: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      })
    },
    [`project-handoff-${projectId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
    }
  )()

export const getProjectKickoffCached = (projectId: string) =>
  unstable_cache(
    async () => {
      return prisma.projectKickoffChecklist.findUnique({
        where: { projectId },
      })
    },
    [`project-kickoff-${projectId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
    }
  )()
