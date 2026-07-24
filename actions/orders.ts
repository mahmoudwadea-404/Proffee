"use server"

import { prisma, atomicDecrementStock } from "@/lib/prisma"
import { validateCoupon } from "@/actions/coupons"
import { SHIPPING_FEE } from "@/lib/constants"
import { requireAdmin } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

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
    if (!rateLimit(`checkout:${input.email}`, 5, 60_000)) {
      return { success: false, error: "Too many orders. Please try again later." }
    }

    if (input.items.length === 0) {
      return { success: false, error: "Your cart is empty. Please add items before placing an order." }
    }

    // Server-side price verification — ignore client-supplied prices
    const productIds = input.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, weightOptions: true },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    const verifiedItems = input.items.map((item) => {
      const product = productMap.get(item.productId)
      if (!product) throw new Error(`Product not found: ${item.productId}`)
      const opts = product.weightOptions as { label: string; grams: number; price: number }[]
      const weightOpt = item.weight
        ? opts.find((o) => String(o.grams) === item.weight || o.label === item.weight)
        : null
      return { ...item, price: weightOpt?.price ?? product.price }
    })

    const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
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
      } else {
        return { success: false, error: `Coupon is no longer valid: ${result.message}` }
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discountAmount)

    const order = await prisma.$transaction(async (tx) => {
      const txProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, name: true },
      })
      const txProductMap = new Map(txProducts.map((p) => [p.id, p]))

      for (const item of verifiedItems) {
        const product = txProductMap.get(item.productId)
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`)
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock}.`
          )
        }
      }

      for (const item of verifiedItems) {
        const decremented = await atomicDecrementStock(tx, item.productId, item.quantity)
        if (!decremented) {
          const product = txProductMap.get(item.productId)!
          throw new Error(
            `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock}.`
          )
        }
      }

      if (validatedCouponId) {
        await tx.coupon.update({
          where: { id: validatedCouponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      const created = await tx.order.create({
        data: {
          email: input.email,
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
            create: verifiedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              weight: item.weight,
            })),
          },
        },
        select: { id: true },
      })

      return created
    })

    await prisma.orderStatusLog.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: "PENDING",
        fromPayment: null,
        toPayment: "UNPAID",
        note: "Order created (COD)",
      },
    })

    console.log("[AUDIT] Order Created — orderId:", order.id)
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("[AUDIT] Order Creation Failed")
    if (error instanceof Error) {
      if (error.message.startsWith("Insufficient stock")) {
        return { success: false, error: error.message }
      }
      if (error.message.startsWith("Product not found")) {
        return { success: false, error: "One or more products in your cart are no longer available." }
      }
    }
    return { success: false, error: "Failed to place your order. Please try again." }
  }
}

export type CreateCardOrderInput = CreateOrderInput

function checkEnvVars() {
  const required = ["PAYMOB_SECRET_KEY", "PAYMOB_INTEGRATION_ID", "PAYMOB_HMAC_SECRET", "PAYMOB_PUBLIC_KEY"] as const
  const missing: string[] = []
  for (const key of required) {
    if (!process.env[key]) missing.push(key)
  }
  if (missing.length > 0) {
    console.error("[createCardOrder] MISSING env vars:", missing.join(", "))
  }
}

export async function createCardOrder(input: CreateCardOrderInput) {
  try {
    if (!rateLimit(`checkout:${input.email}`, 5, 60_000)) {
      return { success: false, error: "Too many orders. Please try again later." }
    }

    if (input.items.length === 0) {
      return { success: false, error: "Your cart is empty. Please add items before placing an order." }
    }

    const hasMissingEnv = !process.env.PAYMOB_SECRET_KEY || !process.env.PAYMOB_INTEGRATION_ID
    if (hasMissingEnv) {
      return { success: false, error: "Payment gateway is not configured. Please contact support." }
    }

    checkEnvVars()

    // Server-side price verification — ignore client-supplied prices
    const productIds = input.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, weightOptions: true },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    const verifiedItems = input.items.map((item) => {
      const product = productMap.get(item.productId)
      if (!product) throw new Error(`Product not found: ${item.productId}`)
      const opts = product.weightOptions as { label: string; grams: number; price: number }[]
      const weightOpt = item.weight
        ? opts.find((o) => String(o.grams) === item.weight || o.label === item.weight)
        : null
      return { ...item, price: weightOpt?.price ?? product.price }
    })

    const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
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
      } else {
        return { success: false, error: `Coupon is no longer valid: ${result.message}` }
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discountAmount)

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          email: input.email,
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
            create: verifiedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              weight: item.weight,
            })),
          },
        },
        select: { id: true },
      })

      return created
    })

    await prisma.orderStatusLog.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: "PENDING",
        fromPayment: null,
        toPayment: "PENDING",
        note: "Order created (CARD)",
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const { createPaymentIntention, getCheckoutUrl } = await import("@/lib/paymob")
    const intention = await createPaymentIntention({
      amount: Math.round(total * 100),
      items: verifiedItems.map((item) => ({
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

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymobTransactionId: intention.id,
        paymobOrderId: intention.intentionOrderId,
      },
      select: { id: true },
    })

    const checkoutUrl = getCheckoutUrl(intention.clientSecret)
    console.log("[AUDIT] Payment Initiated — orderId:", order.id)
    return { success: true, checkoutUrl }
  } catch (error) {
    console.error("[createCardOrder] Error:", error instanceof Error ? error.message : "unknown")
    if (error instanceof Error) {
      if (error.message.includes("PAYMOB_SECRET_KEY")) {
        return { success: false, error: "Invalid payment configuration. Please contact support." }
      }
      if (error.message.includes("Paymob intention creation failed")) {
        return { success: false, error: "Unable to contact payment gateway. Please try again." }
      }
      if (error.message.includes("fetch")) {
        return { success: false, error: "Payment gateway temporarily unavailable. Please try again." }
      }
      if (error.message.startsWith("Insufficient stock")) {
        return { success: false, error: error.message }
      }
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
 * before writing (idempotency guard) and performs the same stock/coupon side-effects
 * as the webhook handler to prevent overselling when redirect fires first.
 */
export async function handlePaymentRedirect(input: HandlePaymentRedirectInput) {
  try {
    const { verifyRedirectHmac } = await import("@/lib/paymob")

    if (!input.hmac || !input.id || !input.order_id) {
      return { success: false, error: "Missing Paymob parameters" }
    }

    const hmacValid = verifyRedirectHmac(input, input.hmac)
    if (!hmacValid) {
      return { success: false, error: "Invalid HMAC" }
    }

    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: {
        id: true,
        paymentStatus: true,
        total: true,
        couponId: true,
      },
    })

    if (!order) {
      return { success: false, error: "Order not found" }
    }

    // Idempotency — already settled
    if (order.paymentStatus === "PAID") {
      return { success: true, paymentStatus: "PAID" }
    }
    if (order.paymentStatus === "FAILED" && input.success !== "true") {
      return { success: true, paymentStatus: "FAILED" }
    }

    const paymobSuccess = input.success === "true"

    if (paymobSuccess) {
      // Perform the full payment confirmation transaction — same as webhook —
      // so stock is always decremented and coupon always incremented exactly once.
      let fullyProcessed = false

      await prisma.$transaction(async (tx) => {
        // Atomic conditional update — only proceed if order is still in a pending state
        const updated = await tx.order.updateMany({
          where: {
            id: input.orderId,
            paymentStatus: { in: ["PENDING", "UNPAID"] },
          },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            paymobTransactionId: input.id,
          },
        })

        // Another process already settled this order — skip side-effects
        if (updated.count === 0) return

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
            // Stock check failed — mark as failed and abort
            await tx.order.update({
              where: { id: order.id },
              data: { paymentStatus: "FAILED", status: "PENDING" },
            })
            await tx.orderStatusLog.create({
              data: {
                orderId: order.id,
                fromPayment: "PENDING",
                toPayment: "FAILED",
                toStatus: "PENDING",
                note: "Payment confirmed via redirect but stock insufficient",
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

        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            fromStatus: "PENDING",
            toStatus: "CONFIRMED",
            fromPayment: "PENDING",
            toPayment: "PAID",
            note: "Payment confirmed via redirect callback",
          },
        })

        fullyProcessed = true
      })

      console.log("[AUDIT] Payment Confirmed via Redirect — orderId:", order.id, "processed:", fullyProcessed)

      // Re-read the settled status after transaction
      const settled = await prisma.order.findUnique({
        where: { id: input.orderId },
        select: { paymentStatus: true },
      })
      return { success: true, paymentStatus: settled?.paymentStatus ?? "PAID" }
    } else {
      const updated = await prisma.order.updateMany({
        where: {
          id: input.orderId,
          paymentStatus: { in: ["PENDING", "UNPAID"] },
        },
        data: {
          paymentStatus: "FAILED",
          paymobTransactionId: input.id,
        },
      })

      if (updated.count > 0) {
        await prisma.orderStatusLog.create({
          data: {
            orderId: order.id,
            fromPayment: "PENDING",
            toPayment: "FAILED",
            toStatus: "PENDING",
            note: "Payment failed via redirect callback",
          },
        })
      }

      const current = await prisma.order.findUnique({
        where: { id: input.orderId },
        select: { paymentStatus: true },
      })
      return { success: true, paymentStatus: current?.paymentStatus ?? "FAILED" }
    }
  } catch (error) {
    console.error("[handlePaymentRedirect] Error:", error instanceof Error ? error.message : "unknown")
    return { success: false, error: "Failed to process payment redirect" }
  }
}

export type CleanupResult = { success: true; cleaned: number } | { success: false; error: string }

export async function cleanupStaleCardOrders(): Promise<CleanupResult> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: "Unauthorized" }
  }

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

  try {
    const staleOrders = await prisma.order.findMany({
      where: {
        paymentMethod: "CARD",
        paymentStatus: "PENDING",
        createdAt: { lt: thirtyMinutesAgo },
      },
      select: { id: true },
    })

    if (staleOrders.length === 0) {
      return { success: true, cleaned: 0 }
    }

    const ids = staleOrders.map((o) => o.id)
    const result = await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { paymentStatus: "FAILED", status: "CANCELLED" },
    })

    console.log("[AUDIT] Cleanup —", result.count, "stale orders marked FAILED/CANCELLED")
    return { success: true, cleaned: result.count }
  } catch (error) {
    console.error("[cleanupStaleCardOrders] Error:", error instanceof Error ? error.message : "unknown")
    return { success: false, error: "Failed to clean up stale orders" }
  }
}

export async function retryCardPayment(orderId: string) {
  try {
    const rawOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
            price: true,
            weight: true,
            product: { select: { name: true } },
          },
        },
      },
    })

    if (!rawOrder) {
      return { success: false, error: "Order not found." }
    }

    const order = {
      id: rawOrder.id,
      status: rawOrder.status,
      paymentStatus: rawOrder.paymentStatus,
      paymentMethod: rawOrder.paymentMethod,
      total: rawOrder.total,
      subtotal: rawOrder.subtotal,
      shippingFee: rawOrder.shippingFee,
      discountAmount: rawOrder.discountAmount,
      couponId: rawOrder.couponId,
      couponCode: rawOrder.couponCode,
      firstName: rawOrder.firstName,
      lastName: rawOrder.lastName,
      email: rawOrder.email,
      phone: rawOrder.phone,
      address: rawOrder.address,
      city: rawOrder.city,
      governorate: rawOrder.governorate,
      items: rawOrder.items,
    }

    if (order.paymentMethod !== "CARD") {
      return { success: false, error: "Only card payment orders can be retried." }
    }

    const retryableStatuses = ["FAILED", "CANCELLED", "PENDING"]
    if (!retryableStatuses.includes(order.paymentStatus)) {
      return { success: false, error: `Cannot retry an order with payment status "${order.paymentStatus}".` }
    }

    const productIds = order.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, name: true },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of order.items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return { success: false, error: `Product "${item.product.name}" is no longer available.` }
      }
      if (product.stock < item.quantity) {
        return { success: false, error: `Stock is no longer available for "${product.name}": requested ${item.quantity}, available ${product.stock}.` }
      }
    }

    if (order.couponCode) {
      const result = await validateCoupon(order.couponCode, order.subtotal)
      if (!result.valid) {
        return { success: false, error: `Coupon is no longer valid: ${result.message}` }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const { createPaymentIntention, getCheckoutUrl } = await import("@/lib/paymob")

    const intention = await createPaymentIntention({
      amount: Math.round(order.total * 100),
      items: order.items.map((item) => ({
        name: item.product.name,
        amount: Math.round(item.price * 100),
        quantity: item.quantity,
      })),
      billingData: {
        first_name: order.firstName,
        last_name: order.lastName,
        email: order.email,
        phone_number: order.phone,
        street: order.address,
        city: order.city,
        country: "EG",
      },
      customer: {
        first_name: order.firstName,
        last_name: order.lastName,
        email: order.email,
      },
      notificationUrl: `${baseUrl}/api/webhooks/paymob`,
      redirectionUrl: `${baseUrl}/checkout/payment-result?orderId=${order.id}`,
      specialReference: order.id,
    })

    const checkoutUrl = getCheckoutUrl(intention.clientSecret)

    // Atomic conditional update — only proceed if order is still in a retryable state.
    // Prevents concurrent retries from creating duplicate Paymob intentions.
    const updated = await prisma.order.updateMany({
      where: {
        id: order.id,
        paymentStatus: { in: ["FAILED", "CANCELLED", "PENDING"] },
      },
      data: {
        paymentStatus: "PENDING",
        status: "PENDING",
        paymobTransactionId: intention.id,
        paymobOrderId: intention.intentionOrderId,
      },
    })

    if (updated.count === 0) {
      return { success: false, error: "Order status changed. Please refresh and try again." }
    }

    console.log("[AUDIT] Retry Success — orderId:", order.id)
    return { success: true, checkoutUrl }
  } catch (error) {
    console.error("[retryCardPayment] Error:", error instanceof Error ? error.message : "unknown")
    if (error instanceof Error) {
      if (error.message.includes("Paymob intention creation failed")) {
        return { success: false, error: "Unable to contact payment gateway. Please try again." }
      }
      if (error.message.includes("fetch")) {
        return { success: false, error: "Payment gateway temporarily unavailable. Please try again." }
      }
    }
    return { success: false, error: "Failed to retry payment. Please try again." }
  }
}
