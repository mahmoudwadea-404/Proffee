"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Tag, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import dynamic from "next/dynamic"
import { getCouponAnalytics } from "@/actions/admin"

const CouponBarChart = dynamic(
  () => import("@/components/admin/CouponChart").then((m) => m.CouponBarChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div> }
)

type CouponAnalytics = {
  id: string
  code: string
  description: string
  discountType: string
  discountValue: number
  maximumDiscount: number | null
  usedCount: number
  maxUses: number | null
  isActive: boolean
  startsAt: Date | null
  expiresAt: Date | null
  createdAt: Date
  orderCount: number
  totalDiscountGiven: number
  totalRevenue: number
  usagePercent: number | null
}

export default function CouponAnalyticsPage() {
  const [coupons, setCoupons] = useState<CouponAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const result = await getCouponAnalytics()
      if (result.success && result.coupons) {
        setCoupons(result.coupons as unknown as CouponAnalytics[])
      }
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

  const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0)
  const totalDiscount = coupons.reduce((sum, c) => sum + c.totalDiscountGiven, 0)
  const activeCoupons = coupons.filter((c) => c.isActive).length

  const chartData = coupons
    .filter((c) => c.usedCount > 0)
    .slice(0, 10)
    .map((c) => ({
      name: c.code,
      uses: c.usedCount,
      discount: Math.round(c.totalDiscountGiven),
    }))

  return (
    <div className="p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-1">Coupon Analytics</h1>
        <p className="text-text-secondary text-sm">Usage statistics and performance metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, icon: Tag, color: "text-blue-500" },
          { label: "Active Coupons", value: activeCoupons, icon: TrendingUp, color: "text-green-500" },
          { label: "Total Discounts Given", value: `EGP ${totalDiscount.toLocaleString()}`, icon: DollarSign, color: "text-orange-500" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-secondary">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary font-sans tabular-nums">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif text-text-primary">Top Coupons by Usage</h2>
          </div>
          <CouponBarChart data={chartData} />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-serif text-text-primary">All Coupons</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Type</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Value</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Used</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Limit</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Orders</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Discount Given</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Revenue</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-text-muted">No coupons created yet.</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-mono text-xs text-text-primary font-medium">{coupon.code}</span>
                      {coupon.description && (
                        <p className="text-text-muted text-xs mt-0.5 truncate max-w-[160px]">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-text-secondary">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `EGP ${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-text-secondary">
                      {coupon.discountType === "PERCENTAGE" && coupon.maximumDiscount
                        ? `max EGP ${coupon.maximumDiscount}`
                        : "---"}
                    </td>
                    <td className="px-6 py-3 text-right font-sans tabular-nums text-xs text-text-primary">
                      {coupon.usedCount}
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-text-secondary">
                      {coupon.maxUses ?? "---"}
                    </td>
                    <td className="px-6 py-3 text-right font-sans tabular-nums text-xs text-text-primary">
                      {coupon.orderCount}
                    </td>
                    <td className="px-6 py-3 text-right font-sans tabular-nums text-xs text-green-500">
                      EGP {coupon.totalDiscountGiven.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right font-sans tabular-nums text-xs text-text-primary">
                      EGP {coupon.totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      {coupon.usagePercent !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${coupon.usagePercent >= 90 ? "bg-red-500" : coupon.usagePercent >= 60 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min(coupon.usagePercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted">{coupon.usagePercent}%</span>
                        </div>
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          coupon.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        }`}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
