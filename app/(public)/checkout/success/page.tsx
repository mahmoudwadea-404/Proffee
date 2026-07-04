import type { Metadata } from "next"
import OrderSuccessClient from "./page.client"

export const metadata: Metadata = {
  title: "Order Confirmed | Proffee",
  description: "Your order has been placed successfully. Thank you for choosing Proffee.",
}

export default function OrderSuccessPage() {
  return <OrderSuccessClient />
}
