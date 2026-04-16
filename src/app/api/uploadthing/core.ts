import { auth } from "@clerk/nextjs/server"
import { type FileRouter, createUploadthing } from "uploadthing/next"

import prisma from "@/src/lib/prisma"

const f = createUploadthing()

export const ourFileRouter = {
  projectAsset: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    text: { maxFileSize: "4MB", maxFileCount: 5 },
    blob: { maxFileSize: "32MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth()
      if (!userId) throw new Error("Unauthorized")

      // Here we could also check for admin role if needed
      return { userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("File URL", file.url)

      // Note: We don't have the projectId here easily via the default middleware
      // without passing it in headers or query params.
      // We'll handle the database entry on the client-side callback for now or
      // improve this with input validation.

      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
