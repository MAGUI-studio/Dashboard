import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { logger } from "@/src/lib/logger"

import { env } from "@/src/config/env"

import { PrismaClient } from "../generated/client/client"

const connectionString = env.DATABASE_URL

const isExternalDb =
  connectionString.includes("neon.tech") ||
  connectionString.includes("supabase.co") ||
  connectionString.includes("db.prisma.io")

const shouldUseSsl =
  isExternalDb ||
  connectionString.includes("sslmode=require") ||
  connectionString.includes("sslmode=verify-full")

declare global {
  var pgPool: pg.Pool | undefined
  var prismaAdapter: PrismaPg | undefined
  var prisma: PrismaClient | undefined
}

function createPool(): pg.Pool {
  const pool = new pg.Pool({
    connectionString,
    ssl: shouldUseSsl
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    keepAlive: true,
  })

  pool.on("error", (err: Error) => {
    logger.error({ err }, "Unexpected error on idle client")
  })

  return pool
}

function getPool(): pg.Pool {
  if (!globalThis.pgPool) {
    globalThis.pgPool = createPool()
  }

  return globalThis.pgPool
}

function getAdapter(): PrismaPg {
  if (!globalThis.prismaAdapter) {
    globalThis.prismaAdapter = new PrismaPg(getPool())
  }

  return globalThis.prismaAdapter
}

function prismaClientSingleton(): PrismaClient {
  return new PrismaClient({ adapter: getAdapter() })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
