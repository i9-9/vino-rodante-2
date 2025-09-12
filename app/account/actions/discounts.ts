"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Discount, DiscountFormData } from '../types/discount'

// Schema de validación para descuentos
const DiscountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().min(0, 'El valor debe ser positivo'),
  min_purchase_amount: z.number().min(0, 'El monto mínimo debe ser positivo'),
  max_discount_amount: z.number().min(0).nullable(),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin es requerida'),
  is_active: z.boolean(),
  usage_limit: z.number().min(1).nullable(),
  applies_to: z.enum(['all_products', 'category', 'specific_products']),
  target_value: z.string().min(1, 'El valor objetivo es requerido'),
  days_of_week: z.array(z.number().min(0).max(6)).default([])
}).refine((data) => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return startDate < endDate
}, {
  message: "La fecha de inicio debe ser anterior a la fecha de fin",
  path: ["end_date"]
}).refine((data) => {
  if (data.discount_type === 'percentage' && data.discount_value > 100) {
    return false
  }
  return true
}, {
  message: "El descuento porcentual no puede ser mayor al 100%",
  path: ["discount_value"]
})

export interface ActionResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('No autorizado')
  }

  const { data: customerData } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customerData?.is_admin) {
    throw new Error('No autorizado - Se requiere ser admin')
  }

  return user.id
}

// Obtener todos los descuentos
export async function getAllDiscounts(): Promise<ActionResponse> {
  try {
    await verifyAdmin()
    const supabase = await createClient()
    
    const { data: discounts, error } = await supabase
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { 
      success: true, 
      data: discounts 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al obtener descuentos' 
    }
  }
}

// Obtener descuento por ID
export async function getDiscountById(id: string): Promise<ActionResponse> {
  try {
    await verifyAdmin()
    const supabase = await createClient()
    
    const { data: discount, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { 
      success: true, 
      data: discount 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al obtener descuento' 
    }
  }
}

// Crear descuento
export async function createDiscount(formData: FormData): Promise<ActionResponse> {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    // Extraer datos del formulario
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      discount_type: formData.get('discount_type') as 'percentage' | 'fixed_amount',
      discount_value: Number(formData.get('discount_value')),
      min_purchase_amount: Number(formData.get('min_purchase_amount')) || 0,
      max_discount_amount: formData.get('max_discount_amount') ? Number(formData.get('max_discount_amount')) : null,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      is_active: formData.get('is_active') === 'on',
      usage_limit: formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null,
      applies_to: formData.get('applies_to') as 'all_products' | 'category' | 'specific_products',
      target_value: formData.get('target_value') as string,
      days_of_week: formData.get('days_of_week') ? JSON.parse(formData.get('days_of_week') as string) : []
    }

    // Validar datos
    const validatedData = DiscountSchema.parse(rawData)

    // Crear descuento
    const { data, error } = await supabase
      .from('discounts')
      .insert(validatedData)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/account')
    return { success: true, data, message: 'Descuento creado correctamente' }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al crear descuento'
    }
  }
}

// Actualizar descuento
export async function updateDiscount(formData: FormData): Promise<ActionResponse> {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'ID de descuento requerido' }
    }

    // Extraer datos del formulario
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      discount_type: formData.get('discount_type') as 'percentage' | 'fixed_amount',
      discount_value: Number(formData.get('discount_value')),
      min_purchase_amount: Number(formData.get('min_purchase_amount')) || 0,
      max_discount_amount: formData.get('max_discount_amount') ? Number(formData.get('max_discount_amount')) : null,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      is_active: formData.get('is_active') === 'on',
      usage_limit: formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null,
      applies_to: formData.get('applies_to') as 'all_products' | 'category' | 'specific_products',
      target_value: formData.get('target_value') as string,
      days_of_week: formData.get('days_of_week') ? JSON.parse(formData.get('days_of_week') as string) : []
    }

    // Validar datos
    const validatedData = DiscountSchema.parse(rawData)

    // Actualizar descuento
    const { error } = await supabase
      .from('discounts')
      .update(validatedData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/account')
    return { success: true, message: 'Descuento actualizado correctamente' }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al actualizar descuento'
    }
  }
}

// Eliminar descuento
export async function deleteDiscount(id: string): Promise<ActionResponse> {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/account')
    return { success: true, message: 'Descuento eliminado correctamente' }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al eliminar descuento'
    }
  }
}

// Toggle estado activo del descuento
export async function toggleDiscountActive(
  discountId: string, 
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await verifyAdmin()
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('discounts')
      .update({ is_active: isActive })
      .eq('id', discountId)

    if (error) throw error

    revalidatePath('/account')
    
    return { 
      success: true, 
      message: `Descuento ${isActive ? 'activado' : 'desactivado'} correctamente` 
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al cambiar estado del descuento' 
    }
  }
}

// Obtener descuentos activos para un producto específico
export async function getActiveDiscountsForProduct(productId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const currentDate = new Date()
    const currentDayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Obtener información del producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('category')
      .eq('id', productId)
      .single()

    if (productError) throw productError

    // Buscar descuentos que apliquen al producto con validación de días de la semana
    const { data: discounts, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', currentDate.toISOString())
      .lte('start_date', currentDate.toISOString())
      .or(`applies_to.eq.all_products,and(applies_to.eq.category,target_value.eq.${product.category}),and(applies_to.eq.specific_products,target_value.cs.["${productId}"])`)

    if (error) throw error

    // Filtrar descuentos que aplican al día actual
    const validDiscounts = discounts?.filter(discount => {
      // Si no tiene restricciones de días, aplicar siempre
      if (!discount.days_of_week || discount.days_of_week.length === 0) {
        return true
      }
      
      // Verificar si el día actual está en los días permitidos
      return discount.days_of_week.includes(currentDayOfWeek)
    }) || []

    // Limpiar la estructura de datos para que coincida con el tipo Discount esperado
    const cleanedDiscounts = validDiscounts.map(discount => ({
      id: discount.id,
      name: discount.name,
      description: discount.description,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_purchase_amount: discount.min_purchase_amount,
      max_discount_amount: discount.max_discount_amount,
      start_date: discount.start_date,
      end_date: discount.end_date,
      is_active: discount.is_active,
      usage_limit: discount.usage_limit,
      used_count: discount.used_count,
      applies_to: discount.applies_to,
      target_value: discount.target_value,
      days_of_week: discount.days_of_week || [],
      created_at: discount.created_at,
      updated_at: discount.updated_at
    }))

    return { 
      success: true, 
      data: cleanedDiscounts 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al obtener descuentos del producto' 
    }
  }
}

// Obtener productos con descuentos aplicados
export async function getProductsWithDiscounts(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // Obtener todos los productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (productsError) throw productsError

    // Obtener descuentos activos
    const { data: discounts, error: discountsError } = await supabase
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString())

    if (discountsError) throw discountsError

    // Aplicar descuentos a los productos
    const productsWithDiscounts = products?.map(product => {
      const applicableDiscounts = discounts?.filter(discount => {
        if (discount.applies_to === 'all_products') return true
        if (discount.applies_to === 'category' && discount.target_value === product.category) return true
        if (discount.applies_to === 'specific_products') {
          const targetProducts = JSON.parse(discount.target_value)
          return targetProducts.includes(product.id)
        }
        return false
      }) || []

      // Aplicar el mejor descuento (mayor ahorro)
      let bestDiscount = null
      let bestSavings = 0

      applicableDiscounts.forEach(discount => {
        let discountAmount = 0
        if (discount.discount_type === 'percentage') {
          discountAmount = (product.price * discount.discount_value) / 100
        } else {
          discountAmount = discount.discount_value
        }

        // Aplicar límite máximo de descuento si existe
        if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
          discountAmount = discount.max_discount_amount
        }

        if (discountAmount > bestSavings) {
          bestSavings = discountAmount
          bestDiscount = {
            id: discount.id,
            name: discount.name,
            discount_type: discount.discount_type,
            discount_value: discount.discount_value,
            final_price: product.price - discountAmount,
            savings: discountAmount
          }
        }
      })

      return {
        ...product,
        discount: bestDiscount
      }
    }) || []

    return { 
      success: true, 
      data: productsWithDiscounts 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al obtener productos con descuentos' 
    }
  }
}
