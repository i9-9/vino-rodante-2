'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '../types'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'

interface OrdersTabProps {
  orders: Order[]
  t: any
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_preparation: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
}

export function OrdersTab({ orders = [], t }: OrdersTabProps) {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
  }

  const getStatusColor = (status: OrderStatus) => {
    return STATUS_COLORS[status] || STATUS_COLORS.pending
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{t.account.noOrders}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.account.startShopping}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>{t.account.orderHistory}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {orders.length} {orders.length === 1 ? t.common.order : t.common.orders}
        </p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Información básica */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <Badge className={getStatusColor(order.status)}>
                      {t.orders[order.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                {/* Resumen y Acciones */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.order_items.reduce((acc, item) => acc + item.quantity, 0)} {t.common.products}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    {expandedOrders.includes(order.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedOrders.includes(order.id) && (
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Lista de productos */}
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
                        {item.products?.image && (
                          <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item.products.image}
                              alt={item.products.name || ''}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                              <h4 className="font-medium truncate">
                                {item.products?.name || t.common.unavailableProduct}
                              </h4>
                              {item.products?.varietal && (
                                <p className="text-sm text-muted-foreground">
                                  {item.products.varietal}
                                  {item.products.year && ` · ${item.products.year}`}
                                  {item.products.region && ` · ${item.products.region}`}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 sm:text-right">
                              <div className="text-sm">
                                <span className="font-medium">
                                  {formatCurrency(item.price)}
                                </span>
                                {" "}x {item.quantity}
                              </div>
                              <div className="font-medium">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{t.common.total}</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 