import { unstable_cache } from "next/cache"

import { CACHE_TTL } from "@/src/config/cache"

import prisma from "./prisma"

export const getDocumentsCached = () =>
  unstable_cache(
    async () => {
      return prisma.document.findMany({
        include: {
          client: {
            select: { name: true, email: true },
          },
          project: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    },
    ["admin-documents-list"],
    {
      revalidate: CACHE_TTL.PROJECT_ROWS,
      tags: ["admin:documents"],
    }
  )()

export const getDocumentDetailsCached = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.document.findUnique({
        where: { id },
        include: {
          client: true,
          project: true,
          lead: true,
          clauses: {
            orderBy: { order: "asc" },
          },
          signers: true,
          versions: {
            orderBy: { createdAt: "desc" },
            include: {
              createdBy: {
                select: { name: true },
              },
            },
          },
        },
      })
    },
    [`document-details-${id}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [`admin:document:${id}`],
    }
  )()

export const getProjectDocumentsCached = (projectId: string) =>
  unstable_cache(
    async () => {
      return prisma.document.findMany({
        where: { projectId },
        include: {
          signers: true,
        },
        orderBy: { createdAt: "desc" },
      })
    },
    [`project-documents-${projectId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [`project:documents:${projectId}`],
    }
  )()
