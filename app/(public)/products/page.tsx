import type { Metadata } from "next"
import ProductsPageClient from "./page.client"
import { getProducts, getRoastLevels } from "@/lib/db-products"

export const metadata: Metadata = {
  title: "Our Products | Proffee",
  description: "Browse our curated selection of premium single-origin specialty coffees from the world's finest growing regions.",
}

export default async function ProductsPage() {
  const [products, roastLevels] = await Promise.all([getProducts(), getRoastLevels()])
  return <ProductsPageClient products={products} roastLevels={roastLevels} />
}
