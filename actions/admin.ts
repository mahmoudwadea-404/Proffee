"use server"

import { prisma } from "@/lib/prisma"

export async function getStats() {
  try {
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

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, orders }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const valid = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
  if (!valid.includes(status)) {
    return { success: false, error: "Invalid status" }
  }
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

export async function getProducts() {
  try {
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
    await prisma.product.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}
