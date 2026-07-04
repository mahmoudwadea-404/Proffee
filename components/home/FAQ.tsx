"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What is specialty coffee?",
    answer:
      "Specialty coffee is coffee that scores 80 points or higher by certified coffee experts. It is distinguished by its superior quality at every stage of production, from farming to roasting, resulting in unique and distinctive flavors.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "We deliver within 2-5 business days within Greater Cairo, and 3-7 business days to other governorates. We carefully package all products to ensure they arrive in perfect condition.",
  },
  {
    question: "Can I order a custom roast?",
    answer:
      "Yes, you can request a custom roast to your preference. Contact us through our contact page and we will coordinate with you to prepare the right quantity at your preferred roast level.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash on delivery, bank transfers, and credit/debit cards. We are working on adding more payment options soon.",
  },
  {
    question: "How should I store my coffee to keep it fresh?",
    answer:
      "Store your coffee in an airtight container in a cool, dark place away from moisture and heat. Avoid storing it in the refrigerator or freezer as this can affect the flavor.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <section className="py-24 px-6 bg-background relative">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-3xl md:text-4xl text-primary font-script mb-2">FAQ</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-surface overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-surface-2"
              >
                <span className="text-base font-medium text-text-primary font-sans">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-primary" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm text-text-secondary font-sans leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
