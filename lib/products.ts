export interface Product {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  price: number
  image: string
  roastLevel: "Light" | "Medium-Light" | "Medium" | "Medium-Dark" | "Dark"
  flavorNotes: string[]
  weightOptions: { label: string; grams: number; price: number }[]
  origin: string
  featured: boolean
}

export const roastLevels = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"] as const
