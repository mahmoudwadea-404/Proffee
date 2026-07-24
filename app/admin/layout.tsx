"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Shield, LayoutDashboard, Package, ShoppingCart, Tag, LogOut, BarChart3, Boxes } from "lucide-react"

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Coupons", path: "/admin/coupons", icon: Tag },
  { name: "Inventory", path: "/admin/inventory", icon: Boxes },
  { name: "Analytics", path: "/admin/coupons/analytics", icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabaseRef = useRef(createClient())
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const supabase = supabaseRef.current
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin/login")
        return
      }
      const res = await fetch("/api/user/role")
      if (res.ok) {
        const data = await res.json()
        if (data.role !== "ADMIN") {
          router.push("/")
          return
        }
        setAuthorized(true)
      } else {
        router.push("/")
        return
      }
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    await supabaseRef.current.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 shrink-0 border-r border-border bg-surface hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-lg font-serif font-bold text-primary">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-transparent"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-lg font-serif font-bold text-primary">Admin</span>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    isActive ? "bg-primary/15 text-primary" : "text-text-secondary"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
