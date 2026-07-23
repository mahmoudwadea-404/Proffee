"use server"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

export async function getWishlist(userId: string) {
  try {
    const user = await requireUser()
    if (user.id !== userId) return { success: true, items: [] }

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, imageUrl: true,
            description: true, roastLevel: true, stock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, items }
  } catch (error) {
    console.error("[getWishlist] Error:", error)
    return { success: false, error: "Failed to fetch wishlist" }
  }
}

export async function toggleWishlist(userId: string, productId: string) {
  try {
    const user = await requireUser()
    if (user.id !== userId) return { success: false, error: "Unauthorized" }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    })

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } })
      return { success: true, added: false }
    }

    await prisma.wishlist.create({
      data: { userId, productId },
    })
    return { success: true, added: true }
  } catch (error) {
    console.error("[toggleWishlist] Error:", error)
    return { success: false, error: "Failed to update wishlist" }
  }
}

export async function isInWishlist(userId: string, productId: string) {
  try {
    const user = await requireUser()
    if (user.id !== userId) return { success: true, inWishlist: false }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    })
    return { success: true, inWishlist: !!existing }
  } catch (error) {
    console.error("[isInWishlist] Error:", error)
    return { success: false, inWishlist: false }
  }
}

export async function getWishlistIds(userId: string) {
  try {
    const user = await requireUser()
    if (user.id !== userId) return { success: true, ids: [] }

    const items = await prisma.wishlist.findMany({
      where: { userId },
      select: { productId: true },
    })
    return { success: true, ids: items.map((i) => i.productId) }
  } catch (error) {
    console.error("[getWishlistIds] Error:", error)
    return { success: false, ids: [] }
  }
}
