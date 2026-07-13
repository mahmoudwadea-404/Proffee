import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookHMAC } from "@/lib/paymob"

export async function POST(request: Request) {
  console.log("")
  console.log("╔══════════════════════════════════════════════════════════╗")
  console.log("║          PAYMOB WEBHOOK RECEIVED                        ║")
  console.log("╚══════════════════════════════════════════════════════════╝")
  console.log("[Paymob Webhook] Timestamp:", new Date().toISOString())
  console.log("[Paymob Webhook] URL:", request.url)

  try {
    const body = await request.json()
    const obj = body?.obj

    if (!obj) {
      console.warn("[Paymob Webhook] ❌ Missing obj in request body")
      console.warn("[Paymob Webhook] Full body keys:", Object.keys(body ?? {}))
      return NextResponse.json({ error: "Missing obj" }, { status: 400 })
    }

    console.log("[Paymob Webhook] Received obj keys:", Object.keys(obj))
    console.log("[Paymob Webhook] obj.id (transactionId):", obj.id)
    console.log("[Paymob Webhook] obj.order:", JSON.stringify(obj.order))
    console.log("[Paymob Webhook] obj.success:", obj.success)
    console.log("[Paymob Webhook] obj.amount_cents:", obj.amount_cents)
    console.log("[Paymob Webhook] obj.currency:", obj.currency)
    console.log("[Paymob Webhook] obj.pending:", obj.pending)
    console.log("[Paymob Webhook] obj.error_occured:", obj.error_occured)

    const url = new URL(request.url)
    const receivedHMAC = url.searchParams.get("hmac") ?? ""

    if (!receivedHMAC) {
      console.warn("[Paymob Webhook] ❌ Missing HMAC query parameter")
      return NextResponse.json({ error: "Missing HMAC" }, { status: 401 })
    }
    console.log("[Paymob Webhook] HMAC received (length):", receivedHMAC.length)

    const isValid = verifyWebhookHMAC(obj, receivedHMAC)
    if (!isValid) {
      console.error("[Paymob Webhook] ❌ HMAC verification FAILED — rejecting request")
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 })
    }
    console.log("[Paymob Webhook] ✅ HMAC verification PASSED")

    const transactionId: number = obj.id
    const paymobOrderId: number = obj.order?.id
    const success: boolean = obj.success === true

    console.log("[Paymob Webhook] Extracted values:")
    console.log("[Paymob Webhook]   transactionId:", transactionId, "(type:", typeof transactionId, ")")
    console.log("[Paymob Webhook]   paymobOrderId:", paymobOrderId, "(type:", typeof paymobOrderId, ")")
    console.log("[Paymob Webhook]   success:", success)

    if (!paymobOrderId) {
      console.warn("[Paymob Webhook] ❌ paymobOrderId is falsy, nothing to update")
      return NextResponse.json({ received: true })
    }

    // Step 1: Find order by paymobOrderId
    console.log("[Paymob Webhook] Step 1: Looking up order by paymobOrderId:", paymobOrderId)
    const order = await prisma.order.findFirst({
      where: { paymobOrderId },
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
        paymobOrderId: true,
        paymobTransactionId: true,
        total: true,
      },
    })

    if (!order) {
      console.warn("[Paymob Webhook] ❌ No order found with paymobOrderId:", paymobOrderId)
      console.warn("[Paymob Webhook] This means createCardOrder stored a different paymobOrderId, or the order was never created.")

      // Debug: List all orders with any paymobOrderId to help diagnose
      const allPaymobOrders = await prisma.order.findMany({
        where: { paymobOrderId: { not: null } },
        select: { id: true, paymobOrderId: true, paymentStatus: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
      console.warn("[Paymob Webhook] All orders with paymobOrderId in DB:", JSON.stringify(allPaymobOrders, null, 2))

      const totalOrders = await prisma.order.count()
      console.warn("[Paymob Webhook] Total orders in DB:", totalOrders)

      return NextResponse.json({ received: true })
    }

    console.log("[Paymob Webhook] ✅ Found order:", JSON.stringify(order))

    // Step 2: Update order
    const newStatus = success ? "PAID" : "FAILED"
    console.log("[Paymob Webhook] Step 2: Updating order", order.id, "to paymentStatus:", newStatus)
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newStatus,
        paymobTransactionId: String(transactionId),
      },
      select: { id: true, paymentStatus: true, paymobTransactionId: true },
    })
    console.log("[Paymob Webhook] ✅ Order updated:", JSON.stringify(updatedOrder))

    // Step 3: Verify the update persisted
    console.log("[Paymob Webhook] Step 3: Verifying update persisted...")
    const verifyOrder = await prisma.order.findUnique({
      where: { id: order.id },
      select: { id: true, paymentStatus: true, paymobTransactionId: true },
    })
    console.log("[Paymob Webhook] Verification result:", JSON.stringify(verifyOrder))

    console.log("[Paymob Webhook] ✅ Webhook processing complete")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Paymob Webhook] ❌ Error processing webhook:", error)
    if (error instanceof Error) {
      console.error("[Paymob Webhook] Error message:", error.message)
      console.error("[Paymob Webhook] Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
