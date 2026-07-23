"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Package, AlertTriangle } from "lucide-react"
import { getInventoryHistory } from "@/actions/admin"

type Product = {
  id: string
  name: string
  slug: string
  stock: number
  price: number
  imageUrl: string
}

type StockChange = {
  date: string
  productName: string
  change: number
  orderId: string
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockChanges, setStockChanges] = useState<StockChange[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const result = await getInventoryHistory()
      if (result.success) {
        setProducts(result.products as Product[])
        setStockChanges(result.stockChanges as StockChange[])
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

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = products.filter((p) => p.stock <= 5).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  return (
    <div className="p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-1">Inventory</h1>
        <p className="text-text-secondary text-sm">Stock levels and movement history</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Stock", value: totalStock, icon: Package, color: "text-blue-500" },
          { label: "Low Stock (<=5)", value: lowStockCount, icon: AlertTriangle, color: "text-yellow-500", alert: lowStockCount > 0 },
          { label: "Out of Stock", value: outOfStockCount, icon: AlertTriangle, color: "text-red-500", alert: outOfStockCount > 0 },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-serif text-text-primary">Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Product</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Price</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                  <td className="px-6 py-3">
                    <p className="text-text-primary font-medium text-xs">{product.name}</p>
                  </td>
                  <td className="px-6 py-3 text-right font-sans tabular-nums text-xs text-text-secondary">
                    EGP {product.price}
                  </td>
                  <td className="px-6 py-3 text-right font-sans tabular-nums text-xs text-text-primary font-medium">
                    {product.stock}
                  </td>
                  <td className="px-6 py-3">
                    {product.stock === 0 ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-500">
                        Out of Stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-500">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-500">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-serif text-text-primary">Stock Movement (Paid Orders)</h2>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Product</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Change</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Order</th>
              </tr>
            </thead>
            <tbody>
              {stockChanges.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-muted">No stock movements recorded yet.</td>
                </tr>
              ) : (
                stockChanges.map((change, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-3 text-text-muted text-xs whitespace-nowrap">
                      {new Date(change.date).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-text-primary text-xs">{change.productName}</td>
                    <td className="px-6 py-3 text-right font-sans tabular-nums text-xs text-red-500 font-medium">
                      {change.change}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-text-muted">{change.orderId.slice(0, 8)}...</td>
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
