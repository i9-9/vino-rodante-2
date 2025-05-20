import useSWR from 'swr'
import { getProducts } from '@/lib/products-client'
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
      const { data: products, error } = await getProducts()
      if (error) {
        console.error('[useProductsByRegion] Error fetching products:', error)
        return []
      }
      const filtered = products?.filter((p: Product) => p.region === region) || []
      console.log('[useProductsByRegion] Products fetched:', filtered)
      return filtered
    } catch (err) {
      console.error('[useProductsByRegion] Error fetching products:', err)
      throw err
    }
  }
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    region ? `products/region/${region}` : null,
    fetcher
  )

  return {
    products: data,
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