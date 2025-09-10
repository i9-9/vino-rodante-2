'use client'

import React, { useState, useEffect } from 'react'
import { OrdersTab } from './OrdersTab'
import { OrdersTabSkeleton } from './OrdersTabSkeleton'
import type { Order } from '../types'
import { createClient } from '@/utils/supabase/client'

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
        const supabase = createClient()
        // Asegurar sesión (pero listamos por userId explícitamente)
        await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              order_id,
              product_id,
              quantity,
              price,
              products (
                id,
                name,
                description,
                image,
                price,
                varietal,
                year,
                region
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!isMounted) return
        if (error) throw error
        setOrders((data as any) || [])
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