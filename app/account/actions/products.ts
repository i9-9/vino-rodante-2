"use server"

import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { StorageError } from '@supabase/storage-js'
import type { Database } from '@/lib/database.types'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { ActionResponse } from '../types'

// Extender el tipo Product para incluir is_visible
type Product = Database['public']['Tables']['products']['Row'] & {
  is_visible: boolean
}

import {
  validateProduct,
  validatePrice,
  validateStock,
  isValidUrl,
  extractFormFields,
  hasChanges
} from '../utils/validation'

export async function addProduct(formData: FormData) {
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

  const product = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    category: formData.get('category') as string,
    stock: parseInt(formData.get('stock') as string),
    year: formData.get('year') as string,
    region: formData.get('region') as string,
    varietal: formData.get('varietal') as string,
    featured: formData.get('featured') === 'on',
    slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
    image: formData.get('image') as string || '/placeholder.jpg',
    is_visible: true
  }

  const { error } = await supabase
    .from('products')
    .insert(product)

  if (error) {
    throw new Error(`Error al agregar producto: ${error.message}`)
  }

  revalidatePath('/account')
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

export async function updateProduct(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Extraer y validar campos
    const productId = formData.get('id')?.toString()
    if (!productId) {
      return { success: false, error: 'ID de producto requerido' }
    }

    // 3. Extraer solo campos con valores válidos
    const updates: Partial<Product> = {}
    
    // Campos de texto
    const textFields = ['name', 'description', 'category', 'year', 'region', 'varietal'] as const
    for (const field of textFields) {
      const value = formData.get(field)?.toString().trim()
      if (value) {
        updates[field] = value
      }
    }
    
    // Campos numéricos
    const price = formData.get('price')?.toString()
    if (price && validatePrice(price)) {
      updates.price = parseFloat(price)
    }
    
    const stock = formData.get('stock')?.toString()
    if (stock && validateStock(stock)) {
      updates.stock = parseInt(stock, 10)
    }
    
    // URL de imagen
    const image = formData.get('image')?.toString().trim()
    if (image && isValidUrl(image)) {
      updates.image = image
    }
    
    // Booleanos
    const featured = formData.get('featured')
    if (featured !== null) {
      updates.featured = featured === 'on'
    }
    
    const visible = formData.get('is_visible')
    if (visible !== null) {
      updates.is_visible = visible === 'on'
    }

    // 4. Validar campos
    const errors = validateProduct(updates)
    if (Object.keys(errors).length > 0) {
      return { 
        success: false, 
        error: 'Errores de validación', 
        data: { errors } 
      }
    }

    // 5. Verificar que hay cambios
    if (!hasChanges(updates)) {
      return { success: false, error: 'No hay cambios para guardar' }
    }

    // 6. Actualizar solo campos modificados
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)

    if (error) throw error

    // 7. Revalidar solo la ruta necesaria
    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Producto actualizado correctamente',
      data: updates
    }

  } catch (error) {
    console.error('Error updating product:', error)
    return { 
      success: false, 
      error: 'Error al actualizar producto' 
    }
  }
}

export async function createProduct(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    const userId = await verifyAdmin()

    // 2. Extraer y validar todos los campos requeridos
    const requiredFields = ['name', 'price', 'stock'] as const
    const product: Partial<Product> = {
      created_at: new Date().toISOString(),
      featured: false,
      is_visible: true
    }

    // Extraer campos del formulario
    for (const field of requiredFields) {
      const value = formData.get(field)?.toString().trim()
      if (!value) {
        return { 
          success: false, 
          error: `El campo ${field} es requerido` 
        }
      }
      if (field === 'name') product.name = value
      if (field === 'price') product.price = parseFloat(value)
      if (field === 'stock') product.stock = parseInt(value, 10)
    }

    // Campos opcionales
    const optionalFields = ['description', 'category', 'year', 'region', 'varietal', 'image'] as const
    for (const field of optionalFields) {
      const value = formData.get(field)?.toString().trim()
      if (value) {
        product[field] = value
      }
    }

    // Generar slug
    if (product.name) {
      const slug = product.name.toLowerCase().replace(/\s+/g, '-')
      Object.assign(product, { slug })
    }

    // 3. Validar producto
    const errors = validateProduct(product)
    if (Object.keys(errors).length > 0) {
      return { 
        success: false, 
        error: 'Errores de validación', 
        data: { errors } 
      }
    }

    // 4. Crear producto
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .insert([product])

    if (error) throw error

    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Producto creado correctamente',
      data: product
    }

  } catch (error) {
    console.error('Error creating product:', error)
    return { 
      success: false, 
      error: 'Error al crear producto' 
    }
  }
}

export async function deleteProduct(productId: string): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Eliminar producto
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error

    revalidatePath('/account')
    
    return { 
      success: true, 
      message: 'Producto eliminado correctamente' 
    }

  } catch (error) {
    console.error('Error deleting product:', error)
    return { 
      success: false, 
      error: 'Error al eliminar producto' 
    }
  }
}

export async function toggleProductVisibility(
  productId: string, 
  visible: boolean
): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Actualizar visibilidad
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .update({ is_visible: visible })
      .eq('id', productId)

    if (error) throw error

    revalidatePath('/account')
    
    return { 
      success: true, 
      message: `Producto ${visible ? 'visible' : 'oculto'} correctamente` 
    }

  } catch (error) {
    console.error('Error toggling product visibility:', error)
    return { 
      success: false, 
      error: 'Error al cambiar visibilidad del producto' 
    }
  }
}

export async function toggleProductFeatured(
  productId: string, 
  featured: boolean
): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Actualizar featured
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .update({ featured })
      .eq('id', productId)

    if (error) throw error

    revalidatePath('/account')
    
    return { 
      success: true, 
      message: `Producto ${featured ? 'destacado' : 'no destacado'} correctamente` 
    }

  } catch (error) {
    console.error('Error toggling product featured:', error)
    return { 
      success: false, 
      error: 'Error al cambiar estado destacado del producto' 
    }
  }
}

export async function uploadProductImage(file: File, slug: string) {
  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${slug}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)
  if (uploadError) {
    return { data: null, error: uploadError }
  }
  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)
  const publicUrl = publicUrlData?.publicUrl
  return { data: publicUrl, error: null }
} 