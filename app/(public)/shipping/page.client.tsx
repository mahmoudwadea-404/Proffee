"use client"

import { motion } from "framer-motion"
import { Truck, ShieldCheck, MapPin, Clock, CreditCard, PackageCheck } from "lucide-react"

const highlights = [
  {
    icon: MapPin,
    title: "Coverage",
    description: "We deliver to all governorates across Egypt. International shipping is not yet available.",
  },
  {
    icon: Clock,
    title: "Delivery Timeline",
    description: "Greater Cairo: 2–5 business days. Other governorates: 3–7 business days. Timelines are estimates and may vary during peak periods.",
  },
  {
    icon: CreditCard,
    title: "Payment on Delivery",
    description: "We accept cash on delivery (COD) nationwide. You can also pay online by credit or debit card at checkout.",
  },
  {
    icon: PackageCheck,
    title: "Flat Rate Shipping",
    description: "All orders ship for a flat rate of EGP 60 across Egypt, regardless of order size or location.",
  },
  {
    icon: ShieldCheck,
    title: "Packaging & Care",
    description: "Each order is carefully packed in padded mailers or boxes to protect freshness and prevent damage during transit.",
  },
]

export default function ShippingPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Fast & Reliable</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-4">Shipping & Delivery</h1>
            <p className="text-lg text-text-secondary max-w-xl">
              We deliver freshly roasted coffee straight to your door, anywhere in Egypt.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-surface"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-serif text-text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-2xl border border-border bg-surface p-8"
        >
          <h2 className="text-2xl font-serif text-text-primary mb-6 flex items-center gap-3">
            <Truck className="w-6 h-6 text-primary" />
            Delivery Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-text-secondary leading-relaxed">
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Greater Cairo</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Cairo, Giza, and Qalyubia governorates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Estimated delivery: 2–5 business days
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  COD available in all areas
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Other Governorates</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Alexandria, Delta, Canal cities, Upper Egypt, and all other governorates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Estimated delivery: 3–7 business days
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  COD available in most areas
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 rounded-2xl border border-border bg-surface p-8"
        >
          <h2 className="text-2xl font-serif text-text-primary mb-4">Shipping Partners</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            We partner with trusted local courier companies to ensure your coffee arrives fresh and on time.
          </p>
          {/* TODO: Replace with actual shipping partners before launch */}
        </motion.div>
      </div>
    </div>
  )
}
