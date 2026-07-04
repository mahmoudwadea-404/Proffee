import type { Metadata } from "next"
import ContactPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Contact Us | Proffee",
  description: "Get in touch with the Proffee team. Whether you have a question about our coffee, your order, or just want to say hello — we'd love to hear from you.",
}

export default function ContactPage() {
  return <ContactPageClient />
}
