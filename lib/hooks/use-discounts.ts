import { useState, useEffect, useCallback } from 'react'
import { applyDiscountsToProducts } from '@/lib/discount-utils'
import type { Discount } from '@/app/account/types/discount'
import type { CartItem } from '@/lib/types'

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar descuentos activos
  const loadDiscounts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/discounts/active')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error loading discounts')
      }
      
      setDiscounts(data.discounts || [])
    } catch (err) {
      console.error('Error loading discounts:', err)
      setError(err instanceof Error ? err.message : 'Error loading discounts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Aplicar descuentos a productos del carrito
  const applyDiscountsToCart = useCallback((cartItems: CartItem[]): CartItem[] => {
    if (discounts.length === 0) {
      return cartItems
    }

    return applyDiscountsToProducts(cartItems, discounts)
  }, [discounts])

  // Cargar descuentos al montar el componente
  useEffect(() => {
    loadDiscounts()
  }, [loadDiscounts])

  return {
    discounts,
    isLoading,
    error,
    loadDiscounts,
    applyDiscountsToCart
  }
}
