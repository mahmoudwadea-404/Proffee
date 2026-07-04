import type { Metadata } from "next"
import CartPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Shopping Cart | Proffee",
  description: "Review your coffee selections and proceed to checkout.",
}

export default function CartPage() {
  return <CartPageClient />
}
