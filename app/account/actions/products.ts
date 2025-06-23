"use server"

import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { StorageError } from '@supabase/storage-js'
import type { Database } from '@/lib/database.types'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { ActionResponse } from '../types'
import type { Product } from '../types'
import { z } from 'zod'
import { ProductSchema, type ProductFormData } from '../types/product'

// Extender el tipo Product para incluir is_visible
type DatabaseProduct = Database['public']['Tables']['products']['Row'] & {
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

type ValidatedProduct = z.infer<typeof ProductSchema>

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

async function uploadImage(file: File, slug: string): Promise<string> {
  const supabase = await createClient()

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Use JPG, PNG o WebP.')
  }

  // Validar tamaño (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('La imagen es demasiado grande. Máximo 5MB.')
  }

  const fileExt = file.type.split('/')[1]
  const fileName = `${slug}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    if (error instanceof StorageError) {
      throw new Error(`Error al subir imagen: ${error.message}`)
    }
    throw error
  }
}

async function deleteOldImage(url: string) {
  if (!url || url === '/placeholder.jpg' || !url.includes('product-images')) {
    return
  }

  try {
    const supabase = await createClient()
    const path = url.split('product-images/')[1]
    if (!path) return

    await supabase.storage
      .from('product-images')
      .remove([path])
  } catch (error) {
    console.error('Error deleting old image:', error)
  }
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autorizado')
  }

  // Verificar si es admin
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!customer?.is_admin) {
    throw new Error('No autorizado')
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const category = formData.get('category') as string
  const region = formData.get('region') as string
  const year = formData.get('year') as string
  const varietal = formData.get('varietal') as string
  const featured = formData.get('featured') === 'on'
  const is_visible = formData.get('is_visible') === 'on'
  const image = formData.get('image') as string

  // Si category o region son 'none', usar string vacío
  const finalCategory = category === 'none' ? '' : category
  const finalRegion = region === 'none' ? '' : region

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description,
      price,
      stock,
      category: finalCategory,
      region: finalRegion,
      year: year || '',
      varietal: varietal || '',
      featured,
      is_visible,
      image: image || null
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Error al actualizar producto: ${error.message}`)
  }

  revalidatePath('/account')
}

async function getProductById(id: string): Promise<DatabaseProduct | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as DatabaseProduct
}

export async function createProduct(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  // Validar que el usuario sea admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    // Extraer y validar datos
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      category: formData.get('category'),
      region: formData.get('region'),
      stock: Number(formData.get('stock')),
      is_visible: formData.get('is_visible') === 'true'
    }

    // Validar datos con Zod
    const validatedData = ProductSchema.parse(rawData)

    // Manejar imagen si existe
    const imageFile = formData.get('image') as File
    if (imageFile?.size > 0) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(`${validatedData.name}-${Date.now()}`, imageFile)

      if (uploadError) throw uploadError
      validatedData.image = uploadData.path
    }

    // Crear producto
    const { data, error } = await supabase
      .from('products')
      .insert(validatedData)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/account')
    return { success: true, data }

  } catch (error) {
    console.error('Error creating product:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al crear producto'
    }
  }
}

export async function deleteProducts(ids: string[]) {
  const supabase = await createClient()

  // Validar que el usuario sea admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  try {
    // Obtener las imágenes de los productos a eliminar
    const { data: products } = await supabase
      .from('products')
      .select('image')
      .in('id', ids)

    // Eliminar las imágenes del storage
    const imagesToDelete = products
      ?.filter(p => p.image)
      .map(p => p.image!.split('/').pop()!)

    if (imagesToDelete?.length) {
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove(imagesToDelete)

      if (storageError) throw storageError
    }

    // Eliminar los productos
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    throw error
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
      error: error instanceof Error ? error.message : 'Error al cambiar visibilidad del producto' 
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
      error: error instanceof Error ? error.message : 'Error al cambiar estado destacado del producto' 
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

export async function getAllProducts(): Promise<ActionResponse> {
  try {
    // 1. Verificar permisos de admin
    await verifyAdmin()

    // 2. Obtener todos los productos
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { 
      success: true, 
      data: products 
    }

  } catch (error) {
    console.error('Error getting all products:', error)
    return { 
      success: false, 
      error: 'Error al obtener productos' 
    }
  }
} 