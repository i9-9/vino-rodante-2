import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import type { OrderItem } from '@/lib/types'

export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('name')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function getOrders(userId: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform the data to match our Order type
    const transformedData = data?.map(order => ({
      ...order,
      order_items: order.order_items?.map((item: any) => ({
        ...item,
        product_name: item.products?.name
      }))
    }))

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Error in getOrders:', err)
    return { data: null, error: err }
  }
}

export async function getAddresses(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('customer_id', userId)
  return { data, error }
}

export async function addAddress(userId: string, address: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('addresses')
    .insert([{ ...address, customer_id: userId }])
    .select()
  return { data, error }
}

export async function deleteAddress(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
  return { error }
}

export async function setDefaultAddress(userId: string, id: string) {
  const supabase = createClient()
  // Primero, desmarcar todas las direcciones como default
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('customer_id', userId)
  // Luego, marcar la seleccionada como default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
  return { error }
} 