import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { collectionSEO } from '@/lib/seo-config'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { prettyLabel } from '@/lib/wine-data'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600 // 1 hora

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = collectionSEO({
    name: 'Vinos por Región',
    description: 'Explorá vinos de las principales regiones vitivinícolas argentinas: Mendoza, Salta, Patagonia y más. Descubrí el terroir único de cada región.',
    slug: 'collections/region'
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

export default async function RegionIndexPage() {
  const breadcrumbs = [
    { label: 'Colecciones', href: '/collections' },
    { label: 'Regiones', current: true }
  ]

  // Obtener regiones únicas de la base de datos
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('region')
    .eq('is_visible', true)
    .not('region', 'is', null)

  // Obtener regiones únicas y normalizarlas
  const uniqueRegions = Array.from(
    new Set(
      products?.map(p => p.region?.toLowerCase().trim()).filter(Boolean) || []
    )
  ).sort()

  // Agrupar regiones destacadas (solo las que existen)
  const featuredRegionsOrder = [
    'mendoza',
    'salta',
    'patagonia',
    'san juan',
    'san-juan',
    'la rioja',
    'la-rioja'
  ]

  const featuredRegions = uniqueRegions.filter(r => 
    featuredRegionsOrder.some(fr => r === fr || r.replace(/\s+/g, '-') === fr)
  )

  const otherRegions = uniqueRegions.filter(
    r => !featuredRegions.includes(r)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MapPin className="w-10 h-10 text-[#5B0E2D]" />
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Vinos por Región
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explorá los vinos argentinos organizados por sus regiones de origen.
          Cada región tiene su terroir único que define el carácter de sus vinos.
        </p>
      </div>

      {/* Featured Regions */}
      {featuredRegions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Regiones Destacadas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredRegions.map((region) => (
              <Link
                key={region}
                href={`/collections/region/${region.replace(/\s+/g, '-')}`}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
              >
                <MapPin className="w-8 h-8 text-[#5B0E2D] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#5B0E2D] transition-colors">
                  {prettyLabel(region)}
                </h3>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5B0E2D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other Regions */}
      {otherRegions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Otras Regiones</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherRegions.map((region) => (
              <Link
                key={region}
                href={`/collections/region/${region.replace(/\s+/g, '-')}`}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-all duration-300 hover:scale-105 text-center"
              >
                <h3 className="text-base font-medium text-gray-700 group-hover:text-[#5B0E2D] transition-colors">
                  {prettyLabel(region)}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uniqueRegions.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay regiones disponibles en este momento.</p>
        </div>
      )}
    </div>
  )
}

