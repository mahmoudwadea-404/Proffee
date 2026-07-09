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
    name: string
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

export type CreateCardOrderInput = CreateOrderInput

export async function createCardOrder(input: CreateCardOrderInput) {
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
          paymentStatus: "PENDING",
          paymentMethod: "CARD",
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

    const nameParts = input.name.trim().split(/\s+/)
    const firstName = nameParts[0] || input.name
    const lastName = nameParts.slice(1).join(" ") || "."

    const { createPaymentIntention, getCheckoutUrl } = await import("@/lib/paymob")
    const intention = await createPaymentIntention({
      amount: Math.round(input.total * 100),
      items: input.items.map((item) => ({
        name: item.name,
        amount: Math.round(item.price * 100),
        quantity: item.quantity,
      })),
      billingData: {
        first_name: firstName,
        last_name: lastName,
        email: input.email,
        phone_number: input.phone,
        street: input.address,
        city: input.city,
        country: "EG",
      },
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: input.email,
      },
      notificationUrl: `${baseUrl}/api/webhooks/paymob`,
      redirectionUrl: `${baseUrl}/checkout/payment-result?orderId=${order.id}`,
      specialReference: order.id,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymobTransactionId: intention.id,
        paymobOrderId: intention.intentionOrderId,
      },
    })

    const checkoutUrl = getCheckoutUrl(intention.clientSecret)

    return { success: true, checkoutUrl }
  } catch (error) {
    console.error("Error creating card order:", error)
    return { success: false, error: "Failed to initiate card payment. Please try again." }
  }
}
