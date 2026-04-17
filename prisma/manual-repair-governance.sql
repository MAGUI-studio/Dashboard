DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeadSource') THEN
    CREATE TYPE "LeadSource" AS ENUM (
      'REFERRAL',
      'ORGANIC',
      'INSTAGRAM',
      'LINKEDIN',
      'WEBSITE',
      'OUTBOUND',
      'EVENT',
      'OTHER'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
    CREATE TYPE "NotificationType" AS ENUM (
      'UPDATE_PENDING_APPROVAL',
      'UPDATE_APPROVED',
      'UPDATE_REJECTED',
      'BRIEFING_SUBMITTED',
      'ASSET_UPLOADED',
      'PROJECT_STATUS_CHANGED',
      'LEAD_ASSIGNED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditActorType') THEN
    CREATE TYPE "AuditActorType" AS ENUM ('SYSTEM', 'USER');
  END IF;
END $$;

ALTER TABLE "Update"
  ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE "Asset"
  ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "assignedToId" TEXT,
  ADD COLUMN IF NOT EXISTS "lastContactAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nextActionAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "source" "LeadSource" NOT NULL DEFAULT 'OTHER';

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "ctaPath" TEXT,
  "metadata" JSONB,
  "readAt" TIMESTAMP(3),
  "userId" TEXT NOT NULL,
  "projectId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "metadata" JSONB,
  "actorType" "AuditActorType" NOT NULL DEFAULT 'SYSTEM',
  "actorId" TEXT,
  "projectId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE INDEX IF NOT EXISTS "Lead_nextActionAt_idx" ON "Lead"("nextActionAt");

CREATE INDEX IF NOT EXISTS "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");
CREATE INDEX IF NOT EXISTS "Project_updatedAt_idx" ON "Project"("updatedAt");

CREATE INDEX IF NOT EXISTS "Update_projectId_idx" ON "Update"("projectId");
CREATE INDEX IF NOT EXISTS "Update_approvalStatus_idx" ON "Update"("approvalStatus");
CREATE INDEX IF NOT EXISTS "Update_createdAt_idx" ON "Update"("createdAt");

CREATE INDEX IF NOT EXISTS "ActionItem_projectId_idx" ON "ActionItem"("projectId");
CREATE INDEX IF NOT EXISTS "ActionItem_status_idx" ON "ActionItem"("status");
CREATE INDEX IF NOT EXISTS "ActionItem_dueDate_idx" ON "ActionItem"("dueDate");

CREATE INDEX IF NOT EXISTS "Asset_projectId_idx" ON "Asset"("projectId");
CREATE INDEX IF NOT EXISTS "Asset_order_idx" ON "Asset"("order");

CREATE INDEX IF NOT EXISTS "Version_projectId_idx" ON "Version"("projectId");
CREATE INDEX IF NOT EXISTS "Version_createdAt_idx" ON "Version"("createdAt");

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_readAt_idx" ON "Notification"("readAt");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX IF NOT EXISTS "Notification_projectId_idx" ON "Notification"("projectId");

CREATE INDEX IF NOT EXISTS "AuditLog_projectId_idx" ON "AuditLog"("projectId");
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Lead_assignedToId_fkey'
  ) THEN
    ALTER TABLE "Lead"
      ADD CONSTRAINT "Lead_assignedToId_fkey"
      FOREIGN KEY ("assignedToId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Notification_userId_fkey'
  ) THEN
    ALTER TABLE "Notification"
      ADD CONSTRAINT "Notification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Notification_projectId_fkey'
  ) THEN
    ALTER TABLE "Notification"
      ADD CONSTRAINT "Notification_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'AuditLog_actorId_fkey'
  ) THEN
    ALTER TABLE "AuditLog"
      ADD CONSTRAINT "AuditLog_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'AuditLog_projectId_fkey'
  ) THEN
    ALTER TABLE "AuditLog"
      ADD CONSTRAINT "AuditLog_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
