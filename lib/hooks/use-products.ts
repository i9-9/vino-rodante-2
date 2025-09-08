import { useState, useEffect } from 'react'
import { getProducts, getProductsByRegion } from '@/lib/products-client'
import type { Product } from '@/lib/types'

// Fallback básico de categorías para modo incógnito
const FALLBACK_CATEGORIES = ['red', 'white', 'rose', 'sparkling', 'naranjo']

export function useProducts() {
  console.log('🔍 [useProducts] Hook called')
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    console.log('🔍 [useProducts] useEffect running')
    
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 [useProducts] Calling getProducts()')
        const { data, error } = await getProducts()
        
        console.log('🔍 [useProducts] getProducts completed:', { 
          dataLength: data?.length, 
          error: error?.message || error,
          firstProduct: data?.[0]?.name
        })
        
        if (error) {
          console.error('🔍 [useProducts] Error from getProducts:', error)
          setError(error)
          
          // Si es un error de autenticación/política en modo incógnito, crear productos básicos para navegación
          if (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116') {
            console.log('🔍 [useProducts] Using fallback for incognito mode')
            // Crear productos mínimos para que el menú funcione
            const fallbackProducts: Product[] = FALLBACK_CATEGORIES.map((category, index) => ({
              id: `fallback-${index}`,
              name: `${category} wine`,
              slug: `${category}-wine`,
              description: `${category} wine collection`,
              price: 1000,
              image: '/images/wine-placeholder.jpg',
              category: category,
              region: 'mendoza',
              varietal: 'cabernet-sauvignon',
              year: '2022',
              stock: 10,
              featured: false,
              is_visible: true
            }))
            setProducts(fallbackProducts)
          } else {
            setProducts([])
          }
        } else {
          console.log('🔍 [useProducts] Setting products in state:', data?.length || 0, 'products')
          setProducts(data || [])
        }
      } catch (err) {
        console.error('🔍 [useProducts] Exception:', err)
        setError(err)
        
        // En caso de excepción completa, usar fallback
        console.log('🔍 [useProducts] Using fallback due to exception')
        const fallbackProducts: Product[] = FALLBACK_CATEGORIES.map((category, index) => ({
          id: `fallback-${index}`,
          name: `${category} wine`,
          slug: `${category}-wine`,
          description: `${category} wine collection`,
          price: 1000,
          image: '/images/wine-placeholder.jpg',
          category: category,
          region: 'mendoza',
          varietal: 'cabernet-sauvignon',
          year: '2022',
          stock: 10,
          featured: false,
          is_visible: true
        }))
        setProducts(fallbackProducts)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  console.log('🔍 [useProducts] Current state:', { 
    dataLength: products?.length, 
    isLoading, 
    error: error?.message || error
  })

  const mutate = () => {
    console.log('🔍 [useProducts] mutate called')
    setIsLoading(true)
    setError(null)
    getProducts().then(({ data, error }) => {
      if (error) {
        setError(error)
        setProducts([])
      } else {
        setProducts(data || [])
      }
      setIsLoading(false)
    })
  }

  return {
    products,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProductsByRegion(region: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!region) {
      setProducts([])
      setIsLoading(false)
      return
    }

    const fetchProducts = async () => {
      console.log('[useProductsByRegion] Fetching products for region:', region)
      try {
        setIsLoading(true)
        setError(null)
        
        const { data: products, error } = await getProductsByRegion(region)
        console.log('[useProductsByRegion] Response:', { products, error })
        
        if (error) {
          console.error('[useProductsByRegion] Error fetching products:', error)
          setError(error)
          setProducts([])
        } else {
          setProducts(products || [])
        }
      } catch (err) {
        console.error('[useProductsByRegion] Error fetching products:', err)
        setError(err)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [region])

  console.log('[useProductsByRegion] State:', { data: products, error, isLoading })

  const mutate = () => {
    if (!region) return
    
    setIsLoading(true)
    setError(null)
    getProductsByRegion(region).then(({ data, error }) => {
      if (error) {
        setError(error)
        setProducts([])
      } else {
        setProducts(data || [])
      }
      setIsLoading(false)
    })
  }

  return {
    products,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const { data: allProducts, error } = await getProducts()
        
        if (error) {
          setError(error)
          setProducts([])
        } else {
          const featuredProducts = (allProducts || []).filter(p => p.featured)
          setProducts(featuredProducts)
        }
      } catch (err) {
        setError(err)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const mutate = () => {
    setIsLoading(true)
    setError(null)
    getProducts().then(({ data, error }) => {
      if (error) {
        setError(error)
        setProducts([])
      } else {
        const featuredProducts = (data || []).filter(p => p.featured)
        setProducts(featuredProducts)
      }
      setIsLoading(false)
    })
  }

  return {
    products,
    isLoading,
    isError: error,
    mutate,
  }
} 