import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductsByVarietal } from "@/lib/products-client"
import { ProductGrid } from "@/components/product-grid"
import SEO from '@/components/SEO'
import { Breadcrumbs, breadcrumbConfigs } from '@/components/breadcrumbs'
import { collectionSEO } from '@/lib/seo-config'
import { generateFAQStructuredData, faqConfigs } from '@/lib/faq-schema'
import { isValidWineVarietal } from "@/lib/wine-data"

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
    openGraph: seoConfig.openGraph,
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

  // Generate FAQ structured data
  const faqData = faqConfigs.general()
  const faqStructuredData = generateFAQStructuredData(faqData)

  const breadcrumbs = breadcrumbConfigs.collection(varietalName, 'Varietal')

  return (
    <SEO seo={seoConfig}>
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