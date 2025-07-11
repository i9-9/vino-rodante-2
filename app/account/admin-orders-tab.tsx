'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import { updateOrderStatus } from './actions/admin-orders'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import PaginatedList from './components/PaginatedList'
import type { OrderStatus, Order } from './types'

interface Product {
  id: string
  name: string
  description: string | null
  image: string | null
  price: number
  year: string | null
  region: string | null
  varietal: string | null
}

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products: Product
}

interface Customer {
  id: string
  name: string
  email: string
}

interface AdminOrdersTabProps {
  orders: Order[]
  t: any
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  in_preparation: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  delivered: 'bg-green-100 text-green-800 hover:bg-green-200',
  cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  refunded: 'bg-red-100 text-red-800 hover:bg-red-200'
} as const satisfies Record<OrderStatus, string>

export default function AdminOrdersTab({ orders, t }: AdminOrdersTabProps) {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus)
      } catch (error) {
        console.error('Error updating order status:', error)
      }
    })
  }

  const formatOrderDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
  }

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending
  }

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Calculate order statistics
  const orderStats = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (!orders) {
    return <OrdersLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(orderStats).map(([status, count]) => (
          <Card key={status} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.orders[status]}
                </p>
                <h3 className="text-2xl font-bold">{count}</h3>
              </div>
              <Badge className={getStatusColor(status)}>
                {((count / orders.length) * 100).toFixed(0)}%
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={selectedStatus || 'all'}
          onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value as OrderStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente de pago</SelectItem>
            <SelectItem value="in_preparation">En preparación</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <EmptyOrdersState searchTerm={searchTerm} selectedStatus={selectedStatus} t={t} />
        ) : (
          filteredOrders.slice(0, 10).map((order) => (
            <Card key={order.id}>
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
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
                      {formatOrderDate(order.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Cambiar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(STATUS_COLORS).map((status) => (
                          <SelectItem key={status} value={status}>
                            {t.orders[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
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
              </CardHeader>

              <Collapsible open={expandedOrders.has(order.id)}>
                <CollapsibleContent>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Customer Info */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-4">Información del Cliente</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="font-medium">{order.customer?.name || 'Cliente no registrado'}</p>
                            <p className="text-sm text-muted-foreground">{order.customer?.email || 'Email no disponible'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Dirección de envío</h4>
                        {order.shipping_address ? (
                          <div className="text-sm text-muted-foreground">
                            <p>{order.shipping_address.line1}</p>
                            {order.shipping_address.line2 && (
                              <p>{order.shipping_address.line2}</p>
                            )}
                            <p>
                              {order.shipping_address.city}, {order.shipping_address.state}
                            </p>
                            <p>{order.shipping_address.postal_code}</p>
                            <p>{order.shipping_address.country}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Sin dirección de envío</p>
                        )}
                      </div>

                      {/* Products */}
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Productos</h4>
                        <div className="space-y-4">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-start gap-4 border-b pb-4">
                              {item.products?.image && (
                                <div className="w-20 h-20 relative">
                                  <Image
                                    src={item.products.image}
                                    alt={item.products.name}
                                    fill
                                    className="object-cover rounded-md"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h5 className="font-medium">{item.products?.name || 'Producto sin nombre'}</h5>
                                {item.products?.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.products.description}
                                  </p>
                                )}
                                <div className="mt-1 text-sm">
                                  {item.products?.varietal && (
                                    <span className="text-muted-foreground">
                                      {item.products.varietal} · 
                                    </span>
                                  )}
                                  {item.products?.year && (
                                    <span className="text-muted-foreground">
                                      {" "}{item.products.year} · 
                                    </span>
                                  )}
                                  {item.products?.region && (
                                    <span className="text-muted-foreground">
                                      {" "}{item.products.region}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
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
                          ))}
                        </div>
                        <div className="mt-4 text-right">
                          <div className="text-sm text-muted-foreground">
                            Total: <span className="font-medium text-foreground">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function EmptyOrdersState({ searchTerm, selectedStatus, t }: { searchTerm: string, selectedStatus: OrderStatus | null, t: any }) {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            {searchTerm || selectedStatus
              ? 'No se encontraron órdenes que coincidan con los filtros aplicados.'
              : 'No hay órdenes disponibles.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Orders Skeleton */}
      {[1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 