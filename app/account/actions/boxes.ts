'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CreateBoxSchema, UpdateBoxSchema } from '../types/box'
import { verifyAdmin } from '@/lib/admin-utils'
import type { ActionResponse } from '@/lib/types/action-response'
import { successResponse, errorResponse, handleActionError } from '@/lib/types/action-response'
import { logAdminAction } from '@/lib/admin-logger'
import { CACHE_TAGS } from '@/lib/cache-tags'

export async function createBox(formData: FormData): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
    const supabase = await createClient()

    // Extraer y validar datos básicos con normalización de números
    const rawPrice = (formData.get('price') as string || '0').replace(',', '.')
    const rawStock = (formData.get('stock') as string || '0').replace(/[^0-9]/g, '')
    const rawTotalWines = formData.get('total_wines') as string || '3'
    const rawDiscountPercentage = (formData.get('discount_percentage') as string || '0').replace(',', '.')

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(rawPrice),
      stock: Number(rawStock),
      category: 'Boxes',
      total_wines: Number(rawTotalWines),
      discount_percentage: Number(rawDiscountPercentage) || 0,
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
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    
    // Log de acción exitosa
    if (userId && boxData) {
      logAdminAction.productCreated(userId, boxData.id, validatedData.name)
    }
    
    return successResponse(boxData, 'Box creado correctamente')

  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'createBox', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al crear el box')
  }
}

export async function updateBox(boxId: string, formData: FormData): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
    const supabase = await createClient()

    // Extraer y validar datos con normalización de números
    const rawPrice = (formData.get('price') as string || '0').replace(',', '.')
    const rawStock = (formData.get('stock') as string || '0').replace(/[^0-9]/g, '')
    const rawTotalWines = formData.get('total_wines') as string || '3'
    const rawDiscountPercentage = (formData.get('discount_percentage') as string || '0').replace(',', '.')

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(rawPrice),
      stock: Number(rawStock),
      total_wines: Number(rawTotalWines),
      discount_percentage: Number(rawDiscountPercentage) || 0,
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
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    
    // Log de acción exitosa
    if (userId && boxData) {
      logAdminAction.productUpdated(userId, boxId, validatedData.name || '', validatedData)
    }
    
    return successResponse(boxData, 'Box actualizado correctamente')

  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'updateBox', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al actualizar el box')
  }
}

export async function deleteBox(boxId: string): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
    const supabase = await createClient()

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
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    
    // Log de acción exitosa
    if (userId) {
      logAdminAction.productDeleted(userId, [boxId])
    }
    
    return successResponse(undefined, 'Box eliminado correctamente')

  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'deleteBox', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al eliminar el box')
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
