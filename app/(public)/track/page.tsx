import type { Metadata } from "next"
import { Suspense } from "react"
import TrackOrderClient from "./page.client"

export const metadata: Metadata = {
  title: "Track Your Order | Proffee",
  description: "Track the status of your Proffee order.",
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-text-secondary">Loading...</div>
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  )
}
