"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Coffee, Trophy, Truck, Leaf } from "lucide-react"

const features = [
  { icon: Coffee, label: "100% Arabica" },
  { icon: Trophy, label: "Premium Quality" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Leaf, label: "Freshly Roasted" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IG51bUpzIiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMCIgLz48L3N2Zz4=')]" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center min-h-screen">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl text-primary font-script"
              >
                Rich. Smooth. Perfect.
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif text-text-primary leading-tight mt-2"
              >
                In case of emergency
                <br />
                make a coffee
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg text-text-secondary max-w-lg leading-relaxed"
            >
              Discover premium specialty coffee sourced from the world&apos;s finest farms.
              Every cup tells a story of quality and passion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-white font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-primary-dark"
              >
                Explore Menu
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-white/30 text-text-primary font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-white/5"
              >
                Our Story
              </Link>
            </motion.div>

            {/* Feature icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex items-center gap-6 md:gap-8 pt-4"
            >
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-text-muted">
                  <f.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs tracking-wide">{f.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="hidden md:block relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden [mask-image:radial-gradient(ellipse_85%_70%_at_50%_30%,black_40%,transparent_75%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(166,108,70,0.25),transparent_60%)]" />
              <img
                src="/images/proffee-hero-coffee.jpg"
                alt="Proffee Coffee"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-8 left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute bottom-12 right-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
