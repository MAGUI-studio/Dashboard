import { revalidateTag } from "next/cache"

import { cacheTags } from "./cache-tags"

export function revalidateProjectData(projectId?: string) {
  revalidateTag(cacheTags.clientProjects, "default")
  revalidateTag(cacheTags.clientProject, "default")
  if (projectId) {
    revalidateTag(`client:project:${projectId}`, "default")
  }
  revalidateTag(cacheTags.clientPendingApprovals, "default")
  revalidateTag(cacheTags.clientHome, "default")
  revalidateTag(cacheTags.adminClientOptions, "default")
  revalidateTag(cacheTags.adminProjects, "default")
  revalidateTag(cacheTags.adminDashboard, "default")
  revalidateTag(cacheTags.adminSearch, "default")
}

export function revalidateCrmData() {
  revalidateTag(cacheTags.adminCrm, "default")
  revalidateTag(cacheTags.adminDashboard, "default")
}

export function revalidateCrmLeads() {
  revalidateTag(cacheTags.adminCrmLeads, "default")
  revalidateTag(cacheTags.adminDashboard, "default")
}

export function revalidateCrmLead(id: string) {
  revalidateTag(cacheTags.adminLead(id), "default")
}

export function revalidateCrmTemplates() {
  revalidateTag(cacheTags.adminCrmTemplates, "default")
}

export function revalidateCrmViews(userId: string) {
  revalidateTag(cacheTags.adminCrmViews(userId), "default")
}

export function revalidateCrmPrefs(userId: string) {
  revalidateTag(cacheTags.adminCrmPrefs(userId), "default")
}

export function revalidateProjectTimeline(projectId: string) {
  revalidateTag(cacheTags.projectTimeline(projectId), "default")
  revalidateTag(cacheTags.adminDashboard, "default")
}

export function revalidateProjectAssets(projectId: string) {
  revalidateTag(cacheTags.projectAssets(projectId), "default")
}

export function revalidateProjectMembers(projectId: string) {
  revalidateTag(cacheTags.projectMembers(projectId), "default")
  revalidateTag(cacheTags.adminProject(projectId), "default")
}

export function revalidateProjectBriefing(projectId: string) {
  revalidateTag(cacheTags.projectBriefing(projectId), "default")
}

export function revalidateProjectThreads(projectId: string) {
  revalidateTag(cacheTags.projectThreads(projectId), "default")
}

export function revalidateProjectDecisions(projectId: string) {
  revalidateTag(cacheTags.projectDecisions(projectId), "default")
}

export function revalidateProjectStatus(projectId: string) {
  revalidateTag(cacheTags.adminProject(projectId), "default")
  revalidateTag(cacheTags.clientProject, "default")
}

export function revalidateClientNotifications() {
  revalidateTag(cacheTags.clientNotifications, "default")
  revalidateTag(cacheTags.clientPendingApprovals, "default")
}
