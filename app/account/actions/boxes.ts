'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreateBoxSchema, UpdateBoxSchema } from '../types/box'

export type ActionResponse = {
  success: boolean
  data?: unknown
  error?: string
}

export async function createBox(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  // Validar que el usuario sea admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    // Verificar si es admin
    const { data: customerData } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!customerData?.is_admin) {
      return { success: false, error: 'No autorizado - Se requiere ser admin' }
    }

    // Extraer y validar datos básicos
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      category: 'Boxes',
      total_wines: Number(formData.get('total_wines')),
      discount_percentage: Number(formData.get('discount_percentage')) || 0,
      featured: formData.get('featured') === 'on',
      is_visible: formData.get('is_visible') === 'on',
      slug: (formData.get('name') as string)?.toLowerCase().replace(/\s+/g, '-') || '',
      image: '/placeholder.svg'
    }

    // Validar datos con Zod
    const validatedData = CreateBoxSchema.parse(rawData)

    // Manejar imagen si existe
    const imageFile = formData.get('image_file') as File
    if (imageFile?.size > 0) {
      const fileExt = imageFile.type.split('/')[1]
      const fileName = `box-${validatedData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const filePath = `boxes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      validatedData.image = publicUrl
    }

    // Crear el box en la tabla de productos
    const { data: boxData, error: boxError } = await supabase
      .from('products')
      .insert({
        ...validatedData,
        year: 'N/A', // Los boxes no tienen año específico
        region: 'Múltiples', // Los boxes pueden tener múltiples regiones
        varietal: 'Múltiples' // Los boxes pueden tener múltiples varietales
      })
      .select()
      .single()

    if (boxError) throw boxError

    // Extraer productos del box
    const boxProductsJson = formData.get('box_products') as string
    if (boxProductsJson) {
      const boxProducts = JSON.parse(boxProductsJson)
      
      // Crear registros en la tabla de relación box-productos
      const boxProductRelations = boxProducts.map((product: { product_id: string; quantity: number }) => ({
        box_id: boxData.id,
        product_id: product.product_id,
        quantity: product.quantity
      }))

      const { error: relationError } = await supabase
        .from('box_product_relations')
        .insert(boxProductRelations)

      if (relationError) {
        console.error('Error creating box product relations:', relationError)
        // No fallar la creación del box, pero registrar el error
        // El box se crea pero sin productos asociados
      }
    }

    revalidatePath('/account')
    return { success: true, data: boxData }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al crear el box' 
    }
  }
}

export async function updateBox(boxId: string, formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  // Validar que el usuario sea admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    // Verificar si es admin
    const { data: customerData } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!customerData?.is_admin) {
      return { success: false, error: 'No autorizado - Se requiere ser admin' }
    }

    // Extraer y validar datos
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      total_wines: Number(formData.get('total_wines')),
      discount_percentage: Number(formData.get('discount_percentage')) || 0,
      featured: formData.get('featured') === 'on',
      is_visible: formData.get('is_visible') === 'on',
      slug: (formData.get('name') as string)?.toLowerCase().replace(/\s+/g, '-') || ''
    }

    // Validar datos con Zod
    const validatedData = UpdateBoxSchema.parse(rawData)

    // Manejar imagen si existe
    const imageFile = formData.get('image_file') as File
    if (imageFile?.size > 0) {
      const fileExt = imageFile.type.split('/')[1]
      const fileName = `box-${validatedData.name?.toLowerCase().replace(/\s+/g, '-') || 'updated'}-${Date.now()}.${fileExt}`
      const filePath = `boxes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      validatedData.image = publicUrl
    }

    // Actualizar el box en la tabla de productos
    const { data: boxData, error: boxError } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', boxId)
      .select()
      .single()

    if (boxError) throw boxError

    // Actualizar productos del box si se proporcionaron
    const boxProductsJson = formData.get('box_products') as string
    if (boxProductsJson) {
      const boxProducts = JSON.parse(boxProductsJson)
      
      // Eliminar relaciones existentes
      await supabase
        .from('box_product_relations')
        .delete()
        .eq('box_id', boxId)

      // Crear nuevas relaciones
      if (boxProducts.length > 0) {
        const boxProductRelations = boxProducts.map((product: { product_id: string; quantity: number }) => ({
          box_id: boxId,
          product_id: product.product_id,
          quantity: product.quantity
        }))

        const { error: relationError } = await supabase
          .from('box_product_relations')
          .insert(boxProductRelations)

        if (relationError) {
          console.error('Error updating box product relations:', relationError)
          // No fallar la actualización del box, pero registrar el error
        }
      }
    }

    revalidatePath('/account')
    return { success: true, data: boxData }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al actualizar el box' 
    }
  }
}

export async function deleteBox(boxId: string): Promise<ActionResponse> {
  const supabase = await createClient()

  // Validar que el usuario sea admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    // Verificar si es admin
    const { data: customerData } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!customerData?.is_admin) {
      return { success: false, error: 'No autorizado - Se requiere ser admin' }
    }

    // Eliminar relaciones box-productos primero
    await supabase
      .from('box_product_relations')
      .delete()
      .eq('box_id', boxId)

    // Eliminar el box de la tabla de productos
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', boxId)

    if (deleteError) throw deleteError

    revalidatePath('/account')
    return { success: true }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al eliminar el box' 
    }
  }
}

export async function getBoxWithProducts(boxId: string): Promise<Box | null> {
  const supabase = await createClient()

  try {
    // Obtener datos básicos del box
    const { data: boxData, error: boxError } = await supabase
      .from('products')
      .select('*')
      .eq('id', boxId)
      .eq('category', 'Boxes')
      .single()

    if (boxError || !boxData) return null

    // Obtener productos del box
    const { data: relations, error: relationsError } = await supabase
      .from('box_product_relations')
      .select(`
        product_id,
        quantity,
        products:product_id (
          id,
          name,
          price,
          image,
          varietal,
          year,
          region
        )
      `)
      .eq('box_id', boxId)

    if (relationsError) {
      return null
    }

    // Formatear productos del box
    const boxProducts = relations?.map(relation => ({
      product_id: relation.product_id,
      quantity: relation.quantity,
      name: relation.products?.name || '',
      price: relation.products?.price || 0,
      image: relation.products?.image || '',
      varietal: relation.products?.varietal || '',
      year: relation.products?.year || '',
      region: relation.products?.region || ''
    })) || []

    return {
      ...boxData,
      box_products: boxProducts,
      total_wines: boxProducts.length
    } as Box

  } catch {
    return null
  }
}

export async function getAllBoxes(): Promise<Box[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'Boxes')
      .eq('is_visible', true)
      .order('name')

    if (error) throw error

    return data || []
  } catch {
    return []
  }
}
