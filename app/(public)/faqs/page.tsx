import type { Metadata } from "next"
import FAQsPageClient from "./page.client"

export const metadata: Metadata = {
  title: "FAQs | Proffee",
  description: "Find answers to frequently asked questions about ordering, shipping, returns, and our specialty coffee at Proffee.",
}

export default function FAQsPage() {
  return <FAQsPageClient />
}
