'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse } from '../types'
import type { Database } from '@/lib/database.types'
import { isValidEmail } from '../utils/validation'


type CustomerUpdate = Omit<Database['public']['Tables']['customers']['Update'], 'is_admin'>

export async function updateProfile(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    // 2. Extraer y validar campos
    const updates: CustomerUpdate = {}
    
    const name = formData.get('name')?.toString().trim()
    if (name && name.length >= 2) {
      updates.name = name
    }

    const email = formData.get('email')?.toString().trim()
    if (email && isValidEmail(email)) {
      updates.email = email
    }

    // 3. Verificar que hay cambios
    if (Object.keys(updates).length === 0) {
      return { success: false, error: 'No hay cambios para guardar' }
    }

    // 4. Actualizar perfil en Supabase Auth si el email cambió
    if (updates.email && updates.email !== user.email) {
      const { error: updateAuthError } = await supabase.auth.updateUser({
        email: updates.email
      })

      if (updateAuthError) {
        return { 
          success: false, 
          error: 'Error al actualizar email' 
        }
      }
    }

    // 5. Actualizar perfil en la tabla customers
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Perfil actualizado correctamente',
      data: updates
    }

  } catch (error) {
    console.error('Error updating profile:', error)
    return { 
      success: false, 
      error: 'Error al actualizar perfil' 
    }
  }
}

export async function getProfile(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    // 2. Obtener datos del perfil
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return { 
      success: true, 
      data: customer 
    }

  } catch (error) {
    console.error('Error getting profile:', error)
    return { 
      success: false, 
      error: 'Error al obtener perfil' 
    }
  }
} 