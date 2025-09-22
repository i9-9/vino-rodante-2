import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductsByVarietal } from "@/lib/products-client"
import { ProductGrid } from "@/components/product-grid"
import SEO from '@/components/SEO'
import { Breadcrumbs, breadcrumbConfigs } from '@/components/breadcrumbs'
import { collectionSEO } from '@/lib/seo-config'
import { isValidWineVarietal } from "@/lib/wine-data"

// Usar SSG con revalidación cada 1 hora
export const revalidate = 3600 // 1 hora en segundos

export async function generateMetadata({ params }: { params: Promise<{ varietal: string }> }): Promise<Metadata> {
  const { varietal } = await params
  
  if (!isValidWineVarietal(varietal)) {
    return {
      title: "Varietal no encontrado | Vino Rodante",
      description: "El varietal solicitado no existe.",
    }
  }

  const varietalName = varietal.charAt(0).toUpperCase() + varietal.slice(1).replace('-', ' ')
  
  const seoConfig = collectionSEO({
    name: `Vinos ${varietalName}`,
    description: `Descubrí nuestra selección de vinos ${varietalName.toLowerCase()} de las mejores bodegas argentinas. Calidad premium, envío gratis y precios competitivos.`,
    slug: `varietal/${varietal}`,
    image: '/images/varietal-banner.jpg'
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

export default async function VarietalPage({ params }: { params: Promise<{ varietal: string }> }) {
  const { varietal } = await params
  
  // Validar varietal
  if (!isValidWineVarietal(varietal)) {
    notFound()
  }

  const varietalName = varietal.charAt(0).toUpperCase() + varietal.slice(1).replace('-', ' ')
  
  const { data: products, error } = await getProductsByVarietal(varietal)
  
  if (error || !products || products.length === 0) {
    notFound()
  }

  const seoConfig = collectionSEO({
    name: `Vinos ${varietalName}`,
    description: `Descubrí nuestra selección de vinos ${varietalName.toLowerCase()} de las mejores bodegas argentinas. Calidad premium, envío gratis y precios competitivos.`,
    slug: `varietal/${varietal}`,
    products: products.map(p => ({
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.image
    }))
  })


  const breadcrumbs = [
    { label: 'Colecciones', href: '/collections' },
    { label: 'Varietales', href: '/collections/varietal' },
    { label: varietalName, current: true }
  ]

  return (
    <SEO>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vinos {varietalName}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubrí nuestra selección premium de vinos {varietalName.toLowerCase()} de las mejores bodegas argentinas. 
            Cada botella ha sido cuidadosamente seleccionada para ofrecerte una experiencia única.
          </p>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} />
      </div>
    </SEO>
  )
} 