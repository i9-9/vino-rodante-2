import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductsByVarietalAndRegion } from "@/lib/products-client"
import { ProductGrid } from "@/components/product-grid"
import SEO from '@/components/SEO'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { collectionSEO } from '@/lib/seo-config'
import { isValidWineVarietal, isValidWineRegion, prettyLabel, REGION_SLUG_MAP } from "@/lib/wine-data"
import { Wine, MapPin, Award, TrendingUp } from 'lucide-react'

// Revalidar cada hora
export const revalidate = 3600

// Metadata específica para cada varietal-region
export async function generateMetadata({ params }: { params: Promise<{ 'varietal-region': string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams['varietal-region']

  // Parsear el slug: "malbec-mendoza" → ["malbec", "mendoza"]
  const parts = slug.split('-')

  // El último segmento es la región, el resto es el varietal
  const region = parts[parts.length - 1]
  const varietal = parts.slice(0, -1).join('-')

  if (!isValidWineVarietal(varietal) || !isValidWineRegion(region)) {
    return {
      title: "Vinos no encontrados | Vino Rodante",
      description: "La combinación de varietal y región solicitada no existe.",
    }
  }

  const varietalName = prettyLabel(varietal)
  const regionName = prettyLabel(region)

  const title = `Vinos ${varietalName} de ${regionName} | Vino Rodante`
  const description = `Descubrí los mejores vinos ${varietalName.toLowerCase()} de ${regionName.toLowerCase()}. Selección premium de bodegas locales con la mejor relación calidad-precio. Envío gratis en compras +$5000. Comprá online en Vino Rodante.`

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  const canonicalUrl = `${baseUrl}/vinos/${slug}`

  return {
    title,
    description,
    keywords: [
      `${varietalName.toLowerCase()} ${regionName.toLowerCase()}`,
      `vino ${varietalName.toLowerCase()}`,
      `vinos de ${regionName.toLowerCase()}`,
      `${varietalName.toLowerCase()} argentino`,
      `comprar ${varietalName.toLowerCase()} ${regionName.toLowerCase()}`,
      `mejor ${varietalName.toLowerCase()} ${regionName.toLowerCase()}`,
      `${varietalName.toLowerCase()} premium`,
      `bodega ${regionName.toLowerCase()}`,
      'vinos argentinos',
      'delivery vino',
    ].join(', '),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Vino Rodante',
      locale: 'es_AR',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `Vinos ${varietalName} de ${regionName}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@vinorodante',
      creator: '@vinorodante',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    }
  }
}

export default async function HybridWinePage({ params }: { params: Promise<{ 'varietal-region': string }> }) {
  const resolvedParams = await params
  const slug = resolvedParams['varietal-region']

  // Parsear el slug
  const parts = slug.split('-')
  const region = parts[parts.length - 1]
  const varietal = parts.slice(0, -1).join('-')

  // Validar varietal y región
  if (!isValidWineVarietal(varietal) || !isValidWineRegion(region)) {
    notFound()
  }

  const varietalName = prettyLabel(varietal)
  const regionName = REGION_SLUG_MAP[region] || prettyLabel(region)

  // Fetch products with error handling
  let products: any[] = []
  let fetchError = null

  try {
    const result = await getProductsByVarietalAndRegion(varietal, region)
    products = result.data || []
    fetchError = result.error

    // Log for debugging
    console.log(`[Hybrid Page] ${varietal}-${region}: Found ${products.length} products`)
    if (fetchError) {
      console.error('[Hybrid Page] Error fetching products:', fetchError)
    }
  } catch (e) {
    console.error('[Hybrid Page] Exception:', e)
    fetchError = e
  }

  // If no products found, return 404
  if (!products || products.length === 0) {
    console.log(`[Hybrid Page] No products for ${varietal}-${region}, returning 404`)
    notFound()
  }

  // Calcular estadísticas
  const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
  const minPrice = Math.min(...products.map(p => p.price))
  const maxPrice = Math.max(...products.map(p => p.price))
  const totalProducts = products.length

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Vinos', href: '/products' },
    { label: varietalName, href: `/collections/varietal/${varietal}` },
    { label: regionName, current: true }
  ]

  // Contenido educativo dinámico basado en varietal
  const getVarietalInfo = (varietal: string) => {
    const varietalLower = varietal.toLowerCase()

    if (varietalLower.includes('malbec')) {
      return {
        title: "El Malbec Argentino",
        description: "El Malbec es la cepa insignia de Argentina, conocida por sus taninos suaves, color intenso y notas a frutas rojas maduras. Ideal para carnes rojas y asados.",
        pairingNote: "Maridaje perfecto: Asado argentino, carnes rojas a la parrilla, quesos maduros."
      }
    } else if (varietalLower.includes('cabernet')) {
      return {
        title: "Cabernet Sauvignon Premium",
        description: "El Cabernet Sauvignon argentino destaca por su estructura, complejidad y potencial de guarda. Notas a cassis, cedro y especias.",
        pairingNote: "Maridaje perfecto: Bife de chorizo, cordero, guisos de carne."
      }
    } else if (varietalLower.includes('torrontes') || varietalLower.includes('torrontés')) {
      return {
        title: "Torrontés: La Cepa Blanca Argentina",
        description: "El Torrontés es la variedad blanca emblemática de Argentina, aromática y fresca, con notas florales y cítricas.",
        pairingNote: "Maridaje perfecto: Empanadas, pescados, comida asiática."
      }
    } else if (varietalLower.includes('chardonnay')) {
      return {
        title: "Chardonnay Argentino",
        description: "Chardonnay de altura con excelente balance entre frescura y cremosidad. Notas a frutas tropicales y cítricos.",
        pairingNote: "Maridaje perfecto: Pescados, pastas con salsas cremosas, pollo."
      }
    } else if (varietalLower.includes('pinot')) {
      return {
        title: "Pinot Noir de Altura",
        description: "Pinot Noir elegante y delicado, con notas a frutas rojas, especias y terroir único de la región.",
        pairingNote: "Maridaje perfecto: Salmón, pato, hongos, quesos suaves."
      }
    } else {
      return {
        title: `${varietalName}: Vinos Únicos`,
        description: `Descubrí la expresión única del ${varietalName.toLowerCase()} en ${regionName}, con características distintivas del terroir local.`,
        pairingNote: "Maridaje: Ideal para comidas gourmet y ocasiones especiales."
      }
    }
  }

  const varietalInfo = getVarietalInfo(varietal)

  // Información específica de la región
  const getRegionInfo = (region: string) => {
    const regionLower = region.toLowerCase()

    if (regionLower.includes('mendoza')) {
      return "Mendoza es la región vitivinícola más importante de Argentina, responsable del 70% de la producción nacional. Su clima seco, gran amplitud térmica y suelos aluvionales crean condiciones perfectas para vinos de alta calidad."
    } else if (regionLower.includes('salta')) {
      return "Salta alberga algunos de los viñedos más altos del mundo (hasta 3000 msnm). La altura extrema, la radiación solar intensa y las noches frescas producen vinos de gran concentración aromática y acidez vibrante."
    } else if (regionLower.includes('san-juan')) {
      return "San Juan es la segunda región productora de Argentina, conocida por su clima cálido y seco. Ideal para variedades tintas de gran cuerpo y dulces naturales de excelente calidad."
    } else if (regionLower.includes('patagonia') || regionLower.includes('neuquen') || regionLower.includes('rio-negro')) {
      return "La Patagonia argentina produce vinos de clima frío con gran elegancia y frescura. Las temperaturas bajas y los vientos patagónicos resultan en vinos de acidez brillante y aromas intensos."
    } else {
      return `${regionName} es una región vitivinícola argentina con características únicas de terroir, produciendo vinos distintivos que expresan su identidad local.`
    }
  }

  const regionInfo = getRegionInfo(region)

  return (
    <SEO>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wine className="w-8 h-8 text-[#5B0E2D]" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              {varietalName} de {regionName}
            </h1>
            <MapPin className="w-8 h-8 text-[#A83935]" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubrí nuestra selección premium de vinos {varietalName.toLowerCase()} provenientes de {regionName.toLowerCase()}.
            {totalProducts} {totalProducts === 1 ? 'vino' : 'vinos'} cuidadosamente seleccionados para tu paladar.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-[#A83935]" />
              <h3 className="font-semibold text-gray-900">Rango de Precios</h3>
            </div>
            <p className="text-2xl font-bold text-[#5B0E2D]">
              ${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Precio promedio: ${avgPrice.toFixed(0)}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Productos Disponibles</h3>
            </div>
            <p className="text-2xl font-bold text-amber-700">{totalProducts}</p>
            <p className="text-sm text-gray-600 mt-1">Vinos en stock ahora</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Región</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">{regionName}</p>
            <p className="text-sm text-gray-600 mt-1">Terroir único argentino</p>
          </div>
        </div>

        {/* Varietal Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Wine className="w-7 h-7 text-[#5B0E2D]" />
            {varietalInfo.title}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {varietalInfo.description}
          </p>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-[#A83935]">
            <p className="text-gray-800">
              <strong className="text-[#5B0E2D]">🍽️ {varietalInfo.pairingNote}</strong>
            </p>
          </div>
        </div>

        {/* Region Info Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-8 mb-12 border border-amber-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <MapPin className="w-7 h-7 text-amber-600" />
            Terroir de {regionName}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {regionInfo}
          </p>
        </div>

        {/* SEO Content - Why buy this combination */}
        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir {varietalName} de {regionName}?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            La combinación de <strong>{varietalName.toLowerCase()}</strong> y el terroir único de <strong>{regionName.toLowerCase()}</strong> crea
            vinos excepcionales con características distintivas. El clima, el suelo y la altitud de esta región potencian
            las cualidades naturales del {varietalName.toLowerCase()}, resultando en vinos de gran personalidad y calidad.
          </p>
          <p className="text-gray-700 leading-relaxed">
            En Vino Rodante, seleccionamos cuidadosamente los mejores {varietalName.toLowerCase()} de {regionName.toLowerCase()} para
            ofrecerte una experiencia auténtica del vino argentino. Comprá online con <strong>envío gratis en compras superiores a $5000</strong> y
            recibí tus vinos en la puerta de tu casa.
          </p>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nuestra Selección
          </h2>
          <ProductGrid products={products} />
        </div>

        {/* FAQ Section - SEO Boost */}
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Preguntas Frecuentes sobre {varietalName} de {regionName}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Cuál es el mejor {varietalName.toLowerCase()} de {regionName.toLowerCase()}?
              </h3>
              <p className="text-gray-700">
                En Vino Rodante ofrecemos una selección curada de los mejores {varietalName.toLowerCase()} de {regionName.toLowerCase()},
                con opciones para todos los gustos y presupuestos, desde ${minPrice.toFixed(0)} hasta ${maxPrice.toFixed(0)}.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Cómo es el delivery de vinos en Argentina?
              </h3>
              <p className="text-gray-700">
                Hacemos envíos a todo el país con envío gratis en CABA, $30.000 en GBA (Gran Buenos Aires) y $55.000 para el resto del país. Los vinos son empaquetados
                cuidadosamente para garantizar que lleguen en perfectas condiciones.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué hace especial al {varietalName.toLowerCase()} de {regionName.toLowerCase()}?
              </h3>
              <p className="text-gray-700">
                El terroir único de {regionName.toLowerCase()} - con su clima, suelo y altitud específicos - permite que
                el {varietalName.toLowerCase()} exprese características únicas que no se encuentran en otras regiones.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Data for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `¿Cuál es el mejor ${varietalName} de ${regionName}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `En Vino Rodante ofrecemos una selección curada de los mejores ${varietalName} de ${regionName}, con opciones para todos los gustos y presupuestos, desde $${minPrice.toFixed(0)} hasta $${maxPrice.toFixed(0)}.`
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo es el delivery de vinos en Argentina?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Hacemos envíos a todo el país con envío gratis en compras superiores a $5000. Los vinos son empaquetados cuidadosamente para garantizar que lleguen en perfectas condiciones."
                  }
                },
                {
                  "@type": "Question",
                  "name": `¿Qué hace especial al ${varietalName} de ${regionName}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `El terroir único de ${regionName} - con su clima, suelo y altitud específicos - permite que el ${varietalName} exprese características únicas que no se encuentran en otras regiones.`
                  }
                }
              ]
            })
          }}
        />

        {/* Collection Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": `Vinos ${varietalName} de ${regionName}`,
              "description": `Selección premium de vinos ${varietalName} de ${regionName}. ${totalProducts} productos disponibles con envío gratis.`,
              "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'}/vinos/${slug}`,
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": totalProducts,
                "itemListElement": products.slice(0, 10).map((product, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Product",
                    "name": product.name,
                    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'}/products/${product.slug}`,
                    "image": product.image,
                    "offers": {
                      "@type": "Offer",
                      "price": product.price,
                      "priceCurrency": "ARS",
                      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                    }
                  }
                }))
              }
            })
          }}
        />
      </div>
    </SEO>
  )
}
