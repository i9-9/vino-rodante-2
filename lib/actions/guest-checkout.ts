'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

interface CustomerInfo {
  name: string
  email: string
  phone?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export async function createOrUpdateGuestCustomer(customerInfo: CustomerInfo) {
  try {
    console.log('🔄 Creating/updating guest customer:', customerInfo.email)
    
    // Crear cliente de administrador para bypass RLS
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar cliente existente
    const { data: existingCustomer, error: findError } = await adminSupabase
      .from('customers')
      .select('id, name, email')
      .eq('email', customerInfo.email)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding existing customer:', findError)
      throw new Error(`Error al buscar cliente existente: ${findError.message}`)
    }

    let customerId: string

    if (existingCustomer) {
      // Cliente ya existe, usar su ID y actualizar datos si es necesario
      console.log('✅ Using existing customer:', existingCustomer.id)
      customerId = existingCustomer.id
      
      // Actualizar nombre si es diferente
      if (existingCustomer.name !== customerInfo.name) {
        const { error: updateError } = await adminSupabase
          .from('customers')
          .update({ name: customerInfo.name })
          .eq('id', customerId)
        
        if (updateError) {
          console.error('Error updating customer name:', updateError)
          throw new Error('Error al actualizar datos del cliente')
        } else {
          console.log('✅ Updated customer name')
        }
      }
    } else {
      // Cliente no existe, crear uno nuevo
      const guestCustomerId = uuidv4()
      
      const { data: customerData, error: customerError } = await adminSupabase
        .from('customers')
        .insert({
          id: guestCustomerId,
          name: customerInfo.name,
          email: customerInfo.email,
        })
        .select()
        .single()

      if (customerError) {
        console.error('Error creating guest customer:', customerError)
        throw new Error(`Error al crear el registro del cliente invitado: ${customerError.message}`)
      }

      customerId = customerData.id
      console.log('✅ New guest customer created successfully:', customerId)
    }

    // Manejar direcciones
    await handleGuestAddress(adminSupabase, customerId, customerInfo)

    return { success: true, customerId }
  } catch (error) {
    console.error('Error in createOrUpdateGuestCustomer:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

async function handleGuestAddress(
  adminSupabase: any, 
  customerId: string, 
  customerInfo: CustomerInfo
) {
  try {
    // Verificar si ya existe una dirección idéntica
    const { data: existingAddress, error: addressQueryError } = await adminSupabase
      .from('addresses')
      .select('id')
      .eq('customer_id', customerId)
      .eq('line1', customerInfo.address1)
      .eq('city', customerInfo.city)
      .eq('state', customerInfo.state)
      .eq('postal_code', customerInfo.postalCode)
      .single()

    if (addressQueryError && addressQueryError.code !== 'PGRST116') {
      console.error('Error checking existing address:', addressQueryError)
      // Continuar sin verificar dirección existente
    }

    if (existingAddress) {
      // Actualizar dirección existente
      const { error: addressError } = await adminSupabase
        .from('addresses')
        .update({
          line1: customerInfo.address1,
          line2: customerInfo.address2,
          city: customerInfo.city,
          state: customerInfo.state,
          postal_code: customerInfo.postalCode,
          country: customerInfo.country,
          is_default: true,
        })
        .eq('id', existingAddress.id)

      if (addressError) {
        console.error('Error updating address:', addressError)
        throw new Error('Error al actualizar dirección')
      }
    } else {
      // Crear nueva dirección
      const { error: addressError } = await adminSupabase.from("addresses").insert({
        customer_id: customerId,
        line1: customerInfo.address1,
        line2: customerInfo.address2,
        city: customerInfo.city,
        state: customerInfo.state,
        postal_code: customerInfo.postalCode,
        country: customerInfo.country,
        is_default: true,
      })

      if (addressError) {
        console.error('Error saving address:', addressError)
        throw new Error('Error al guardar dirección')
      }
    }

    // Asegurar que solo esta dirección sea la principal
    await adminSupabase
      .from('addresses')
      .update({ is_default: false })
      .eq('customer_id', customerId)
      .neq('line1', customerInfo.address1)

    // Marcar la dirección actual como principal
    await adminSupabase
      .from('addresses')
      .update({ is_default: true })
      .eq('customer_id', customerId)
      .eq('line1', customerInfo.address1)

    console.log('✅ Address handled successfully')
  } catch (error) {
    console.error('Error handling address:', error)
    throw error
  }
}
