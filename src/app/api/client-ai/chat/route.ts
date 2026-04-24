import { google } from "@ai-sdk/google"
import { auth } from "@clerk/nextjs/server"
import { streamText, tool } from "ai"
import { z } from "zod"

import prisma from "@/src/lib/prisma"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, projectId } = await req.json()
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (!user) {
    return new Response("User not found", { status: 404 })
  }

  // Verify project access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      clientId: user.id,
    },
    include: {
      client: true,
    },
  })

  if (!project) {
    return new Response("Project not found or access denied", { status: 403 })
  }

  const result = streamText({
    model: google("gemini-1.5-pro-latest"),
    system: `Você é o assistente virtual da MAGUI.studio para clientes.
Seu objetivo é ajudar o cliente com informações sobre o projeto "${project.name}" e o funcionamento da MAGUI.
Regras OBRIGATÓRIAS:
1. Responda apenas com base nos dados do projeto e da MAGUI.studio.
2. Se o cliente perguntar algo fora do contexto do projeto ou da MAGUI, recuse educadamente.
3. Não invente prazos, valores ou entregas. Use as ferramentas disponíveis para consultar dados reais.
4. Mantenha um tom profissional, direto e estratégico (Padrão MAGUI).
5. Se não encontrar uma informação, diga que não tem dados suficientes no momento.
6. Você tem acesso a ferramentas para consultar o status atual, tarefas e financeiro.
7. Nunca mencione outros clientes ou projetos.`,
    messages,
    tools: {
      getProjectStatus: tool({
        description: "Obtém o status atual, progresso e categoria do projeto.",
        parameters: z.object({}),
        execute: async () => {
          return {
            status: project.status,
            progress: project.progress,
            category: project.category,
            startDate: project.startDate,
            deadline: project.deadline,
          }
        },
      }),
      getPendingTasks: tool({
        description:
          "Lista as tarefas e solicitações pendentes para o cliente.",
        parameters: z.object({}),
        execute: async () => {
          const tasks = await prisma.actionItem.findMany({
            where: {
              projectId: project.id,
              status: "PENDING",
              targetRole: "CLIENT",
            },
            orderBy: { dueDate: "asc" },
          })
          return tasks.map((t) => ({ title: t.title, dueDate: t.dueDate }))
        },
      }),
      getFinancialSummary: tool({
        description:
          "Obtém o resumo financeiro do projeto (total, pago e pendente).",
        parameters: z.object({}),
        execute: async () => {
          const invoices = await prisma.invoice.findMany({
            where: { projectId: project.id },
            include: { installments: true },
          })
          const totalValue = invoices.reduce(
            (acc, inv) => acc + inv.totalAmount,
            0
          )
          const paidValue = invoices.reduce((acc, inv) => {
            return (
              acc +
              inv.installments
                .filter((i) => i.status === "PAID")
                .reduce((sum, inst) => sum + inst.amount, 0)
            )
          }, 0)
          return {
            total: totalValue,
            paid: paidValue,
            pending: totalValue - paidValue,
            currency: project.budget?.split(" ")[0] || "BRL",
          }
        },
      }),
    },
  })

  return result.toDataStreamResponse()
}
