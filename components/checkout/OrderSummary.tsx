'use client'

import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Percent, DollarSign } from 'lucide-react'
import type { CartItem } from '@/lib/types'

interface OrderSummaryProps {
  cartItems: CartItem[]
  subtotal: number
  totalSavings: number
  finalTotal: number
  shipping: number
  t: any
}

export function OrderSummary({ 
  cartItems, 
  subtotal, 
  totalSavings, 
  finalTotal, 
  shipping, 
  t 
}: OrderSummaryProps) {
  const total = finalTotal + shipping

  return (
    <div className="border rounded-lg p-6 sticky top-20">
      <h2 className="text-xl font-semibold mb-4">{t.checkout?.orderSummary || "Order Summary"}</h2>

      <div className="divide-y">
        {cartItems.map((item) => (
          <div key={item.id} className="py-3 flex gap-3">
            <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.category?.toLowerCase() === 'boxes' || item.category?.toLowerCase() === 'box'
                  ? 'Box de Vinos Varietales'
                  : `${item.year} • ${item.varietal}`
                }
              </p>
              
              {/* Mostrar descuento si existe */}
              {item.discount && (
                <div className="mt-1">
                  <Badge variant="destructive" className="text-xs">
                    <div className="flex items-center gap-1">
                      {item.discount.discount_type === 'percentage' ? (
                        <Percent className="h-3 w-3" />
                      ) : (
                        <DollarSign className="h-3 w-3" />
                      )}
                      <span>
                        {item.discount.discount_type === 'percentage' 
                          ? `${item.discount.discount_value}% OFF`
                          : `$${item.discount.discount_value.toLocaleString('es-AR')} OFF`
                        }
                      </span>
                    </div>
                  </Badge>
                </div>
              )}
              
              <div className="flex justify-between mt-1">
                <p className="text-sm">{t.common.quantity}: {item.quantity}</p>
                <div className="text-right">
                  {item.discount ? (
                    <div>
                      <div className="text-sm line-through text-gray-500">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(item.discount.final_price * item.quantity)}
                      </div>
                      <div className="text-xs text-green-600">
                        Ahorrás {formatCurrency(item.discount.savings * item.quantity)}
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t mt-4 pt-4 space-y-2">
        <div className="flex justify-between">
          <p>{t.checkout?.subtotal || "Subtotal"}</p>
          <p>{formatCurrency(subtotal)}</p>
        </div>
        
        {/* Mostrar descuentos aplicados */}
        {totalSavings > 0 && (
          <div className="flex justify-between text-green-600">
            <p>Descuentos aplicados</p>
            <p>-{formatCurrency(totalSavings)}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <div>
            <p>{t.checkout?.shipping || "Shipping"}</p>
          </div>
          <p>{formatCurrency(shipping)}</p>
        </div>
        
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <p>{t.checkout?.total || "Total"}</p>
          <p>{formatCurrency(total)}</p>
        </div>
        
        {/* Mostrar ahorros totales si hay descuentos */}
        {totalSavings > 0 && (
          <div className="text-center text-green-600 text-sm font-medium">
            ¡Ahorraste {formatCurrency(totalSavings)} en esta compra!
          </div>
        )}
      </div>
    </div>
  )
}
