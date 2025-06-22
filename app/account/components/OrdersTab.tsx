import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Order } from '../types'
import Image from 'next/image'

interface OrdersTabProps {
  orders: Order[]
  t: any
}

export function OrdersTab({ orders, t }: OrdersTabProps) {
  // Función para formatear la fecha de manera consistente
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.account.orders}</h2>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <p className="text-muted-foreground">{t.account.noOrders}</p>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      {formatDate(order.created_at)}
                      {order.customer && (
                        <div className="mt-2 space-y-1">
                          <div>
                            <span className="font-medium">{order.customer.name}</span>
                            <br />
                            <span className="text-sm">{order.customer.email}</span>
                          </div>
                          {order.shipping_address && (
                            <div className="text-sm">
                              <div className="font-medium">Dirección de envío:</div>
                              <div>{order.shipping_address.line1}</div>
                              {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                              <div>
                                {order.shipping_address.city}, {order.shipping_address.state}
                              </div>
                              <div>{order.shipping_address.postal_code}</div>
                              <div>{order.shipping_address.country}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="space-y-2 text-right">
                    <Badge variant={
                      order.status === 'delivered' ? 'default' :
                      order.status === 'preparing' ? 'secondary' :
                      order.status === 'shipped' ? 'secondary' :
                      order.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {t.orders[order.status]}
                    </Badge>
                    <div>
                      <Badge variant={
                        order.payment_status === 'paid' ? 'default' :
                        order.payment_status === 'pending' ? 'secondary' :
                        order.payment_status === 'failed' ? 'destructive' :
                        order.payment_status === 'refunded' ? 'outline' :
                        'outline'
                      }>
                        {t.orders[order.payment_status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.product_image && (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden">
                          <Image
                            src={item.product_image}
                            alt={item.product_name || 'Producto'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        {item.product_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.product_description}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                          <p className="font-medium">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                    {order.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Notas: </span>
                        {order.notes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 