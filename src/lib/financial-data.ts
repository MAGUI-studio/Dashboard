import { unstable_cache } from "next/cache"

import { CACHE_TTL } from "@/src/config/cache"

import prisma from "./prisma"

export const getProjectInvoicesCached = (projectId: string) =>
  unstable_cache(
    async () => {
      return prisma.invoice.findMany({
        where: { projectId },
        include: {
          installments: {
            orderBy: { number: "asc" },
            include: {
              paymentEvents: {
                orderBy: { date: "desc" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    },
    [`project-invoices-${projectId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [`project:financial:${projectId}`],
    }
  )()

export const getClientInvoicesCached = (clientId: string) =>
  unstable_cache(
    async () => {
      return prisma.invoice.findMany({
        where: { project: { clientId } },
        include: {
          project: { select: { name: true } },
          installments: {
            orderBy: { number: "asc" },
          },
        },
        orderBy: { dueDate: "desc" },
      })
    },
    [`client-invoices-${clientId}`],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [`client:financial:${clientId}`],
    }
  )()

export const getFinancialSummaryCached = () =>
  unstable_cache(
    async () => {
      const invoices = await prisma.invoice.findMany({
        include: { installments: true },
      })

      const totalValue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
      const paidValue = invoices.reduce((acc, inv) => {
        const paid = inv.installments
          .filter((i) => i.status === "PAID")
          .reduce((sum, inst) => sum + inst.amount, 0)
        return acc + paid
      }, 0)

      return {
        totalValue,
        paidValue,
        pendingValue: totalValue - paidValue,
        invoiceCount: invoices.length,
        paidPercentage: totalValue > 0 ? (paidValue / totalValue) * 100 : 0,
      }
    },
    ["admin-financial-summary"],
    {
      revalidate: CACHE_TTL.DASHBOARD,
      tags: ["admin:financial"],
    }
  )()
