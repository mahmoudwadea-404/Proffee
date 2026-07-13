"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Search, ChevronDown } from "lucide-react"
import { getOrders, updateOrderStatus } from "@/actions/admin"

type OrderItem = {
  id: string
  quantity: number
  product: { name: string }
}

type Order = {
  id: string
  status: string
  paymentMethod: string | null
  total: number
  createdAt: Date
  user: { name: string; email: string }
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500",
  CONFIRMED: "bg-blue-500/20 text-blue-500",
  PROCESSING: "bg-purple-500/20 text-purple-500",
  SHIPPED: "bg-indigo-500/20 text-indigo-500",
  DELIVERED: "bg-green-500/20 text-green-500",
  CANCELLED: "bg-red-500/20 text-red-500",
}

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const result = await getOrders()
      if (!mounted) return
      if (result.success && result.orders) {
        setOrders(result.orders as unknown as Order[])
        setError(null)
      } else if (!result.success) {
        console.error("[AdminOrders] Failed to load orders:", result.error)
        setError(result.error ?? "Unknown error loading orders")
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    await updateOrderStatus(orderId, newStatus)
    const result = await getOrders()
    if (result.success && result.orders) {
      setOrders(result.orders as unknown as Order[])
      setError(null)
    } else if (!result.success) {
      setError(result.error ?? "Failed to refresh orders after update")
    }
    setUpdating(null)
  }

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-4">Orders</h1>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-400 font-medium mb-2">Failed to load orders</p>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-1">Orders</h1>
            <p className="text-text-secondary text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name, or email..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Items</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Payment</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-text-muted">
                      {search ? "No orders match your search." : "No orders yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-text-secondary">{order.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-text-primary font-medium">{order.user.name}</p>
                          <p className="text-text-muted text-xs">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((item) => (
                            <p key={item.id} className="text-text-secondary text-xs">
                              {item.product.name} × {item.quantity}
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-text-muted text-xs">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-primary font-sans tabular-nums text-right font-semibold">
                        EGP {order.total}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-text-secondary">{order.paymentMethod ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updating === order.id}
                            className={`appearance-none px-3 py-1.5 rounded-lg text-xs font-medium border border-border cursor-pointer transition-all duration-300 focus:outline-none focus:border-primary ${
                              statusColors[order.status] ?? "bg-surface text-text-secondary"
                            }`}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-50" />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
