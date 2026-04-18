import {
  AssetType,
  NotificationType,
  Priority,
  ProjectCategory,
  ProjectStatus,
  UserRole,
} from "@/src/generated/client/enums"

export interface DashboardProject {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  progress: number
  budget: string | null
  deadline: Date | null
  startDate: Date
  liveUrl: string | null
  repositoryUrl: string | null
  category: ProjectCategory
  priority: Priority
  clientId: string
  briefing: {
    brandTone: string
    visualReferences: string[]
    businessGoals: string
    primaryCta: string
    targetAudience: string
    differentiators: string
  } | null
  client: {
    id: string
    name: string | null
    email: string
    companyName: string | null
    phone: string | null
    position: string | null
    taxId: string | null
  }
  updates: DashboardUpdate[]
  assets: DashboardAsset[]
  actionItems?: DashboardActionItem[]
  versions?: DashboardVersion[]
  notifications?: DashboardNotification[]
  auditLogs?: DashboardAuditLog[]
}

export interface DashboardUpdate {
  id: string
  title: string
  description: string | null
  isMilestone: boolean
  imageUrl: string | null
  timezone: string
  projectId: string
  createdAt: Date | string
  project: {
    name: string
  }
  requiresApproval: boolean
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
  approvedAt: Date | string | null
  feedback: string | null
  attachments?: DashboardUpdateAttachment[]
}

export interface DashboardUpdateAttachment {
  id: string
  name: string
  url: string
  key: string
  customId: string | null
  type: AssetType
  mimeType: string | null
  size: number | null
  createdAt: Date | string
}

export interface DashboardNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  ctaPath: string | null
  readAt: Date | string | null
  createdAt: Date | string
  project?: {
    id: string
    name: string
  } | null
}

export interface DashboardAuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  summary: string
  createdAt: Date | string
  actorType: "SYSTEM" | "USER"
  actor: {
    id: string
    name: string | null
    role: UserRole
  } | null
}

export interface DashboardAsset {
  id: string
  name: string
  url: string
  key: string
  type: AssetType
  order: number
  timezone: string
  projectId: string
  createdAt: Date
}

export interface DashboardActionItem {
  id: string
  title: string
  description: string | null
  status: "PENDING" | "COMPLETED"
  dueDate: Date | string | null
  projectId: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DashboardVersion {
  id: string
  name: string
  deployUrl: string | null
  description: string | null
  scorePerformance: number | null
  scoreAccessibility: number | null
  scoreBestPractices: number | null
  scoreSEO: number | null
  projectId: string
  createdAt: Date | string
}
