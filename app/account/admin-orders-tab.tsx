'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { updateOrderStatus } from './actions/admin-orders'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total: number
  created_at: string
  order_items: OrderItem[]
}

interface AdminOrdersTabProps {
  orders: Order[]
  t: any
}

export default function AdminOrdersTab({ orders, t }: AdminOrdersTabProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setIsLoading(true)
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No hay pedidos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Pedido #{order.id}</h3>
                <p className="text-sm text-muted-foreground">
                  {order.created_at ? format(new Date(order.created_at), 'PPP') : 'No date'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(
                    order.id, 
                    e.target.value as Order['status']
                  )}
                  className="px-2 py-1 border rounded-md text-sm"
                  disabled={isLoading}
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">En Proceso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <Badge variant={
                  order.status === 'completed' ? 'default' :
                  order.status === 'pending' ? 'secondary' :
                  order.status === 'cancelled' ? 'destructive' :
                  'outline'
                }>
                  {order.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Información del Cliente</h4>
                <div className="text-sm text-muted-foreground">
                  <p>ID: {order.user_id}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Productos</h4>
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.product_name}</span>
                        <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                  
                  {/* Order Total */}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 