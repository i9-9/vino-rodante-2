import { getProducts } from "@/lib/products-client"
import Link from "next/link"
import { REGION_SLUG_MAP } from "@/lib/wine-data"

export const revalidate = 3600

export default async function VinosIndexPage() {
  const { data: products } = await getProducts()

  // Crear un mapa de combinaciones varietal-region que existen
  const combinations = new Map<string, { count: number; products: any[] }>()

  products?.forEach(product => {
    if (product.varietal && product.region) {
      // Normalizar varietal a slug format
      const varietalSlug = product.varietal.toLowerCase().replace(/\s+/g, '-')

      // Encontrar el slug de la región
      const regionSlug = Object.entries(REGION_SLUG_MAP).find(
        ([_, name]) => name.toLowerCase() === product.region.toLowerCase()
      )?.[0] || product.region.toLowerCase().replace(/\s+/g, '-')

      const key = `${varietalSlug}-${regionSlug}`

      if (!combinations.has(key)) {
        combinations.set(key, { count: 0, products: [] })
      }

      const combo = combinations.get(key)!
      combo.count++
      combo.products.push(product)
    }
  })

  // Ordenar por cantidad de productos
  const sortedCombinations = Array.from(combinations.entries())
    .sort((a, b) => b[1].count - a[1].count)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Vinos por Varietal y Región
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          ℹ️ Páginas Disponibles
        </h2>
        <p className="text-blue-800">
          Estas son las combinaciones de varietal-región que actualmente tienen productos disponibles.
          Solo estas URLs funcionarán correctamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCombinations.map(([slug, data]) => {
          const [varietal, ...regionParts] = slug.split('-')
          const region = regionParts.join('-')

          return (
            <Link
              key={slug}
              href={`/vinos/${slug}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-[#A83935] hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-[#5B0E2D] mb-2">
                {data.products[0].varietal || varietal} de {data.products[0].region || region}
              </h3>
              <p className="text-gray-600">
                {data.count} {data.count === 1 ? 'vino' : 'vinos'} disponible{data.count === 1 ? '' : 's'}
              </p>
              <p className="text-sm text-[#A83935] mt-2 font-medium">
                Ver colección →
              </p>
            </Link>
          )
        })}
      </div>

      {sortedCombinations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay productos con varietal y región definidos.
          </p>
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📋 Debug Info
        </h2>
        <div className="space-y-2 text-sm font-mono">
          <p><strong>Total productos:</strong> {products?.length || 0}</p>
          <p><strong>Combinaciones encontradas:</strong> {combinations.size}</p>
          <p><strong>URL pattern:</strong> /vinos/[varietal]-[region]</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Ejemplos de URLs válidas:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {sortedCombinations.slice(0, 5).map(([slug]) => (
              <li key={slug}>
                <code className="bg-gray-100 px-2 py-1 rounded">
                  /vinos/{slug}
                </code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
