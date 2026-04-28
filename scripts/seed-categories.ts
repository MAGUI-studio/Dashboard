import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
import pg from "pg"

import { PrismaClient } from "../src/generated/client/index.js"

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = [
    {
      name: "Landing Page de Alta Conversão",
      description:
        "Desenvolvimento de página única focada em transformar visitantes em clientes, com carregamento instantâneo e otimização total para celular.",
      approach:
        "Desenvolvimento de página única focada em transformar visitantes em clientes, com carregamento instantâneo e otimização total para celular.",
      suggestedValue: 120_000,
      imageUrl: null,
      isSubscription: false,
    },
    {
      name: "Site Institucional",
      description:
        "Presença digital completa para sua empresa, com arquitetura moderna para transmitir autoridade e facilitar o contato do cliente.",
      approach:
        "Presença digital completa para sua empresa, com arquitetura moderna para transmitir autoridade e facilitar o contato do cliente.",
      suggestedValue: 180_000,
      imageUrl: null,
      isSubscription: false,
    },
    {
      name: "Plataforma com Agendamento",
      description:
        "Sistema inteligente para automação de reservas e gestão de horários, eliminando trabalho manual e erros de agenda.",
      approach:
        "Sistema inteligente para automação de reservas e gestão de horários, eliminando trabalho manual e erros de agenda.",
      suggestedValue: 250_000,
      imageUrl: null,
      isSubscription: false,
    },
    {
      name: "Plano de Estabilidade e Suporte",
      description:
        "Gestão técnica completa para garantir que sua empresa nunca fique offline, com atualizações de segurança e monitoramento 24/7.",
      approach:
        "Gestão técnica completa para garantir que sua empresa nunca fique offline, com atualizações de segurança e monitoramento 24/7.",
      suggestedValue: 10_000,
      imageUrl: null,
      isSubscription: true,
    },
  ] as const

  console.log("Seeding service categories...")

  for (const cat of categories) {
    const existing = await prisma.serviceCategory.findFirst({
      where: { name: cat.name },
      select: { id: true },
    })

    if (existing) {
      await prisma.serviceCategory.update({
        where: { id: existing.id },
        data: cat,
      })
      continue
    }

    await prisma.serviceCategory.create({ data: cat })
  }

  console.log("Seed finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
