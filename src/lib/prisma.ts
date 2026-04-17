import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { logger } from "@/src/lib/logger"

import { PrismaClient } from "../generated/client/client"

const rawConnectionString = `${process.env.DATABASE_URL}`

function normalizeConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString)

    if (
      url.searchParams.get("sslmode") === "require" &&
      !url.searchParams.has("uselibpqcompat")
    ) {
      url.searchParams.set("uselibpqcompat", "true")
    }

    return url.toString()
  } catch {
    return connectionString
  }
}

const connectionString = normalizeConnectionString(rawConnectionString)
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

function hasRequiredDelegates(
  client: PrismaClient | undefined
): client is PrismaClient {
  if (!client) {
    return false
  }

  return Boolean(
    client.user &&
    client.project &&
    client.update &&
    client.asset &&
    client.notification &&
    client.auditLog
  )
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = hasRequiredDelegates(globalThis.prisma)
  ? globalThis.prisma
  : prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
