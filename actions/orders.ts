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

function checkEnvVars() {
  const required = ["PAYMOB_SECRET_KEY", "PAYMOB_INTEGRATION_ID", "PAYMOB_HMAC_SECRET", "PAYMOB_PUBLIC_KEY"] as const
  const missing: string[] = []
  const present: string[] = []
  for (const key of required) {
    if (process.env[key]) present.push(key)
    else missing.push(key)
  }
  if (missing.length > 0) {
    console.error("[createCardOrder] MISSING env vars:", missing.join(", "))
  }
  console.log(`[createCardOrder] Env vars present (${present.length}/${required.length}):`, present.join(", "))
  console.log(`[createCardOrder] NEXT_PUBLIC_BASE_URL:`, process.env.NEXT_PUBLIC_BASE_URL ? "set" : "NOT SET (will use localhost fallback)")
}

export async function createCardOrder(input: CreateCardOrderInput) {
  checkEnvVars()

  try {
    console.log("[createCardOrder] Step 1: Upserting user...")
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
    console.log("[createCardOrder] User upserted:", user.id)

    console.log("[createCardOrder] Step 2: Creating order in DB...")
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
    console.log("[createCardOrder] Order created:", order.id, "total (EGP):", input.total, "total (cents):", Math.round(input.total * 100))

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    console.log("[createCardOrder] Using baseUrl:", baseUrl)

    const nameParts = input.name.trim().split(/\s+/)
    const firstName = nameParts[0] || input.name
    const lastName = nameParts.slice(1).join(" ") || "."

    console.log("[createCardOrder] Step 3: Calling Paymob createPaymentIntention...")
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
    console.log("[createCardOrder] Paymob intention created:", intention.id, "intentionOrderId:", intention.intentionOrderId)

    console.log("[createCardOrder] Step 4: Updating order with Paymob IDs...")
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymobTransactionId: intention.id,
        paymobOrderId: intention.intentionOrderId,
      },
    })

    console.log("[createCardOrder] Step 5: Building checkout URL...")
    const checkoutUrl = getCheckoutUrl(intention.clientSecret)
    console.log("[createCardOrder] Checkout URL built successfully")

    return { success: true, checkoutUrl }
  } catch (error) {
    console.error("========== CARD ORDER ERROR ==========")
    if (error instanceof Error) {
      console.error("Message:", error.message)
      console.error("Stack:", error.stack)
      console.error("Name:", error.name)
      if ("cause" in error) console.error("Cause:", (error as any).cause)
    } else {
      console.error("Non-Error thrown:", error)
    }
    console.error("======================================")
    return { success: false, error: "Failed to initiate card payment. Please try again." }
  }
}
