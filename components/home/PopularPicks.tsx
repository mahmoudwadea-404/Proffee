"use client"

import { useRef, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { ShoppingCart, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import type { FeaturedProduct } from "@/lib/db-products"

export default function PopularPicks({ products }: { products: FeaturedProduct[] }) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { addItem } = useCart()

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = 320
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  const handleAddToCart = (product: (typeof products)[number]) => {
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
  }

  const handleBuyNow = useCallback((product: (typeof products)[number]) => {
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

  if (products.length === 0) return null

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden" ref={ref}>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-3xl md:text-4xl text-primary font-script mb-2">Our Signature</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary">
              Popular Picks
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full border border-border text-text-secondary hover:text-primary hover:border-primary transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full border border-border text-text-secondary hover:text-primary hover:border-primary transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="snap-start shrink-0 w-[280px] md:w-[300px] rounded-2xl border border-border bg-surface overflow-hidden group hover:border-primary/30 transition-all duration-500"
            >
              <Link href={`/products/${product.slug}`} className="block">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#3A2A1A] to-[#1A100A] flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={225}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </Link>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-serif text-lg text-text-primary group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-semibold text-primary font-sans">
                    EGP {product.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleBuyNow(product)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-10"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-all duration-300"
          >
            View Full Menu
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
