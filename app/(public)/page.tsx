import type { Metadata } from "next"
import Hero from "@/components/home/Hero"
import AboutSection from "@/components/home/AboutSection"
import PopularPicks from "@/components/home/PopularPicks"
import FeaturesRibbon from "@/components/home/FeaturesRibbon"
import Testimonials from "@/components/home/Testimonials"
import FAQ from "@/components/home/FAQ"
import Newsletter from "@/components/home/Newsletter"
import { getFeaturedProducts } from "@/lib/db-products"

export const metadata: Metadata = {
  title: "Proffee | Premium Specialty Coffee",
  description: "Discover the world of premium specialty coffee with Proffee. Carefully selected roasts from Ethiopia, Colombia, Kenya, and more.",
  openGraph: {
    title: "Proffee | Premium Specialty Coffee",
    description: "Discover the world of premium specialty coffee with Proffee.",
  },
}

export default async function Home() {
  const featured = await getFeaturedProducts()
  return (
    <main>
      <Hero />
      <AboutSection />
      <PopularPicks products={featured} />
      <FeaturesRibbon />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </main>
  )
}
