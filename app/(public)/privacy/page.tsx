import type { Metadata } from "next"
import PrivacyPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Privacy Policy | Proffee",
  description: "Learn how Proffee collects, uses, and protects your personal data when you use our website and services.",
}

export default function PrivacyPage() {
  return <PrivacyPageClient />
}
