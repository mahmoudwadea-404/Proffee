import type { Metadata } from "next"
import CheckoutPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Checkout | Proffee",
  description: "Complete your order for premium specialty coffee.",
}

export default function CheckoutPage() {
  return <CheckoutPageClient />
}
