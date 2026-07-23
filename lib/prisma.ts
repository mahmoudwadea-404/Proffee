import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma

/**
 * Atomically decrement stock for a product, but only if sufficient stock exists.
 * Returns true if the decrement succeeded, false if stock was insufficient.
 * Uses PostgreSQL's GREATEST(col - val, 0) with a WHERE guard to avoid overselling.
 */
export async function atomicDecrementStock(
  tx: { $executeRaw: PrismaClient["$executeRaw"] },
  productId: string,
  quantity: number
): Promise<boolean> {
  const result = await tx.$executeRaw`
    UPDATE "Product"
    SET stock = GREATEST(stock - ${quantity}, 0),
        "updatedAt" = NOW()
    WHERE id = ${productId} AND stock >= ${quantity}
  `
  return result > 0
}
