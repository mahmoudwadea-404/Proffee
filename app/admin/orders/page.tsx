"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, Search, ChevronDown, Filter, Clock, CheckCircle,
  XCircle, Download, Eye, ShieldCheck, ChevronRight, ChevronLeft,
} from "lucide-react"
import { getOrders, updateOrderStatus, getOrderTimeline, verifyPayment, getOrdersForExport } from "@/actions/admin"

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: { name: string }
}

type Order = {
  id: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  paymobTransactionId: string | null
  total: number
  subtotal: number
  shippingFee: number
  discountAmount: number
  couponCode: string
  createdAt: Date
  firstName: string
  lastName: string
  governorate: string
  city: string
  address: string
  phone: string
  user: { name: string; email: string }
  items: OrderItem[]
}

type TimelineLog = {
  id: string
  fromStatus: string | null
  toStatus: string
  fromPayment: string | null
  toPayment: string
  note: string | null
  createdAt: Date
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500",
  CONFIRMED: "bg-blue-500/20 text-blue-500",
  PROCESSING: "bg-purple-500/20 text-purple-500",
  SHIPPED: "bg-indigo-500/20 text-indigo-500",
  DELIVERED: "bg-green-500/20 text-green-500",
  CANCELLED: "bg-red-500/20 text-red-500",
}

const paymentStatusColors: Record<string, string> = {
  PAID: "bg-green-500/20 text-green-500",
  PENDING: "bg-yellow-500/20 text-yellow-500",
  FAILED: "bg-red-500/20 text-red-500",
  UNPAID: "bg-orange-500/20 text-orange-500",
}

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
const paymentStatusFilters = ["All", "PAID", "PENDING", "FAILED", "UNPAID"] as const
const paymentMethodFilters = ["All", "CARD", "COD"] as const

function toCSV(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? "")
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val
      }).join(",")
    ),
  ]
  return lines.join("\n")
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("All")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("All")
  const [timelineOrderId, setTimelineOrderId] = useState<string | null>(null)
  const [timelineLogs, setTimelineLogs] = useState<TimelineLog[]>([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const result = await getOrders()
      if (!mounted) return
      if (result.success && result.orders) {
        setOrders(result.orders as unknown as Order[])
        setError(null)
      } else if (!result.success) {
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
    }
    setUpdating(null)
  }

  const handleVerifyPayment = async (orderId: string) => {
    setVerifying(orderId)
    const result = await verifyPayment(orderId)
    if (result.success) {
      const refreshed = await getOrders()
      if (refreshed.success && refreshed.orders) {
        setOrders(refreshed.orders as unknown as Order[])
      }
    } else {
      setError(result.error ?? "Failed to verify payment")
    }
    setVerifying(null)
  }

  const handleViewTimeline = async (orderId: string) => {
    setTimelineOrderId(orderId)
    setTimelineLoading(true)
    const result = await getOrderTimeline(orderId)
    if (result.success && result.logs) {
      setTimelineLogs(result.logs as unknown as TimelineLog[])
    }
    setTimelineLoading(false)
  }

  const handleExport = async () => {
    setExporting(true)
    const result = await getOrdersForExport()
    if (result.success && result.rows) {
      const csv = toCSV(result.rows as unknown as Record<string, unknown>[])
      downloadCSV(csv, `orders-export-${new Date().toISOString().split("T")[0]}.csv`)
    }
    setExporting(false)
  }

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase())
    const matchesPaymentStatus =
      paymentStatusFilter === "All" || o.paymentStatus === paymentStatusFilter
    const matchesPaymentMethod =
      paymentMethodFilter === "All" || o.paymentMethod === paymentMethodFilter
    return matchesSearch && matchesPaymentStatus && matchesPaymentMethod
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && orders.length === 0) {
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
            <p className="text-text-secondary text-sm">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
              {filtered.length !== orders.length ? ` of ${orders.length} total` : ""}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-all duration-300 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search by order ID, customer name, or email..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Payment</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {paymentStatusFilters.map((f) => (
              <button
                key={f}
                onClick={() => { setPaymentStatusFilter(f); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  paymentStatusFilter === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-muted hover:text-text-secondary hover:border-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex flex-wrap gap-1.5">
            {paymentMethodFilters.map((f) => (
              <button
                key={f}
                onClick={() => { setPaymentMethodFilter(f); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  paymentMethodFilter === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-muted hover:text-text-secondary hover:border-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Items</th>
                  <th className="text-right px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Pay Status</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Coupon</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Tx ID</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-12 text-center text-text-muted">
                      {search || paymentStatusFilter !== "All" || paymentMethodFilter !== "All"
                        ? "No orders match your filters."
                        : "No orders yet."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-mono text-xs text-text-secondary">{order.id.slice(0, 8)}...</span>
                          <p className="text-text-muted text-xs">{order.firstName} {order.lastName}</p>
                          <p className="text-text-muted text-xs">{order.governorate}, {order.city}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-text-primary font-medium text-xs">{order.user.name}</p>
                          <p className="text-text-muted text-xs truncate max-w-[140px]" title={order.user.email}>{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((item) => (
                            <p key={item.id} className="text-text-secondary text-xs">
                              {item.product.name} x{item.quantity}
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-text-muted text-xs">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-sans tabular-nums">
                        <div className="space-y-0.5">
                          {order.discountAmount > 0 && (
                            <p className="text-xs text-green-500">- EGP {order.discountAmount}</p>
                          )}
                          <p className="text-text-primary font-semibold text-xs">EGP {order.total}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          order.paymentMethod === "CARD"
                            ? "bg-blue-500/20 text-blue-500"
                            : order.paymentMethod === "COD"
                              ? "bg-orange-500/20 text-orange-500"
                              : "text-text-muted"
                        }`}>
                          {order.paymentMethod ?? "---"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          paymentStatusColors[order.paymentStatus] ?? "bg-surface text-text-secondary"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.couponCode ? (
                          <span className="font-mono text-xs text-text-muted">{order.couponCode}</span>
                        ) : (
                          <span className="text-text-muted text-xs">---</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {order.paymobTransactionId ? (
                          <span className="font-mono text-xs text-text-muted" title={order.paymobTransactionId}>
                            {order.paymobTransactionId.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-text-muted text-xs">---</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updating === order.id}
                            className={`appearance-none px-2.5 py-1 rounded-lg text-xs font-medium border border-border cursor-pointer transition-all duration-300 focus:outline-none focus:border-primary ${
                              statusColors[order.status] ?? "bg-surface text-text-secondary"
                            }`}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-50" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewTimeline(order.id)}
                            className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all"
                            title="View Timeline"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          {order.paymentStatus !== "PAID" && (
                            <button
                              onClick={() => handleVerifyPayment(order.id)}
                              disabled={verifying === order.id}
                              className="p-1.5 rounded-lg hover:bg-green-500/10 text-text-muted hover:text-green-500 transition-all disabled:opacity-50"
                              title="Verify Payment"
                            >
                              {verifying === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-border hover:bg-surface-2 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-border hover:bg-surface-2 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {timelineOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setTimelineOrderId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl border border-border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif text-text-primary">Order Timeline</h3>
                <button
                  onClick={() => setTimelineOrderId(null)}
                  className="p-1 rounded-lg hover:bg-surface-2 text-text-muted"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {timelineLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : timelineLogs.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">No status changes recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {timelineLogs.map((log, i) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          log.toPayment === "PAID" ? "bg-green-500" :
                          log.toPayment === "FAILED" ? "bg-red-500" :
                          "bg-blue-500"
                        }`} />
                        {i < timelineLogs.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[log.toStatus] ?? ""}`}>
                            {log.toStatus}
                          </span>
                          {log.fromPayment !== log.toPayment && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${paymentStatusColors[log.toPayment] ?? ""}`}>
                              {log.fromPayment} &rarr; {log.toPayment}
                            </span>
                          )}
                        </div>
                        {log.note && (
                          <p className="text-text-muted text-xs mt-1">{log.note}</p>
                        )}
                        <p className="text-text-muted text-xs mt-1">
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
