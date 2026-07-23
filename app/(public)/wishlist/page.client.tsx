"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Trash2, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getPrismaUserId } from "@/actions/auth"
import { getWishlist, toggleWishlist } from "@/actions/wishlist"
import { useCart } from "@/lib/cart-context"

type WishlistItem = {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    imageUrl: string
    description: string
    roastLevel: string
    stock: number
  }
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const prismaId = await getPrismaUserId(user.id)
      if (!prismaId) {
        setLoading(false)
        return
      }
      setUserId(prismaId)
      const result = await getWishlist(prismaId)
      if (result.success && result.items) {
        setItems(result.items as unknown as WishlistItem[])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleRemove = async (productId: string) => {
    if (!userId) return
    await toggleWishlist(userId, productId)
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      productId: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.imageUrl,
      price: item.product.price,
      weight: 250,
      weightLabel: "250g",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <Heart className="w-16 h-16 text-text-muted mx-auto" />
          <h1 className="text-3xl font-serif text-text-primary">Your Wishlist</h1>
          <p className="text-text-secondary">Sign in to save your favorite coffees.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <Heart className="w-16 h-16 text-text-muted mx-auto" />
          <h1 className="text-3xl font-serif text-text-primary">Your Wishlist is Empty</h1>
          <p className="text-text-secondary">Save your favorite coffees for later.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-2">My Wishlist</h1>
            <p className="text-text-secondary text-lg">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/20 transition-all duration-300"
            >
              <Link href={`/products/${item.product.slug}`}>
                <div className="aspect-[4/3] bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] overflow-hidden">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/products/${item.product.slug}`} className="font-serif text-lg text-text-primary hover:text-primary transition-colors">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-text-muted mt-0.5">{item.product.roastLevel} Roast</p>
                  </div>
                  <p className="text-lg font-semibold text-primary font-sans">EGP {item.product.price}</p>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">{item.product.description}</p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="p-2.5 rounded-xl border border-border text-text-muted hover:text-red-500 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
