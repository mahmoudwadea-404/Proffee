"use server"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

export async function getServerCart(userId: string) {
  const user = await requireUser()
  if (user.id !== userId) return []

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
  const user = await requireUser()
  if (user.id !== userId) throw new Error("UNAUTHORIZED")
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId, weight },
    select: { id: true, quantity: true },
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
  await requireUser()
  return prisma.cartItem.delete({ where: { id } })
}

export async function updateServerCartItemQuantity(id: string, quantity: number) {
  await requireUser()
  if (quantity < 1) return null
  return prisma.cartItem.update({ where: { id }, data: { quantity } })
}

export async function mergeServerCart(
  userId: string,
  items: { productId: string; quantity: number; weight: string }[],
) {
  const user = await requireUser()
  if (user.id !== userId) throw new Error("UNAUTHORIZED")
  if (items.length === 0) return

  const productIds = items.map((i) => i.productId)
  const existing = await prisma.cartItem.findMany({
    where: { userId, productId: { in: productIds } },
    select: { id: true, productId: true, weight: true, quantity: true },
  })

  const existingMap = new Map(existing.map((e) => [`${e.productId}-${e.weight}`, e]))

  const toUpdate: { id: string; quantity: number }[] = []
  const toCreate: { userId: string; productId: string; quantity: number; weight: string }[] = []

  for (const item of items) {
    const key = `${item.productId}-${item.weight}`
    const found = existingMap.get(key)
    if (found) {
      toUpdate.push({ id: found.id, quantity: found.quantity + item.quantity })
    } else {
      toCreate.push({ userId, productId: item.productId, quantity: item.quantity, weight: item.weight })
    }
  }

  await prisma.$transaction([
    ...toUpdate.map((u) =>
      prisma.cartItem.update({ where: { id: u.id }, data: { quantity: u.quantity } })
    ),
    ...toCreate.map((c) =>
      prisma.cartItem.create({ data: c })
    ),
  ])
}

export async function clearServerCart(userId: string) {
  const user = await requireUser()
  if (user.id !== userId) throw new Error("UNAUTHORIZED")
  return prisma.cartItem.deleteMany({ where: { userId } })
}
