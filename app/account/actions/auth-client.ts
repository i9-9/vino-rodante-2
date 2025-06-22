import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import type { OrderItem } from '@/lib/types'
import { supabaseCache } from '@/lib/supabase/cache'
import { PostgrestError } from '@supabase/supabase-js'

// Helper function to serialize dates
function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'function') return undefined;
    if (value === undefined) return null;
    return value;
  }));
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('name')
    .eq('id', userId)
    .single()
  return { data: data ? serializeData(data) : null, error }
}

export async function getOrders(userId: string) {
  const supabase = await createClient()
  try {
    console.log('Fetching orders for user:', userId)
    
    // 1. Primero intentemos obtener solo las órdenes básicas
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)

    if (ordersError) {
      console.error('Error fetching orders:', {
        error: ordersError,
        errorMessage: ordersError.message,
        errorDetails: ordersError.details,
        errorHint: ordersError.hint,
        userId
      })
      throw ordersError
    }

    console.log('Basic orders query result:', {
      ordersCount: orders?.length || 0,
      orders,
      userId
    })

    // 2. Si eso funciona, intentemos obtener los items
    const { data: ordersWithItems, error: itemsError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products:product_id (*)
        )
      `)
      .eq('user_id', userId)

    if (itemsError) {
      console.error('Error fetching orders with items:', {
        error: itemsError,
        errorMessage: itemsError.message,
        errorDetails: itemsError.details,
        errorHint: itemsError.hint,
        userId
      })
      throw itemsError
    }

    console.log('Orders with items query result:', {
      ordersCount: ordersWithItems?.length || 0,
      firstOrder: ordersWithItems?.[0],
      userId
    })

    if (!ordersWithItems?.length) return { data: [], error: null }

    // 3. Transformar los datos
    const transformedData = ordersWithItems.map(order => {
      try {
        return {
          id: order.id,
          user_id: order.user_id,
          status: order.status,
          payment_status: order.payment_status,
          total: order.total,
          created_at: order.created_at ? new Date(order.created_at).toISOString() : null,
          notes: order.notes,
          shipping_address: order.shipping_address_id ? {
            line1: '',
            city: '',
            state: '',
            postal_code: '',
            country: ''
          } : undefined,
          customer: {
            name: '',
            email: ''
          },
          order_items: (order.order_items || []).map(item => {
            try {
              return {
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                product_name: item.products?.name || 'Producto sin nombre',
                product_image: item.products?.image || '',
                product_description: item.products?.description || '',
                quantity: item.quantity,
                price: item.price
              }
            } catch (itemError) {
              console.error('Error transforming order item:', {
                error: itemError,
                item,
                orderId: order.id
              })
              throw itemError
            }
          })
        }
      } catch (orderError) {
        console.error('Error transforming order:', {
          error: orderError,
          order,
          userId
        })
        throw orderError
      }
    })

    console.log('Transformed orders data:', {
      transformedCount: transformedData.length,
      firstTransformed: transformedData[0],
      userId
    })

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Error in getOrders:', {
      error: err,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      errorStack: err instanceof Error ? err.stack : undefined,
      userId
    })
    return { data: null, error: err as PostgrestError }
  }
}

export async function getAddresses(userId: string) {
  return supabaseCache.get(
    `addresses-${userId}`,
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', userId)
      return { data: data ? serializeData(data) : null, error }
    },
    10 * 60 * 1000 // 10 minutos para las direcciones
  )
}

export async function addAddress(userId: string, address: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('addresses')
    .insert([{ ...serializeData(address), customer_id: userId }])
    .select()
  
  // Invalidamos el cache de direcciones
  supabaseCache.invalidate(`addresses-${userId}`)
  
  return { data: data ? serializeData(data) : null, error }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient()
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
  const supabase = await createClient()
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