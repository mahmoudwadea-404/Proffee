"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function getStats() {
  try {
    await requireAdmin()

    const [totalOrders, totalRevenue, totalCustomers, totalProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.user.count(),
      prisma.product.count(),
    ])

    return {
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total ?? 0,
        totalCustomers,
        totalProducts,
      },
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return { success: false, error: "Failed to fetch stats" }
  }
}

export async function getDashboardStats() {
  try {
    await requireAdmin()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      todayOrders,
      todayRevenue,
      pendingOrders,
      failedPayments,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { paymentStatus: "PENDING" } }),
      prisma.order.count({ where: { paymentStatus: "FAILED" } }),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          total: true,
          createdAt: true,
          firstName: true,
          lastName: true,
          user: { select: { name: true } },
        },
      }),
    ])

    return {
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total ?? 0,
        totalCustomers,
        totalProducts,
        todayOrders,
        todayRevenue: todayRevenue._sum.total ?? 0,
        pendingOrders,
        failedPayments,
        lowStockProducts,
        recentOrders,
      },
    }
  } catch (error) {
    console.error("[getDashboardStats] Error:", error)
    return { success: false, error: "Failed to fetch dashboard stats" }
  }
}

export async function getRevenueChart() {
  try {
    await requireAdmin()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { total: true, createdAt: true },
    })

    const dailyRevenue: Record<string, { revenue: number; orders: number }> = {}

    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split("T")[0]
      dailyRevenue[key] = { revenue: 0, orders: 0 }
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split("T")[0]
      if (dailyRevenue[key]) {
        dailyRevenue[key].revenue += order.total
        dailyRevenue[key].orders += 1
      }
    }

    const data = Object.entries(dailyRevenue).map(([date, val]) => ({
      date,
      revenue: Math.round(val.revenue),
      orders: val.orders,
    }))

    return { success: true, data }
  } catch (error) {
    console.error("[getRevenueChart] Error:", error)
    return { success: false, error: "Failed to fetch revenue chart" }
  }
}

export async function getOrdersByMethod() {
  try {
    await requireAdmin()
    const [cardOrders, codOrders, cardRevenue, codRevenue] = await Promise.all([
      prisma.order.count({ where: { paymentMethod: "CARD" } }),
      prisma.order.count({ where: { paymentMethod: "COD" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentMethod: "CARD", paymentStatus: "PAID" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentMethod: "COD", paymentStatus: "PAID" } }),
    ])

    return {
      success: true,
      data: [
        { name: "Card", orders: cardOrders, revenue: Math.round(cardRevenue._sum.total ?? 0) },
        { name: "COD", orders: codOrders, revenue: Math.round(codRevenue._sum.total ?? 0) },
      ],
    }
  } catch (error) {
    console.error("[getOrdersByMethod] Error:", error)
    return { success: false, error: "Failed to fetch orders by method" }
  }
}

export async function getOrderTimeline(orderId: string) {
  try {
    await requireAdmin()
    const logs = await prisma.orderStatusLog.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    })
    return { success: true, logs }
  } catch (error) {
    console.error("[getOrderTimeline] Error:", error)
    return { success: false, error: "Failed to fetch order timeline" }
  }
}

export async function logOrderStatus(
  orderId: string,
  fromStatus: string | null,
  toStatus: string,
  fromPayment: string | null,
  toPayment: string,
  note?: string
) {
  try {
    await requireAdmin()
    await prisma.orderStatusLog.create({
      data: {
        orderId,
        fromStatus,
        toStatus,
        fromPayment,
        toPayment,
        note: note ?? null,
      },
    })
    return { success: true }
  } catch (error) {
    console.error("[logOrderStatus] Error:", error)
    return { success: false, error: "Failed to log order status" }
  }
}

export async function verifyPayment(orderId: string) {
  try {
    await requireAdmin()
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, paymentStatus: true, status: true },
    })

    if (!order) {
      return { success: false, error: "Order not found." }
    }

    if (order.paymentStatus === "PAID") {
      return { success: false, error: "Order is already paid." }
    }

    await prisma.$transaction(async (tx) => {
      const previousPayment = order.paymentStatus
      const previousStatus = order.status

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: previousStatus === "PENDING" ? "CONFIRMED" : previousStatus,
        },
      })

      await tx.orderStatusLog.create({
        data: {
          orderId,
          fromStatus: previousStatus,
          toStatus: previousStatus === "PENDING" ? "CONFIRMED" : previousStatus,
          fromPayment: previousPayment,
          toPayment: "PAID",
          note: "Manually verified by admin",
        },
      })
    })

    console.log("[AUDIT] Payment Verified — orderId:", orderId, "by admin")
    return { success: true }
  } catch (error) {
    console.error("[verifyPayment] Error:", error)
    return { success: false, error: "Failed to verify payment" }
  }
}

export async function getInventoryHistory() {
  try {
    await requireAdmin()
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        price: true,
        imageUrl: true,
      },
      orderBy: { name: "asc" },
    })

    const orders = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: {
        id: true,
        createdAt: true,
        items: {
          select: {
            productId: true,
            quantity: true,
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const stockChanges: {
      date: string
      productName: string
      change: number
      orderId: string
    }[] = []

    for (const order of orders) {
      for (const item of order.items) {
        stockChanges.push({
          date: order.createdAt.toISOString(),
          productName: item.product.name,
          change: -item.quantity,
          orderId: order.id,
        })
      }
    }

    return {
      success: true,
      products,
      stockChanges: stockChanges.slice(0, 200),
    }
  } catch (error) {
    console.error("[getInventoryHistory] Error:", error)
    return { success: false, error: "Failed to fetch inventory history" }
  }
}

export async function getCouponAnalytics() {
  try {
    await requireAdmin()
    const coupons = await prisma.coupon.findMany({
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        maximumDiscount: true,
        usedCount: true,
        maxUses: true,
        isActive: true,
        startsAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { usedCount: "desc" },
    })

    const couponOrders = await prisma.order.groupBy({
      by: ["couponCode"],
      where: { couponCode: { not: "" }, paymentStatus: "PAID" },
      _count: { id: true },
      _sum: { discountAmount: true, total: true },
    })

    const analytics = coupons.map((coupon) => {
      const orderData = couponOrders.find((o) => o.couponCode === coupon.code)
      return {
        ...coupon,
        orderCount: orderData?._count.id ?? 0,
        totalDiscountGiven: orderData?._sum.discountAmount ?? 0,
        totalRevenue: orderData?._sum.total ?? 0,
        usagePercent: coupon.maxUses ? Math.round(((coupon.usedCount / coupon.maxUses) * 100)) : null,
      }
    })

    return { success: true, coupons: analytics }
  } catch (error) {
    console.error("[getCouponAnalytics] Error:", error)
    return { success: false, error: "Failed to fetch coupon analytics" }
  }
}

export async function getOrdersForExport() {
  try {
    await requireAdmin()
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    const rows = orders.map((o) => ({
      id: o.id,
      date: o.createdAt.toISOString(),
      customer: `${o.firstName} ${o.lastName}`,
      email: o.email || o.user?.email || "",
      phone: o.phone,
      governorate: o.governorate,
      city: o.city,
      items: o.items.map((i) => `${i.product.name} x${i.quantity}`).join("; "),
      subtotal: o.subtotal,
      shipping: o.shippingFee,
      discount: o.discountAmount,
      total: o.total,
      paymentMethod: o.paymentMethod ?? "",
      paymentStatus: o.paymentStatus,
      orderStatus: o.status,
      couponCode: o.couponCode,
      txId: o.paymobTransactionId ?? "",
    }))

    return { success: true, rows }
  } catch (error) {
    console.error("[getOrdersForExport] Error:", error)
    return { success: false, error: "Failed to fetch orders for export" }
  }
}

export async function getOrders() {
  try {
    await requireAdmin()
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    const mapped = orders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      paymobTransactionId: o.paymobTransactionId,
      total: o.total,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      discountAmount: o.discountAmount,
      couponCode: o.couponCode,
      createdAt: o.createdAt,
      firstName: o.firstName,
      lastName: o.lastName,
      governorate: o.governorate,
      city: o.city,
      address: o.address,
      phone: o.phone,
      email: o.email,
      user: o.user,
      items: o.items,
      shippingAddress: o.shippingAddress as { street?: string; city?: string; governorate?: string } | null,
    }))

    return { success: true, orders: mapped }
  } catch (error) {
    console.error("[getOrders] Error:", error instanceof Error ? error.message : "unknown")
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const valid = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
  if (!valid.includes(status)) {
    return { success: false, error: "Invalid status" }
  }
  try {
    await requireAdmin()
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, paymentStatus: true },
    })

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
      })

      await tx.orderStatusLog.create({
        data: {
          orderId,
          fromStatus: order?.status ?? null,
          toStatus: status,
          fromPayment: order?.paymentStatus ?? null,
          toPayment: order?.paymentStatus ?? "",
          note: "Status updated by admin",
        },
      })
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

export async function getProducts() {
  try {
    await requireAdmin()
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })
    return { success: true, products }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export type ProductInput = {
  name: string
  slug: string
  description: string
  longDescription?: string
  origin?: string
  price: number
  stock: number
  roastLevel: string
  flavorNotes: string[]
  weightOptions: { label: string; grams: number; price: number }[]
  imageUrl: string
  featured: boolean
}

export async function createProduct(input: ProductInput) {
  try {
    await requireAdmin()
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        longDescription: input.longDescription ?? null,
        origin: input.origin ?? null,
        price: input.price,
        stock: input.stock,
        roastLevel: input.roastLevel,
        flavorNotes: input.flavorNotes,
        weightOptions: input.weightOptions,
        imageUrl: input.imageUrl,
        images: [input.imageUrl],
        featured: input.featured,
      },
    })
    return { success: true, product }
  } catch (error) {
    console.error("Error creating product:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  try {
    await requireAdmin()
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        longDescription: input.longDescription ?? null,
        origin: input.origin ?? null,
        price: input.price,
        stock: input.stock,
        roastLevel: input.roastLevel,
        flavorNotes: input.flavorNotes,
        weightOptions: input.weightOptions,
        imageUrl: input.imageUrl,
        images: [input.imageUrl],
        featured: input.featured,
      },
    })
    return { success: true, product }
  } catch (error) {
    console.error("Error updating product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin()
    await prisma.product.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

export type CouponInput = {
  code: string
  description: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  maximumDiscount: number | null
  minOrderAmount: number | null
  maxUses: number | null
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
}

export async function getCoupons() {
  try {
    await requireAdmin()
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
    return { success: true, coupons }
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return { success: false, error: "Failed to fetch coupons" }
  }
}

export async function createCoupon(input: CouponInput) {
  try {
    await requireAdmin()
    const coupon = await prisma.coupon.create({
      data: {
        code: input.code.trim().toUpperCase(),
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        maximumDiscount: input.maximumDiscount,
        minOrderAmount: input.minOrderAmount,
        maxUses: input.maxUses,
        isActive: input.isActive,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    })
    return { success: true, coupon }
  } catch (error) {
    console.error("Error creating coupon:", error)
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes("Unique constraint")) {
      return { success: false, error: "A coupon with this code already exists." }
    }
    return { success: false, error: "Failed to create coupon" }
  }
}

export async function updateCoupon(id: string, input: CouponInput) {
  try {
    await requireAdmin()
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: input.code.trim().toUpperCase(),
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        maximumDiscount: input.maximumDiscount,
        minOrderAmount: input.minOrderAmount,
        maxUses: input.maxUses,
        isActive: input.isActive,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    })
    return { success: true, coupon }
  } catch (error) {
    console.error("Error updating coupon:", error)
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes("Unique constraint")) {
      return { success: false, error: "A coupon with this code already exists." }
    }
    return { success: false, error: "Failed to update coupon" }
  }
}

export async function deleteCoupon(id: string) {
  try {
    await requireAdmin()
    await prisma.coupon.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return { success: false, error: "Failed to delete coupon" }
  }
}
