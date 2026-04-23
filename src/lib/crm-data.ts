import { cache } from "react"

import { unstable_cache } from "next/cache"

import { Prisma } from "@/src/generated/client/client"
import { LeadStatus } from "@/src/generated/client/enums"
import { Lead, MessageTemplate, SavedView } from "@/src/types/crm"

import { env } from "@/src/config/env"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

const dataCacheTtl = env.DATA_CACHE_TTL_SECONDS

// Types for DTO mapping
type LeadWithRelations = Prisma.LeadGetPayload<{
  include: {
    activities: {
      include: {
        author: {
          select: { id: true; name: true }
        }
      }
    }
    followUpNotes: {
      include: {
        author: {
          select: { id: true; name: true }
        }
      }
    }
  }
}>

type MessageTemplateType = Prisma.MessageTemplateGetPayload<
  Record<string, never>
>
type SavedViewType = Prisma.SavedViewGetPayload<Record<string, never>>

export const toLeadDto = (lead: LeadWithRelations): Lead => ({
  ...lead,
  activities: lead.activities.map((a) => ({
    ...a,
    metadata: (a.metadata as Record<string, unknown>) || {},
  })),
  followUpNotes: lead.followUpNotes.map((n) => ({
    ...n,
  })),
})

export const toMessageTemplateDto = (
  template: MessageTemplateType
): MessageTemplate => ({
  ...template,
})

export const toSavedViewDto = (view: SavedViewType): SavedView => ({
  ...view,
  filtersJson: (view.filtersJson as Record<string, unknown>) || {},
})

const getLeadsCached = unstable_cache(
  async () => {
    const leads = await prisma.lead.findMany({
      where: {
        status: {
          not: LeadStatus.DESCARTADO,
        },
      },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
        followUpNotes: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ nextActionAt: "asc" }, { createdAt: "desc" }],
    })
    return leads
  },
  ["crm-leads"],
  { revalidate: dataCacheTtl, tags: [cacheTags.adminCrm] }
)

export const getLeads = cache(async () => {
  const leads = await getLeadsCached()
  return (leads as LeadWithRelations[]).map(toLeadDto)
})

const getLeadDetailsCached = unstable_cache(
  async (id: string) => {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
        followUpNotes: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })
  },
  ["crm-lead-details"],
  { revalidate: dataCacheTtl }
)

export const getLeadDetails = (id: string) =>
  unstable_cache(
    async () => {
      const lead = await getLeadDetailsCached(id)
      return lead ? toLeadDto(lead as LeadWithRelations) : null
    },
    ["crm-lead-details", id],
    {
      revalidate: dataCacheTtl,
      tags: [cacheTags.adminLead(id), cacheTags.adminCrm],
    }
  )()

const getMessageTemplatesCached = unstable_cache(
  async (scope: string = "LEAD") => {
    return prisma.messageTemplate.findMany({
      where: { scope },
      orderBy: { createdAt: "asc" },
    })
  },
  ["crm-message-templates"],
  { revalidate: dataCacheTtl, tags: [cacheTags.adminCrm] }
)

export const getMessageTemplates = (scope: string = "LEAD") =>
  unstable_cache(
    async () => {
      const templates = await getMessageTemplatesCached(scope)
      return (templates as MessageTemplateType[]).map(toMessageTemplateDto)
    },
    ["crm-message-templates", scope],
    { revalidate: dataCacheTtl, tags: [cacheTags.adminCrm] }
  )()

const getSavedCrmViewsCached = unstable_cache(
  async (userId: string) => {
    return prisma.savedView.findMany({
      where: {
        userId,
        module: "CRM",
      },
      orderBy: { updatedAt: "desc" },
    })
  },
  ["crm-saved-views"],
  { revalidate: dataCacheTtl }
)

export const getSavedCrmViews = (userId: string) =>
  unstable_cache(
    async () => {
      const views = await getSavedCrmViewsCached(userId)
      return (views as SavedViewType[]).map(toSavedViewDto)
    },
    ["crm-saved-views", userId],
    { revalidate: dataCacheTtl, tags: [cacheTags.adminCrm] }
  )()

const getCrmPreferencesCached = unstable_cache(
  async (userId: string) => {
    return prisma.savedView.findFirst({
      where: {
        userId,
        module: "CRM_PREFERENCES",
        name: "default",
      },
    })
  },
  ["crm-preferences"],
  { revalidate: dataCacheTtl }
)

export const getCrmPreferences = (userId: string) =>
  unstable_cache(
    async () => {
      const prefs = await getCrmPreferencesCached(userId)
      return prefs ? toSavedViewDto(prefs as SavedViewType) : null
    },
    ["crm-preferences", userId],
    { revalidate: dataCacheTtl, tags: [cacheTags.adminCrm] }
  )()
