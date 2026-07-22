"use client"

import { motion } from "framer-motion"
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-3xl font-serif text-text-primary">Your cart is empty</h1>
          <p className="text-text-secondary">Looks like you haven&apos;t added any coffee to your cart yet.</p>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-2">Shopping Cart</h1>
            <p className="text-text-secondary text-lg">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.weight}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex gap-4 p-4 rounded-2xl border border-border bg-surface group hover:border-primary/20 transition-all duration-300"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] flex items-center justify-center shrink-0 border border-border overflow-hidden"
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                </Link>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-serif text-base md:text-lg text-text-primary hover:text-primary transition-colors duration-300 line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-text-muted">{item.weightLabel}</p>
                    </div>
                    <p className="text-lg font-semibold text-primary font-sans whitespace-nowrap">
                      EGP {item.price}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-border text-text-secondary hover:text-primary hover:border-primary transition-all duration-300 flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-text-primary tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-border text-text-secondary hover:text-primary hover:border-primary transition-all duration-300 flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-text-primary font-sans tabular-nums">
                        EGP {item.price * item.quantity}
                      </p>
                      <button
                        onClick={() => removeItem(item.productId, item.weight)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={clearCart}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-red-500 transition-colors duration-300"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
              <Link
                href="/products"
                className="text-sm text-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-border bg-surface p-6 space-y-4 sticky top-28"
            >
              <h2 className="text-lg font-serif text-text-primary">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                  <span className="text-text-primary font-medium tabular-nums">EGP {subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span className="text-text-muted">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-text-primary">Estimated Total</span>
                  <span className="text-xl font-bold text-primary font-sans tabular-nums">EGP {subtotal}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Proceed to Checkout
              </Link>

              <p className="text-xs text-text-muted text-center">Shipping: EGP 60 flat rate</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
