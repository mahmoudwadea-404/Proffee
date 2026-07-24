"use client"

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react"

export interface CartItem {
  id?: string
  productId: string
  slug: string
  name: string
  image: string
  price: number
  weight: number
  weightLabel: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productId: string, weight: number) => void
  updateQuantity: (productId: string, weight: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "proffee-cart"

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CartItem[]
  } catch {
    return []
  }
}

function saveLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(loadLocalCart())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      saveLocalCart(items)
    }
  }, [items, loaded])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = item.quantity ?? 1
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.weight === item.weight)
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.weight === item.weight
            ? { ...i, quantity: i.quantity + qty }
            : i
        )
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }, [])

  const removeItem = useCallback((productId: string, weight: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId || i.weight !== weight))
  }, [])

  const updateQuantity = useCallback((productId: string, weight: number, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.weight === weight ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return ctx
}
