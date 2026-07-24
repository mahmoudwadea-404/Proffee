import type { Metadata } from "next"
import AdminLoginClient from "./page.client"

export const metadata: Metadata = {
  title: "Admin Login | Proffee",
  description: "Admin authentication for the Proffee dashboard.",
}

export default function AdminLoginPage() {
  return <AdminLoginClient />
}
