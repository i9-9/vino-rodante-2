'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SubscriptionsTab } from './SubscriptionsTab'
import { SubscriptionsTabSkeleton } from './SubscriptionsTabSkeleton'
import type { UserSubscription, SubscriptionPlan } from '../types'

interface SubscriptionsTabLazyProps {
  userId: string
  t: any
}

export default function SubscriptionsTabLazy({ userId, t }: SubscriptionsTabLazyProps) {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadSubscriptionsData = async () => {
      try {
        const supabase = createClient()
        
        // Cargar suscripciones del usuario y planes disponibles en paralelo
        const [subscriptionsRes, plansRes] = await Promise.all([
          supabase
            .from('user_subscriptions')
            .select(`
              *,
              subscription_plan:subscription_plans(*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
        ])

        if (!isMounted) return

        if (subscriptionsRes.error) {
          setError(subscriptionsRes.error.message)
          return
        }

        if (plansRes.error) {
          setError(plansRes.error.message)
          return
        }

        // Ensure features is never null
        const plansWithFeatures = (plansRes.data || []).map(plan => ({
          ...plan,
          features: plan.features || []
        }))

        setSubscriptions(subscriptionsRes.data || [])
        setAvailablePlans(plansWithFeatures)
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

    loadSubscriptionsData()

    return () => {
      isMounted = false
    }
  }, [userId])

  if (loading) {
    return <SubscriptionsTabSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error al cargar suscripciones: {error}
      </div>
    )
  }

  return (
    <SubscriptionsTab 
      subscriptions={subscriptions} 
      availablePlans={availablePlans}
      t={t} 
    />
  )
} 