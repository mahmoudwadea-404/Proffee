"use client"

import { motion } from "framer-motion"
import { RotateCcw, AlertCircle, CheckCircle, Clock, Mail, FileText } from "lucide-react"

const steps = [
  {
    icon: Mail,
    title: "1. Contact Us",
    description: "Email us at hello@proffee.com within 48 hours of receiving your order. Include your order number, photos (if damaged), and a description of the issue.",
  },
  {
    icon: FileText,
    title: "2. Review",
    description: "Our team will review your request and respond within 1–2 business days with instructions or a resolution.",
  },
  {
    icon: CheckCircle,
    title: "3. Resolution",
    description: "Depending on the issue, we will arrange a replacement, store credit, or refund. Refunds are processed within 5–10 business days.",
  },
]

export default function ReturnsPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">We Make It Right</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-4">Returns & Refunds</h1>
            <p className="text-lg text-text-secondary max-w-xl">
              We stand behind the quality of every bag of coffee. If something is not right, we are here to help.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <h2 className="text-2xl font-serif text-text-primary mb-6 flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-primary" />
            Our Policy
          </h2>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              Due to the perishable nature of coffee, we do not accept general returns or exchanges for change of mind.
              However, we will replace or refund your order in the following cases:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-text-primary">Damaged in transit:</strong> If your package arrives visibly damaged or the coffee bags are compromised.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-text-primary">Wrong item:</strong> If you received a product that is different from what you ordered.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-text-primary">Defective product:</strong> If the coffee shows signs of staleness, contamination, or roasting defects.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-text-primary">Quality concern:</strong> If you are unsatisfied with the quality, contact us and we will work with you to find a fair resolution, including replacement or store credit where appropriate.</span>
              </li>
            </ul>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mt-4">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-amber-800">
                <strong>Important:</strong> All claims must be reported within 48 hours of delivery. Please inspect your package upon arrival.
              </div>
            </div>
          </div>
          {/* TODO: Review with business owner before launch */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <h2 className="text-2xl font-serif text-text-primary mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-serif text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <h2 className="text-2xl font-serif text-text-primary mb-4">Refund Timeline</h2>
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>
              Once your refund is approved, it will be processed within 5–10 business days depending on the original payment method:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span><strong className="text-text-primary">Card payments:</strong> Refunded to the original card. Processing time depends on your bank.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span><strong className="text-text-primary">Cash on delivery:</strong> Refunded via bank transfer or issued as store credit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span><strong className="text-text-primary">Bank transfers:</strong> Refunded to the originating bank account.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
