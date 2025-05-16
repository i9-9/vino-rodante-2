import useSWR from 'swr'
import { getProducts } from '@/lib/products'
import type { Product } from '@/lib/types'

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>('products', getProducts)

  return {
    products: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProductsByRegion(region: string) {
  const fetcher = async () => {
    console.log('[useProductsByRegion] Fetching products for region:', region)
    try {
      const products = await getProducts()
      const filtered = products.filter(p => p.region === region)
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
    () => getProducts().then(products => products.filter(p => p.featured))
  )

  return {
    products: data,
    isLoading,
    isError: error,
    mutate,
  }
} 