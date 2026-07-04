"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Coffee, Heart, Shield, Star } from "lucide-react"

const features = [
  { icon: Coffee, title: "Premium Beans", description: "Sourced from the finest coffee farms worldwide" },
  { icon: Heart, title: "Crafted with Love", description: "Every batch roasted to perfection" },
  { icon: Shield, title: "Quality Guaranteed", description: "We stand behind every cup we serve" },
  { icon: Star, title: "Expert Selection", description: "Hand-picked by certified coffee experts" },
]

export default function AboutSection() {
  const router = useRouter()

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden relative [mask-image:radial-gradient(ellipse_85%_70%_at_50%_30%,black_40%,transparent_75%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(166,108,70,0.25),transparent_60%)]" />
              <img
                src="/images/proffee-gold-about.jpeg"
                alt="Proffee Gold"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-primary/20 rounded-full" />
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div>
              <p className="text-3xl md:text-4xl text-primary font-script mb-2">About Us</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary leading-tight">
                Passion That
                <br />
                <span className="text-primary">Transcends Coffee</span>
              </h2>
            </div>

            <p className="text-text-secondary leading-relaxed">
              At Proffee, we believe coffee is more than just a drink. It&apos;s a moment of
              reflection, a daily ritual that deserves the best nature has to offer. We
              travel to the source to ensure every cup delivers an exceptional experience.
            </p>

            <div className="space-y-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif text-text-primary font-semibold">{f.title}</h4>
                    <p className="text-sm text-text-muted">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => router.push("/about")}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-white font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-primary-dark"
            >
              Learn More
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
