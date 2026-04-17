import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { logger } from "@/src/lib/logger"

import { PrismaClient } from "../generated/client/index.js"

const connectionString = `${process.env.DATABASE_URL}`
const isExternalDb =
  connectionString.includes("neon.tech") ||
  connectionString.includes("supabase.co")

const pool = new pg.Pool({
  connectionString:
    isExternalDb && !connectionString.includes("sslmode=")
      ? `${connectionString}${connectionString.includes("?") ? "&" : "?"}sslmode=verify-full`
      : connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on("error", (err: Error) => {
  logger.error("Unexpected error on idle client", { err })
})

const adapter = new PrismaPg(pool)

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
