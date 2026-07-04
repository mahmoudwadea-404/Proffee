import type { Metadata } from "next"
import AccountPageClient from "./page.client"

export const metadata: Metadata = {
  title: "My Account | Proffee",
  description: "Manage your Proffee account settings and view your order history.",
}

export default function AccountPage() {
  return <AccountPageClient />
}
