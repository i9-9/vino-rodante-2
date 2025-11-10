/**
 * Utilidades centralizadas para verificación de permisos de administrador
 * 
 * Este módulo centraliza toda la lógica de verificación de permisos admin
 * para evitar duplicación y asegurar consistencia en toda la aplicación.
 */

import { createClient } from '@/utils/supabase/server'

export interface AdminVerificationResult {
  success: boolean
  userId?: string
  error?: string
}

/**
 * Verifica si el usuario actual es administrador
 * 
 * @returns Promise con el resultado de la verificación
 * @throws Error si no está autorizado (para uso en server actions)
 */
export async function verifyAdmin(): Promise<string> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (customerError) {
    throw new Error(`Error al verificar permisos: ${customerError.message}`)
  }

  if (!customerData?.is_admin) {
    throw new Error('No autorizado - Se requiere ser admin')
  }

  return user.id
}

/**
 * Verifica si el usuario actual es administrador (versión no-throwing)
 * Útil para componentes que necesitan manejar el error de forma diferente
 * 
 * @returns Promise con el resultado de la verificación
 */
export async function checkAdminStatus(): Promise<AdminVerificationResult> {
  try {
    const userId = await verifyAdmin()
    return { success: true, userId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtiene información completa del usuario admin
 * 
 * @returns Información del usuario admin o null si no es admin
 */
export async function getAdminUser() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return null
  }

  const { data: customerData } = await supabase
    .from('customers')
    .select('id, email, name, is_admin')
    .eq('id', user.id)
    .single()

  if (!customerData?.is_admin) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: customerData.name,
    isAdmin: true
  }
}


