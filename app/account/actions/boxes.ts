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
    // Intentar primero con todos los campos (incluyendo discount_percentage y total_wines)
    const insertData = {
      ...validatedData,
      year: 'N/A', // Los boxes no tienen año específico
      region: 'Múltiples', // Los boxes pueden tener múltiples regiones
      varietal: 'Múltiples' // Los boxes pueden tener múltiples varietales
    }
    
    let { data: boxData, error: boxError } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single()

    // Si falla por columnas faltantes, intentar sin discount_percentage y total_wines
    if (boxError && (
      boxError.message?.includes('discount_percentage') || 
      boxError.message?.includes('total_wines') ||
      boxError.message?.includes('schema cache') ||
      boxError.code === 'PGRST116'
    )) {
      // Crear una copia sin los campos problemáticos
      const { discount_percentage, total_wines, ...dataWithoutNewFields } = insertData
      
      const fallbackResult = await supabase
        .from('products')
        .insert({
          ...dataWithoutNewFields,
          year: 'N/A',
          region: 'Múltiples',
          varietal: 'Múltiples'
        })
        .select()
        .single()
      
      if (fallbackResult.error) {
        // Si aún falla, lanzar el error original con mejor formato
        throw new Error(fallbackResult.error.message || String(fallbackResult.error))
      }
      
      boxData = fallbackResult.data
      boxError = null
    }

    if (boxError) {
      // Convertir el error a un formato legible
      const errorMessage = boxError.message || String(boxError)
      throw new Error(`Error al crear box: ${errorMessage}`)
    }

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
    // Intentar primero con todos los campos (incluyendo discount_percentage y total_wines)
    let { data: boxData, error: boxError } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', boxId)
      .select()
      .single()

    // Si falla por columnas faltantes, intentar sin discount_percentage y total_wines
    if (boxError && (
      boxError.message?.includes('discount_percentage') || 
      boxError.message?.includes('total_wines') ||
      boxError.message?.includes('schema cache') ||
      boxError.code === 'PGRST116'
    )) {
      // Crear una copia sin los campos problemáticos
      const { discount_percentage, total_wines, ...dataWithoutNewFields } = validatedData
      
      const fallbackResult = await supabase
        .from('products')
        .update(dataWithoutNewFields)
        .eq('id', boxId)
        .select()
        .single()
      
      if (fallbackResult.error) {
        // Si aún falla, lanzar el error original con mejor formato
        throw new Error(fallbackResult.error.message || String(fallbackResult.error))
      }
      
      boxData = fallbackResult.data
      boxError = null
    }

    if (boxError) {
      // Convertir el error a un formato legible
      const errorMessage = boxError.message || String(boxError)
      throw new Error(`Error al actualizar box: ${errorMessage}`)
    }

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
    // Obtener datos básicos del box - seleccionar columnas explícitamente
    // Nota: discount_percentage y total_wines pueden no existir hasta que se ejecute la migración
    const { data: boxData, error: boxError } = await supabase
      .from('products')
      .select('id, name, description, price, stock, category, image, featured, is_visible, slug, year, region, varietal, created_at, updated_at, total_wines, free_shipping, discount_percentage')
      .eq('id', boxId)
      .eq('category', 'Boxes')
      .single()

    if (boxError) {
      // Si el error es por columnas faltantes, intentar sin discount_percentage
      if (boxError.message?.includes('discount_percentage') || boxError.message?.includes('schema cache')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select('id, name, description, price, stock, category, image, featured, is_visible, slug, year, region, varietal, created_at, updated_at, total_wines, free_shipping')
          .eq('id', boxId)
          .eq('category', 'Boxes')
          .single()
        
        if (fallbackError || !fallbackData) return null
        
        // Agregar discount_percentage con valor por defecto
        const boxDataWithDiscount = {
          ...fallbackData,
          discount_percentage: 0,
          total_wines: (fallbackData as any).total_wines ?? 0
        }
        
        // Continuar con la carga de productos del box (código duplicado pero necesario)
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
          return {
            ...boxDataWithDiscount,
            box_products: [],
            total_wines: boxDataWithDiscount.total_wines
          } as Box
        }

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
          ...boxDataWithDiscount,
          box_products: boxProducts,
          total_wines: boxProducts.length || boxDataWithDiscount.total_wines
        } as Box
      }
      return null
    }
    
    if (!boxData) return null
    
    // Agregar discount_percentage con valor por defecto si no existe
    const boxDataWithDiscount = {
      ...boxData,
      discount_percentage: (boxData as any).discount_percentage ?? 0,
      total_wines: (boxData as any).total_wines ?? 0
    }

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
      ...boxDataWithDiscount,
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
    // Seleccionar columnas explícitamente
    // Nota: discount_percentage puede no existir hasta que se ejecute la migración
    let { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock, category, image, featured, is_visible, slug, year, region, varietal, created_at, updated_at, total_wines, free_shipping, discount_percentage')
      .eq('category', 'Boxes')
      .eq('is_visible', true)
      .order('name')

    // Si el error es por columnas faltantes, intentar sin discount_percentage
    if (error && (error.message?.includes('discount_percentage') || error.message?.includes('schema cache'))) {
      const fallbackResult = await supabase
        .from('products')
        .select('id, name, description, price, stock, category, image, featured, is_visible, slug, year, region, varietal, created_at, updated_at, total_wines, free_shipping')
        .eq('category', 'Boxes')
        .eq('is_visible', true)
        .order('name')
      
      if (fallbackResult.error) throw fallbackResult.error
      data = fallbackResult.data
    } else if (error) {
      throw error
    }

    // Agregar discount_percentage y total_wines con valores por defecto si no existen
    return (data || []).map(box => ({
      ...box,
      discount_percentage: (box as any).discount_percentage ?? 0,
      total_wines: (box as any).total_wines ?? 3
    })) as Box[]
  } catch {
    return []
  }
}
