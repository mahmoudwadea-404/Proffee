"use client"

import { Suspense, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Package, ArrowLeft, Loader2, RefreshCw, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/lib/cart-context"

type OrderItem = {
  quantity: number
  price: number
  weight: number
  weightLabel: string
  product: { name: string; imageUrl: string; slug: string; id: string }
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const { addItem } = useCart()
  const [orderItems, setOrderItems] = useState<OrderItem[] | null>(null)
  const [reordered, setReordered] = useState(false)

  useEffect(() => {
    if (!orderId) return
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/track?orderId=${orderId}&email=`)
        // We don't have email here, so we'll just show the reorder button that adds sample items
      } catch {
        // Ignore
      }
    }
    fetchOrder()
  }, [orderId])

  const handleReorder = () => {
    if (!orderItems) return
    for (const item of orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          productId: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          image: item.product.imageUrl,
          price: item.price,
          weight: item.weight,
          weightLabel: item.weightLabel,
        })
      }
    }
    setReordered(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6 max-w-md"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
      </motion.div>

      <h1 className="text-3xl md:text-4xl font-serif text-text-primary">Order Placed!</h1>
      <p className="text-text-secondary text-lg leading-relaxed">
        Thank you for your order. We&apos;ll start preparing it right away.
      </p>

      {orderId && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-sm text-text-secondary">
            Order ID: <span className="text-text-primary font-mono">{orderId}</span>
          </span>
        </div>
      )}

      <div className="pt-4 space-y-3">
        <p className="text-sm text-text-muted">
          You will receive a confirmation email with your order details shortly.
        </p>
        <p className="text-sm text-text-muted">
          Payment will be collected in cash upon delivery.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          href={`/track${orderId ? `?orderId=${orderId}` : ""}`}
          className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-all duration-300"
        >
          <Package className="w-4 h-4" />
          Track Order
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </motion.div>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </div>
  )
}
