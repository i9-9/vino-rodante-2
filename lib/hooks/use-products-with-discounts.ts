import { useState, useEffect, useCallback } from 'react'
import { applyDiscountsToProducts } from '@/lib/discount-utils'
import type { Discount } from '@/app/account/types/discount'
import type { Product } from '@/lib/types'

export function useProductsWithDiscounts(products: Product[]) {
  const [productsWithDiscounts, setProductsWithDiscounts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar descuentos activos y aplicarlos a los productos
  const loadProductsWithDiscounts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/discounts/active')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error loading discounts')
      }
      
      const discounts: Discount[] = data.discounts || []
      const productsWithAppliedDiscounts = applyDiscountsToProducts(products, discounts)
      
      setProductsWithDiscounts(productsWithAppliedDiscounts)
    } catch (err) {
      console.error('Error loading products with discounts:', err)
      setError(err instanceof Error ? err.message : 'Error loading products with discounts')
      // En caso de error, mostrar productos sin descuentos
      setProductsWithDiscounts(products)
    } finally {
      setIsLoading(false)
    }
  }, [products])

  // Cargar productos con descuentos cuando cambien los productos
  useEffect(() => {
    if (products.length > 0) {
      loadProductsWithDiscounts()
    }
  }, [products, loadProductsWithDiscounts])

  return {
    productsWithDiscounts,
    isLoading,
    error,
    reload: loadProductsWithDiscounts
  }
}
