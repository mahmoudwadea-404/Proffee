"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Search } from "lucide-react"

const categories = [
  { id: "all", label: "All" },
  { id: "ordering", label: "Ordering" },
  { id: "shipping", label: "Shipping & Delivery" },
  { id: "returns", label: "Returns & Refunds" },
  { id: "products", label: "Products & Roasting" },
  { id: "payment", label: "Payment" },
  { id: "account", label: "Account" },
  { id: "subscription", label: "Subscriptions" },
]

const faqs = [
  {
    category: "ordering",
    question: "How do I place an order?",
    answer: "Browse our menu, select your preferred coffee and weight, add items to your cart, and proceed to checkout. No account is required to place an order, though creating one lets you track your order history.",
  },
  {
    category: "ordering",
    question: "Do I need an account to order?",
    answer: "No, you can check out as a guest. However, creating a free account allows you to save your shipping details, view order history, and manage subscriptions.",
  },
  {
    category: "ordering",
    question: "Can I modify or cancel my order after placing it?",
    answer: "If your order has not yet been dispatched, please contact us at hello@proffee.com and we will do our best to accommodate changes. Once dispatched, modifications are not possible.",
  },
  {
    category: "ordering",
    question: "How do I know my order has been confirmed?",
    answer: "After placing your order, you will receive a confirmation email with your order number and details. If you do not see it, please check your spam folder or contact us.",
  },
  {
    category: "ordering",
    question: "Can I order as a business or wholesale customer?",
    answer: "Yes, we offer wholesale pricing for cafés, offices, and retailers. Please reach out to us at hello@proffee.com with your estimated volume and we will provide a custom quote.",
  },
  {
    category: "shipping",
    question: "What areas do you deliver to?",
    answer: "We currently deliver across all governorates of Egypt. We do not ship internationally at this time.",
  },
  {
    category: "shipping",
    question: "How long does delivery take?",
    answer: "Deliveries within Greater Cairo typically arrive within 2–5 business days. For other governorates, please allow 3–7 business days. These are estimates and may vary during peak periods or due to circumstances beyond our control.",
  },
  {
    category: "shipping",
    question: "How much does shipping cost?",
    answer: "Shipping is calculated at checkout based on your location and order size. Orders of EGP 500 or more qualify for free standard shipping within Egypt.",
  },
  {
    category: "shipping",
    question: "How is my coffee packaged for shipping?",
    answer: "We package our coffee in airtight, resealable bags with one-way degassing valves to preserve freshness. Each bag is then placed in a padded mailer or box to protect it during transit.",
  },
  {
    category: "shipping",
    question: "Do you offer express or same-day delivery?",
    answer: "We are working on offering express delivery within select areas of Greater Cairo. Currently, all orders are shipped via standard delivery. We will announce express options once they become available.",
  },
  {
    category: "shipping",
    question: "What happens if my package arrives damaged?",
    answer: "We take great care in packaging, but if your order arrives damaged, please contact us at hello@proffee.com within 48 hours with photos of the damage and we will make it right.",
  },
  {
    category: "returns",
    question: "What is your return policy?",
    answer: "Due to the perishable nature of coffee, we generally do not accept returns. However, if your order arrives damaged, defective, or is not what you ordered, please contact us within 48 hours and we will arrange a replacement or refund.",
  },
  {
    category: "returns",
    question: "Can I get a refund if I do not like the coffee?",
    answer: "We stand behind the quality of our coffee. If you are unsatisfied with your purchase, please reach out to us at hello@proffee.com and we will do our best to resolve the issue, including offering a replacement or store credit where appropriate.",
  },
  {
    category: "returns",
    question: "How do I request a refund or replacement?",
    answer: "Contact us at hello@proffee.com with your order number and a description of the issue. Our team will review and respond within 1–2 business days with next steps.",
  },
  {
    category: "returns",
    question: "When will I receive my refund?",
    answer: "Once your refund is approved, it will be processed to your original payment method within 5–10 business days. For cash-on-delivery orders, refunds will be issued as store credit or via bank transfer.",
  },
  {
    category: "products",
    question: "What is specialty coffee?",
    answer: "Specialty coffee is coffee that scores 80 points or higher on the Specialty Coffee Association (SCA) grading scale. It is distinguished by exceptional flavor, careful processing, and full traceability from farm to cup.",
  },
  {
    category: "products",
    question: "What roast levels do you offer?",
    answer: "We offer Light, Medium, Medium-Dark, and Dark roasts. Each roast level is developed to highlight the unique flavor characteristics of the bean — from bright and fruity at lighter roasts to rich and chocolatey at darker roasts.",
  },
  {
    category: "products",
    question: "Where do you source your coffee?",
    answer: "We source directly from smallholder farmers and cooperatives in Ethiopia, Colombia, Kenya, Indonesia, Guatemala, Costa Rica, and Brazil. Each origin is chosen for its distinctive flavor profile and sustainable growing practices.",
  },
  {
    category: "products",
    question: "Is your coffee freshly roasted?",
    answer: "Yes, all our coffee is roasted in small batches at our Cairo roastery and shipped within days of roasting. We do not roast far in advance because coffee is at its peak flavor 3–14 days after roasting.",
  },
  {
    category: "products",
    question: "What grind options are available?",
    answer: "We offer whole bean and two grind sizes: coarse (for French press) and fine (for espresso). If you need a different grind size, let us know at checkout and we will do our best to accommodate.",
  },
  {
    category: "products",
    question: "Can I request a custom roast profile?",
    answer: "Yes, we offer custom roasting for larger quantities. Please contact us at hello@proffee.com with your desired profile and volume, and we will coordinate with you.",
  },
  {
    category: "products",
    question: "How should I store my coffee?",
    answer: "Store your coffee in an airtight container in a cool, dark place away from direct sunlight, heat, and moisture. Avoid storing it in the refrigerator or freezer as condensation can degrade the flavor.",
  },
  {
    category: "products",
    question: "What is the best before date on your coffee?",
    answer: "Our coffee is best consumed within 4–6 weeks of the roast date. The bag includes both the roast date and a best-before date for your reference.",
  },
  {
    category: "payment",
    question: "What payment methods do you accept?",
    answer: "We accept cash on delivery (COD), credit cards, debit cards, and bank transfers. We are actively working on adding more payment options.",
  },
  {
    category: "payment",
    question: "Is COD available everywhere?",
    answer: "Yes, cash on delivery is available across all governorates in Egypt. You pay in cash when your order arrives.",
  },
  {
    category: "payment",
    question: "Is it safe to pay online with my card?",
    answer: "Yes, all online payments are processed through our secure payment gateway. We do not store your card details on our servers.",
  },
  {
    category: "payment",
    question: "Do you offer payment plans?",
    answer: "Not at the moment, but we are exploring options to offer buy-now-pay-later services in the future.",
  },
  {
    category: "account",
    question: "How do I create an account?",
    answer: "Click on the user icon at the top of the page and select Sign Up. You can register using your email address and a password, or sign in with Google for a faster setup.",
  },
  {
    category: "account",
    question: "I forgot my password. How do I reset it?",
    answer: "On the Sign In page, click Forgot Password and enter your email address. We will send you a link to create a new password.",
  },
  {
    category: "account",
    question: "How do I update my shipping address or profile details?",
    answer: "Log into your account and navigate to Account Settings. You can update your name, email, phone number, and saved addresses from there.",
  },
  {
    category: "account",
    question: "Can I delete my account?",
    answer: "Yes, you can request account deletion by contacting us at hello@proffee.com. Please note that order history will be anonymised but retained for record-keeping purposes.",
  },
  {
    category: "subscription",
    question: "Does Proffee offer coffee subscriptions?",
    answer: "We are developing a subscription service and expect to launch it soon. Subscribe to our newsletter to be the first to know when subscriptions become available.",
  },
  {
    category: "subscription",
    question: "Can I set up recurring orders?",
    answer: "Recurring ordering is not yet available. Once the subscription service launches, you will be able to set up weekly, biweekly, or monthly deliveries.",
  },
]

export default function FAQsPageClient() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const filtered = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory
    const matchesSearch =
      !search.trim() ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Got Questions?</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-4">FAQs</h1>
            <p className="text-lg text-text-secondary max-w-xl">
              Everything you need to know about ordering, shipping, returns, and our coffee.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenIndex(null) }}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors duration-300"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(null) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary/50 hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-text-muted py-16"
          >
            No results found for &ldquo;{search}&rdquo;. Try a different search term or category.
          </motion.p>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="rounded-xl border border-border bg-surface overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-surface-2"
                >
                  <span className="text-base font-medium text-text-primary font-sans pr-4">
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
        )}
      </div>
    </div>
  )
}
