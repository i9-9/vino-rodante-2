import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { supabaseCache } from '@/lib/supabase/cache'

// Helper function to serialize dates
function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'function') return undefined;
    if (value === undefined) return null;
    return value;
  }));
}

// Helper function to validate Supabase connection
async function validateSupabaseConnection(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    // Intentar una consulta simple para verificar la conexión
    const { error } = await supabase.from('orders').select('id').limit(1)
    if (error) {
      console.error('🚫 [DB Connection] Failed to validate connection:', {
        error,
        message: error.message,
        hint: error.hint,
        code: error.code
      })
      return { ok: false, error }
    }
    return { ok: true, error: null }
  } catch (err) {
    console.error('🚫 [DB Connection] Connection validation error:', {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error'
    })
    return { ok: false, error: err }
  }
}

// Helper function to format PostgrestError
function formatPostgrestError(error: PostgrestError): string {
  const parts = []
  if (error.message) parts.push(error.message)
  if (error.details) parts.push(`Details: ${error.details}`)
  if (error.hint) parts.push(`Hint: ${error.hint}`)
  if (error.code) parts.push(`Code: ${error.code}`)
  return parts.join(' | ')
}

// Tipos para la respuesta de la consulta de órdenes
type OrderItemWithProduct = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    category: string | null;
    year: string | null;
    region: string | null;
    varietal: string | null;
  } | null;
};



export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data: profileData, error } = await supabase
    .from('customers')
    .select('name')
    .eq('id', userId)
    .single()
  return { data: profileData ? serializeData(profileData) : null, error }
}

export async function getOrders(userId: string) {
  try {
    // Validación de entrada
    if (!userId) {
      console.error('🚫 [getOrders] Called without userId')
      return { 
        data: null, 
        error: new Error('User ID is required') 
      }
    }

    console.log('🔍 [getOrders] Starting to fetch orders for user:', userId)
    
    // Inicializar cliente de Supabase
    let supabase
    try {
      supabase = await createClient()
    } catch (initError) {
      console.error('🚫 [getOrders] Failed to initialize Supabase client:', {
        error: initError,
        message: initError instanceof Error ? initError.message : 'Unknown error'
      })
      return {
        data: null,
        error: new Error('Failed to initialize database connection')
      }
    }

    // Validar conexión a la base de datos
    const connectionStatus = await validateSupabaseConnection(supabase)
    if (!connectionStatus.ok) {
      return {
        data: null,
        error: new Error('Database connection error: ' + 
          (connectionStatus.error instanceof Error ? 
            connectionStatus.error.message : 
            'Could not establish database connection'))
      }
    }
    
    // Verificar que el usuario existe y tiene acceso
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('🚫 [getOrders] Auth error:', {
        error: userError,
        userId,
        message: userError.message
      })
      return { 
        data: null, 
        error: new Error('Authentication error: ' + userError.message)
      }
    }

    if (!user) {
      console.error('🚫 [getOrders] No authenticated user found')
      return { 
        data: null, 
        error: new Error('No authenticated user found')
      }
    }

    // Obtener órdenes con todos los detalles necesarios
    console.log('📦 [getOrders] Executing query for orders...')
    
    const query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers!orders_user_id_fkey (
          id,
          name,
          email
        ),
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price,
          product:products!order_items_product_id_fkey (
            id,
            name,
            description,
            image,
            price,
            category,
            year,
            region,
            varietal
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    console.log('🔍 [getOrders] Query details:', {
      userId,
      tables: ['orders', 'customers', 'order_items', 'products']
    })

    const { data: ordersWithDetails, error: ordersError } = await query

    if (ordersError) {
      const formattedError = formatPostgrestError(ordersError)
      console.error('🚫 [getOrders] Database error:', {
        error: ordersError,
        userId,
        formattedError,
        tables: ['orders', 'customers', 'order_items', 'products']
      })
      return { 
        data: null, 
        error: new Error(`Database error: ${formattedError}`)
      }
    }

    if (!ordersWithDetails) {
      console.log('ℹ️ [getOrders] No orders found for user:', userId)
      return { data: [], error: null }
    }

    console.log('✅ [getOrders] Successfully fetched orders:', {
      count: ordersWithDetails.length,
      userId
    })

    // Transformar los datos
    try {
      const transformedData = ordersWithDetails.map(order => {
        return {
          id: order.id,
          user_id: order.user_id,
          status: order.status,
          total: order.total,
          created_at: order.created_at ? new Date(order.created_at).toISOString() : null,
          customer: order.customer ? {
            name: order.customer.name,
            email: order.customer.email
          } : undefined,
          order_items: (order.order_items || []).map((item: OrderItemWithProduct) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product: item.product ? {
              name: item.product.name,
              description: item.product.description,
              image: item.product.image,
              price: item.product.price,
              varietal: item.product.varietal,
              year: item.product.year
            } : null,
            quantity: item.quantity,
            price: item.price
          }))
        }
      })

      console.log('✅ [getOrders] Successfully transformed data:', {
        count: transformedData.length,
        userId
      })

      return { data: transformedData, error: null }
    } catch (transformError) {
      console.error('🚫 [getOrders] Error transforming data:', {
        error: transformError,
        userId,
        message: transformError instanceof Error ? transformError.message : 'Unknown error'
      })
      return { 
        data: null, 
        error: new Error('Error transforming order data: ' + 
          (transformError instanceof Error ? transformError.message : 'Unknown error'))
      }
    }
  } catch (err) {
    // Error general no manejado
    console.error('🚫 [getOrders] Unhandled error:', {
      error: err,
      userId,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    })
    return { 
      data: null, 
      error: new Error('Unhandled error in getOrders: ' + 
        (err instanceof Error ? err.message : 'Unknown error'))
    }
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

export async function addAddress(userId: string, address: Record<string, unknown>) {
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

  // Luego, marcar la dirección seleccionada como default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('customer_id', userId)
  
  // Invalidamos el cache de direcciones
  supabaseCache.invalidate(`addresses-${userId}`)
  
  return { error }
} 