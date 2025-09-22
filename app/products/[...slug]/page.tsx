import { redirect } from 'next/navigation'
import { getProductBySlug } from '@/lib/products-client'

// Función para convertir una URL malformada a un slug válido
function fixMalformedSlug(slugSegments: string[]): string {
  // Si tenemos múltiples segmentos, los unimos con guiones
  // Ejemplo: ['40', '40-malbec'] -> '40-40-malbec'
  return slugSegments.join('-')
}

// Función para intentar encontrar el producto correcto
async function findCorrectProduct(slugSegments: string[]): Promise<string | null> {
  console.log('🔍 [CatchAll] Looking for product with segments:', slugSegments)
  
  // Intentar diferentes variaciones del slug
  const variations = [
    slugSegments.join('-'), // '40-40-malbec'
    slugSegments.join(''),  // '4040malbec'
    slugSegments.join('_'), // '40_40_malbec'
    slugSegments.join('/'), // '40/40/malbec' (original con slashes)
    slugSegments.join(' '), // '40 40 malbec' (con espacios)
  ]

  console.log('🔍 [CatchAll] Testing variations:', variations)

  for (const variation of variations) {
    try {
      console.log(`🔍 [CatchAll] Testing variation: "${variation}"`)
      const product = await getProductBySlug(variation)
      if (product) {
        console.log(`✅ [CatchAll] Found product: "${product.name}" with slug: "${variation}"`)
        return variation
      }
    } catch (error) {
      console.log(`❌ [CatchAll] Error testing variation "${variation}":`, error)
      // Continuar con la siguiente variación
      continue
    }
  }

  console.log('❌ [CatchAll] No product found with any variation')
  return null
}

export default async function CatchAllProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string[] }> 
}) {
  const { slug } = await params
  
  // Si solo hay un segmento, redirigir a la página normal de productos
  if (slug.length === 1) {
    redirect(`/products/${slug[0]}`)
  }

  // Intentar encontrar el producto correcto
  const correctSlug = await findCorrectProduct(slug)
  
  if (correctSlug) {
    // Redirigir al slug correcto
    redirect(`/products/${correctSlug}`)
  }

  // Si no encontramos el producto, mostrar página 404
  return (
    <div className="container py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
      <p className="text-gray-500 mb-6">
        El producto que buscas no existe o la URL no es válida.
      </p>
      <a 
        href="/products" 
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Ver todos los productos
      </a>
    </div>
  )
}

