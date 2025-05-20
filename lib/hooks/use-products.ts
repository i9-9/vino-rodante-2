import useSWR from 'swr'
import { getProducts, getProductsByRegion } from '@/lib/products-client'
import type { Product } from '@/lib/types'

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>('products', async () => {
    const { data, error } = await getProducts()
    if (error) {
      throw error
    }
    return data || []
  })

  return {
    products: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProductsByRegion(region: string) {
  const fetcher = async (): Promise<Product[]> => {
    console.log('[useProductsByRegion] Fetching products for region:', region)
    try {
      const { data: products, error } = await getProductsByRegion(region)
      if (error) {
        console.error('[useProductsByRegion] Error fetching products:', error)
        return []
      }
      return products || []
    } catch (err) {
      console.error('[useProductsByRegion] Error fetching products:', err)
      return []
    }
  }
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    region ? `products/region/${region}` : null,
    fetcher
  )

  return {
    products: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useFeaturedProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    'products/featured',
    async () => {
      const { data: products, error } = await getProducts()
      if (error) {
        throw error
      }
      return (products || []).filter(p => p.featured)
    }
  )

  return {
    products: data,
    isLoading,
    isError: error,
    mutate,
  }
} 