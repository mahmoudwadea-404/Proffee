import type { Metadata } from "next"
import ForgotPasswordClient from "./page.client"

export const metadata: Metadata = {
  title: "Reset Password | Proffee",
  description: "Reset your Proffee account password. Enter your email and we'll send you a reset link.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
