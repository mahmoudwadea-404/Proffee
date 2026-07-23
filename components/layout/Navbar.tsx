"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User as UserIcon, Menu, X, LogOut, Shield, Heart, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import type { User } from "@supabase/supabase-js"

export default function Navbar() {
  const pathname = usePathname()
  const { itemCount: cartCount } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const res = await fetch(`/api/user/role?email=${session.user.email}`)
          if (res.ok) {
            const data = await res.json()
            setIsAdmin(data.role === "ADMIN")
          }
        } catch {
          // ignore
        }
      }
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          const res = await fetch(`/api/user/role?email=${session.user.email}`)
          if (res.ok) {
            const data = await res.json()
            setIsAdmin(data.role === "ADMIN")
          }
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => { subscription.unsubscribe() }
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Our Story", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: { type: "tween" as const, duration: 0.3, ease: "easeInOut" as const },
    },
    opened: {
      opacity: 1,
      x: 0,
      transition: { type: "tween" as const, duration: 0.3, ease: "easeInOut" as const },
    },
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border py-4 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-serif font-bold text-primary tracking-wider transition-colors hover:text-primary-light">
          Proffee
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.path
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-medium transition-all duration-300 relative py-1 ${
                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.name}
              {isActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/track"
          className="p-2 text-text-secondary hover:text-primary transition-colors duration-300 hidden md:block"
          aria-label="Track Order"
        >
          <Package className="w-5 h-5" />
        </Link>
        <Link
          href="/wishlist"
          className="p-2 text-text-secondary hover:text-primary transition-colors duration-300 hidden md:block"
          aria-label="Wishlist"
        >
          <Heart className="w-5 h-5" />
        </Link>
        <Link
          href="/cart"
          className="relative p-2 text-text-secondary hover:text-primary transition-colors duration-300"
          aria-label="Shopping cart"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-pulse">
              {cartCount}
            </span>
          )}
        </Link>

        {!loading && (
          <div className="relative group">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="p-2 text-text-secondary hover:text-primary transition-colors duration-300 flex items-center gap-1"
                  aria-label="Account"
                >
                  <UserIcon className="w-6 h-6" />
                </Link>
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-surface border border-border py-1 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 origin-top-right z-50">
                  <div className="px-4 py-2 border-b border-border text-xs text-text-secondary truncate">
                    {user.email}
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-2 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-primary" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-2 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-surface-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 text-text-secondary hover:text-primary transition-colors duration-300"
                aria-label="Sign in"
              >
                <UserIcon className="w-6 h-6" />
              </Link>
            )}
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text-secondary hover:text-primary transition-colors duration-300 md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="opened"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-y-0 right-0 z-40 w-4/5 max-w-sm bg-background border-l border-primary shadow-2xl p-8 flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between mb-12">
              <span className="text-xl font-serif font-bold text-primary">Proffee</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-secondary hover:text-primary transition-colors duration-300"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 mb-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors duration-300 ${
                      isActive ? "text-primary border-l-2 border-primary pl-3" : "text-text-secondary pl-3 hover:text-text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-text-secondary pl-3 hover:text-text-primary transition-colors duration-300 flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </Link>
              <Link
                href="/track"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-text-secondary pl-3 hover:text-text-primary transition-colors duration-300 flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Track Order
              </Link>
            </nav>

            <div className="border-t border-border pt-6 mt-auto">
              {user ? (
                <div className="space-y-4">
                  <div className="text-xs text-text-secondary truncate">{user.email}</div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 py-2 text-text-primary hover:text-primary transition-colors"
                    >
                      <Shield className="w-5 h-5 text-primary" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-2 text-text-primary hover:text-primary transition-colors"
                  >
                    <UserIcon className="w-5 h-5" />
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 py-2 text-red-500 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition-colors duration-300"
                >
                  <UserIcon className="w-5 h-5" />
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
