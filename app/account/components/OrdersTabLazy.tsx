'use client'

import { useState, useEffect } from 'react'
import { getUserOrders } from '../actions/data-loader'
import { OrdersTab } from './OrdersTab'
import { OrdersTabSkeleton } from './OrdersTabSkeleton'
import type { Order } from '../types'

interface OrdersTabLazyProps {
  userId: string
  t: any
}

export default function OrdersTabLazy({ userId, t }: OrdersTabLazyProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      try {
        // Usar función optimizada
        const data = await getUserOrders(userId, 20)
        
        if (!isMounted) return
        setOrders(data as any)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [userId])

  if (loading) {
    return <OrdersTabSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error al cargar órdenes: {error}
      </div>
    )
  }

  return <OrdersTab orders={orders} t={t} />
} 