// Hook optimizado para productos que reduce egress de Supabase
import { useState, useEffect, useCallback, useRef } from 'react'
import { getProducts, getProductsByRegion } from '@/lib/products-client'
import type { Product } from '@/lib/types'

interface UseOptimizedProductsOptions {
  region?: string
  category?: string
  enabled?: boolean
  cacheTime?: number // Tiempo de cache en ms
}

interface UseOptimizedProductsResult {
  products: Product[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  clearCache: () => void
}

// Cache global para productos
const productCache = new Map<string, {
  data: Product[]
  timestamp: number
  region?: string
  category?: string
}>()

const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 minutos

export function useOptimizedProducts(options: UseOptimizedProductsOptions = {}): UseOptimizedProductsResult {
  const {
    region,
    category,
    enabled = true,
    cacheTime = DEFAULT_CACHE_TIME
  } = options

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Generar clave de cache
  const cacheKey = `products-${region || 'all'}-${category || 'all'}`

  // Verificar si hay datos en cache válidos
  const getCachedData = useCallback(() => {
    const cached = productCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data
    }
    return null
  }, [cacheKey, cacheTime])

  // Función para limpiar cache expirado
  const cleanupCache = useCallback(() => {
    const now = Date.now()
    for (const [key, value] of productCache.entries()) {
      if (now - value.timestamp > cacheTime) {
        productCache.delete(key)
      }
    }
  }, [cacheTime])

  // Función para obtener productos
  const fetchProducts = useCallback(async () => {
    if (!enabled) return

    // Verificar cache primero
    const cachedData = getCachedData()
    if (cachedData) {
      setProducts(cachedData)
      setError(null)
      return
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)

    try {
      let result
      
      if (region) {
        result = await getProductsByRegion(region)
      } else {
        result = await getProducts()
      }

      if (result.error) {
        throw new Error(result.error.message || 'Error al cargar productos')
      }

      const productData = result.data || []
      
      // Filtrar por categoría si se especifica
      const filteredProducts = category 
        ? productData.filter(p => p.category?.toLowerCase() === category.toLowerCase())
        : productData

      // Guardar en cache
      productCache.set(cacheKey, {
        data: filteredProducts,
        timestamp: Date.now(),
        region,
        category
      })

      setProducts(filteredProducts)
      setError(null)

      // Limpiar cache expirado
      cleanupCache()

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
        console.error('Error fetching products:', err)
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [enabled, region, category, cacheKey, getCachedData, cleanupCache])

  // Efecto para cargar productos
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Función para refetch manual
  const refetch = useCallback(() => {
    // Limpiar cache para esta clave
    productCache.delete(cacheKey)
    fetchProducts()
  }, [cacheKey, fetchProducts])

  // Función para limpiar todo el cache
  const clearCache = useCallback(() => {
    productCache.clear()
    setProducts([])
  }, [])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    products,
    isLoading,
    error,
    refetch,
    clearCache
  }
}

// Hook especializado para el mega menú (menos frecuente)
export function useProductsForMenu(): UseOptimizedProductsResult {
  return useOptimizedProducts({
    enabled: true,
    cacheTime: 10 * 60 * 1000 // 10 minutos para el menú
  })
}

// Hook para productos por región (cache más largo)
export function useProductsByRegion(region: string): UseOptimizedProductsResult {
  return useOptimizedProducts({
    region,
    enabled: !!region,
    cacheTime: 15 * 60 * 1000 // 15 minutos para regiones
  })
}

// Hook para productos por categoría
export function useProductsByCategory(category: string): UseOptimizedProductsResult {
  return useOptimizedProducts({
    category,
    enabled: !!category,
    cacheTime: 10 * 60 * 1000 // 10 minutos para categorías
  })
}

