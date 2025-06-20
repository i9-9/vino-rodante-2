'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse } from '../types'
import type { Database } from '@/lib/database.types'
import { validateOrderStatus } from '../utils/validation'

type Order = Database['public']['Tables']['orders']['Row']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

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

export async function updateOrderStatus(
  orderId: string, 
  status: string
): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Validar status
    if (!validateOrderStatus(status)) {
      return { 
        success: false, 
        error: 'Estado de orden inválido' 
      }
    }

    // 3. Actualizar estado de la orden
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Estado de orden actualizado correctamente' 
    }

  } catch (error) {
    console.error('Error updating order status:', error)
    return { 
      success: false, 
      error: 'Error al actualizar estado de orden' 
    }
  }
}

export async function getOrdersByUser(userId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    // 2. Verificar que el usuario solicita sus propias órdenes o es admin
    if (user.id !== userId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!customer?.is_admin) {
        return { success: false, error: 'No autorizado' }
      }
    }

    // 3. Obtener órdenes con items y productos
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            name,
            image
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { 
      success: true, 
      data: orders 
    }

  } catch (error) {
    console.error('Error getting orders:', error)
    return { 
      success: false, 
      error: 'Error al obtener órdenes' 
    }
  }
}

export async function getAllOrders(): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Obtener todas las órdenes con detalles
    const supabase = await createClient()
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (
          name,
          email
        ),
        order_items (
          *,
          product:products (
            name,
            image
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { 
      success: true, 
      data: orders 
    }

  } catch (error) {
    console.error('Error getting all orders:', error)
    return { 
      success: false, 
      error: 'Error al obtener órdenes' 
    }
  }
}

export async function getOrderDetails(orderId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // 1. Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    // 2. Obtener orden con todos los detalles
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (
          name,
          email
        ),
        order_items (
          *,
          product:products (
            name,
            description,
            image,
            price
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error

    // 3. Verificar que el usuario puede ver esta orden
    if (order.user_id !== user.id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!customer?.is_admin) {
        return { success: false, error: 'No autorizado' }
      }
    }

    return { 
      success: true, 
      data: order 
    }

  } catch (error) {
    console.error('Error getting order details:', error)
    return { 
      success: false, 
      error: 'Error al obtener detalles de orden' 
    }
  }
} 