"use client"

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getServerCart,
  addServerCartItem,
  removeServerCartItem,
  updateServerCartItemQuantity,
  mergeServerCart,
  clearServerCart,
} from "@/actions/cart"
import { getPrismaUserId } from "@/actions/auth"

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

function clearLocalCart() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadLocalCart())
  const [userId, setUserId] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const isFirstRender = useRef(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseRef.current.auth.getUser()
      if (user) {
        const prismaId = await getPrismaUserId(user.id)
        if (!prismaId) return
        setUserId(prismaId)
        const local = loadLocalCart()
        if (local.length > 0) {
          await mergeServerCart(
            prismaId,
            local.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              weight: String(i.weight),
            }))
          )
          clearLocalCart()
        }
        const dbItems = await getServerCart(prismaId)
        setItems(dbItems)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!userId) {
      saveLocalCart(items)
    }
  }, [items, userId])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = item.quantity ?? 1
    if (userId) {
      addServerCartItem(userId, item.productId, qty, String(item.weight)).then(() => {
        getServerCart(userId).then(setItems)
      })
    }
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
  }, [userId])

  const removeItem = useCallback((productId: string, weight: number) => {
    let removedId: string | undefined
    setItems((prev) => {
      const target = prev.find((i) => i.productId === productId && i.weight === weight)
      removedId = target?.id
      return prev.filter((i) => i.productId !== productId || i.weight !== weight)
    })
    if (userId && removedId) {
      removeServerCartItem(removedId)
    }
  }, [userId])

  const updateQuantity = useCallback((productId: string, weight: number, quantity: number) => {
    if (quantity < 1) return
    let targetId: string | undefined
    setItems((prev) => {
      const target = prev.find((i) => i.productId === productId && i.weight === weight)
      targetId = target?.id
      return prev.map((i) =>
        i.productId === productId && i.weight === weight ? { ...i, quantity } : i
      )
    })
    if (userId && targetId) {
      updateServerCartItemQuantity(targetId, quantity)
    }
  }, [userId])

  const clearCart = useCallback(() => {
    setItems([])
    if (userId) {
      clearServerCart(userId)
    }
  }, [userId])

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
