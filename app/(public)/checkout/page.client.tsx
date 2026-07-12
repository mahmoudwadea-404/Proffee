"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, Loader2, Package } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { createOrder, createCardOrder, type CreateOrderInput } from "@/actions/orders"

type CheckoutItem = {
  productId: string
  slug: string
  name: string
  image: string
  price: number
  weight: number
  weightLabel: string
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cartItems, itemCount: cartItemCount, subtotal: cartSubtotal, clearCart } = useCart()

  const [buyNowItem, setBuyNowItem] = useState<CheckoutItem | null>(null)
  const isBuyNow = buyNowItem !== null

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get("buyNow") !== "1") return
      const raw = sessionStorage.getItem("proffee-buy-now")
      if (!raw) return
      const parsed = JSON.parse(raw) as CheckoutItem
      if (parsed.productId && parsed.price) setBuyNowItem(parsed)
    } catch { /* ignore */ }
  }, [])

  const displayItems = isBuyNow && buyNowItem ? [buyNowItem] : cartItems
  const displaySubtotal = isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.quantity : cartSubtotal
  const displayCount = isBuyNow && buyNowItem ? buyNowItem.quantity : cartItemCount

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (!isBuyNow && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-3xl font-serif text-text-primary">Nothing to check out</h1>
          <p className="text-text-secondary">Add some products to your cart first.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </motion.div>
      </div>
    )
  }

  if (isBuyNow && !buyNowItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-3xl font-serif text-text-primary">Buy Now unavailable</h1>
          <p className="text-text-secondary">Could not load the selected product. Please try again.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    console.log("[Checkout] handleSubmit called, paymentMethod:", paymentMethod, "displayItems count:", displayItems.length, "submitting:", submitting)

    if (displayItems.length === 0) {
      console.error("[Checkout] displayItems is empty — cannot submit")
      setError("Your cart is empty. Please add items to your cart before placing an order.")
      setSubmitting(false)
      return
    }

    let payload: CreateOrderInput
    try {
      payload = {
        email: form.email,
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes || undefined,
        items: displayItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          weight: i.weightLabel,
        })),
        total: displaySubtotal,
      }
      console.log("[Checkout] payload built successfully, items:", payload.items.length, "total:", payload.total)
    } catch (payloadErr) {
      console.error("[Checkout] ERROR building payload:", payloadErr)
      setError("Failed to prepare order data. Please try again.")
      setSubmitting(false)
      return
    }

    if (paymentMethod === "CARD") {
      console.log("[Checkout] Calling createCardOrder...")
      let result: Awaited<ReturnType<typeof createCardOrder>>
      try {
        result = await createCardOrder(payload)
      } catch (callErr) {
        console.error("[Checkout] createCardOrder threw (unhandled rejection):", callErr)
        setError("An unexpected error occurred. Please try again.")
        setSubmitting(false)
        return
      }
      console.log("[Checkout] createCardOrder returned, success:", result.success)

      if (!result.success) {
        setError(result.error ?? "Something went wrong")
        setSubmitting(false)
        return
      }

      if (!isBuyNow) {
        clearCart()
      }
      window.location.href = result.checkoutUrl!
      return
    }

    console.log("[Checkout] Calling createOrder (COD)...")
    let result: Awaited<ReturnType<typeof createOrder>>
    try {
      result = await createOrder(payload)
    } catch (callErr) {
      console.error("[Checkout] createOrder threw (unhandled rejection):", callErr)
      setError("An unexpected error occurred. Please try again.")
      setSubmitting(false)
      return
    }

    if (!result.success) {
      setError(result.error ?? "Something went wrong")
      setSubmitting(false)
      return
    }

    if (!isBuyNow) {
      clearCart()
    }
    router.push(`/checkout/success?orderId=${result.orderId}`)
  }

  const isValid = form.name && form.email && form.phone && form.address && form.city

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link
              href={isBuyNow ? "/products" : "/cart"}
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors duration-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {isBuyNow ? "Back to Products" : "Back to Cart"}
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-2">Checkout</h1>
            <p className="text-text-secondary text-lg">Complete your order</p>
          </motion.div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-border bg-surface p-6 space-y-5"
              >
                <h2 className="text-lg font-serif text-text-primary">Customer Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="name" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+20 100 000 0000"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-2xl border border-border bg-surface p-6 space-y-5"
              >
                <h2 className="text-lg font-serif text-text-primary">Shipping Address</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="address" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Street Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="123 Main Street, Apartment 4B"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="city" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Cairo"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Order Notes (optional)
                    </label>
                    <input
                      id="notes"
                      type="text"
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Delivery instructions, gate code, etc."
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-2xl border border-border bg-surface p-6 space-y-4"
              >
                <h2 className="text-lg font-serif text-text-primary">Payment Method</h2>

                <label className="flex items-center gap-4 p-4 rounded-xl border border-primary/40 bg-primary/5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-primary w-4 h-4"
                  />
                  <Package className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Cash on Delivery</p>
                    <p className="text-xs text-text-muted">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all duration-300">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                    className="accent-primary w-4 h-4"
                  />
                  <CreditCard className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Pay with Card</p>
                    <p className="text-xs text-text-muted">Visa / Mastercard — secure payment via Paymob</p>
                  </div>
                </label>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-border bg-surface p-6 space-y-4 sticky top-28"
              >
                <h2 className="text-lg font-serif text-text-primary">Order Summary</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {displayItems.map((item) => (
                    <div key={`${item.productId}-${item.weight}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] flex items-center justify-center shrink-0 border border-border overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.weightLabel} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-text-primary tabular-nums">EGP {item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Subtotal ({displayCount} item{displayCount !== 1 ? "s" : ""})</span>
                    <span className="text-text-primary font-medium tabular-nums">EGP {displaySubtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span className={displaySubtotal >= 500 ? "text-green-500" : "text-text-muted"}>
                      {displaySubtotal >= 500 ? "Free" : "Calculated later"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Payment</span>
                    <span className="text-text-primary">{paymentMethod === "CARD" ? "Card Payment" : "Cash on Delivery"}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-text-primary">Total</span>
                    <span className="text-2xl font-bold text-primary font-sans tabular-nums">EGP {displaySubtotal}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="w-full py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {paymentMethod === "CARD" ? "Redirecting to Payment..." : "Placing Order..."}
                      </>
                    ) : (
                      <>
                        {paymentMethod === "CARD" ? <CreditCard className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                        {paymentMethod === "CARD" ? "Pay with Card" : "Place Order"}
                      </>
                    )}
                </button>

                <p className="text-xs text-text-muted text-center">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
