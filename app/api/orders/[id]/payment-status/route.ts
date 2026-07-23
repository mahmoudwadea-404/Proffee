import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        paymentStatus: true,
        userId: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Ownership check
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ paymentStatus: order.paymentStatus })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
