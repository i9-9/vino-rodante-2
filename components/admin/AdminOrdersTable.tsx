"use client"

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Order, OrderStatus, PaymentStatus } from '@/app/account/types'
import { updateOrderStatus } from '@/app/account/actions/admin-orders'

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente de pago', variant: 'secondary' },
  paid: { label: 'Pagado', variant: 'default' },
  preparing: { label: 'En preparación', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'default' },
  delivered: { label: 'Entregado', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
  refunded: { label: 'Reembolsado', variant: 'destructive' }
}

const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  paid: { label: 'Pagado', variant: 'default' },
  failed: { label: 'Fallido', variant: 'destructive' },
  refunded: { label: 'Reembolsado', variant: 'outline' }
}

interface OrderDetailsProps {
  order: Order
  onStatusChange: (newStatus: OrderStatus) => Promise<void>
}

function OrderDetails({ order, onStatusChange }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true)
      await onStatusChange(newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Cliente</h4>
          <p>{order.customer?.name}</p>
          <p>{order.customer?.email}</p>
        </div>
        <div>
          <h4 className="font-medium">Estado</h4>
          <div className="flex items-center gap-2">
            <Badge variant={ORDER_STATUS_MAP[order.status].variant}>
              {ORDER_STATUS_MAP[order.status].label}
            </Badge>
            <Badge variant={PAYMENT_STATUS_MAP[order.payment_status].variant}>
              {PAYMENT_STATUS_MAP[order.payment_status].label}
            </Badge>
          </div>
        </div>
      </div>

      {order.shipping_address && (
        <div>
          <h4 className="font-medium">Dirección de envío</h4>
          <p>{order.shipping_address.line1}</p>
          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
          <p>
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
          </p>
        </div>
      )}

      <div>
        <h4 className="font-medium">Productos</h4>
        <ul className="space-y-2">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantity}x {item.product_name}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between font-medium">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div>
        <h4 className="font-medium">Actualizar estado</h4>
        <div className="flex items-center gap-2">
          <Select
            disabled={isUpdating}
            onValueChange={(value) => handleStatusChange(value as OrderStatus)}
            value={order.status}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_STATUS_MAP).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {order.notes && (
        <div>
          <h4 className="font-medium">Notas</h4>
          <p>{order.notes}</p>
        </div>
      )}
    </div>
  )
}

export default function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      // La página se revalidará automáticamente
    } catch (error) {
      console.error('Error updating order status:', error)
      // Aquí podrías mostrar un toast con el error
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pedidos</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={ORDER_STATUS_MAP[order.status].variant}>
                      {ORDER_STATUS_MAP[order.status].label}
                    </Badge>
                    <Badge variant={PAYMENT_STATUS_MAP[order.payment_status].variant}>
                      {PAYMENT_STATUS_MAP[order.payment_status].label}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  {format(new Date(order.created_at), 'PPP', { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Ver detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detalles de la orden</DialogTitle>
                        <DialogDescription>
                          Orden #{order.id.slice(0, 8)}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedOrder && (
                        <OrderDetails
                          order={selectedOrder}
                          onStatusChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 