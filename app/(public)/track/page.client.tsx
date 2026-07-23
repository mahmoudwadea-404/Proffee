"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Package, Clock, CheckCircle, Truck, XCircle, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type OrderStatus = {
  id: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  total: number
  createdAt: string
  items: {
    quantity: number
    price: number
    product: { name: string; imageUrl: string }
  }[]
  statusLogs: {
    toStatus: string
    toPayment: string
    note: string | null
    createdAt: string
  }[]
}

const statusIcons: Record<string, typeof Package> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-500",
  CONFIRMED: "text-blue-500",
  PROCESSING: "text-purple-500",
  SHIPPED: "text-indigo-500",
  DELIVERED: "text-green-500",
  CANCELLED: "text-red-500",
}

const statusBg: Record<string, string> = {
  PENDING: "bg-yellow-500/20",
  CONFIRMED: "bg-blue-500/20",
  PROCESSING: "bg-purple-500/20",
  SHIPPED: "bg-indigo-500/20",
  DELIVERED: "bg-green-500/20",
  CANCELLED: "bg-red-500/20",
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "")
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = useCallback(async () => {
    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both Order ID and email.")
      return
    }
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Order not found.")
        return
      }
      const data = await res.json()
      setOrder(data.order)
    } catch {
      setError("Failed to track order. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [orderId, email])

  useEffect(() => {
    if (searchParams.get("orderId") && email) {
      handleTrack()
    }
  }, [searchParams, email, handleTrack])

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-2">Track Your Order</h1>
            <p className="text-text-secondary text-lg">Enter your order ID and email to see the latest status.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-2xl border border-border bg-surface p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. cm5x..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={handleTrack}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track Order
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </motion.div>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-8">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-serif text-text-primary">Order {order.id.slice(0, 8)}...</h2>
                  <p className="text-text-muted text-xs mt-1">
                    Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary font-sans">EGP {order.total}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusBg[order.status] ?? ""} ${statusColors[order.status] ?? ""}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((step) => {
                  const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]
                  const currentIdx = steps.indexOf(order.status === "CANCELLED" ? "PENDING" : order.status)
                  const stepIdx = steps.indexOf(step)
                  const isActive = stepIdx <= currentIdx
                  const Icon = statusIcons[step] ?? Clock
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? `${statusBg[step]} ${statusColors[step]}` : "bg-surface-2 text-text-muted"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-text-primary" : "text-text-muted"}`}>{step}</span>
                    </div>
                  )
                })}
              </div>

              <h3 className="text-sm font-semibold text-text-primary mb-3">Items</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] overflow-hidden shrink-0">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{item.product.name}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-text-primary">EGP {item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.statusLogs.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="text-lg font-serif text-text-primary mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {order.statusLogs.map((log, i) => {
                    const Icon = statusIcons[log.toStatus] ?? Clock
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusBg[log.toStatus] ?? "bg-surface-2"} ${statusColors[log.toStatus] ?? "text-text-muted"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {i < order.statusLogs.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium text-text-primary">{log.toStatus}</p>
                          {log.note && <p className="text-xs text-text-muted mt-0.5">{log.note}</p>}
                          <p className="text-xs text-text-muted mt-1">
                            {new Date(log.createdAt).toLocaleString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {!order && !loading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Enter your order details above to track your order.</p>
          </div>
        )}
      </div>
    </div>
  )
}
