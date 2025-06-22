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
import type { OrderStatus } from './types'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product: {
    id: string
    name: string
    image: string | null
    price: number
    year: string | null
    region: string | null
    varietal: string | null
  }
  price: number
  quantity: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  created_at: string
  customer: Customer
  order_items: OrderItem[]
}

interface AdminOrdersTabProps {
  orders: Order[]
  t: any
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  paid: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  preparing: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
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
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
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
            {Object.keys(STATUS_COLORS).map((status) => (
              <SelectItem key={status} value={status}>
                {t.orders[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <EmptyOrdersState searchTerm={searchTerm} selectedStatus={selectedStatus} t={t} />
        ) : (
          filteredOrders.map((order) => (
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
                            <p className="font-medium">{order.customer.name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                            {order.customer.phone && (
                              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                            )}
                          </div>
                          {(order.customer.address || order.customer.city) && (
                            <div className="space-y-2">
                              <p className="font-medium">Dirección de envío</p>
                              {order.customer.address && (
                                <p className="text-sm text-muted-foreground">{order.customer.address}</p>
                              )}
                              {order.customer.city && order.customer.state && (
                                <p className="text-sm text-muted-foreground">
                                  {order.customer.city}, {order.customer.state}
                                </p>
                              )}
                              {order.customer.postal_code && (
                                <p className="text-sm text-muted-foreground">{order.customer.postal_code}</p>
                              )}
                              {order.customer.country && (
                                <p className="text-sm text-muted-foreground">{order.customer.country}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Products */}
                      <div className="space-y-4">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={item.product.image || '/placeholder.svg'}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-col sm:flex-row justify-between gap-2">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    {item.product.year && item.product.region && (
                                      <p>{item.product.year} · {item.product.region}</p>
                                    )}
                                    {item.product.varietal && (
                                      <p className="font-medium text-foreground">{item.product.varietal}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <p className="font-medium">{formatCurrency(item.price)} c/u</p>
                                  <p className="text-sm text-muted-foreground">
                                    Cantidad: {item.quantity}
                                  </p>
                                  <p className="font-semibold">
                                    Subtotal: {formatCurrency(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          Total de productos: {order.order_items.reduce((acc, item) => acc + item.quantity, 0)}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total del pedido</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(order.total)}
                          </p>
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
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">No se encontraron pedidos</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {searchTerm || selectedStatus
          ? 'No hay pedidos que coincidan con los filtros aplicados.'
          : t.account.noOrders}
      </p>
    </div>
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