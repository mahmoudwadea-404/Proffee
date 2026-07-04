import type { Metadata } from "next"
import RegisterPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Create Account | Proffee",
  description: "Create your Proffee account and start exploring our premium specialty coffee collection.",
}

export default function RegisterPage() {
  return <RegisterPageClient />
}
