"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Ahmed",
    role: "Regular Customer",
    content:
      "The Ethiopia Yirgacheffe was an amazing experience! The floral and citrus notes are beautifully balanced. Fast delivery and excellent packaging.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mohamed Ali",
    role: "Café Owner",
    content:
      "Best specialty coffee I&apos;ve tried. Consistent quality in every shipment. The Proffee team is very professional to work with.",
    rating: 5,
  },
  {
    id: 3,
    name: "Nour Hassan",
    role: "New Customer",
    content:
      "I was looking for distinctive coffee and finally found what suits my taste. Fresh roasting makes a huge difference in flavor. Highly recommend.",
    rating: 4,
  },
  {
    id: 4,
    name: "Khaled Omar",
    role: "Coffee Expert",
    content:
      "Proffee offers a product that competes with the best roasters worldwide. The careful bean selection and precise roasting are evident in every cup.",
    rating: 5,
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  const next = () => goTo((current + 1) % testimonials.length)
  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length)

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  }

  return (
    <section className="py-24 px-6 bg-background relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-3xl md:text-4xl text-primary font-script mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary">
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="relative min-h-[280px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="rounded-2xl border border-border bg-surface p-8 md:p-12 text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonials[current].rating
                        ? "text-primary fill-primary"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>

              <blockquote className="text-lg md:text-xl text-text-secondary font-sans leading-relaxed mb-8 max-w-2xl mx-auto">
                &ldquo;{testimonials[current].content}&rdquo;
              </blockquote>

              <div>
                <p className="font-serif text-text-primary font-semibold">
                  {testimonials[current].name}
                </p>
                <p className="text-sm text-text-muted font-sans">
                  {testimonials[current].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="p-2 rounded-full border border-border text-text-secondary hover:text-primary hover:border-primary transition-all duration-300"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-primary w-6" : "bg-border hover:bg-primary/50"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="p-2 rounded-full border border-border text-text-secondary hover:text-primary hover:border-primary transition-all duration-300"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
