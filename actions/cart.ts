"use server"

import { prisma } from "@/lib/prisma"

export async function getServerCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: { id: true, name: true, slug: true, imageUrl: true, price: true, weightOptions: true },
      },
    },
  })

  return items.map((item) => {
    const opts = item.product.weightOptions as { label: string; grams: number; price: number }[]
    const match = opts.find((o) => String(o.grams) === item.weight || o.label === item.weight)
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.imageUrl,
      price: match?.price ?? item.product.price,
      weight: match?.grams ?? (item.weight ? Number(item.weight) : 0),
      weightLabel: match?.label ?? item.weight ?? "",
      quantity: item.quantity,
    }
  })
}

export async function addServerCartItem(
  userId: string,
  productId: string,
  quantity: number,
  weight: string,
) {
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId, weight },
  })
  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    })
  }
  return prisma.cartItem.create({
    data: { userId, productId, quantity, weight },
  })
}

export async function removeServerCartItem(id: string) {
  return prisma.cartItem.delete({ where: { id } })
}

export async function updateServerCartItemQuantity(id: string, quantity: number) {
  if (quantity < 1) return null
  return prisma.cartItem.update({ where: { id }, data: { quantity } })
}

export async function mergeServerCart(
  userId: string,
  items: { productId: string; quantity: number; weight: string }[],
) {
  for (const item of items) {
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId: item.productId, weight: item.weight },
    })
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: { userId, productId: item.productId, quantity: item.quantity, weight: item.weight },
      })
    }
  }
}

export async function clearServerCart(userId: string) {
  return prisma.cartItem.deleteMany({ where: { userId } })
}
