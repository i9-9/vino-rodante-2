import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import type { OrderItem } from '@/lib/types'
import { supabaseCache } from '@/lib/supabase/cache'
import { PostgrestError } from '@supabase/supabase-js'

export async function getProfile(userId: string) {
  return supabaseCache.get(
    `profile-${userId}`,
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('customers')
        .select('name')
        .eq('id', userId)
        .single()
      return { data, error }
    },
    10 * 60 * 1000 // 10 minutos para el perfil
  )
}

export async function getOrders(userId: string) {
  return supabaseCache.get(
    `orders-${userId}`,
    async () => {
      const supabase = createClient()
      try {
        // 1. Primero obtenemos las órdenes básicas
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, status, total, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (ordersError) throw ordersError
        if (!orders?.length) return { data: [], error: null }

        // 2. Obtenemos los items de las órdenes en una sola consulta
        const orderIds = orders.map(order => order.id)
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('id, order_id, product_id, quantity, price')
          .in('order_id', orderIds)

        if (itemsError) throw itemsError

        // 3. Obtenemos los nombres de los productos en una sola consulta
        const productIds = [...new Set(orderItems?.map(item => item.product_id) || [])]
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds)

        if (productsError) throw productsError

        // 4. Construimos el resultado final
        const productMap = new Map(products?.map(p => [p.id, p.name]) || [])
        const itemsByOrder = new Map()
        
        orderItems?.forEach(item => {
          if (!itemsByOrder.has(item.order_id)) {
            itemsByOrder.set(item.order_id, [])
          }
          itemsByOrder.get(item.order_id).push({
            ...item,
            product_name: productMap.get(item.product_id)
          })
        })

        const transformedData = orders.map(order => ({
          ...order,
          order_items: itemsByOrder.get(order.id) || []
        }))

        return { data: transformedData, error: null }
      } catch (err) {
        console.error('Error in getOrders:', err)
        return { data: null, error: err as PostgrestError }
      }
    },
    2 * 60 * 1000 // 2 minutos para las órdenes
  )
}

export async function getAddresses(userId: string) {
  return supabaseCache.get(
    `addresses-${userId}`,
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', userId)
      return { data, error }
    },
    10 * 60 * 1000 // 10 minutos para las direcciones
  )
}

export async function addAddress(userId: string, address: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('addresses')
    .insert([{ ...address, customer_id: userId }])
    .select()
  
  // Invalidamos el cache de direcciones
  supabaseCache.invalidate(`addresses-${userId}`)
  
  return { data, error }
}

export async function deleteAddress(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
  
  // Invalidamos el cache de direcciones
  // Nota: necesitaríamos el userId para invalidar el cache específico
  // Por ahora invalidamos todo el cache de direcciones
  supabaseCache.clear()
  
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
  
  // Invalidamos el cache de direcciones
  supabaseCache.invalidate(`addresses-${userId}`)
  
  return { error }
} 