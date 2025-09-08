'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionStatus,
  SubscriptionFrequency
} from '../types'
import { redirect } from 'next/navigation'



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

export async function uploadPlanImage(file: File, type: 'main' | 'banner' = 'main') {
  try {
    const supabase = await createClient()
    
    // Verificar admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado' }
    
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!customer?.is_admin) {
      return { success: false, error: 'Permisos insuficientes' }
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Tipo de archivo no permitido. Use JPG, PNG o WebP.' }
    }

    // Límites diferentes según el tipo de imagen
    const maxSize = type === 'banner' 
      ? 50 * 1024 * 1024 // 50MB para banners (alta resolución)
      : 20 * 1024 * 1024 // 20MB para imágenes principales
    
    if (file.size > maxSize) {
      const maxSizeMB = type === 'banner' ? '50MB' : '20MB'
      return { success: false, error: `La imagen es demasiado grande. Máximo ${maxSizeMB}.` }
    }

    // Generar un nombre único para el archivo con prefijo según tipo
    const fileExt = file.name.split('.').pop()
    const prefix = type === 'banner' ? 'banner' : 'main'
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = fileName

    // Configuración de cache optimizada para banners
    const cacheControl = type === 'banner' ? '31536000' : '3600' // 1 año para banners, 1 hora para main

    // Subir el archivo
    const { error } = await supabase.storage
      .from('subscription-plans')
      .upload(filePath, file, {
        cacheControl,
        upsert: false
      })

    if (error) {
      console.error('Error de Supabase Storage:', error)
      throw error
    }

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('subscription-plans')
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al subir la imagen' }
  }
}

export async function updateSubscriptionPlan(planId: string, data: Partial<SubscriptionPlan>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado' }
    
    // Verificar admin
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!customer?.is_admin) {
      return { success: false, error: 'Permisos insuficientes' }
    }

    // Obtener el plan actual para no perder datos
    const { data: currentPlan, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (fetchError) {
      console.error('Error al obtener el plan actual:', fetchError)
      throw new Error('Error al obtener el plan actual')
    }

    // Preparar datos para actualización, manteniendo valores existentes si no se proporcionan nuevos
    const updateData = {
      name: data.name || currentPlan.name,
      club: data.club || currentPlan.club,
      description: data.description ?? currentPlan.description,
      tagline: data.tagline ?? currentPlan.tagline, // Permitir actualizar el tagline
      image: data.image || currentPlan.image, // Mantener imagen existente si no se proporciona una nueva
      banner_image: data.banner_image === '' ? null : (data.banner_image || currentPlan.banner_image), // Permitir eliminar el banner
      price_monthly: data.price_monthly ?? currentPlan.price_monthly,
      price_quarterly: data.price_quarterly ?? currentPlan.price_quarterly,
      price_weekly: data.price_weekly ?? currentPlan.price_weekly,
      price_biweekly: data.price_biweekly ?? currentPlan.price_biweekly,
      is_active: typeof data.is_active === 'boolean' ? data.is_active : currentPlan.is_active,
      updated_at: new Date().toISOString(),
      // Mantener otros campos que no deberían cambiar
      slug: currentPlan.slug,
      features: currentPlan.features,
      discount_percentage: currentPlan.discount_percentage,
      status: currentPlan.status,
      display_order: currentPlan.display_order,
      is_visible: currentPlan.is_visible,
      type: currentPlan.type,
      wines_per_delivery: currentPlan.wines_per_delivery
    }
    
    // Actualizar plan
    const { data: updatedPlan, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single()
    
    if (error) {
      console.error('Error de Supabase:', error)
      throw new Error(error.message)
    }
    
    revalidatePath('/account')
    return { success: true, data: updatedPlan }
  } catch (error) {
    console.error('Error updating plan:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Función auxiliar para validar URLs
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString)
    return true
  } catch {
    return false
  }
}

export async function createSubscriptionPlan(data: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado' }
    
    // Verificar admin
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!customer?.is_admin) {
      return { success: false, error: 'Permisos insuficientes' }
    }
    
    // Crear plan
    const { data: newPlan, error } = await supabase
      .from('subscription_plans')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/account')
    return { success: true, data: newPlan }
  } catch (error) {
    console.error('Error creating plan:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function deleteSubscriptionPlan(planId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado' }
    
    // Verificar admin
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!customer?.is_admin) {
      return { success: false, error: 'Permisos insuficientes' }
    }
    
    // Eliminar plan
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId)
    
    if (error) throw error
    
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error deleting plan:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
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

// Helper function to verify permissions
async function verifySubscriptionAccess(subscriptionId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  // Get subscription and check ownership
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('id', subscriptionId)
    .single()

  if (subError || !subscription) {
    throw new Error('Suscripción no encontrada')
  }

  // Check if user is owner or admin
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (subscription.user_id !== user.id && !customer?.is_admin) {
    throw new Error('No tienes permiso para modificar esta suscripción')
  }

  return { userId: user.id, isAdmin: customer?.is_admin }
}

// Helper function to calculate next delivery date
function calculateNextDeliveryDate(
  frequency: SubscriptionFrequency,
  fromDate: Date = new Date()
): Date {
  const date = new Date(fromDate)
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    default:
      throw new Error('Frecuencia inválida')
  }

  // Avoid weekends
  if (date.getDay() === 0) { // Sunday
    date.setDate(date.getDate() + 1)
  } else if (date.getDay() === 6) { // Saturday
    date.setDate(date.getDate() + 2)
  }

  return date
}

export async function pauseSubscription(subscriptionId: string) {
  try {
    await verifySubscriptionAccess(subscriptionId)
    const supabase = await createClient()

    // Verify subscription is active
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('id', subscriptionId)
      .single()

    if (!subscription || subscription.status !== 'active') {
      throw new Error('Solo se pueden pausar suscripciones activas')
    }

    // Update subscription status
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al pausar suscripción:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function reactivateSubscription(subscriptionId: string) {
  try {
    await verifySubscriptionAccess(subscriptionId)
    const supabase = await createClient()

    // Verify subscription is paused
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status, frequency')
      .eq('id', subscriptionId)
      .single()

    if (!subscription || subscription.status !== 'paused') {
      throw new Error('Solo se pueden reactivar suscripciones pausadas')
    }

    // Calculate new delivery date
    const nextDeliveryDate = calculateNextDeliveryDate(
      subscription.frequency as SubscriptionFrequency
    )

    // Update subscription status
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'active',
        current_period_end: nextDeliveryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al reactivar suscripción:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    await verifySubscriptionAccess(subscriptionId)
    const supabase = await createClient()

    // Verify subscription is not already cancelled
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('id', subscriptionId)
      .single()

    if (!subscription || subscription.status === 'cancelled') {
      throw new Error('Esta suscripción ya está cancelada')
    }

    // Update subscription status
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'cancelled',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al cancelar suscripción:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function changeSubscriptionPlan(
  subscriptionId: string, 
  newPlanId: string,
  newFrequency?: SubscriptionFrequency
) {
  try {
    await verifySubscriptionAccess(subscriptionId)
    const supabase = await createClient()

    // Verify new plan exists and is active
    const { data: newPlan } = await supabase
      .from('subscription_plans')
      .select('id, is_active')
      .eq('id', newPlanId)
      .single()

    if (!newPlan || !newPlan.is_active) {
      throw new Error('Plan no encontrado o inactivo')
    }

    // Get current subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status, frequency')
      .eq('id', subscriptionId)
      .single()

    if (!subscription || subscription.status === 'cancelled') {
      throw new Error('No se puede cambiar el plan de una suscripción cancelada')
    }

    // Calculate new delivery date if frequency changes
    const frequency = newFrequency || subscription.frequency
    const nextDeliveryDate = calculateNextDeliveryDate(
      frequency as SubscriptionFrequency
    )

    // Update subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        plan_id: newPlanId,
        frequency: newFrequency || subscription.frequency,
        current_period_end: nextDeliveryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error al cambiar plan:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function getSubscriptionHistory(subscriptionId: string) {
  try {
    await verifySubscriptionAccess(subscriptionId)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        status,
        updated_at,
        plan_id,
        subscription_plans (
          name
        )
      `)
      .eq('id', subscriptionId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener historial:', error)
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Para testing - crear suscripción sin pago
export async function createFakeSubscription(data: {
  planId: string
  frequency: 'weekly' | 'biweekly' | 'monthly'
  userId?: string // Admin puede crear para cualquier usuario
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/sign-in')
    
    // Verificar que el plan existe
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', data.planId)
      .single()
    
    if (!plan) return { error: 'Plan no encontrado' }
    
    // Usar userId proporcionado (admin) o usuario actual
    const targetUserId = data.userId || user.id
    
    // Calcular fechas
    const startDate = new Date()
    const nextDelivery = calculateNextDeliveryDate(data.frequency, startDate)
    const periodEnd = new Date(nextDelivery)
    
    // Crear suscripción fake
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: targetUserId,
        plan_id: data.planId,
        frequency: data.frequency,
        status: 'active',
        start_date: startDate.toISOString(),
        next_delivery_date: nextDelivery.toISOString(),
        current_period_end: periodEnd.toISOString(),
        total_paid: 0, // Fake - sin pago real
        mercadopago_subscription_id: `fake_${Date.now()}` // ID fake
      })
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/account')
    return { success: true, subscription }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Error desconocido' }
  }
}

export async function changeSubscriptionFrequency(
  subscriptionId: string, 
  newFrequency: 'weekly' | 'biweekly' | 'monthly'
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    // Verificar que la suscripción existe y pertenece al usuario
    const { data: subscription, error: findError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*)
      `)
      .eq('id', subscriptionId)
      .single()

    if (findError || !subscription) {
      return { success: false, error: 'Suscripción no encontrada' }
    }

    // Verificar permisos
    const isOwner = subscription.user_id === user.id
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!isOwner && !customer?.is_admin) {
      return { success: false, error: 'Sin permisos' }
    }

    // Verificar que está activa
    if (subscription.status !== 'active') {
      return { success: false, error: 'Solo se puede cambiar la frecuencia de suscripciones activas' }
    }

    // Verificar que la nueva frecuencia es diferente
    if (subscription.frequency === newFrequency) {
      return { success: false, error: 'La frecuencia seleccionada es la misma actual' }
    }

    // Calcular nueva fecha de próxima entrega basada en la nueva frecuencia
    const now = new Date()
    const nextDeliveryDate = calculateNextDeliveryDate(newFrequency, now)

    // Actualizar suscripción
    const { data: updated, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        frequency: newFrequency,
        next_delivery_date: nextDeliveryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select(`
        *,
        subscription_plan:subscription_plans(*)
      `)
      .single()

    if (updateError) throw updateError

    revalidatePath('/account')
    return { success: true, data: updated }

  } catch (error) {
    console.error('Error changing frequency:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function updateSubscriptionFrequency(subscriptionId: string, frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly') {
  try {
    const supabase = await createClient()

    // Obtener la suscripción actual y su plan
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*)
      `)
      .eq('id', subscriptionId)
      .single()

    if (subError) throw subError
    if (!subscription) throw new Error('Suscripción no encontrada')


    // Calcular la próxima fecha de entrega basada en la nueva frecuencia
    const { data: nextDate } = await supabase
      .rpc('calculate_next_delivery_date', {
        base_date: new Date().toISOString(),
        frequency: frequency
      })

    // Actualizar la suscripción
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        frequency: frequency,
        next_delivery_date: nextDate,
        // Otros campos que podrían necesitar actualización
      })
      .eq('id', subscriptionId)

    if (updateError) throw updateError

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error updating subscription frequency:', error)
    return { error: (error as Error).message }
  }
} 