import type { Metadata } from "next"
import WishlistClient from "./page.client"

export const metadata: Metadata = {
  title: "My Wishlist | Proffee",
  description: "Your saved favorite coffees.",
}

export default function WishlistPage() {
  return <WishlistClient />
}
