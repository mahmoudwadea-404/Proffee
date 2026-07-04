"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Check, ArrowLeft, Leaf, MapPin, Thermometer, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"

export default function ProductDetailPage({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter()
  const { addItem } = useCart()

  const [selectedWeight, setSelectedWeight] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  const weight = product.weightOptions[selectedWeight]
  const displayPrice = weight?.price ?? product.price

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: displayPrice,
      weight: weight.grams,
      weightLabel: weight.label,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = useCallback(() => {
    sessionStorage.setItem(
      "proffee-buy-now",
      JSON.stringify({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: displayPrice,
        weight: weight.grams,
        weightLabel: weight.label,
        quantity: 1,
      })
    )
    router.push("/checkout?buyNow=1")
  }, [product, displayPrice, weight, router])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] flex items-center justify-center border border-border overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover opacity-90"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                {product.roastLevel}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <p className="text-3xl text-primary font-script mb-1">{product.origin}</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary">
                {product.name}
              </h1>
            </div>

            <p className="text-text-secondary text-lg leading-relaxed">
              {product.longDescription}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary">
                <MapPin className="w-4 h-4 text-primary" />
                {product.origin}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary">
                <Thermometer className="w-4 h-4 text-primary" />
                {product.roastLevel} Roast
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">Flavor Notes</h3>
              <div className="flex flex-wrap gap-2">
                {product.flavorNotes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                Weight <span className="text-text-muted font-normal normal-case">— {weight?.label ?? "250g"}</span>
              </h3>
              <div className="flex gap-3">
                {product.weightOptions.map((opt, i) => (
                  <button
                    key={opt.grams}
                    onClick={() => setSelectedWeight(i)}
                    className={`relative px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                      selectedWeight === i
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-text-secondary hover:border-primary/40 hover:text-text-primary"
                    }`}
                  >
                    {opt.label}
                    {selectedWeight === i && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <p className="text-3xl font-bold text-primary font-sans">
                EGP {displayPrice}
              </p>
              <div className="flex-1 flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    addedToCart
                      ? "bg-green-600 text-white"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  <ShoppingCart className={`w-5 h-5 ${addedToCart ? "animate-bounce" : ""}`} />
                  {addedToCart ? "Added to Cart" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm border border-primary text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <Zap className="w-5 h-5" />
                  Buy Now
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Leaf className="w-3.5 h-3.5" />
              Free shipping on orders over EGP 500
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-24 pt-12 border-t border-border"
          >
            <p className="text-3xl text-primary font-script mb-2">You May Also Like</p>
            <h2 className="text-2xl md:text-3xl font-serif text-text-primary mb-8">Similar Roasts</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link href={`/products/${r.slug}`} className="group block">
                    <div className="rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/30 transition-all duration-500">
                      <div className="aspect-[4/3] bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] flex items-center justify-center overflow-hidden">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="font-serif text-lg text-text-primary group-hover:text-primary transition-colors duration-300">
                          {r.name}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                          {r.description}
                        </p>
                        <p className="text-xl font-semibold text-primary font-sans">
                          EGP {r.price}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
