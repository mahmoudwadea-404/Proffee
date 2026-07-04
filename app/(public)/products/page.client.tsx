"use client"

import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, SlidersHorizontal, X, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"

export default function ProductsPage({ products, roastLevels }: { products: Product[]; roastLevels: string[] }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedRoast, setSelectedRoast] = useState<string | null>(null)
  const [selectedPriceIndex, setSelectedPriceIndex] = useState<number | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleAddToCart = useCallback((product: Product) => {
    const firstWeight = product.weightOptions[0]
    if (!firstWeight) return
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: firstWeight.price,
      weight: firstWeight.grams,
      weightLabel: firstWeight.label,
    })
  }, [addItem])

  const handleBuyNow = useCallback((product: Product) => {
    const firstWeight = product.weightOptions[0]
    if (!firstWeight) return
    sessionStorage.setItem(
      "proffee-buy-now",
      JSON.stringify({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: firstWeight.price,
        weight: firstWeight.grams,
        weightLabel: firstWeight.label,
        quantity: 1,
      })
    )
    router.push("/checkout?buyNow=1")
  }, [router])

  const priceRanges = useMemo(() => {
    if (products.length === 0) {
      return [{ label: "All Prices", min: null as number | null, max: null as number | null }]
    }
    const prices = products.map((p) => p.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) {
      return [
        { label: "All Prices", min: null, max: null },
        { label: `EGP ${min}`, min, max },
      ]
    }
    const range = max - min
    let b1 = Math.ceil(min + range / 3)
    let b2 = Math.ceil(min + (2 * range) / 3)
    if (b1 >= max) b1 = max - 1
    if (b2 <= b1) b2 = b1 + 1
    if (b2 >= max) b2 = max
    return [
      { label: "All Prices", min: null, max: null },
      { label: `Under EGP ${b1}`, min: null, max: b1 },
      { label: `EGP ${b1} – ${b2}`, min: b1, max: b2 },
      { label: `EGP ${b2}+`, min: b2, max: null },
    ]
  }, [products])

  const filtered = useMemo(() => {
    const range = selectedPriceIndex !== null ? priceRanges[selectedPriceIndex] : null
    return products.filter((p) => {
      if (selectedRoast && p.roastLevel !== selectedRoast) return false
      if (range) {
        if (range.min !== null && p.price < range.min) return false
        if (range.max !== null && p.price > range.max) return false
      }
      return true
    })
  }, [selectedRoast, selectedPriceIndex, products, priceRanges])

  const activeFilters = [selectedRoast, selectedPriceIndex !== null ? priceRanges[selectedPriceIndex].label : null].filter(Boolean)

  const clearFilters = () => {
    setSelectedRoast(null)
    setSelectedPriceIndex(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Our Collection</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-4">All Products</h1>
            <p className="text-text-secondary text-lg max-w-xl">
              Explore our carefully curated selection of premium single-origin coffees from the world&apos;s finest growing regions.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-text-secondary">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {activeFilters.length > 0 && " found"}
          </p>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-primary hover:border-primary transition-all duration-300 lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-text-muted">Active filters:</span>
            {activeFilters.map((f) => f && (
              <span key={f} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                {f}
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">Roast Level</h3>
              <div className="flex flex-wrap gap-2">
                {roastLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedRoast(selectedRoast === level ? null : level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 ${
                      selectedRoast === level
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-text-secondary hover:border-primary/40 hover:text-text-primary"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">Price Range</h3>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range, i) => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedPriceIndex(selectedPriceIndex === i ? null : i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 ${
                      selectedPriceIndex === i
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-text-secondary hover:border-primary/40 hover:text-text-primary"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l border-border p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-serif text-text-primary">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-text-secondary hover:text-primary transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">Roast Level</h3>
                    <div className="flex flex-wrap gap-2">
                      {roastLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => { setSelectedRoast(selectedRoast === level ? null : level); setMobileFiltersOpen(false) }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 ${
                            selectedRoast === level
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border text-text-secondary hover:border-primary/40 hover:text-text-primary"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">Price Range</h3>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range, i) => (
                        <button
                          key={range.label}
                          onClick={() => { setSelectedPriceIndex(selectedPriceIndex === i ? null : i); setMobileFiltersOpen(false) }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 ${
                            selectedPriceIndex === i
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border text-text-secondary hover:border-primary/40 hover:text-text-primary"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-muted text-lg mb-2">No products match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link href={`/products/${product.slug}`} className="group block">
                      <div className="rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/30 transition-all duration-500">
                        <div className="aspect-[4/3] bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] flex items-center justify-center relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-110 transition-transform duration-700"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider">
                            {product.roastLevel}
                          </span>
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg text-text-primary group-hover:text-primary transition-colors duration-300">
                              {product.name}
                            </h3>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product) }}
                              className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300"
                              aria-label="Add to cart"
                            >
                              <ShoppingCart className="w-4 h-4 text-primary" />
                            </button>
                          </div>
                          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold text-primary font-sans">
                              EGP {product.price}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBuyNow(product) }}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                              >
                                <Zap className="w-3 h-3" />
                                Buy Now
                              </button>
                              <span className="text-xs text-text-muted">{product.origin}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
