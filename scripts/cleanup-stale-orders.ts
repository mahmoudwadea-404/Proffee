/**
 * One-off cleanup script: marks stale test orders as FAILED.
 *
 * Criteria:
 *   - paymentStatus IN ('PENDING', 'UNPAID')
 *   - paymobOrderId IS NULL          (Paymob never acknowledged them)
 *   - paymentMethod = 'CARD'
 *   - createdAt < 1 hour ago         (not a currently-in-progress checkout)
 *
 * These are abandoned/failed test attempts where the order row was created in
 * our DB but the Paymob intention or webhook never linked back — they will
 * never transition to PAID on their own.
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000)

async function main() {
  console.log("[cleanup] Looking for stale CARD orders created before", ONE_HOUR_AGO.toISOString())

  const staleOrders = await prisma.order.findMany({
    where: {
      paymentStatus: { in: ["PENDING", "UNPAID"] },
      paymobOrderId: null,
      paymentMethod: "CARD",
      createdAt: { lt: ONE_HOUR_AGO },
    },
    select: {
      id: true,
      paymentStatus: true,
      paymobOrderId: true,
      paymentMethod: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })

  console.log(`[cleanup] Found ${staleOrders.length} stale order(s) to mark as FAILED`)

  if (staleOrders.length === 0) {
    console.log("[cleanup] Nothing to do.")
    return
  }

  for (const o of staleOrders) {
    console.log(
      `  - ${o.id}  status=${o.paymentStatus}  total=${o.total}  created=${o.createdAt.toISOString()}`
    )
  }

  const result = await prisma.order.updateMany({
    where: {
      id: { in: staleOrders.map((o) => o.id) },
    },
    data: {
      paymentStatus: "FAILED",
    },
  })

  console.log(`[cleanup] Marked ${result.count} order(s) as FAILED`)

  // Verify
  const verify = await prisma.order.findMany({
    where: {
      id: { in: staleOrders.map((o) => o.id) },
    },
    select: { id: true, paymentStatus: true },
  })

  const allFailed = verify.every((o) => o.paymentStatus === "FAILED")
  console.log(`[cleanup] Verification: all ${verify.length} orders now FAILED = ${allFailed}`)

  if (!allFailed) {
    console.error("[cleanup] WARNING: Some orders were not updated!")
    console.error(verify.filter((o) => o.paymentStatus !== "FAILED"))
  }
}

main()
  .catch((e) => {
    console.error("[cleanup] Fatal error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
