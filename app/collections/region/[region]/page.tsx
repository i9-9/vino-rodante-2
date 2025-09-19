import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductsByRegion } from "@/lib/products-client"
import { ProductGrid } from "@/components/product-grid"
import SEO from '@/components/SEO'
import { Breadcrumbs, breadcrumbConfigs } from '@/components/breadcrumbs'
import { collectionSEO } from '@/lib/seo-config'
import { generateFAQStructuredData, faqConfigs } from '@/lib/faq-schema'
import { prettyLabel } from "@/lib/wine-data"

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
    openGraph: seoConfig.openGraph,
    twitter: seoConfig.twitter,
    alternates: {
      canonical: seoConfig.canonical
    }
  }
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params
  const regionName = prettyLabel(region)
  
  const { data: products, error } = await getProductsByRegion(region)
  
  if (error || !products || products.length === 0) {
    notFound()
  }

  const seoConfig = collectionSEO({
    name: `Vinos de ${regionName}`,
    description: `Descubrí los mejores vinos de ${regionName.toLowerCase()}. Selección premium de bodegas locales con envío gratis y precios competitivos.`,
    slug: `region/${region}`,
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

  const breadcrumbs = breadcrumbConfigs.collection(regionName, 'Región')

  return (
    <SEO seo={seoConfig}>
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