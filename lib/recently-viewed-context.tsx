"use client"

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react"

export interface RecentProduct {
  id: string
  slug: string
  name: string
  image: string
  price: number
  roastLevel: string
}

interface RecentlyViewedContextValue {
  items: RecentProduct[]
  addView: (product: RecentProduct) => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null)

const STORAGE_KEY = "proffee-recently-viewed"
const MAX_ITEMS = 10

function loadRecent(): RecentProduct[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentProduct[]
  } catch {
    return []
  }
}

function saveRecent(items: RecentProduct[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecentProduct[]>([])
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    setItems(loadRecent())
  }, [])

  const addView = useCallback((product: RecentProduct) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== product.id)
      const updated = [product, ...filtered].slice(0, MAX_ITEMS)
      saveRecent(updated)
      return updated
    })
  }, [])

  return (
    <RecentlyViewedContext.Provider value={{ items, addView }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const ctx = useContext(RecentlyViewedContext)
  if (!ctx) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider")
  }
  return ctx
}
