import type { Metadata } from "next"
import AboutPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Our Story | Proffee",
  description: "Discover the story behind Proffee — our passion for specialty coffee, our values, and the team that brings the world's finest roasts to your cup.",
}

export default function AboutPage() {
  return <AboutPageClient />
}
