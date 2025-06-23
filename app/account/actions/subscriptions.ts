'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionStatus,
  SubscriptionFrequency,
  WineType 
} from '../types'

const subscriptionPlanSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  tagline: z.string().optional(),
  type: z.enum(['tinto', 'blanco', 'mixto', 'premium'] as const),
  image: z.string().nullable(),
  banner_image: z.string().nullable(),
  features: z.array(z.string()),
  price_weekly: z.number().int().min(0),
  price_biweekly: z.number().int().min(0),
  price_monthly: z.number().int().min(0),
  discount_percentage: z.number().min(0).max(100).optional(),
  wines_per_delivery: z.number().int().min(1),
  display_order: z.number().int().min(0),
  is_visible: z.boolean().default(true),
  is_active: z.boolean().default(true)
})

// Funciones auxiliares
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (customerError || !customer?.is_admin) {
    throw new Error('Se requieren permisos de administrador')
  }

  return user
}

// Funciones para usuarios normales
export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  try {
    if (!userId) {
      console.error('getUserSubscriptions called without userId')
      return []
    }

    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error de autenticación:', userError)
      return []
    }

    // Verificar que el usuario solicita sus propias suscripciones o es admin
    if (user.id !== userId) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (customerError || !customer?.is_admin) {
        console.error('Usuario no autorizado para ver estas suscripciones')
        return []
      }
    }

    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener suscripciones:', error)
      return []
    }

    return subscriptions as UserSubscription[]
  } catch (error) {
    console.error('Error inesperado en getUserSubscriptions:', error)
    return []
  }
}

export async function updateSubscriptionStatus(
  subscriptionId: string, 
  status: SubscriptionStatus
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('No autorizado')
    }

    // Verificar propiedad de la suscripción
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      throw new Error('Suscripción no encontrada')
    }

    if (subscription.user_id !== user.id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!customer?.is_admin) {
        throw new Error('No autorizado para modificar esta suscripción')
      }
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar estado de suscripción:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Función para obtener planes disponibles (activos y visibles)
export async function getAvailablePlans() {
  try {
    const supabase = await createClient()
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    
    return { data: plans as SubscriptionPlan[] }
  } catch (error) {
    console.error('Error al obtener planes:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Funciones para administradores
export async function getAllSubscriptionPlans() {
  try {
    await verifyAdmin()
    
    const supabase = await createClient()
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    
    return { data: plans as SubscriptionPlan[] }
  } catch (error) {
    console.error('Error al obtener planes:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function createSubscriptionPlan(formData: FormData) {
  try {
    await verifyAdmin()

    const planData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      tagline: formData.get('tagline'),
      type: formData.get('type'),
      image: formData.get('image'),
      banner_image: formData.get('banner_image'),
      features: JSON.parse(formData.get('features') as string),
      price_weekly: parseInt(formData.get('price_weekly') as string),
      price_biweekly: parseInt(formData.get('price_biweekly') as string),
      price_monthly: parseInt(formData.get('price_monthly') as string),
      discount_percentage: parseInt(formData.get('discount_percentage') as string),
      wines_per_delivery: parseInt(formData.get('wines_per_delivery') as string),
      display_order: parseInt(formData.get('display_order') as string),
      is_visible: formData.get('is_visible') === 'true',
      is_active: formData.get('is_active') === 'true'
    }

    const validatedData = subscriptionPlanSchema.parse(planData)
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('subscription_plans')
      .insert(validatedData)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al crear plan:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function updateSubscriptionPlan(planId: string, formData: FormData) {
  try {
    await verifyAdmin()

    const planData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      tagline: formData.get('tagline'),
      type: formData.get('type'),
      image: formData.get('image'),
      banner_image: formData.get('banner_image'),
      features: JSON.parse(formData.get('features') as string),
      price_weekly: parseInt(formData.get('price_weekly') as string),
      price_biweekly: parseInt(formData.get('price_biweekly') as string),
      price_monthly: parseInt(formData.get('price_monthly') as string),
      discount_percentage: parseInt(formData.get('discount_percentage') as string),
      wines_per_delivery: parseInt(formData.get('wines_per_delivery') as string),
      display_order: parseInt(formData.get('display_order') as string),
      is_visible: formData.get('is_visible') === 'true',
      is_active: formData.get('is_active') === 'true'
    }

    const validatedData = subscriptionPlanSchema.parse(planData)
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('subscription_plans')
      .update(validatedData)
      .eq('id', planId)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar plan:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function deleteSubscriptionPlan(planId: string) {
  try {
    await verifyAdmin()
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar plan:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Funciones para gestión de suscripciones de usuario
export async function createSubscription(
  planId: string, 
  frequency: SubscriptionFrequency
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('No autorizado')
    }

    // Obtener el plan para validar
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      throw new Error('Plan no encontrado')
    }

    if (!plan.is_active || !plan.is_visible) {
      throw new Error('Plan no disponible')
    }

    // Crear la suscripción
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        frequency,
        status: 'active',
        start_date: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/account')
    return { success: true, data: subscription }
  } catch (error) {
    console.error('Error al crear suscripción:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Función para obtener planes disponibles (activos y visibles)
export async function getSubscriptionPlans() {
  try {
    const supabase = await createClient()
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return { data: plans as SubscriptionPlan[] }
  } catch (error) {
    console.error('Error al obtener planes:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
} 