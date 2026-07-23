import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get("orderId")
    const email = url.searchParams.get("email")

    if (!orderId || !email) {
      return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: { email: email.toLowerCase() },
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: { select: { name: true, imageUrl: true } },
          },
        },
        statusLogs: {
          orderBy: { createdAt: "asc" },
          select: {
            toStatus: true,
            toPayment: true,
            note: true,
            createdAt: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("[Track Order] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
