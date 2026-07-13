import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[Payment Status] GET /api/orders/" + id + "/payment-status")
    console.log("[Payment Status] Timestamp:", new Date().toISOString())

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        paymentStatus: true,
        paymentMethod: true,
        paymobOrderId: true,
        paymobTransactionId: true,
        createdAt: true,
      },
    })

    if (!order) {
      console.warn("[Payment Status] ❌ Order NOT found for id:", id)
      console.warn("[Payment Status] Checking if any orders exist at all...")
      const totalOrders = await prisma.order.count()
      console.warn("[Payment Status] Total orders in DB:", totalOrders)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("[Payment Status] ✅ Order found:", JSON.stringify(order))
    return NextResponse.json({ paymentStatus: order.paymentStatus })
  } catch (error) {
    console.error("[Payment Status] ❌ Error fetching payment status:", error)
    if (error instanceof Error) {
      console.error("[Payment Status] Error message:", error.message)
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
