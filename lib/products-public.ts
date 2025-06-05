import { createAdaptiveClient } from '@/lib/supabase/client-incognito'
import type { Product } from '@/lib/types'
import { useState, useEffect } from 'react'

// Cliente específico para acceso público
function createPublicClient() {
  return createAdaptiveClient()
}

// Función optimizada para acceso público a productos
export async function getPublicProducts(): Promise<Product[]> {
  console.log('🔍 [getPublicProducts] Starting public product fetch')
  
  try {
    const supabase = createPublicClient()
    
    // Query simple y directa
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('🔍 [getPublicProducts] Supabase error:', error)
      console.log('🔍 [getPublicProducts] Using fallback products')
      return getFallbackProducts()
    }
    
    if (!data || data.length === 0) {
      console.log('🔍 [getPublicProducts] No data returned, using fallback')
      return getFallbackProducts()
    }
    
    console.log('🔍 [getPublicProducts] Success:', data.length, 'products')
    return data
    
  } catch (error) {
    console.error('🔍 [getPublicProducts] Exception:', error)
    console.log('🔍 [getPublicProducts] Using fallback due to exception')
    return getFallbackProducts()
  }
}

// Productos de fallback para cuando todo falla
function getFallbackProducts(): Product[] {
  console.log('🔍 [getFallbackProducts] Using fallback products')
  
  return [
    {
      id: 'fallback-red',
      name: 'Vinos Tintos',
      slug: 'red-wines',
      description: 'Selección de vinos tintos',
      price: 2500,
      image: '/images/wine-placeholder.jpg',
      category: 'red',
      region: 'mendoza',
      varietal: 'malbec',
      year: '2022',
      stock: 10,
      featured: false,
      is_visible: true
    },
    {
      id: 'fallback-white',
      name: 'Vinos Blancos',
      slug: 'white-wines',
      description: 'Selección de vinos blancos',
      price: 2200,
      image: '/images/wine-placeholder.jpg',
      category: 'white',
      region: 'mendoza',
      varietal: 'chardonnay',
      year: '2022',
      stock: 10,
      featured: false,
      is_visible: true
    },
    {
      id: 'fallback-rose',
      name: 'Vinos Rosé',
      slug: 'rose-wines',
      description: 'Selección de vinos rosé',
      price: 2000,
      image: '/images/wine-placeholder.jpg',
      category: 'rose',
      region: 'mendoza',
      varietal: 'pinot-noir',
      year: '2022',
      stock: 10,
      featured: false,
      is_visible: true
    },
    {
      id: 'fallback-sparkling',
      name: 'Vinos Espumantes',
      slug: 'sparkling-wines',
      description: 'Selección de vinos espumantes',
      price: 3000,
      image: '/images/wine-placeholder.jpg',
      category: 'sparkling',
      region: 'mendoza',
      varietal: 'champagne',
      year: '2022',
      stock: 10,
      featured: false,
      is_visible: true
    },
    {
      id: 'fallback-naranjo',
      name: 'Vinos Naranjo',
      slug: 'orange-wines',
      description: 'Selección de vinos naranjo',
      price: 2800,
      image: '/images/wine-placeholder.jpg',
      category: 'naranjo',
      region: 'mendoza',
      varietal: 'torrontes',
      year: '2022',
      stock: 10,
      featured: false,
      is_visible: true
    }
  ]
}

// Hook mejorado para productos públicos
export function usePublicProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const data = await getPublicProducts()
        
        if (isMounted) {
          setProducts(data)
        }
      } catch (err) {
        console.error('usePublicProducts error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setProducts(getFallbackProducts())
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [])

  return { products, isLoading, error }
} 