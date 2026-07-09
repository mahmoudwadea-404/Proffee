import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookHMAC } from "@/lib/paymob"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const obj = body?.obj
    if (!obj) {
      console.warn("[Paymob Webhook] Missing obj in request body")
      return NextResponse.json({ error: "Missing obj" }, { status: 400 })
    }

    const url = new URL(request.url)
    const receivedHMAC = url.searchParams.get("hmac") ?? ""

    if (!receivedHMAC) {
      console.warn("[Paymob Webhook] Missing HMAC query parameter")
      return NextResponse.json({ error: "Missing HMAC" }, { status: 401 })
    }

    const isValid = verifyWebhookHMAC(obj, receivedHMAC)
    if (!isValid) {
      console.error("[Paymob Webhook] HMAC verification FAILED — rejecting request")
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 })
    }

    const transactionId: number = obj.id
    const paymobOrderId: number = obj.order?.id
    const success: boolean = obj.success === true

    console.log(
      `[Paymob Webhook] Verified — transaction=${transactionId}, order=${paymobOrderId}, success=${success}`
    )

    if (paymobOrderId) {
      const order = await prisma.order.findFirst({
        where: { paymobOrderId },
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: success ? "PAID" : "FAILED",
            paymobTransactionId: String(transactionId),
          },
        })
        console.log(
          `[Paymob Webhook] Order ${order.id} updated to ${success ? "PAID" : "FAILED"}`
        )
      } else {
        console.warn(
          `[Paymob Webhook] No order found with paymobOrderId=${paymobOrderId}`
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Paymob Webhook] Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
