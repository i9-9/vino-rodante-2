import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductsByRegion } from "@/lib/products-client"
import { ProductGrid } from "@/components/product-grid"
import { Breadcrumbs } from '@/components/breadcrumbs'
import { collectionSEO } from '@/lib/seo-config'
import { prettyLabel } from "@/lib/wine-data"
import SEO from '@/components/SEO'

// Usar SSG con revalidación cada 1 hora
export const revalidate = 3600 // 1 hora en segundos

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params
  const regionName = prettyLabel(region)
  
  const seoConfig = collectionSEO({
    name: `Vinos de ${regionName}`,
    description: `Descubrí los mejores vinos de ${regionName.toLowerCase()}. Selección premium de bodegas locales con envío gratis y precios competitivos.`,
    slug: `region/${region}`,
    image: '/images/region-banner.jpg'
  })

  return {
    title: seoConfig.title,
    description: seoConfig.description,
    openGraph: seoConfig.openGraph as any,
    twitter: seoConfig.twitter,
    alternates: {
      canonical: seoConfig.canonical
    }
  }
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params
  
  console.log('Region recibida:', region)
  
  const regionName = prettyLabel(region)
  
  console.log('Region name:', regionName)
  
  const { data: products, error } = await getProductsByRegion(region)
  
  console.log('Productos encontrados:', products?.length, 'Error:', error)
  
  if (error || !products || products.length === 0) {
    console.log('No se encontraron productos, llamando notFound()')
    notFound()
  }

  const breadcrumbs = [
    { label: 'Colecciones', href: '/collections' },
    { label: 'Regiones', href: '/collections/region' },
    { label: regionName, current: true }
  ]

  return (
    <SEO>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vinos de {regionName}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubrí la riqueza vitivinícola de {regionName.toLowerCase()}. 
            Nuestra selección incluye los vinos más destacados de esta región, 
            conocida por su terroir único y tradición enológica.
          </p>
        </div>

        {/* Region Info */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-8 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Terroir de {regionName}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {regionName} es reconocida por sus condiciones climáticas únicas y suelos excepcionales 
              que dan lugar a vinos con características distintivas. Nuestros vinos de esta región 
              reflejan la identidad y la pasión de los productores locales.
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} />
      </div>
    </SEO>
  )
} 