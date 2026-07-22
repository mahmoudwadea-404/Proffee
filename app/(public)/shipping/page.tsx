import type { Metadata } from "next"
import ShippingPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Shipping & Delivery | Proffee",
  description: "Learn about Proffee's shipping options, delivery areas, timelines, and flat rate shipping across Egypt.",
}

export default function ShippingPage() {
  return <ShippingPageClient />
}
