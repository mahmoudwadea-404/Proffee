"use client"

import { motion } from "framer-motion"
import { Truck, Flame, ShieldCheck, Gift } from "lucide-react"

const perks = [
  { icon: Truck, title: "Free Delivery", description: "On orders over EGP 1000" },
  { icon: Flame, title: "Fresh & Fast", description: "Roasted to order, shipped same day" },
  { icon: ShieldCheck, title: "Secure Payment", description: "100% secure checkout" },
  { icon: Gift, title: "Loyalty Rewards", description: "Earn points with every purchase" },
]

export default function FeaturesRibbon() {
  return (
    <section className="py-16 px-6 bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <perk.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-serif text-text-primary font-semibold">{perk.title}</h4>
              <p className="text-xs text-text-muted">{perk.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
