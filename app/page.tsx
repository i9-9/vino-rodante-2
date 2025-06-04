import Hero from "@/components/hero"
import ProductShowcase from "@/components/product-showcase"
import AboutUs from "@/components/about-us"
import { getProducts } from '@/lib/products-client'

// Forzar renderizado dinámico para páginas que dependen de datos de Supabase
export const dynamic = "force-dynamic"

export default async function Home() {
  const { data: products, error } = await getProducts()

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Hero />
      <ProductShowcase products={(products || []).slice(0, 4)} />
      <AboutUs />
    </main>
  )
}
