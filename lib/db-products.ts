import { prisma } from "@/lib/prisma"
import type { Product } from "@/lib/products"

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const p = await prisma.product.findUnique({ where: { slug } })
  if (!p) return null
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    longDescription: p.longDescription ?? p.description,
    price: p.price,
    image: p.imageUrl,
    roastLevel: p.roastLevel as Product["roastLevel"],
    flavorNotes: p.flavorNotes,
    weightOptions: p.weightOptions as Product["weightOptions"],
    origin: p.origin ?? "",
    featured: p.featured,
  }
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "asc" } })

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    longDescription: p.longDescription ?? p.description,
    price: p.price,
    image: p.imageUrl,
    roastLevel: p.roastLevel as Product["roastLevel"],
    flavorNotes: p.flavorNotes,
    weightOptions: p.weightOptions as Product["weightOptions"],
    origin: p.origin ?? "",
    featured: p.featured,
  }))
}

export type FeaturedProduct = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  weightOptions: { label: string; grams: number; price: number }[]
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "asc" },
  })
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    image: p.imageUrl,
    weightOptions: p.weightOptions as FeaturedProduct["weightOptions"],
  }))
}

export async function getRoastLevels(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    select: { roastLevel: true },
    distinct: ["roastLevel"],
    orderBy: { roastLevel: "asc" },
  })
  const order = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"]
  return rows.map((r) => r.roastLevel).sort((a, b) => order.indexOf(a) - order.indexOf(b))
}
