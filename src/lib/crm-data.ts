import { cache } from "react"

import { unstable_cache } from "next/cache"

import { Prisma } from "@/src/generated/client/client"
import { LeadStatus } from "@/src/generated/client/enums"
import { Lead, MessageTemplate, SavedView } from "@/src/types/crm"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

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

const getLeadsCached = (page: number = 1, limit: number = 50) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [leads, totalCount] = await Promise.all([
        prisma.lead.findMany({
          where: {
            status: {
              not: LeadStatus.DESCARTADO,
            },
          },
          orderBy: [{ nextActionAt: "asc" }, { createdAt: "desc" }],
          skip,
          take: limit,
        }),
        prisma.lead.count({
          where: {
            status: {
              not: LeadStatus.DESCARTADO,
            },
          },
        }),
      ])
      return { leads, totalCount, totalPages: Math.ceil(totalCount / limit) }
    },
    ["crm-leads", page.toString(), limit.toString()],
    {
      revalidate: CACHE_TTL.LEADS,
      tags: [cacheTags.adminCrmLeads, cacheTags.adminCrm],
    }
  )()

export const getLeads = async (page: number = 1, limit: number = 100) => {
  const { leads } = await getLeadsCached(page, limit)
  return leads.map((l) => ({
    ...l,
    activities: [],
    followUpNotes: [],
  })) as Lead[]
}

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
  { revalidate: CACHE_TTL.LEADS }
)

export const getLeadDetails = (id: string) =>
  unstable_cache(
    async () => {
      const lead = await getLeadDetailsCached(id)
      return lead ? toLeadDto(lead as LeadWithRelations) : null
    },
    ["crm-lead-details", id],
    {
      revalidate: CACHE_TTL.LEADS,
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
  { revalidate: CACHE_TTL.USER_PREFERENCES, tags: [cacheTags.adminCrm] }
)

export const getLeadProposals = (leadId: string) =>
  unstable_cache(
    async () => {
      return prisma.proposal.findMany({
        where: { leadId },
        include: { items: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      })
    },
    ["crm-lead-proposals", leadId],
    {
      revalidate: CACHE_TTL.LEADS,
      tags: [cacheTags.adminLead(leadId), cacheTags.adminCrm],
    }
  )()

export const getMessageTemplates = (scope: string = "LEAD") =>
  unstable_cache(
    async () => {
      const templates = await getMessageTemplatesCached(scope)
      return (templates as MessageTemplateType[]).map(toMessageTemplateDto)
    },
    ["crm-message-templates", scope],
    {
      revalidate: CACHE_TTL.TEMPLATES,
      tags: [cacheTags.adminCrmTemplates, cacheTags.adminCrm],
    }
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
  { revalidate: CACHE_TTL.LEADS }
)

export const getSavedCrmViews = (userId: string) =>
  unstable_cache(
    async () => {
      const views = await getSavedCrmViewsCached(userId)
      return (views as SavedViewType[]).map(toSavedViewDto)
    },
    ["crm-saved-views", userId],
    {
      revalidate: CACHE_TTL.USER_PREFERENCES,
      tags: [cacheTags.adminCrmViews(userId), cacheTags.adminCrm],
    }
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
  { revalidate: CACHE_TTL.LEADS }
)

export const getCrmPreferences = (userId: string) =>
  unstable_cache(
    async () => {
      const prefs = await getCrmPreferencesCached(userId)
      return prefs ? toSavedViewDto(prefs as SavedViewType) : null
    },
    ["crm-preferences", userId],
    {
      revalidate: CACHE_TTL.USER_PREFERENCES,
      tags: [cacheTags.adminCrmPrefs(userId), cacheTags.adminCrm],
    }
  )()
