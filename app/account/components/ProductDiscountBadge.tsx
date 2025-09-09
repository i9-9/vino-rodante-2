'use client'

import { Badge } from '@/components/ui/badge'
import { Percent, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '../types'

interface ProductDiscountBadgeProps {
  product: Product
  className?: string
}

export function ProductDiscountBadge({ product, className }: ProductDiscountBadgeProps) {
  if (!product.discount) {
    return null
  }

  const { discount } = product
  const savingsPercentage = product.price > 0 
    ? Math.round((discount.savings / product.price) * 100) 
    : 0

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="destructive" className="text-xs">
        <div className="flex items-center gap-1">
          {discount.discount_type === 'percentage' ? (
            <Percent className="h-3 w-3" />
          ) : (
            <DollarSign className="h-3 w-3" />
          )}
          <span>
            {discount.discount_type === 'percentage' 
              ? `${discount.discount_value}% OFF`
              : `$${discount.discount_value.toLocaleString('es-AR')} OFF`
            }
          </span>
        </div>
      </Badge>
      
      <div className="text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="line-through">
            ${product.price.toLocaleString('es-AR')}
          </span>
          <span className="font-medium text-green-600">
            ${discount.final_price.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="text-green-600">
          Ahorrás ${discount.savings.toLocaleString('es-AR')} ({savingsPercentage}%)
        </div>
      </div>
    </div>
  )
}
