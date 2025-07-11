'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import AdminOrdersTab from './admin-orders-tab'
import { AdminOrdersSkeleton } from './components/AdminSkeleton'
import type { Order } from './types'

interface AdminOrdersTabLazyProps {
  t: any
}

export default function AdminOrdersTabLazy({ t }: AdminOrdersTabLazyProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAdminOrders = async () => {
      try {
        const supabase = createClient()
        
        // Verificar que el usuario sea admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('No autorizado')
          return
        }

        const { data: customer } = await supabase
          .from('customers')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!customer?.is_admin) {
          setError('No autorizado')
          return
        }

        // Cargar todas las órdenes con límite inicial
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*),
            customer:customers!user_id(
              id,
              name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50) // Límite inicial para performance

        if (!isMounted) return

        if (error) {
          setError(error.message)
        } else {
          setOrders(data || [])
        }
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

    loadAdminOrders()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <AdminOrdersSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error al cargar órdenes: {error}
      </div>
    )
  }

  return <AdminOrdersTab orders={orders} t={t} />
} 