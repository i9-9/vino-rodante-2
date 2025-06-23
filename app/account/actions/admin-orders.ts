'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OrderStatus } from '../types'

interface DbOrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    description: string | null
    image: string | null
    price: number
    varietal: string | null
    year: string | null
    region: string | null
  } | null
}

interface RawOrderResponse {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  created_at: string
  shipping_address: {
    line1: string
    line2: string | null
    city: string
    state: string
    postal_code: string
    country: string
  } | null
  customer: {
    id: string
    name: string
    email: string
  } | null
  order_items: DbOrderItem[]
}

async function verifyAdmin() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customer?.is_admin) {
    throw new Error('No autorizado - Se requiere ser admin')
  }

  return user.id
}

export async function getAllOrders() {
  const supabase = await createClient()

  console.log('Fetching all orders as admin')

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.log('No user found or error:', userError)
    return { data: null, error: new Error('No autorizado') }
  }

  // Verificar si es admin
  const { data: customerData } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  console.log('Customer admin check:', customerData)

  if (!customerData?.is_admin) {
    console.log('User is not admin')
    return { data: null, error: new Error('No autorizado - Se requiere ser admin') }
  }

  console.log('Fetching orders with details')

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      status,
      total,
      created_at,
      shipping_address:addresses!shipping_address_id (
        line1,
        line2,
        city,
        state,
        postal_code,
        country
      ),
      customer:customers!user_id (
        id,
        name,
        email
      ),
      order_items (
        id,
        product_id,
        quantity,
        price,
        products (
          id,
          name,
          description,
          image,
          price,
          varietal,
          year,
          region
        )
      )
    `)
    .order('created_at', { ascending: false })

  console.log('Orders query result:', { data, error })

  if (error) {
    console.error('Error fetching orders:', error)
    return { data: null, error }
  }

  // Transformar los datos para que coincidan con la interfaz Order
  const transformedOrders = (data as unknown as RawOrderResponse[]).map((order) => ({
    id: order.id,
    user_id: order.user_id,
    status: order.status,
    total: order.total,
    created_at: order.created_at,
    shipping_address: order.shipping_address,
    customer: order.customer || { 
      id: order.user_id,
      name: 'Cliente no encontrado',
      email: 'No disponible'
    },
    order_items: order.order_items.map((item) => ({
      id: item.id,
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product: item.products || {
        id: item.product_id,
        name: 'Producto no encontrado',
        price: item.price
      }
    }))
  }))

  console.log('Transformed orders:', transformedOrders)

  return { data: transformedOrders, error: null }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Actualizar estado de la orden
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/account')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export async function getOrderById(orderId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('No autorizado') }
    }

    // 2. Verificar permisos
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    // 3. Obtener orden con todos los detalles
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        status,
        total,
        created_at,
        shipping_address:addresses!shipping_address_id (
          line1,
          line2,
          city,
          state,
          postal_code,
          country
        ),
        customer:customers!user_id (
          id,
          name,
          email
        ),
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            id,
            name,
            description,
            image,
            price,
            varietal,
            year,
            region
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error

    // 4. Verificar que el usuario puede ver esta orden
    if (!customer?.is_admin && data.user_id !== user.id) {
      return { data: null, error: new Error('No autorizado para ver este pedido') }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { data: null, error }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await verifyAdmin()
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/account')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}

export async function addOrderNotes(orderId: string, notes: string) {
  try {
    await verifyAdmin()
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/account')
    
    return { success: true }
  } catch (error) {
    console.error('Error adding order notes:', error)
    throw error
  }
} 