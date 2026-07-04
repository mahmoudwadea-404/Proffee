import type { Metadata } from "next"
import LoginPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Sign In | Proffee",
  description: "Sign in to your Proffee account to manage orders, view your wishlist, and more.",
}

export default function LoginPage() {
  return <LoginPageClient />
}
