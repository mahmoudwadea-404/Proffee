"use client"

import { ArrowRight } from "lucide-react"

export function NewsletterForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex">
      <input
        type="email"
        placeholder="Your email"
        required
        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-l-lg text-text-primary text-sm focus:outline-none focus:border-primary transition-colors duration-300"
      />
      <button
        type="submit"
        className="px-4 py-2.5 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors duration-300"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  )
}
