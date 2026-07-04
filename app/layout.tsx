import type { Metadata } from "next"
import { Playfair_Display, Inter, Great_Vibes } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { CartProvider } from "@/lib/cart-context"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Proffee | Premium Specialty Coffee",
  description: "Discover the world of premium specialty coffee with Proffee. Carefully selected roasts and meticulous attention to every detail of your cup.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${playfair.variable} ${inter.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <CartProvider>
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  )
}
