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
