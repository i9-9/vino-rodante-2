'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AdminSubscriptionsTab } from './admin-subscriptions-tab'
import { AdminSubscriptionsSkeleton } from './components/AdminSkeleton'

interface AdminSubscriptionsTabLazyProps {
  t: unknown
}


export default function AdminSubscriptionsTabLazy({ t }: AdminSubscriptionsTabLazyProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkAuthorization = async () => {
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

        if (!isMounted) return

        if (!customer?.is_admin) {
          setError('No autorizado')
          return
        }

        setIsAuthorized(true)
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

    checkAuthorization()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <AdminSubscriptionsSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error: {error}
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
        No tienes permisos para ver esta sección.
      </div>
    )
  }

  // El componente AdminSubscriptionsTab ya tiene su propia lógica de carga de datos
  return <AdminSubscriptionsTab t={t as unknown as import('@/lib/i18n/types').Translations} />
} 