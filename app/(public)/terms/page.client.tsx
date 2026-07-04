"use client"

import { motion } from "framer-motion"
import { FileText, Scale, Eye, ShoppingBag, UserCheck, Ban, Gavel } from "lucide-react"

const sections = [
  {
    icon: Scale,
    title: "1. General",
    content:
      "These Terms & Conditions govern your use of the Proffee website and your purchase of products from Proffee. By accessing or using this website, you agree to be bound by these terms. If you do not agree, please do not use our services. We reserve the right to update these terms at any time, and your continued use after changes constitutes acceptance of the new terms.",
  },
  {
    icon: Eye,
    title: "2. Use of the Website",
    content:
      "You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use and enjoyment. You may not use the website to distribute spam, viruses, or harmful content. We reserve the right to suspend or terminate access for users who violate these terms.",
  },
  {
    icon: ShoppingBag,
    title: "3. Orders & Acceptance",
    content:
      "All orders placed through our website are subject to acceptance. We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, pricing errors, or suspected fraudulent activity. We will notify you if your order is cancelled. A confirmed order constitutes a binding agreement to purchase.",
  },
  {
    icon: UserCheck,
    title: "4. Account Registration",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate, current, and complete information during registration. We are not liable for any loss arising from unauthorised use of your account.",
  },
  {
    icon: Ban,
    title: "5. Prohibited Activities",
    content:
      "You may not use our website or services for any illegal or unauthorised purpose. This includes, but is not limited to, attempting to disrupt our servers, distributing malware, engaging in fraud, or violating any applicable laws or regulations. Violation may result in immediate termination of access and legal action.",
  },
  {
    icon: Gavel,
    title: "6. Limitation of Liability",
    content:
      "Proffee shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability for any claim shall not exceed the amount paid by you for the product in question. We make no warranties beyond those expressly stated in our policies.",
  },
  {
    icon: FileText,
    title: "7. Intellectual Property",
    content:
      "All content on this website, including text, images, logos, and product descriptions, is the property of Proffee unless otherwise stated. You may not reproduce, distribute, or create derivative works without our prior written consent.",
  },
]

export default function TermsPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Please Read Carefully</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-4">Terms & Conditions</h1>
            <p className="text-lg text-text-secondary max-w-xl">
              These terms govern your use of the Proffee website and your purchase of our products.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-text-muted mb-10"
        >
          Last updated: July 2026
        </motion.p>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-surface p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-serif text-text-primary mb-3">{section.title}</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 p-6 rounded-2xl border border-amber-200 bg-amber-50"
        >
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> These terms are provided as a general template and may not address all legal requirements specific to your jurisdiction or business. We strongly recommend consulting with a qualified legal professional before relying on these terms.
          </p>
        </motion.div>
        {/* TODO: Review with legal counsel before launch */}
      </div>
    </div>
  )
}
