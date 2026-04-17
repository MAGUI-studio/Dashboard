import { auth } from "@clerk/nextjs/server"
import { type FileRouter, createUploadthing } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

import { logger } from "@/src/lib/logger"

const f = createUploadthing()

export const ourFileRouter = {
  projectAsset: f({
    pdf: { maxFileSize: "32MB" },
    image: { maxFileSize: "32MB" },
    blob: { maxFileSize: "32MB" },
  })
    .middleware(async () => {
      const { userId } = await auth()

      if (!userId) throw new UploadThingError("Unauthorized")

      return { userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Upload complete", { userId: metadata.userId, url: file.url })

      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
