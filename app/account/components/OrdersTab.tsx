'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Order } from '../types'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Wine, Package } from 'lucide-react'

interface OrdersTabProps {
  orders: Order[]
  t: any
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-red-100 text-red-800'
} as const

export function OrdersTab({ orders = [], t }: OrdersTabProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Función para formatear la fecha en español
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM yyyy", { locale: es })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const filteredOrders = selectedStatus
    ? orders.filter(order => order.status === selectedStatus)
    : orders

  // Manejo de estado vacío
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Wine className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t?.account?.noOrders || 'No hay pedidos'}</h3>
        <p className="text-muted-foreground mb-6">
          ¡Es momento de descubrir nuestros increíbles vinos!
        </p>
        <Button asChild>
          <a href="/products">Explorar Productos</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStatus === null ? "secondary" : "outline"}
          onClick={() => setSelectedStatus(null)}
        >
          Todos
        </Button>
        {["pending", "shipped", "delivered"].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "secondary" : "outline"}
            onClick={() => setSelectedStatus(status)}
          >
            {t?.orders?.[status] || status}
          </Button>
        ))}
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="bg-muted/50">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Información básica */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      #{(order.id || '').slice(-8).toUpperCase()}
                    </h3>
                    <Badge className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending}>
                      {t?.orders?.[order.status] || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                {/* Resumen y Acciones */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total || 0)}</p>
                    <p className="text-sm text-muted-foreground">
                      {(order.order_items || []).reduce((acc, item) => acc + (item.quantity || 0), 0)} productos
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleOrderExpanded(order.id)}
                  >
                    {expandedOrders.has(order.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Resumen de productos (siempre visible) */}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                {(order.order_items || []).map((item, index, array) => (
                  <span key={item.id}>
                    {item.product?.name || 'Producto sin nombre'}
                    {index < array.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </CardHeader>

            {/* Detalles expandibles */}
            {expandedOrders.has(order.id) && (
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Productos */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground">DETALLE DE PRODUCTOS</h3>
                    {(order.order_items || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        {item.product?.image && (
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <Image
                              src={item.product.image}
                              alt={item.product.name || 'Producto'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.product?.name || 'Producto sin nombre'}</p>
                              {item.product?.varietal && item.product?.year && (
                                <p className="text-sm text-muted-foreground">
                                  {item.product.varietal} {item.product.year}
                                </p>
                              )}
                              {item.product?.region && (
                                <p className="text-sm text-muted-foreground">
                                  {item.product.region}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(item.price || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Cantidad: {item.quantity || 0}
                              </p>
                              <p className="text-sm font-medium">
                                Subtotal: {formatCurrency((item.price || 0) * (item.quantity || 0))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Información de envío */}
                  {order.customer && (order.customer.address || order.customer.city) && (
                    <>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">INFORMACIÓN DE ENVÍO</h3>
                        <div>
                          {order.customer.address && (
                            <p className="text-sm">{order.customer.address}</p>
                          )}
                          {order.customer.city && order.customer.state && (
                            <p className="text-sm">
                              {order.customer.city}, {order.customer.state}
                            </p>
                          )}
                          {order.customer.postal_code && (
                            <p className="text-sm">{order.customer.postal_code}</p>
                          )}
                          {order.customer.country && (
                            <p className="text-sm">{order.customer.country}</p>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total del Pedido</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(order.total || 0)}
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