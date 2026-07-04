"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Loader2, Check, ArrowRight } from "lucide-react"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    await new Promise((r) => setTimeout(r, 1000))
    setStatus("success")
    setEmail("")
  }

  return (
    <section className="py-24 px-6 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface to-background opacity-50" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <p className="text-3xl md:text-4xl text-primary font-script mb-2">Stay Updated</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-text-secondary max-w-md mx-auto mb-8 font-sans">
            Subscribe to receive the latest products, exclusive offers, and coffee brewing tips
          </p>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-primary"
            >
              <Check className="w-5 h-5" />
              <span className="font-sans">Subscribed successfully! Thank you</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                    focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
