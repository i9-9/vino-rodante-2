'use client';

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SubscriptionsTab } from '@/app/account/components/SubscriptionsTab'
import Spinner from '@/components/ui/Spinner'
import type { UserSubscription, SubscriptionPlan } from '@/app/account/types'
import { useTranslations } from '@/lib/providers/translations-provider'

export function SubscriptionsDashboard({ }: { isAdmin?: boolean }) {
  const [loading, setLoading] = useState(true)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations()
  
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('No se pudo obtener el usuario')
        }

        // Load subscription plans
        const { data: plans, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .eq('is_visible', true)
          .order('display_order', { ascending: true })

        if (plansError) {
          throw new Error('Error al cargar los planes')
        }
        setSubscriptionPlans(plans || [])

        // Load user subscriptions
        const { data: subscriptions, error: subsError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plan:subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (subsError) {
          throw new Error('Error al cargar las suscripciones')
        }
        setUserSubscriptions(subscriptions || [])

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setError(error instanceof Error ? error.message : 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <SubscriptionsTab
        subscriptions={userSubscriptions}
        availablePlans={subscriptionPlans}
        t={t}
      />
    </div>
  )
} 