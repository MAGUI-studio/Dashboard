import {
  AssetType,
  Priority,
  ProjectCategory,
  ProjectStatus,
} from "@/src/generated/client"

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
  briefing: Record<string, unknown> | null
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
