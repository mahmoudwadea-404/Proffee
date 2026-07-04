import type { Metadata } from "next"
import ResetPasswordClient from "./page.client"

export const metadata: Metadata = {
  title: "Set New Password | Proffee",
  description: "Enter your new password to regain access to your Proffee account.",
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
