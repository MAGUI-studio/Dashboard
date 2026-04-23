import { revalidateTag } from "next/cache"

export const cacheTags = {
  adminProjects: "admin:projects",
  adminProject: (id: string) => `admin:project:${id}`,
  adminClientOptions: "admin:client-options",
  adminClient: (id: string) => `admin:client:${id}`,
  adminDashboard: "admin:dashboard",
  adminSearch: "admin:search",
  adminCrm: "admin:crm",
  adminLead: (id: string) => `admin:lead:${id}`,
  projectTimeline: (id: string) => `project:timeline:${id}`,
  projectAssets: (id: string) => `project:assets:${id}`,
  projectMembers: (id: string) => `project:members:${id}`,
  projectBriefing: (id: string) => `project:briefing:${id}`,
  clientProjects: "client:projects",
  clientProject: "client:project",
  clientPendingApprovals: "client:pending-approvals",
  clientHome: "client:home",
  clientNotifications: "client:notifications",
}

export function revalidateProjectData(projectId?: string) {
  revalidateTag(cacheTags.clientProjects, "max")
  revalidateTag(cacheTags.clientProject, "max")
  if (projectId) {
    revalidateTag(`client:project:${projectId}`, "max")
  }
  revalidateTag(cacheTags.clientPendingApprovals, "max")
  revalidateTag(cacheTags.clientHome, "max")
  revalidateTag(cacheTags.adminClientOptions, "max")
  revalidateTag(cacheTags.adminProjects, "max")
  revalidateTag(cacheTags.adminDashboard, "max")
  revalidateTag(cacheTags.adminSearch, "max")
}

export function revalidateCrmData(leadId?: string) {
  revalidateTag(cacheTags.adminCrm, "max")
  if (leadId) {
    revalidateTag(cacheTags.adminLead(leadId), "max")
  }
  revalidateTag(cacheTags.adminDashboard, "max")
}

export function revalidateProjectTimeline(projectId: string) {
  revalidateTag(cacheTags.projectTimeline(projectId), "max")
  revalidateTag(cacheTags.adminDashboard, "max")
}

export function revalidateProjectAssets(projectId: string) {
  revalidateTag(cacheTags.projectAssets(projectId), "max")
}

export function revalidateProjectMembers(projectId: string) {
  revalidateTag(cacheTags.projectMembers(projectId), "max")
  revalidateTag(cacheTags.adminProject(projectId), "max")
}

export function revalidateProjectBriefing(projectId: string) {
  revalidateTag(cacheTags.projectBriefing(projectId), "max")
}

export function revalidateProjectStatus(projectId: string) {
  revalidateTag(cacheTags.adminProject(projectId), "max")
  revalidateTag(cacheTags.clientProject, "max")
}

export function revalidateClientNotifications() {
  revalidateTag(cacheTags.clientNotifications, "max")
  revalidateTag(cacheTags.clientPendingApprovals, "max")
}
