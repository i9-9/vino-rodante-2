import { Metadata } from 'next'
import Link from 'next/link'
import { Wine, MapPin, Tag, Gift, TrendingUp, Sparkles } from 'lucide-react'
import { collectionSEO } from '@/lib/seo-config'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const revalidate = 3600 // 1 hora

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = collectionSEO({
    name: 'Colecciones de Vinos',
    description: 'Explorá nuestra selección completa de vinos argentinos organizados por varietal, región, tipo y más. Encontrá el vino perfecto para cada ocasión.',
    slug: 'collections'
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

export default function CollectionsPage() {
  const breadcrumbs = [
    { label: 'Colecciones', current: true }
  ]

  const collections = [
    {
      title: 'Por Varietal',
      description: 'Descubrí vinos organizados por cepa: Malbec, Cabernet Sauvignon, Torrontés y más',
      href: '/collections/varietal',
      icon: Wine,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Por Región',
      description: 'Explorá vinos de las principales regiones vitivinícolas argentinas',
      href: '/collections/region',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Por Tipo',
      description: 'Tintos, blancos, rosados, espumantes y más variedades',
      href: '/collections/red',
      icon: Tag,
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'Boxes de Vinos',
      description: 'Selecciones especiales y cajas regalo para compartir',
      href: '/collections/boxes',
      icon: Gift,
      color: 'from-amber-500 to-yellow-500'
    },
    {
      title: 'Más Vendidos',
      description: 'Los vinos favoritos de nuestros clientes',
      href: '/collections/bestsellers',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Novedades',
      description: 'Los últimos vinos agregados a nuestra selección',
      href: '/collections/new-arrivals',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nuestras Colecciones
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explorá nuestra selección completa de vinos argentinos premium.
            Organizados para que encuentres exactamente lo que buscás.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {collections.map((collection) => {
            const IconComponent = collection.icon
            return (
              <Link
                key={collection.href}
                href={collection.href}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${collection.color} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#5B0E2D] transition-colors">
                      {collection.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {collection.description}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5B0E2D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )
          })}
        </div>
      </div>
  )
}
