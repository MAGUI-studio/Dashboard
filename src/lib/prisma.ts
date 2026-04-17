import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { logger } from "@/src/lib/logger"

import { PrismaClient } from "../generated/client/client.js"

const connectionString = `${process.env.DATABASE_URL}`
const isExternalDb =
  connectionString.includes("neon.tech") ||
  connectionString.includes("supabase.co") ||
  connectionString.includes("db.prisma.io")

const shouldUseSsl =
  isExternalDb ||
  connectionString.includes("sslmode=require") ||
  connectionString.includes("sslmode=verify-full")

const pool = new pg.Pool({
  connectionString,
  ssl: shouldUseSsl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
})

pool.on("error", (err: Error) => {
  logger.error({ err }, "Unexpected error on idle client")
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
