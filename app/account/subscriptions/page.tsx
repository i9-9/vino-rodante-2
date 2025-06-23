'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { SubscriptionsDashboard } from '@/components/dashboard/subscriptions-dashboard'

export default function SubscriptionsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/sign-in?redirect=/account/subscriptions')
          return
        }

        // Verificar si es admin
        const { data: customer } = await supabase
          .from('customers')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        setIsAdmin(customer?.is_admin || false)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/sign-in')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndRole()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona tus suscripciones de vino y descubre nuevos sabores cada mes
            </p>
          </div>
        </div>
      </div>
      
      <SubscriptionsDashboard isAdmin={isAdmin} />
    </div>
  )
}