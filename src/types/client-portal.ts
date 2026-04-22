import { DashboardProject, DashboardUpdate, DashboardAsset, DashboardActionItem } from "./dashboard"

export interface ClientHomeData {
  projects: DashboardProject[]
  pendingApprovals: DashboardUpdate[]
  pendingTasks: DashboardActionItem[]
  recentActivity: Array<{
    id: string
    title: string
    type: "update" | "approval" | "file" | "task"
    projectName: string
    createdAt: Date | string
    href: string
  }>
}

export type ClientProjectSummary = Pick<
  DashboardProject,
  "id" | "name" | "status" | "progress" | "deadline" | "updatedAt"
> & {
  lastUpdate?: DashboardUpdate
}
