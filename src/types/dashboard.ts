export interface DashboardProject {
  id: string
  name: string
  description: string | null
  status: any // eslint-disable-line @typescript-eslint/no-explicit-any
  progress: number
  budget: string | null
  deadline: Date | null
  startDate: Date
  liveUrl: string | null
  repositoryUrl: string | null
  category: any // eslint-disable-line @typescript-eslint/no-explicit-any
  priority: any // eslint-disable-line @typescript-eslint/no-explicit-any
  clientId: string
  briefing: any // eslint-disable-line @typescript-eslint/no-explicit-any
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
  type: any // eslint-disable-line @typescript-eslint/no-explicit-any
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
