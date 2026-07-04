"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Package, ShoppingCart, Users, DollarSign, Loader2 } from "lucide-react"
import Link from "next/link"
import { getStats } from "@/actions/admin"

type Stats = {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
}

const statCards = [
  { label: "Total Orders", key: "totalOrders" as const, icon: ShoppingCart, href: "/admin/orders", color: "text-blue-500" },
  { label: "Total Revenue", key: "totalRevenue" as const, icon: DollarSign, href: "/admin/orders", color: "text-green-500", prefix: "EGP " },
  { label: "Customers", key: "totalCustomers" as const, icon: Users, href: "#", color: "text-purple-500" },
  { label: "Products", key: "totalProducts" as const, icon: Package, href: "/admin/products", color: "text-primary" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getStats()
      if (result.success && result.stats) {
        setStats(result.stats as Stats)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-secondary text-sm mb-8">Welcome to your admin panel</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const value = stats ? stats[card.key] : 0
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                href={card.href}
                className="block rounded-2xl border border-border bg-surface p-6 hover:border-primary/30 transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">{card.label}</span>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-3xl font-bold text-text-primary font-sans tabular-nums">
                  {card.prefix ?? ""}{value.toLocaleString()}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-serif text-text-primary mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/admin/products"
            className="rounded-2xl border border-border bg-surface p-6 hover:border-primary/30 transition-all duration-300 space-y-3"
          >
            <Package className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Manage Products</h3>
            <p className="text-sm text-text-secondary">Add, edit, or remove products from your catalog</p>
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-border bg-surface p-6 hover:border-primary/30 transition-all duration-300 space-y-3"
          >
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Manage Orders</h3>
            <p className="text-sm text-text-secondary">View and update order statuses</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
