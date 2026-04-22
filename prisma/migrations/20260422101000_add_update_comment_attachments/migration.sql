-- CreateTable
CREATE TABLE "UpdateCommentAttachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "customId" TEXT,
    "type" "AssetType" NOT NULL DEFAULT 'DOCUMENT',
    "mimeType" TEXT,
    "size" INTEGER,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateCommentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UpdateCommentAttachment_commentId_idx" ON "UpdateCommentAttachment"("commentId");

-- CreateIndex
CREATE INDEX "UpdateCommentAttachment_createdAt_idx" ON "UpdateCommentAttachment"("createdAt");

-- AddForeignKey
ALTER TABLE "UpdateCommentAttachment" ADD CONSTRAINT "UpdateCommentAttachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "UpdateComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
