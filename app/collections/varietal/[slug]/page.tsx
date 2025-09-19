import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductsByVarietal } from '@/lib/products-client'
import ProductGrid from '@/components/product-grid'
import SEO from '@/components/SEO'
import { Breadcrumbs, breadcrumbConfigs } from '@/components/breadcrumbs'
import { collectionSEO } from '@/lib/seo-config'
import { generateFAQStructuredData, faqConfigs } from '@/lib/faq-schema'

interface VarietalPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: VarietalPageProps): Promise<Metadata> {
  const varietal = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  const seoConfig = collectionSEO({
    name: `Vinos ${varietal}`,
    description: `Descubrí nuestra selección de vinos ${varietal.toLowerCase()} de las mejores bodegas argentinas. Calidad premium, envío gratis y precios competitivos.`,
    slug: `varietal/${params.slug}`,
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

export default async function VarietalPage({ params }: VarietalPageProps) {
  const varietal = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  const { data: products, error } = await getProductsByVarietal(varietal)
  
  if (error || !products || products.length === 0) {
    notFound()
  }

  const seoConfig = collectionSEO({
    name: `Vinos ${varietal}`,
    description: `Descubrí nuestra selección de vinos ${varietal.toLowerCase()} de las mejores bodegas argentinas. Calidad premium, envío gratis y precios competitivos.`,
    slug: `varietal/${params.slug}`,
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

  const breadcrumbs = breadcrumbConfigs.collection(varietal, 'Varietal')

  return (
    <SEO seo={seoConfig}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vinos {varietal}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubrí nuestra selección premium de vinos {varietal.toLowerCase()} de las mejores bodegas argentinas. 
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

// Generate static params for all varietals
export async function generateStaticParams() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: varietals } = await supabase
      .from('products')
      .select('varietal')
      .eq('is_visible', true)
      .not('varietal', 'is', null)
      .not('varietal', 'eq', '')
      .not('varietal', 'eq', 'Múltiples')
    
    if (!varietals) return []
    
    const uniqueVarietals = [...new Set(varietals.map(v => v.varietal))]
    
    return uniqueVarietals.map((varietal) => ({
      slug: varietal.toLowerCase().replace(/\s+/g, '-')
    }))
  } catch (error) {
    console.error('Error generating static params for varietals:', error)
    return []
  }
}

