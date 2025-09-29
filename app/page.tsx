import { Suspense } from "react"
import Hero from "@/components/hero"
import ProductShowcase from "@/components/product-showcase"
import AboutUs from "@/components/about-us"
import { getFeaturedProducts } from '@/lib/products-client'
import SEO from '@/components/SEO'
import { getHomeSEOWithStructuredData } from '@/lib/seo-config'

// Usar SSG con revalidación cada 1 hora
export const revalidate = 3600 // 1 hora en segundos

export async function generateMetadata() {
  return getHomeSEOWithStructuredData()
}

// Componente asíncrono para cargar productos destacados
async function ProductSection() {
  
  const { data: products, error } = await getFeaturedProducts()
  
  if (error) {
    console.error('Error loading featured products:', error)
    return null // O un componente de error
  }
  
  // Si no hay suficientes productos destacados, mostrar mensaje de error
  if (!products || products.length === 0) {
    console.warn('No featured products found')
    return (
      <div className="w-full py-16 bg-[#F2F2F2]">
        <div className="container px-4 text-center text-gray-500">
          No hay vinos destacados disponibles en este momento.
        </div>
      </div>
    )
  }
  
  // Tomar solo los primeros 4 productos destacados
  return <ProductShowcase products={products.slice(0, 4)} />
}

export default function Home() {
  return (
    <SEO>
      <main className="flex min-h-screen flex-col items-center">
        <Hero />
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
    </SEO>
  )
}
