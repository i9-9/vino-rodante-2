'use client'

import { Badge } from '@/components/ui/badge'
import { Percent, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductDiscountBadgeProps {
  product: Product
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ProductDiscountBadge({ 
  product, 
  className,
  size = 'md'
}: ProductDiscountBadgeProps) {
  if (!product.discount) {
    return null
  }

  const { discount } = product
  const savingsPercentage = product.price > 0 
    ? Math.round((discount.savings / product.price) * 100) 
    : 0

  const sizeClasses = {
    sm: {
      price: 'text-sm font-bold text-green-600',
      original: 'text-xs line-through text-gray-500'
    },
    md: {
      price: 'text-lg font-bold text-green-600',
      original: 'text-sm line-through text-gray-500'
    },
    lg: {
      price: 'text-2xl font-bold text-green-600',
      original: 'text-lg line-through text-gray-500'
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={sizeClasses[size].price}>
        ${discount.final_price.toLocaleString('es-AR')}
      </span>
      <span className={sizeClasses[size].original}>
        ${product.price.toLocaleString('es-AR')}
      </span>
    </div>
  )
}
