"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { toast } from "sonner"

const contactInfo = [
  { icon: Mail, label: "Email", value: "proffee3@gmail.com", href: "mailto:proffee3@gmail.com" },
  { icon: Phone, label: "Phone", value: "01016165218", href: "tel:01016165218" },
  { icon: MapPin, label: "Address", value: "Al-Husseiniya, Alsharqia, Egypt" },
  { icon: Clock, label: "Hours", value: "Open 24/7" },
]

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.")
      return
    }
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Thanks for reaching out! We'll get back to you soon.")
    setForm({ name: "", email: "", message: "" })
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Get in Touch</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-4">Contact Us</h1>
            <p className="text-lg text-text-secondary max-w-xl">
              Have a question about our coffee, your order, or just want to say hello? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-text-secondary hover:text-primary transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-text-secondary">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ahmed Hassan"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ahmed@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
