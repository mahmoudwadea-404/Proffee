import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductBySlug, getProducts } from "@/lib/db-products"
import ProductDetailClient from "./page.client"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found | Proffee",
    }
  }

  return {
    title: `${product.name} | Proffee`,
    description: product.longDescription,
    openGraph: {
      title: `${product.name} | Proffee`,
      description: product.description,
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const allProducts = await getProducts()
  const related = allProducts
    .filter((p) => p.id !== product.id && p.roastLevel === product.roastLevel)
    .slice(0, 3)

  return <ProductDetailClient product={product} related={related} />
}
