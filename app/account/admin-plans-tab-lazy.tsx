'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AdminPlansTab } from './admin-plans-tab'
import { AdminPlansSkeleton } from './components/AdminSkeleton'
import type { SubscriptionPlan, Customer } from './types'
import type { Translations } from '@/lib/i18n/types'

interface AdminPlansTabLazyProps {
  t: Translations
}

export default function AdminPlansTabLazy({ }: AdminPlansTabLazyProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [users, setUsers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAdminPlansData = async () => {
      try {
        console.log('🔄 Iniciando carga de planes admin...')
        const supabase = createClient()
        
        // Verificar que el usuario sea admin
        console.log('👤 Verificando usuario...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('❌ Error de autenticación:', userError)
          setError(`Error de autenticación: ${userError.message}`)
          return
        }
        
        if (!user) {
          console.error('❌ No hay usuario autenticado')
          setError('No autorizado - No hay usuario')
          return
        }

        console.log('✅ Usuario autenticado:', user.email)
        console.log('🔍 Verificando permisos de admin...')

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('is_admin, email, name')
          .eq('id', user.id)
          .single()

        if (customerError) {
          console.error('❌ Error al verificar customer:', customerError)
          setError(`Error al verificar permisos: ${customerError.message}`)
          return
        }

        console.log('👤 Datos del customer:', customer)

        if (!customer?.is_admin) {
          console.error('❌ Usuario no es admin:', customer)
          setError('No autorizado - Se requieren permisos de administrador')
          return
        }

        console.log('✅ Usuario verificado como admin, cargando datos...')

        // Cargar planes y usuarios en paralelo
        const [plansRes, usersRes] = await Promise.all([
          // Cargar todos los planes de suscripción
          supabase
            .from('subscription_plans')
            .select('*')
            .order('display_order', { ascending: true }),
          
          // Cargar todos los customers
          supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false })
        ])

        if (!isMounted) return

        if (plansRes.error) {
          console.error('❌ Error al cargar planes:', plansRes.error)
          setError(`Error al cargar planes: ${plansRes.error.message}`)
          return
        }

        if (usersRes.error) {
          console.error('❌ Error al cargar usuarios:', usersRes.error)
          setError(`Error al cargar usuarios: ${usersRes.error.message}`)
          return
        }

        console.log(`✅ Planes cargados exitosamente: ${plansRes.data?.length || 0}`)
        console.log('📋 Planes:', plansRes.data)
        console.log(`✅ Usuarios cargados exitosamente: ${usersRes.data?.length || 0}`)

        // Asegurar que features nunca sea null
        const plansWithFeatures = (plansRes.data || []).map(plan => ({
          ...plan,
          features: plan.features || []
        }))

        setPlans(plansWithFeatures)
        setUsers(usersRes.data || [])
      } catch (err) {
        console.error('💥 Error inesperado al cargar datos de planes:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAdminPlansData()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <AdminPlansSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error al cargar planes: {error}
      </div>
    )
  }

  return <AdminPlansTab plans={plans} users={users} t={{} as Translations} />
} 