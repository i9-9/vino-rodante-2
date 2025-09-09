'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionResponse } from '../types'
import type { Database } from '@/lib/database.types'

type AddressUpdate = Database['public']['Tables']['addresses']['Update']

const addressSchema = z.object({
  line1: z.string().min(1, 'La calle y número son requeridos'),
  line2: z.string().optional(),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'La provincia es requerida'),
  postal_code: z.string().min(1, 'El código postal es requerido'),
  country: z.string().min(1, 'El país es requerido'),
  is_default: z.boolean().optional()
})

// Esquemas de validación individuales para updates parciales
const addressFieldValidators = {
  line1: z.string().min(1, 'La calle y número son requeridos'),
  line2: z.string().nullable().optional(),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'La provincia es requerida'),
  postal_code: z.string().min(1, 'El código postal es requerido'),
  is_default: z.boolean().optional()
} as const

type AddressField = keyof typeof addressFieldValidators

// Función auxiliar para validar campos individuales
const validateField = (field: AddressField, value: unknown): { success: boolean; value?: unknown; error?: string } => {
  try {
    const validator = addressFieldValidators[field]
    const validatedValue = validator.parse(value)
    return { success: true, value: validatedValue }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Error de validación' }
  }
}

export async function createAddress(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      redirect('/auth/sign-in')
    }

    const rawData = {
      line1: formData.get('line1')?.toString().trim(),
      line2: formData.get('line2')?.toString().trim() || '',
      city: formData.get('city')?.toString().trim(),
      state: formData.get('state')?.toString().trim(),
      postal_code: formData.get('postal_code')?.toString().trim(),
      country: 'Argentina',
      is_default: formData.get('is_default') === 'true'
    }

    const validatedData = addressSchema.parse(rawData)

    // Verificar si ya existe una dirección idéntica
    const { data: existingAddresses } = await supabase
      .from('addresses')
      .select('id')
      .eq('customer_id', user.id)
      .eq('line1', validatedData.line1)
      .eq('city', validatedData.city)
      .eq('state', validatedData.state)
      .eq('postal_code', validatedData.postal_code)

    if (existingAddresses && existingAddresses.length > 0) {
      return { success: false, error: 'Ya existe una dirección idéntica' }
    }

    const { error: insertError } = await supabase
      .from('addresses')
      .insert({
        ...validatedData,
        customer_id: user.id
      })

    if (insertError) throw insertError

    if (validatedData.is_default) {
      await setOtherAddressesAsNonDefault(supabase, user.id, null)
    }

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error creating address:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la dirección' }
  }
}

export async function updateAddress(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // 1. Autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) redirect('/auth/sign-in')

    const addressId = formData.get('id')?.toString()
    if (!addressId) return { success: false, error: 'ID de dirección no proporcionado' }

    // Debug logs
    console.log('UpdateAddress - FormData received:', Object.fromEntries(formData))
    console.log('UpdateAddress - Address ID:', addressId)
    console.log('UpdateAddress - User ID:', user.id)

    // 2. Verificar propiedad y obtener dirección existente
    const { data: existingAddress, error: fetchError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('customer_id', user.id)
      .single()

    if (fetchError || !existingAddress) {
      console.error('Error fetching existing address:', fetchError)
      return { 
        success: false, 
        error: 'No se encontró la dirección o no tienes permiso para editarla'
      }
    }

    console.log('UpdateAddress - Existing address:', existingAddress)

    // 3. Procesar y validar datos campo por campo
    const updateData: Partial<AddressUpdate> = {}
    const formFields: AddressField[] = ['line1', 'line2', 'city', 'state', 'postal_code', 'is_default']
    
    for (const field of formFields) {
      const formValue = formData.get(field)
      
      // Solo procesar campos que vienen en el FormData
      if (formValue !== null) {
        let valueToValidate: unknown = formValue

        // Manejo especial para is_default
        if (field === 'is_default') {
          valueToValidate = formValue === 'true'
        } 
        // Manejo especial para line2
        else if (field === 'line2') {
          valueToValidate = formValue.toString().trim() || null
        }
        // Otros campos
        else {
          valueToValidate = formValue.toString().trim()
        }

        // Solo validar y actualizar si el valor es diferente al existente
        if (valueToValidate !== (existingAddress[field] as unknown)) {
          const validation = validateField(field, valueToValidate)
          if (!validation.success) {
            return { success: false, error: `Error en ${field}: ${validation.error}` }
          }
          (updateData as Record<string, unknown>)[field] = validation.value
        }
      }
    }

    console.log('UpdateAddress - Data to update:', updateData)

    // 4. Si no hay cambios, retornar éxito temprano
    if (Object.keys(updateData).length === 0) {
      return { success: true, message: 'No hay cambios para actualizar' }
    }

    // 5. Actualizar dirección
    const { error: updateError } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', addressId)
      .eq('customer_id', user.id)

    if (updateError) {
      console.error('Error updating address:', updateError)
      throw updateError
    }

    console.log('UpdateAddress - Update successful')

    // 6. Manejar dirección predeterminada si cambió
    if ('is_default' in updateData && updateData.is_default === true) {
      await setOtherAddressesAsNonDefault(supabase, user.id, addressId)
    }

    // 7. Revalidar y retornar
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error in updateAddress:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al actualizar la dirección'
    }
  }
}

async function setOtherAddressesAsNonDefault(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  excludeId: string | null
) {
  const query = supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('customer_id', userId)

  if (excludeId) {
    query.neq('id', excludeId)
  }

  await query
}

export async function deleteAddress(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // 1. Autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) redirect('/auth/sign-in')

    const addressId = formData.get('id')?.toString()
    if (!addressId) return { success: false, error: 'ID de dirección no proporcionado' }

    // 2. Eliminar dirección
    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('customer_id', user.id)

    if (deleteError) throw deleteError

    // 3. Revalidar y retornar
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error deleting address:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar la dirección' }
  }
}

export async function setDefaultAddress(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // 1. Autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) redirect('/auth/sign-in')

    const addressId = formData.get('id')?.toString()
    if (!addressId) return { success: false, error: 'ID de dirección no proporcionado' }

    // 2. Actualizar dirección como predeterminada
    const { error: updateError } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('customer_id', user.id)

    if (updateError) throw updateError

    // 3. Actualizar otras direcciones como no predeterminadas
    await setOtherAddressesAsNonDefault(supabase, user.id, addressId)

    // 4. Revalidar y retornar
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error setting default address:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al establecer dirección predeterminada' }
  }
} 