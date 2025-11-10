'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse } from '../types'
import { validateOrderStatus } from '../utils/validation'
import { verifyAdmin } from '@/lib/admin-utils'
import { successResponse, errorResponse, handleActionError } from '@/lib/types/action-response'

// verifyAdmin ahora se importa de @/lib/admin-utils

export async function updateOrderStatus(
  orderId: string, 
  status: string
): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // Validar status
    if (!validateOrderStatus(status)) {
      return errorResponse('Estado de orden inválido')
    }

    // Actualizar estado de la orden
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/account')
    
    return successResponse({ orderId, status }, 'Estado de orden actualizado correctamente')

  } catch (error) {
    return handleActionError(error, 'Error al actualizar estado de orden')
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
        return errorResponse('No autorizado')
      }
    }

    // Obtener órdenes con items y productos
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers ( id, name, email ),
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price,
          product:products (
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return successResponse(orders)

  } catch (error) {
    return handleActionError(error, 'Error al obtener órdenes')
  }
}

export async function getAllOrders(): Promise<ActionResponse> {
  try {
    // Verificar permisos de admin
    await verifyAdmin()
    const supabase = await createClient()
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers ( id, name, email ),
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price,
          product:products (
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

    return successResponse(orders)

  } catch (error) {
    return handleActionError(error, 'Error al obtener órdenes')
  }
}

export async function getOrderDetails(orderId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return errorResponse('No autorizado')
    }

    // Obtener orden con todos los detalles
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

    // Verificar que el usuario puede ver esta orden
    if (order.user_id !== user.id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!customer?.is_admin) {
        return errorResponse('No autorizado')
      }
    }

    return successResponse(order)

  } catch (error) {
    return handleActionError(error, 'Error al obtener detalles de orden')
  }
}