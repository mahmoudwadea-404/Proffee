import type { Metadata } from "next"
import ReturnsPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Returns & Refunds | Proffee",
  description: "Learn about Proffee's return and refund policy for damaged, defective, or incorrect orders.",
}

export default function ReturnsPage() {
  return <ReturnsPageClient />
}
