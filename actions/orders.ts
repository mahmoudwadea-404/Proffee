"use server"

import { prisma, logDatabaseInfo } from "@/lib/prisma"
import { validateCoupon } from "@/actions/coupons"
import { SHIPPING_FEE } from "@/lib/constants"

export type CreateOrderInput = {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  governorate: string
  city: string
  latitude?: number
  longitude?: number
  notes?: string
  items: {
    productId: string
    name: string
    quantity: number
    price: number
    weight: string | null
  }[]
  subtotal: number
  shippingFee?: number
  discount?: number
  couponId?: string
  couponCode?: string
  total: number
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingFee = SHIPPING_FEE

    let discountAmount = 0
    let validatedCouponId: string | null = null
    let validatedCouponCode = ""

    if (input.couponCode) {
      const result = await validateCoupon(input.couponCode, subtotal)
      if (result.valid) {
        discountAmount = result.discount
        validatedCouponId = result.coupon.id
        validatedCouponCode = result.coupon.code
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discountAmount)

    const fullName = `${input.firstName} ${input.lastName}`
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: { name: fullName, phone: input.phone },
      create: {
        supabaseId: `guest_${input.email}_${Date.now()}`,
        name: fullName,
        email: input.email,
        phone: input.phone,
        role: "CUSTOMER",
      },
    })

    const order = await prisma.$transaction(async (tx) => {
      const productIds = input.items.map((i) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, name: true },
      })
      const productMap = new Map(products.map((p) => [p.id, p]))

      for (const item of input.items) {
        const product = productMap.get(item.productId)
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`)
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock}.`
          )
        }
      }

      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      if (validatedCouponId) {
        await tx.coupon.update({
          where: { id: validatedCouponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          paymentStatus: "UNPAID",
          paymentMethod: "COD",
          subtotal,
          shippingFee,
          discountAmount,
          total,
          couponId: validatedCouponId,
          couponCode: validatedCouponCode,
          shippingAddress: {
            street: input.address,
            city: input.city,
            governorate: input.governorate,
          },
          firstName: input.firstName,
          lastName: input.lastName,
          governorate: input.governorate,
          city: input.city,
          address: input.address,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
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
  console.log(`[createCardOrder] NEXT_PUBLIC_BASE_URL:`, process.env.NEXT_PUBLIC_BASE_URL ? `"${process.env.NEXT_PUBLIC_BASE_URL}"` : "NOT SET (will use localhost fallback)")
}

export async function createCardOrder(input: CreateCardOrderInput) {
  console.log("")
  console.log("╔══════════════════════════════════════════════════════════╗")
  console.log("║          createCardOrder — START                        ║")
  console.log("╚══════════════════════════════════════════════════════════╝")
  console.log("[createCardOrder] Timestamp:", new Date().toISOString())
  console.log("[createCardOrder] Input email:", input.email)
  console.log("[createCardOrder] Input items count:", input.items.length)

  await logDatabaseInfo()

  checkEnvVars()

  try {
    const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingFee = SHIPPING_FEE

    let discountAmount = 0
    let validatedCouponId: string | null = null
    let validatedCouponCode = ""

    if (input.couponCode) {
      const result = await validateCoupon(input.couponCode, subtotal)
      if (result.valid) {
        discountAmount = result.discount
        validatedCouponId = result.coupon.id
        validatedCouponCode = result.coupon.code
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discountAmount)

    console.log("[createCardOrder] Server-calculated subtotal:", subtotal)
    console.log("[createCardOrder] Server-calculated shippingFee:", shippingFee)
    console.log("[createCardOrder] Server-calculated discountAmount:", discountAmount)
    console.log("[createCardOrder] Server-calculated total:", total)
    if (validatedCouponId) {
      console.log("[createCardOrder] Validated coupon:", validatedCouponCode, "ID:", validatedCouponId)
    }

    console.log("[createCardOrder] Step 1: Upserting user...")
    const fullName = `${input.firstName} ${input.lastName}`
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: { name: fullName, phone: input.phone },
      create: {
        supabaseId: `guest_${input.email}_${Date.now()}`,
        name: fullName,
        email: input.email,
        phone: input.phone,
        role: "CUSTOMER",
      },
    })
    console.log("[createCardOrder] ✅ User upserted — ID:", user.id, "email:", user.email)

    console.log("[createCardOrder] Step 2: Creating order in $transaction...")

    const order = await prisma.$transaction(async (tx) => {
      console.log("[createCardOrder]   [TX] Inside transaction callback")

      const orderData = {
        userId: user.id,
        status: "PENDING" as const,
        paymentStatus: "PENDING",
        paymentMethod: "CARD",
        subtotal,
        shippingFee,
        discountAmount,
        total,
        couponId: validatedCouponId,
        couponCode: validatedCouponCode,
        shippingAddress: {
          street: input.address,
          city: input.city,
          governorate: input.governorate,
        },
        firstName: input.firstName,
        lastName: input.lastName,
        governorate: input.governorate,
        city: input.city,
        address: input.address,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
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
      }

      console.log("[createCardOrder]   [TX] Order total:", orderData.total, "subtotal:", orderData.subtotal, "shipping:", orderData.shippingFee, "discount:", orderData.discountAmount)

      const created = await tx.order.create({
        data: orderData,
        include: { items: true },
      })

      console.log("[createCardOrder]   [TX] tx.order.create returned — Order ID:", created.id)
      return created
    })

    console.log("[createCardOrder] ✅ Transaction COMPLETED — Order ID:", order.id)

    console.log("[createCardOrder] Step 2b: VERIFYING order exists in DB...")
    const verification = await prisma.order.findUnique({
      where: { id: order.id },
      select: {
        id: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true,
        subtotal: true,
        shippingFee: true,
        discountAmount: true,
        couponCode: true,
        paymobOrderId: true,
        paymobTransactionId: true,
        userId: true,
        createdAt: true,
      },
    })

    if (!verification) {
      console.error("[createCardOrder] ❌ CRITICAL: Order does NOT exist in DB after transaction commit!")
      throw new Error(
        `Order ${order.id} was created in a transaction but does not exist in the database afterwards.`
      )
    } else {
      console.log("[createCardOrder] ✅ Post-transaction verification PASSED")
    }

    const orderCount = await prisma.order.count()
    console.log("[createCardOrder] Total orders in database:", orderCount)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    console.log("[createCardOrder] Step 3: Calling Paymob createPaymentIntention...")
    const { createPaymentIntention, getCheckoutUrl } = await import("@/lib/paymob")
    const intention = await createPaymentIntention({
      amount: Math.round(total * 100),
      items: input.items.map((item) => ({
        name: item.name,
        amount: Math.round(item.price * 100),
        quantity: item.quantity,
      })),
      billingData: {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone_number: input.phone,
        street: input.address,
        city: input.city,
        country: "EG",
      },
      customer: {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
      },
      notificationUrl: `${baseUrl}/api/webhooks/paymob`,
      redirectionUrl: `${baseUrl}/checkout/payment-result?orderId=${order.id}`,
      specialReference: order.id,
    })
    console.log("[createCardOrder] ✅ Paymob intention created:", intention.id)

    console.log("[createCardOrder] Step 4: Updating order with Paymob IDs...")
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymobTransactionId: intention.id,
        paymobOrderId: intention.intentionOrderId,
      },
      select: { id: true, paymobTransactionId: true, paymobOrderId: true },
    })
    console.log("[createCardOrder] ✅ Order updated:", JSON.stringify(updatedOrder))

    console.log("[createCardOrder] Step 5: Building checkout URL...")
    const checkoutUrl = getCheckoutUrl(intention.clientSecret)
    console.log("[createCardOrder] ✅ Checkout URL built successfully")

    console.log("")
    console.log("╔══════════════════════════════════════════════════════════╗")
    console.log("║          createCardOrder — SUCCESS                      ║")
    console.log("╚══════════════════════════════════════════════════════════╝")

    return { success: true, checkoutUrl }
  } catch (error) {
    console.error("")
    console.error("╔══════════════════════════════════════════════════════════╗")
    console.error("║          createCardOrder — ERROR                        ║")
    console.error("╚══════════════════════════════════════════════════════════╝")
    if (error instanceof Error) {
      console.error("[createCardOrder] Message:", error.message)
      console.error("[createCardOrder] Name:", error.name)
      console.error("[createCardOrder] Stack:", error.stack)
      if ("cause" in error) console.error("[createCardOrder] Cause:", (error as any).cause)
    } else {
      console.error("[createCardOrder] Non-Error thrown:", error)
    }
    return { success: false, error: "Failed to initiate card payment. Please try again." }
  }
}

export type HandlePaymentRedirectInput = {
  orderId: string
  success: string
  id: string
  order_id: string
  amount_cents: string
  created_at: string
  currency: string
  error_occured: string
  has_parent_transaction: string
  integration_id: string
  is_3d_secure: string
  is_auth: string
  is_capture: string
  is_refunded: string
  is_standalone_payment: string
  is_voided: string
  owner: string
  pending: string
  source_data_pan: string
  source_data_sub_type: string
  source_data_type: string
  hmac: string
}

/**
 * Server action called from the payment-result page when Paymob redirects back
 * after a payment attempt. Verifies the redirect HMAC and updates the order's
 * paymentStatus. Acts as a fallback for when the webhook doesn't fire
 * (e.g. AUTHENTICATION_FAILED pre-auth declines).
 *
 * Safe to call even if the webhook already processed — it checks current status
 * before writing and only upgrades from PENDING/UNPAID/FAILED → PAID or FAILED.
 */
export async function handlePaymentRedirect(input: HandlePaymentRedirectInput) {
  console.log("[handlePaymentRedirect] Called for orderId:", input.orderId, "success:", input.success)
  try {
    const { verifyRedirectHmac } = await import("@/lib/paymob")

    if (!input.hmac || !input.id || !input.order_id) {
      console.warn("[handlePaymentRedirect] Missing required Paymob redirect params")
      return { success: false, error: "Missing Paymob parameters" }
    }

    const hmacValid = verifyRedirectHmac(input, input.hmac)
    console.log("[handlePaymentRedirect] HMAC valid:", hmacValid)
    if (!hmacValid) {
      console.error("[handlePaymentRedirect] HMAC verification failed — rejecting")
      return { success: false, error: "Invalid HMAC" }
    }

    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: {
        id: true,
        paymentStatus: true,
        paymobOrderId: true,
      },
    })

    if (!order) {
      console.warn("[handlePaymentRedirect] Order not found:", input.orderId)
      return { success: false, error: "Order not found" }
    }

    console.log("[handlePaymentRedirect] Current order paymentStatus:", order.paymentStatus)

    if (order.paymentStatus === "PAID") {
      console.log("[handlePaymentRedirect] Order already PAID — no change needed")
      return { success: true, paymentStatus: "PAID" }
    }

    const paymobSuccess = input.success === "true"
    const newStatus = paymobSuccess ? "PAID" : "FAILED"
    console.log("[handlePaymentRedirect] Redirect success:", paymobSuccess, "→ setting:", newStatus)

    const updated = await prisma.order.update({
      where: { id: input.orderId },
      data: {
        paymentStatus: newStatus,
        paymobTransactionId: order.paymobOrderId ? undefined : input.id,
      },
      select: { id: true, paymentStatus: true },
    })

    console.log("[handlePaymentRedirect] ✅ Order updated:", JSON.stringify(updated))
    return { success: true, paymentStatus: updated.paymentStatus }
  } catch (error) {
    console.error("[handlePaymentRedirect] Error:", error)
    return { success: false, error: "Failed to process payment redirect" }
  }
}
