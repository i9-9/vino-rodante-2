'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface Subscription {
  id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'quarterly' | 'yearly'
  active: boolean
  created_at: string
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