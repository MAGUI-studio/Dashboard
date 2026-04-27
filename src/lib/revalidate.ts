import { revalidateTag } from "next/cache"

import { cacheTags } from "./cache-tags"

export function revalidateProjectData(projectId?: string) {
  revalidateTag(cacheTags.clientProjects)
  revalidateTag(cacheTags.clientProject)
  if (projectId) {
    revalidateTag(`client:project:${projectId}`)
  }
  revalidateTag(cacheTags.clientPendingApprovals)
  revalidateTag(cacheTags.clientHome)
  revalidateTag(cacheTags.adminClientOptions)
  revalidateTag(cacheTags.adminProjects)
  revalidateTag(cacheTags.adminDashboard)
  revalidateTag(cacheTags.adminSearch)
}

export function revalidateCrmData() {
  revalidateTag(cacheTags.adminCrm)
  revalidateTag(cacheTags.adminDashboard)
}

export function revalidateCrmLeads() {
  revalidateTag(cacheTags.adminCrmLeads)
  revalidateTag(cacheTags.adminDashboard)
}

export function revalidateCrmLead(id: string) {
  revalidateTag(cacheTags.adminLead(id))
}

export function revalidateCrmTemplates() {
  revalidateTag(cacheTags.adminCrmTemplates)
}

export function revalidateCrmViews(userId: string) {
  revalidateTag(cacheTags.adminCrmViews(userId))
}

export function revalidateCrmPrefs(userId: string) {
  revalidateTag(cacheTags.adminCrmPrefs(userId))
}

export function revalidateProjectTimeline(projectId: string) {
  revalidateTag(cacheTags.projectTimeline(projectId))
  revalidateTag(cacheTags.adminDashboard)
}

export function revalidateProjectAssets(projectId: string) {
  revalidateTag(cacheTags.projectAssets(projectId))
}

export function revalidateProjectMembers(projectId: string) {
  revalidateTag(cacheTags.projectMembers(projectId))
  revalidateTag(cacheTags.adminProject(projectId))
}

export function revalidateProjectBriefing(projectId: string) {
  revalidateTag(cacheTags.projectBriefing(projectId))
}

export function revalidateProjectThreads(projectId: string) {
  revalidateTag(cacheTags.projectThreads(projectId))
}

export function revalidateProjectDecisions(projectId: string) {
  revalidateTag(cacheTags.projectDecisions(projectId))
}

export function revalidateProjectStatus(projectId: string) {
  revalidateTag(cacheTags.adminProject(projectId))
  revalidateTag(cacheTags.clientProject)
}

export function revalidateClientNotifications() {
  revalidateTag(cacheTags.clientNotifications)
  revalidateTag(cacheTags.clientPendingApprovals)
}
