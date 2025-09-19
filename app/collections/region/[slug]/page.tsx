import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductsByRegion } from '@/lib/products-client'
import ProductGrid from '@/components/product-grid'
import SEO from '@/components/SEO'
import { Breadcrumbs, breadcrumbConfigs } from '@/components/breadcrumbs'
import { collectionSEO } from '@/lib/seo-config'
import { generateFAQStructuredData, faqConfigs } from '@/lib/faq-schema'

interface RegionPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const region = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  const seoConfig = collectionSEO({
    name: `Vinos de ${region}`,
    description: `Descubrí los mejores vinos de ${region.toLowerCase()}. Selección premium de bodegas locales con envío gratis y precios competitivos.`,
    slug: `region/${params.slug}`,
    image: '/images/region-banner.jpg'
  })

  return {
    title: seoConfig.title,
    description: seoConfig.description,
    openGraph: seoConfig.openGraph,
    twitter: seoConfig.twitter,
    alternates: {
      canonical: seoConfig.canonical
    }
  }
}

export default async function RegionPage({ params }: RegionPageProps) {
  const region = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  const { data: products, error } = await getProductsByRegion(region)
  
  if (error || !products || products.length === 0) {
    notFound()
  }

  const seoConfig = collectionSEO({
    name: `Vinos de ${region}`,
    description: `Descubrí los mejores vinos de ${region.toLowerCase()}. Selección premium de bodegas locales con envío gratis y precios competitivos.`,
    slug: `region/${params.slug}`,
    products: products.map(p => ({
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.image
    }))
  })

  // Generate FAQ structured data
  const faqData = faqConfigs.general()
  const faqStructuredData = generateFAQStructuredData(faqData)

  const breadcrumbs = breadcrumbConfigs.collection(region, 'Región')

  return (
    <SEO seo={seoConfig}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vinos de {region}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubrí la riqueza vitivinícola de {region.toLowerCase()}. 
            Nuestra selección incluye los vinos más destacados de esta región, 
            conocida por su terroir único y tradición enológica.
          </p>
        </div>

        {/* Region Info */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-8 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Terroir de {region}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {region} es reconocida por sus condiciones climáticas únicas y suelos excepcionales 
              que dan lugar a vinos con características distintivas. Nuestros vinos de esta región 
              reflejan la identidad y la pasión de los productores locales.
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} />

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData)
          }}
        />
      </div>
    </SEO>
  )
}

// Generate static params for all regions
export async function generateStaticParams() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: regions } = await supabase
      .from('products')
      .select('region')
      .eq('is_visible', true)
      .not('region', 'is', null)
      .not('region', 'eq', '')
      .not('region', 'eq', 'Múltiples')
    
    if (!regions) return []
    
    const uniqueRegions = [...new Set(regions.map(r => r.region))]
    
    return uniqueRegions.map((region) => ({
      slug: region.toLowerCase().replace(/\s+/g, '-')
    }))
  } catch (error) {
    console.error('Error generating static params for regions:', error)
    return []
  }
}

