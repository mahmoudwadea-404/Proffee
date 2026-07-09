import type { Metadata } from "next"
import PaymentResultClient from "./page.client"

export const metadata: Metadata = {
  title: "Payment Result | Proffee",
  description: "View the result of your payment.",
}

export default function PaymentResultPage() {
  return <PaymentResultClient />
}
