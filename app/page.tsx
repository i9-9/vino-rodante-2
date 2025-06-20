import { Suspense } from "react"
import Hero from "@/components/hero"
import ProductShowcase from "@/components/product-showcase"
import AboutUs from "@/components/about-us"
import WineClubsShowcase from "@/components/wine-clubs-showcase"
import { getProducts } from '@/lib/products-client'

// Forzar renderizado dinámico para páginas que dependen de datos de Supabase
export const dynamic = "force-dynamic"

// Componente asíncrono para cargar productos
async function ProductSection() {
  console.log('📦 Rendering ProductSection...')
  const { data: products, error } = await getProducts()
  
  if (error) {
    console.error('Error loading products:', error)
    return null // O un componente de error
  }
  
  return <ProductShowcase products={(products || []).slice(0, 4)} />
}

export default function Home() {
  console.log('🏠 Homepage rendering...')
  
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Hero />
      <WineClubsShowcase />
      <Suspense 
        fallback={
          <div className="w-full py-16 bg-[#F2F2F2]">
            <div className="container px-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-48 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ProductSection />
      </Suspense>
      <AboutUs />
    </main>
  )
}
