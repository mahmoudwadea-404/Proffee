import { NextResponse } from "next/server"
import { prisma, atomicDecrementStock } from "@/lib/prisma"
import { verifyWebhookHMAC } from "@/lib/paymob"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const obj = body?.obj

    if (!obj) {
      return NextResponse.json({ error: "Missing obj" }, { status: 400 })
    }

    const url = new URL(request.url)
    const receivedHMAC = url.searchParams.get("hmac") ?? ""

    if (!receivedHMAC) {
      return NextResponse.json({ error: "Missing HMAC" }, { status: 401 })
    }

    const isValid = verifyWebhookHMAC(obj, receivedHMAC)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 })
    }

    const transactionId: number = obj.id
    const paymobOrderId: number = obj.order?.id
    const success: boolean = obj.success === true
    const webhookAmountCents: number = obj.amount_cents

    if (!paymobOrderId) {
      return NextResponse.json({ received: true })
    }

    const order = await prisma.order.findFirst({
      where: { paymobOrderId },
      select: {
        id: true,
        paymentStatus: true,
        total: true,
        couponId: true,
      },
    })

    if (!order) {
      return NextResponse.json({ received: true })
    }

    // Idempotency — if already PAID, skip all processing
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true })
    }

    // Server-side payment amount verification
    const serverAmountCents = Math.round(order.total * 100)
    if (success && webhookAmountCents !== serverAmountCents) {
      console.error("[Webhook] Amount mismatch — orderId:", order.id, "webhook:", webhookAmountCents, "server:", serverAmountCents)
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      })
      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromPayment: order.paymentStatus,
          toPayment: "FAILED",
          toStatus: "PENDING",
          note: "Payment amount mismatch — possible tampering",
        },
      })
      return NextResponse.json({ received: true })
    }

    if (success) {
      await prisma.$transaction(async (tx) => {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: order.id },
          select: {
            productId: true,
            quantity: true,
            product: { select: { id: true, stock: true, name: true } },
          },
        })

        for (const item of orderItems) {
          const decremented = await atomicDecrementStock(tx, item.productId, item.quantity)
          if (!decremented) {
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: "FAILED",
                paymobTransactionId: String(transactionId),
              },
            })
            await tx.orderStatusLog.create({
              data: {
                orderId: order.id,
                fromPayment: "PENDING",
                toPayment: "FAILED",
                toStatus: "PENDING",
                note: "Payment confirmed but stock insufficient",
              },
            })
            return
          }
        }

        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { usedCount: { increment: 1 } },
          })
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            paymobTransactionId: String(transactionId),
          },
        })

        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            fromStatus: "PENDING",
            toStatus: "CONFIRMED",
            fromPayment: "PENDING",
            toPayment: "PAID",
            note: "Payment confirmed via webhook",
          },
        })
      })

      console.log("[AUDIT] Payment Confirmed — orderId:", order.id)
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          paymobTransactionId: String(transactionId),
        },
      })

      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: order.paymentStatus === "PENDING" ? null : order.paymentStatus,
          toStatus: "PENDING",
          fromPayment: "PENDING",
          toPayment: "FAILED",
          note: "Payment failed via webhook",
        },
      })

      console.log("[AUDIT] Payment Failed — orderId:", order.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Webhook] Error:", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ received: true })
  }
}
