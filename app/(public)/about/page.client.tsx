"use client"

import { motion } from "framer-motion"
import { Shield, Leaf, Heart, Award } from "lucide-react"

const values = [
  {
    icon: Leaf,
    title: "Sustainability",
    description: "We work directly with farmers who use eco-friendly practices, ensuring every bean is grown with respect for the land and its people.",
  },
  {
    icon: Award,
    title: "Quality First",
    description: "Every batch is cupped and graded before it reaches our shelves. We never compromise on the quality of what goes into your cup.",
  },
  {
    icon: Heart,
    title: "Fair Partnership",
    description: "We pay well above fair-trade prices, building long-term relationships with growers that support their communities and families.",
  },
  {
    icon: Shield,
    title: "Traceability",
    description: "Every bag tells a story. From farm to roastery to your door, you can trace the exact origin of every coffee you drink.",
  },
]

const team = [
  {
    name: "Ahmed Hassan",
    role: "Founder & Head Roaster",
    bio: "A third-generation coffee professional with over 15 years of experience sourcing and roasting specialty coffee across East Africa and Latin America.",
  },
  {
    name: "Mariam Youssef",
    role: "Head of Sourcing",
    bio: "Mariam travels the world building relationships with coffee producers, ensuring every bean we import meets our exacting standards.",
  },
  {
    name: "Karim El-Sayed",
    role: "Master Roaster",
    bio: "With a background in food science, Karim brings precision and artistry to every roast profile, unlocking the full potential of each origin.",
  },
  {
    name: "Nadia Farouk",
    role: "Customer Experience Lead",
    bio: "Nadia ensures every interaction with Proffee is as delightful as your morning brew. She leads our community and education programs.",
  },
]

export default function AboutPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Our Story</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-6">From Bean to Brew</h1>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
              Proffee was born from a simple belief: that great coffee has the power to bring people together.
              What started as a small roastery in Cairo has grown into a destination for specialty coffee lovers
              across Egypt and beyond.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-text-secondary leading-relaxed"
          >
            <p className="text-lg">
              Our journey began in 2019 when our founder, Ahmed Hassan, returned from a trip through Ethiopia&apos;s
              coffee highlands with a mission: to bring the world&apos;s finest specialty coffees to Egypt. He had
              witnessed firsthand the extraordinary care that goes into growing and processing premium coffee,
              and he knew that coffee lovers at home deserved the same quality.
            </p>
            <p className="text-lg">
              We source our beans directly from smallholder farmers and cooperatives in Ethiopia, Colombia, Kenya,
              Indonesia, Guatemala, Costa Rica, and Brazil. Every relationship is built on trust, transparency,
              and a shared passion for excellence. By paying fair prices and investing in long-term partnerships,
              we help farmers improve their livelihoods while securing the best harvests for our customers.
            </p>
            <p className="text-lg">
              Each roast is crafted in small batches in our Cairo roastery, where we carefully develop flavor
              profiles that highlight the unique character of every origin. From light roasts that preserve
              delicate floral and fruity notes to dark roasts that deliver bold, chocolatey depth, every bag
              of Proffee is a journey into the world of specialty coffee.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">What We Believe</p>
            <h2 className="text-3xl md:text-4xl font-serif text-text-primary">Our Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-background"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif text-text-primary mb-2">{value.title}</h3>
                <p className="text-text-secondary leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Meet the Team</p>
            <h2 className="text-3xl md:text-4xl font-serif text-text-primary">The People Behind Proffee</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-surface text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] mx-auto mb-4 flex items-center justify-center border border-border">
                  <span className="text-2xl font-serif text-primary font-bold">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-text-primary">{member.name}</h3>
                <p className="text-xs text-primary font-medium uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
