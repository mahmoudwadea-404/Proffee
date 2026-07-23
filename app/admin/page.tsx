"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Package, ShoppingCart, Users, DollarSign, Loader2, AlertTriangle,
  Clock, XCircle, TrendingUp, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  getDashboardStats, getRevenueChart, getOrdersByMethod,
} from "@/actions/admin"

const RevenueBarChart = dynamic(
  () => import("@/components/admin/Charts").then((m) => m.RevenueBarChart),
  { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div> }
)
const OrdersPieChart = dynamic(
  () => import("@/components/admin/Charts").then((m) => m.OrdersPieChart),
  { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div> }
)

type DashboardStats = {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  failedPayments: number
  lowStockProducts: number
  recentOrders: {
    id: string
    status: string
    paymentStatus: string
    paymentMethod: string | null
    total: number
    createdAt: Date
    firstName: string
    lastName: string
    user: { name: string }
  }[]
}

type RevenuePoint = { date: string; revenue: number; orders: number }
type MethodData = { name: string; orders: number; revenue: number }

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500",
  CONFIRMED: "bg-blue-500/20 text-blue-500",
  PROCESSING: "bg-purple-500/20 text-purple-500",
  SHIPPED: "bg-indigo-500/20 text-indigo-500",
  DELIVERED: "bg-green-500/20 text-green-500",
  CANCELLED: "bg-red-500/20 text-red-500",
}

const payStatusColors: Record<string, string> = {
  PAID: "bg-green-500/20 text-green-500",
  PENDING: "bg-yellow-500/20 text-yellow-500",
  FAILED: "bg-red-500/20 text-red-500",
  UNPAID: "bg-orange-500/20 text-orange-500",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [methodData, setMethodData] = useState<MethodData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [s, r, m] = await Promise.all([
        getDashboardStats(),
        getRevenueChart(),
        getOrdersByMethod(),
      ])
      if (s.success && s.stats) setStats(s.stats as DashboardStats)
      if (r.success && r.data) setRevenue(r.data)
      if (m.success && m.data) setMethodData(m.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-secondary text-sm">Welcome to your admin panel</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-500", href: "/admin/orders" },
          { label: "Revenue", value: `EGP ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-green-500", href: "/admin/orders" },
          { label: "Customers", value: stats?.totalCustomers ?? 0, icon: Users, color: "text-purple-500", href: "#" },
          { label: "Products", value: stats?.totalProducts ?? 0, icon: Package, color: "text-primary", href: "/admin/products" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
            <Link href={card.href} className="block rounded-2xl border border-border bg-surface p-5 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-secondary">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary font-sans tabular-nums">{card.value}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Orders", value: stats?.todayOrders ?? 0, icon: TrendingUp, color: "text-blue-500" },
          { label: "Today's Revenue", value: `EGP ${(stats?.todayRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
          { label: "Pending Payments", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-yellow-500", alert: (stats?.pendingOrders ?? 0) > 0 },
          { label: "Low Stock", value: stats?.lowStockProducts ?? 0, icon: AlertTriangle, color: "text-orange-500", alert: (stats?.lowStockProducts ?? 0) > 0 },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}>
            <div className={`rounded-2xl border bg-surface p-5 ${card.alert ? "border-orange-500/30" : "border-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-secondary">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary font-sans tabular-nums">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-serif text-text-primary mb-4">Revenue (Last 30 Days)</h2>
          <RevenueBarChart data={revenue} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-serif text-text-primary mb-4">Orders by Method</h2>
          <OrdersPieChart data={methodData} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif text-text-primary">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-text-muted font-medium text-xs">Order</th>
                  <th className="text-left px-3 py-2 text-text-muted font-medium text-xs">Customer</th>
                  <th className="text-right px-3 py-2 text-text-muted font-medium text-xs">Total</th>
                  <th className="text-left px-3 py-2 text-text-muted font-medium text-xs">Payment</th>
                  <th className="text-left px-3 py-2 text-text-muted font-medium text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-mono text-xs text-text-secondary">{o.id.slice(0, 8)}...</td>
                    <td className="px-3 py-2 text-text-primary text-xs">{o.firstName} {o.lastName}</td>
                    <td className="px-3 py-2 text-right font-sans tabular-nums text-xs">EGP {o.total}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${payStatusColors[o.paymentStatus] ?? ""}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[o.status] ?? ""}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-muted text-sm">No orders yet</p>
        )}
      </motion.div>
    </div>
  )
}
