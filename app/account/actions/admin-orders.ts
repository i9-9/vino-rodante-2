'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail, renderCustomerOrderEmail } from '@/lib/emails/resend'
import type { OrderStatus } from '../types'
import { verifyAdmin } from '@/lib/admin-utils'
import type { ActionResponse } from '@/lib/types/action-response'
import { successResponse, errorResponse, handleActionError } from '@/lib/types/action-response'
import { logAdminAction } from '@/lib/admin-logger'

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

// verifyAdmin ahora se importa de @/lib/admin-utils

export async function getAllOrders(): Promise<ActionResponse> {
  try {
    // Verificar permisos de admin
    await verifyAdmin()
    const supabase = await createClient()

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

    if (error) throw error

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

    return successResponse(transformedOrders)

  } catch (error) {
    return handleActionError(error, 'Error al obtener órdenes')
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
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
    
    // Notify customer via email
    try {
      const { data: order } = await supabase
        .from('orders')
        .select(`id, total, user_id, order_items (quantity, price, products (name))`)
        .eq('id', orderId)
        .single()

      const { data: customer } = await supabase
        .from('customers')
        .select('name, email')
        .eq('id', order?.user_id)
        .single()

      if (customer?.email && order) {
        const items = (order.order_items || []).map((it: unknown) => ({
          name: (it as { products?: { name?: string } })?.products?.name || 'Producto',
          quantity: (it as { quantity: number }).quantity,
          price: (it as { price: number }).price * (it as { quantity: number }).quantity,
        }))
        const subtotal = items.reduce((s: number, it: unknown) => s + (it as { price: number }).price, 0)
        const shipping = Math.max(0, order.total - subtotal)
        
        const html = renderCustomerOrderEmail({
          customerName: customer.name || 'Cliente',
          orderId,
          subtotal,
          shipping,
          total: order.total,
          items,
          customerEmail: customer.email,
        })

        await sendEmail({ 
          to: customer.email, 
          subject: `Vino Rodante · Pedido ${newStatus} #${orderId.slice(-8)}`, 
          html 
        })
      }
    } catch (notifyError) {
      console.error('Error sending status update email:', notifyError)
    }
    
    // Log de acción exitosa
    if (userId) {
      logAdminAction.orderStatusUpdated(userId, orderId, newStatus)
    }
    
    return successResponse({ orderId, status: newStatus }, `Estado de orden actualizado a ${newStatus}`)
  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'updateOrderStatus', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al actualizar estado de la orden')
  }
}

export async function getOrderById(orderId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return errorResponse('No autorizado')
    }

    // Verificar permisos
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    // Obtener orden con todos los detalles
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

    // Verificar que el usuario puede ver esta orden
    if (!customer?.is_admin && data.user_id !== user.id) {
      return errorResponse('No autorizado para ver este pedido')
    }

    return successResponse(data)
  } catch (error) {
    return handleActionError(error, 'Error al obtener orden')
  }
}

export async function deleteOrder(orderId: string): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    userId = await verifyAdmin()
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/account')
    
    // Log de acción exitosa
    if (userId) {
      logAdminAction.orderDeleted(userId, orderId)
    }
    
    return successResponse(undefined, 'Orden eliminada correctamente')
  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'deleteOrder', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al eliminar orden')
  }
}

export async function addOrderNotes(orderId: string, notes: string): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    userId = await verifyAdmin()
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
    
    // Log de acción exitosa
    if (userId) {
      logAdminAction.orderNotesAdded(userId, orderId)
    }
    
    return successResponse({ orderId, notes }, 'Notas agregadas correctamente')
  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'addOrderNotes', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al agregar notas a la orden')
  }
} 