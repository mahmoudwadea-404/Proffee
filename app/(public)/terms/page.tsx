import type { Metadata } from "next"
import TermsPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Terms & Conditions | Proffee",
  description: "Read the terms and conditions governing the use of the Proffee website and the purchase of our products.",
}

export default function TermsPage() {
  return <TermsPageClient />
}
