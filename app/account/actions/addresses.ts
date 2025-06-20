'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionResponse } from '../types'
import type { Database } from '@/lib/database.types'
import { validateAddress } from '../utils/validation'
import { supabaseCache } from '@/lib/supabase/cache'

type Address = Database['public']['Tables']['addresses']['Row']
type AddressInsert = Database['public']['Tables']['addresses']['Insert']

export async function createAddress(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()
  
  // 1. Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'No autorizado' }
  }

  // 2. Extraer campos
  const address: AddressInsert = {
    customer_id: user.id,
    line1: formData.get('line1')?.toString().trim() || '',
    line2: formData.get('line2')?.toString().trim() || undefined,
    city: formData.get('city')?.toString().trim() || '',
    state: formData.get('state')?.toString().trim() || '',
    postal_code: formData.get('postal_code')?.toString().trim() || '',
    country: formData.get('country')?.toString().trim() || '',
    is_default: formData.get('is_default') === 'on'
  }

  // 3. Validar campos requeridos
  if (!address.line1 || !address.city || !address.state || !address.postal_code || !address.country) {
    return { 
      success: false, 
      error: 'Todos los campos son requeridos excepto línea 2' 
    }
  }

  try {
    // 4. Si es dirección predeterminada, actualizar otras direcciones
    if (address.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)
    }

    // 5. Crear dirección
    const { error } = await supabase
      .from('addresses')
      .insert([address])

    if (error) throw error

    // 6. Invalidar caché y revalidar página
    supabaseCache.invalidate(`addresses-${user.id}`)
    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Dirección creada correctamente' 
    }

  } catch (error) {
    console.error('Error creating address:', error)
    return { 
      success: false, 
      error: 'Error al crear dirección' 
    }
  }
}

export async function updateAddress(
  addressId: string, 
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient()
  
  // 1. Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'No autorizado' }
  }

  // 2. Verificar que la dirección pertenece al usuario
  const { data: existingAddress } = await supabase
    .from('addresses')
    .select('customer_id')
    .eq('id', addressId)
    .single()

  if (!existingAddress || existingAddress.customer_id !== user.id) {
    return { success: false, error: 'No autorizado' }
  }

  // 3. Extraer campos
  const updates: Partial<Address> = {
    line1: formData.get('line1')?.toString().trim(),
    line2: formData.get('line2')?.toString().trim() || undefined,
    city: formData.get('city')?.toString().trim(),
    state: formData.get('state')?.toString().trim(),
    postal_code: formData.get('postal_code')?.toString().trim(),
    country: formData.get('country')?.toString().trim(),
    is_default: formData.get('is_default') === 'on'
  }

  // 4. Validar campos requeridos
  if (!updates.line1 || !updates.city || !updates.state || !updates.postal_code || !updates.country) {
    return { 
      success: false, 
      error: 'Todos los campos son requeridos excepto línea 2' 
    }
  }

  try {
    // 5. Si es dirección predeterminada, actualizar otras direcciones
    if (updates.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)
    }

    // 6. Actualizar dirección
    const { error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)

    if (error) throw error

    // 7. Invalidar caché y revalidar página
    supabaseCache.invalidate(`addresses-${user.id}`)
    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Dirección actualizada correctamente' 
    }

  } catch (error) {
    console.error('Error updating address:', error)
    return { 
      success: false, 
      error: 'Error al actualizar dirección' 
    }
  }
}

export async function setDefaultAddress(addressId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    // 2. Verificar que la dirección pertenece al usuario
    const { data: address } = await supabase
      .from('addresses')
      .select('customer_id')
      .eq('id', addressId)
      .single()

    if (!address || address.customer_id !== user.id) {
      return { success: false, error: 'No autorizado' }
    }

    // 3. Actualizar todas las direcciones del usuario
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('customer_id', user.id)

    // 4. Establecer la dirección seleccionada como predeterminada
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)

    if (error) throw error

    // 5. Invalidar caché y revalidar página
    supabaseCache.invalidate(`addresses-${user.id}`)
    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Dirección predeterminada actualizada correctamente' 
    }

  } catch (error) {
    console.error('Error setting default address:', error)
    return { 
      success: false, 
      error: 'Error al establecer dirección predeterminada' 
    }
  }
}

export async function deleteAddress(addressId: string): Promise<ActionResponse> {
  const supabase = await createClient()
  
  // 1. Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'No autorizado' }
  }

  // 2. Verificar que la dirección pertenece al usuario
  const { data: address } = await supabase
    .from('addresses')
    .select('customer_id, is_default')
    .eq('id', addressId)
    .single()

  if (!address || address.customer_id !== user.id) {
    return { success: false, error: 'No autorizado' }
  }

  // 3. No permitir eliminar la única dirección predeterminada
  if (address.is_default) {
    const { count } = await supabase
      .from('addresses')
      .select('id', { count: 'exact' })
      .eq('customer_id', user.id)

    if (count === 1) {
      return { 
        success: false, 
        error: 'No se puede eliminar la única dirección' 
      }
    }
  }

  try {
    // 4. Eliminar dirección
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)

    if (error) throw error

    // 5. Invalidar caché y revalidar página
    supabaseCache.invalidate(`addresses-${user.id}`)
    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Dirección eliminada correctamente' 
    }

  } catch (error) {
    console.error('Error deleting address:', error)
    return { 
      success: false, 
      error: 'Error al eliminar dirección' 
    }
  }
} 