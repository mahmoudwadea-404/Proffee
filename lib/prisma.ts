import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? ""
  const masked = url.replace(/:([^@\/]+)@/, ":***@")

  console.log("[Prisma] Creating new PrismaClient")
  console.log("[Prisma] DATABASE_URL (masked):", masked)
  console.log("[Prisma] NODE_ENV:", process.env.NODE_ENV)

  try {
    const parsed = new URL(url)
    console.log("[Prisma] Host:", parsed.hostname)
    console.log("[Prisma] Port:", parsed.port)
    console.log("[Prisma] Database:", parsed.pathname)
    console.log("[Prisma] Username:", parsed.username)
  } catch {
    console.error("[Prisma] Failed to parse DATABASE_URL")
  }

  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  })

  client.$on("query", (e) => {
    console.log("[Prisma Query]")
    console.log("  Query: " + e.query)
    console.log("  Params: " + e.params)
    console.log("  Duration: " + e.duration + "ms")
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma

let loggedDbInfo = false
export async function logDatabaseInfo() {
  if (loggedDbInfo) return
  loggedDbInfo = true
  try {
    const result = await prisma.$queryRawUnsafe<{ version: string }[]>(
      "SELECT version() as version"
    )
    console.log("[DB] PostgreSQL version:", result[0]?.version ?? "unknown")

    const settings = await prisma.$queryRawUnsafe<{ name: string; setting: string }[]>(
      "SELECT name, setting FROM pg_settings WHERE name IN ('server_version', 'max_connections', 'pool_mode') ORDER BY name"
    )
    for (const s of settings) {
      console.log(`[DB] ${s.name}: ${s.setting}`)
    }
  } catch (err) {
    console.error("[DB] Failed to query database info:", err)
  }
}
