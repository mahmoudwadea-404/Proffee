"use server"

import { prisma } from "@/lib/prisma"

export type CreateOrderInput = {
  email: string
  name: string
  phone: string
  address: string
  city: string
  notes?: string
  items: {
    productId: string
    quantity: number
    price: number
    weight: string | null
  }[]
  total: number
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: { name: input.name, phone: input.phone },
      create: {
        supabaseId: `guest_${input.email}_${Date.now()}`,
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: "CUSTOMER",
      },
    })

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          paymentStatus: "UNPAID",
          paymentMethod: "COD",
          total: input.total,
          shippingAddress: {
            street: input.address,
            city: input.city,
          },
          phone: input.phone,
          notes: input.notes ?? null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              weight: item.weight,
            })),
          },
        },
        include: { items: true },
      })

      return created
    })

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: "Failed to place your order. Please try again." }
  }
}
