'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse } from '../types'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_bimonthly: number
  price_quarterly: number
  club: string
  features: Record<string, any>
  image: string | null
  is_active: boolean
}

interface UserSubscription {
  id: string
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  current_period_end: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  is_gift: boolean
  created_at: string
  updated_at: string
  subscription_plan: SubscriptionPlan | null
}

interface SupabaseSubscriptionResponse {
  id: string
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  current_period_end: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  is_gift: boolean
  created_at: string
  updated_at: string
  subscription_plan: {
    id: string
    name: string
    description: string
    price_monthly: number
    price_bimonthly: number
    price_quarterly: number
    club: string
    features: Record<string, any>
    image: string | null
    is_active: boolean
  } | null
}

export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  try {
    if (!userId) {
      console.error('getUserSubscriptions called without userId')
      return []
    }

    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('getUserSubscriptions auth error:', userError)
      return []
    }

    // 2. Verificar que el usuario solicita sus propias suscripciones o es admin
    if (user.id !== userId) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (customerError) {
        console.error('Error checking admin status:', customerError)
        return []
      }

      if (!customer?.is_admin) {
        console.error('User not authorized to view these subscriptions')
        return []
      }
    }

    // 3. Obtener suscripciones del usuario
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        customer_id,
        plan_id,
        start_date,
        end_date,
        current_period_end,
        status,
        is_gift,
        created_at,
        updated_at,
        subscription_plan:subscription_plans (
          id,
          name,
          description,
          price_monthly,
          price_bimonthly,
          price_quarterly,
          club,
          features,
          image,
          is_active
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError)
      return []
    }

    // Si no hay suscripciones, devolver array vacío
    if (!subscriptions) {
      return []
    }

    // Transformar y validar los datos
    const validatedSubscriptions: UserSubscription[] = (subscriptions as unknown as SupabaseSubscriptionResponse[]).map(sub => ({
      id: sub.id,
      customer_id: sub.customer_id,
      plan_id: sub.plan_id,
      start_date: sub.start_date,
      end_date: sub.end_date,
      current_period_end: sub.current_period_end,
      status: sub.status,
      is_gift: sub.is_gift,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
      subscription_plan: sub.subscription_plan ? {
        id: sub.subscription_plan.id,
        name: sub.subscription_plan.name,
        description: sub.subscription_plan.description,
        price_monthly: sub.subscription_plan.price_monthly,
        price_bimonthly: sub.subscription_plan.price_bimonthly,
        price_quarterly: sub.subscription_plan.price_quarterly,
        club: sub.subscription_plan.club,
        features: sub.subscription_plan.features || {},
        image: sub.subscription_plan.image,
        is_active: sub.subscription_plan.is_active
      } : null
    }))

    return validatedSubscriptions

  } catch (error) {
    console.error('Unexpected error in getUserSubscriptions:', error)
    return []
  }
}

export async function addSubscription(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  // Verificar si es admin
  const { data: customerData } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customerData?.is_admin) {
    throw new Error('No autorizado - Se requiere ser admin')
  }

  const subscription = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    interval: formData.get('interval') as 'monthly' | 'quarterly' | 'yearly',
    active: formData.get('active') === 'on'
  }

  const { error } = await supabase
    .from('subscription_plans')
    .insert(subscription)

  if (error) {
    throw new Error(`Error al agregar suscripción: ${error.message}`)
  }

  revalidatePath('/account')
}

export async function updateSubscription(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  // Verificar si es admin
  const { data: customerData } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customerData?.is_admin) {
    throw new Error('No autorizado - Se requiere ser admin')
  }

  const subscriptionId = formData.get('id') as string
  const subscription = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    interval: formData.get('interval') as 'monthly' | 'quarterly' | 'yearly',
    active: formData.get('active') === 'on'
  }

  const { error } = await supabase
    .from('subscription_plans')
    .update(subscription)
    .eq('id', subscriptionId)

  if (error) {
    throw new Error(`Error al actualizar suscripción: ${error.message}`)
  }

  revalidatePath('/account')
}

export async function deleteSubscription(subscriptionId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  // Verificar si es admin
  const { data: customerData } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customerData?.is_admin) {
    throw new Error('No autorizado - Se requiere ser admin')
  }

  const { error } = await supabase
    .from('subscription_plans')
    .delete()
    .eq('id', subscriptionId)

  if (error) {
    throw new Error(`Error al eliminar suscripción: ${error.message}`)
  }

  revalidatePath('/account')
} 