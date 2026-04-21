import { auth } from "@clerk/nextjs/server"
import { type FileRouter, createUploadthing } from "uploadthing/next"
import { UTFiles, UploadThingError } from "uploadthing/server"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"
import { getCurrentAppUser } from "@/src/lib/project-governance"

const f = createUploadthing()

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

export const ourFileRouter = {
  projectAsset: f({
    pdf: { maxFileSize: "32MB" },
    image: { maxFileSize: "32MB" },
    blob: { maxFileSize: "32MB" },
  })
    .input(
      z
        .object({
          projectId: z.string().min(1).optional(),
          scope: z.enum(["assets", "timeline"]).optional(),
        })
        .optional()
    )
    .middleware(async ({ input, files }) => {
      const { userId } = await auth()

      if (!userId) throw new UploadThingError("Unauthorized")
      const appUser = await getCurrentAppUser()

      if (!input?.projectId) {
        return { userId }
      }

      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        select: {
          id: true,
          name: true,
          client: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          members: {
            where: {
              userId: appUser?.id ?? "",
            },
            select: {
              id: true,
            },
          },
        },
      })

      if (!project) {
        throw new UploadThingError("Project not found")
      }

      const canAccess =
        appUser?.role === "ADMIN" ||
        appUser?.role === "MEMBER" ||
        project.client.id === appUser?.id ||
        project.members.length > 0

      if (!canAccess) {
        throw new UploadThingError("Unauthorized")
      }

      const clientLabel =
        project.client.companyName ?? project.client.name ?? project.client.id
      const clientSlug = toSlug(clientLabel)
      const projectSlug = toSlug(project.name)
      const scope = input.scope ?? "assets"

      return {
        userId,
        projectId: project.id,
        [UTFiles]: files.map((file, index) => ({
          ...file,
          customId: `${clientSlug}/${projectSlug}/${scope}/${Date.now()}-${index}-${toSlug(file.name)}`,
        })),
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info(
        {
          userId: metadata.userId,
          projectId: metadata.projectId,
          url: file.url,
          customId: file.customId,
        },
        "Upload complete"
      )

      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
