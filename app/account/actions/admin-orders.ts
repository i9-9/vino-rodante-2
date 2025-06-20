'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total: number
  created_at: string
  order_items: OrderItem[]
}

export async function getAllOrders() {
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

  return supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        order_id,
        product_id,
        product_name,
        price,
        quantity
      )
    `)
    .order('created_at', { ascending: false })
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
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
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    throw new Error(`Error al actualizar estado del pedido: ${error.message}`)
  }

  revalidatePath('/account')
} 