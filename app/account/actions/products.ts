"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { ProductSchema, VARIETALS, REGIONS, CATEGORIES } from '../types/product'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { verifyAdmin } from '@/lib/admin-utils'
import type { ActionResponse } from '@/lib/types/action-response'
import { successResponse, errorResponse, handleActionError } from '@/lib/types/action-response'
import { logAdminAction } from '@/lib/admin-logger'

// Función para generar slug a partir del nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\//g, '-') // Reemplazar slashes con guiones PRIMERO
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim()
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
}

// Tipo básico de producto para la base de datos
type DatabaseProduct = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  region: string
  year: string
  varietal: string
  featured: boolean
  is_visible: boolean
  image?: string
  slug: string
  created_at?: string
}

// ActionResponse ahora se importa de @/lib/types/action-response

// Mapeo de categorías del formulario a valores de la base de datos
const CATEGORY_MAPPING: Record<string, string> = {
  // Tintos
  'Tinto': 'Tinto',
  'tinto': 'Tinto',
  'TINTO': 'Tinto',
  'Tintos': 'Tinto',
  'tintos': 'Tinto',
  
  // Blancos
  'Blanco': 'Blanco',
  'blanco': 'Blanco',
  'BLANCO': 'Blanco',
  'Blancos': 'Blanco',
  'blancos': 'Blanco',
  
  // Rosados
  'Rosado': 'Rosado',
  'rosado': 'Rosado',
  'ROSADO': 'Rosado',
  'Rosados': 'Rosado',
  'rosados': 'Rosado',
  
  // Naranja/Naranjo
  'Naranja': 'Naranjo',
  'naranja': 'Naranjo',
  'NARANJA': 'Naranjo',
  'Naranjo': 'Naranjo',
  'naranjo': 'Naranjo',
  'NARANJO': 'Naranjo',
  
  // Espumantes
  'Espumante': 'Espumante',
  'espumante': 'Espumante',
  'ESPUMANTE': 'Espumante',
  'Espumantes': 'Espumante',
  'espumantes': 'Espumante',
  
  // Dulces
  'Dulce': 'Dulce',
  'dulce': 'Dulce',
  'DULCE': 'Dulce',
  'Dulces': 'Dulce',
  'dulces': 'Dulce',
  
  // Boxes
  'Boxes': 'Boxes',
  'boxes': 'Boxes',
  'BOXES': 'Boxes',
  'Box': 'Boxes',
  'box': 'Boxes',
  
  // Otras Bebidas
  'Otras Bebidas': 'Otras Bebidas',
  'otras bebidas': 'Otras Bebidas',
  'OTRAS BEBIDAS': 'Otras Bebidas',
  'Otras': 'Otras Bebidas',
  'otras': 'Otras Bebidas'
}

// Función helper interna para convertir categoría del formulario a base de datos
function mapCategoryToDB(category: string): string {
  const mapped = CATEGORY_MAPPING[category]
  
  if (mapped) {
    // Verificar que el valor mapeado esté en el enum
    if (CATEGORIES.includes(mapped as typeof CATEGORIES[number])) {
      return mapped
    }
  }
  
  // Si la categoría original está en el enum, retornarla
  if (CATEGORIES.includes(category as typeof CATEGORIES[number])) {
    return category
  }
  
  // Buscar case-insensitive
  const found = CATEGORIES.find(c => 
    c.toLowerCase() === category.toLowerCase()
  )
  
  return found || category // Retornar el encontrado o el original como fallback
}

// Función para normalizar varietales (evitar duplicados por tildes/mayúsculas)
function normalizeVarietal(varietal: string): string {
  if (!varietal) return ''
  
  // Normalizar tildes y convertir a lowercase para comparar
  const normalized = varietal
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .trim()
  
  // Mapeo de variantes comunes a formato estándar
  const varietalMapping: Record<string, string> = {
    'torrontes': 'Torrontés',
    'torrontés': 'Torrontés',
    'malbec': 'Malbec',
    'cabernet sauvignon': 'Cabernet Sauvignon',
    'cabernet-sauvignon': 'Cabernet Sauvignon',
    'cabernet franc': 'Cabernet Franc',
    'cabernet-franc': 'Cabernet Franc',
    'chardonnay': 'Chardonnay',
    'sauvignon blanc': 'Sauvignon Blanc',
    'sauvignon-blanc': 'Sauvignon Blanc',
    'pinot noir': 'Pinot Noir',
    'pinot-noir': 'Pinot Noir',
    'pinot grigio': 'Pinot Grigio',
    'pinot-grigio': 'Pinot Grigio',
    'merlot': 'Merlot',
    'syrah': 'Syrah',
    'tempranillo': 'Tempranillo',
    'bonarda': 'Bonarda',
    'sangiovese': 'Sangiovese',
    'riesling': 'Riesling',
    'viognier': 'Viognier',
    'semillon': 'Semillón',
    'semillón': 'Semillón',
    'chenin blanc': 'Chenin Blanc',
    'chenin-blanc': 'Chenin Blanc',
    'gewurztraminer': 'Gewürztraminer',
    'gewürztraminer': 'Gewürztraminer',
    'moscato': 'Moscato',
    'prosecco': 'Prosecco',
    'champagne': 'Champagne',
    'cava': 'Cava',
    'blend': 'Blend',
    'múltiples': 'Múltiples',
    'multiples': 'Múltiples'
  }
  
  // Si encontramos el varietal en el mapeo, retornarlo
  if (varietalMapping[normalized]) {
    const mapped = varietalMapping[normalized]
    // Verificar que el valor mapeado esté en el enum
    if (VARIETALS.includes(mapped as typeof VARIETALS[number])) {
      return mapped
    }
  }
  
  // Si no está en el mapeo, intentar capitalizar correctamente palabras compuestas
  // Dividir por espacios y capitalizar cada palabra
  const words = varietal.split(/\s+/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
  
  const capitalized = words.join(' ')
  
  // Verificar si el valor capitalizado está en el enum
  if (VARIETALS.includes(capitalized as typeof VARIETALS[number])) {
    return capitalized
  }
  
  // Si aún no coincide, buscar el más cercano (case-insensitive)
  const found = VARIETALS.find(v => 
    v.toLowerCase().replace(/[áéíóúñ]/g, (m) => {
      const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' }
      return map[m] || m
    }) === normalized
  )
  
  return found || capitalized // Retornar el encontrado o el capitalizado como fallback
}

// Función para normalizar regiones (evitar duplicados por tildes/mayúsculas)
function normalizeRegion(region: string): string {
  if (!region) return ''
  
  // Normalizar tildes y convertir a lowercase para comparar
  const normalized = region
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .trim()
  
  // Mapeo de variantes comunes a formato estándar
  const regionMapping: Record<string, string> = {
    // Regiones principales
    'buenos aires': 'Buenos Aires',
    'buenos-aires': 'Buenos Aires',
    'catamarca': 'Catamarca',
    'chaco': 'Chaco',
    'chapadmalal': 'Chapadmalal',
    'chubut': 'Chubut',
    'cordoba': 'Córdoba',
    'córdoba': 'Córdoba',
    'corrientes': 'Corrientes',
    'entre rios': 'Entre Ríos',
    'entre-rios': 'Entre Ríos',
    'entre ríos': 'Entre Ríos',
    'formosa': 'Formosa',
    'jujuy': 'Jujuy',
    'la pampa': 'La Pampa',
    'la-pampa': 'La Pampa',
    'la rioja': 'La Rioja',
    'la-rioja': 'La Rioja',
    'rioja': 'La Rioja',
    'mendoza': 'Mendoza',
    'misiones': 'Misiones',
    'multiples': 'Múltiples',
    'múltiples': 'Múltiples',
    'neuquen': 'Neuquén',
    'neuquén': 'Neuquén',
    'rio negro': 'Río Negro',
    'rio-negro': 'Río Negro',
    'río negro': 'Río Negro',
    'salta': 'Salta',
    'san juan': 'San Juan',
    'san-juan': 'San Juan',
    'san luis': 'San Luis',
    'san-luis': 'San Luis',
    'santa cruz': 'Santa Cruz',
    'santa-cruz': 'Santa Cruz',
    'santa fe': 'Santa Fe',
    'santa-fe': 'Santa Fe',
    'santiago del estero': 'Santiago del Estero',
    'santiago-del-estero': 'Santiago del Estero',
    'tierra del fuego': 'Tierra del Fuego',
    'tierra-del-fuego': 'Tierra del Fuego',
    'tucuman': 'Tucumán',
    'tucumán': 'Tucumán',
    // Valles
    'valle calchaqui': 'Valle Calchaquí',
    'valle-calchaqui': 'Valle Calchaquí',
    'valle calchaquí': 'Valle Calchaquí',
    'valle de famatina': 'Valle de Famatina',
    'valle-de-famatina': 'Valle de Famatina',
    'valle de uco': 'Valle de Uco',
    'valle-de-uco': 'Valle de Uco',
    'valle del pedernal': 'Valle del Pedernal',
    'valle-del-pedernal': 'Valle del Pedernal',
    'valle del rio colorado': 'Valle del Río Colorado',
    'valle-del-rio-colorado': 'Valle del Río Colorado',
    'valle del río colorado': 'Valle del Río Colorado'
  }
  
  // Si encontramos la región en el mapeo, retornarla
  if (regionMapping[normalized]) {
    const mapped = regionMapping[normalized]
    // Verificar que el valor mapeado esté en el enum
    if (REGIONS.includes(mapped as typeof REGIONS[number])) {
      return mapped
    }
  }
  
  // Si no está en el mapeo, intentar capitalizar correctamente palabras compuestas
  // Dividir por espacios y capitalizar cada palabra
  const words = region.split(/\s+/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
  
  const capitalized = words.join(' ')
  
  // Verificar si el valor capitalizado está en el enum
  if (REGIONS.includes(capitalized as typeof REGIONS[number])) {
    return capitalized
  }
  
  // Si aún no coincide, buscar el más cercano (case-insensitive)
  const found = REGIONS.find(r => 
    r.toLowerCase().replace(/[áéíóúñ]/g, (m) => {
      const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' }
      return map[m] || m
    }) === normalized
  )
  
  return found || capitalized // Retornar el encontrado o el capitalizado como fallback
}




// verifyAdmin ahora se importa de @/lib/admin-utils



export async function updateProduct(formData: FormData): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) {
      return errorResponse('ID de producto requerido')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    // Normalizar precio por si llega con coma como separador decimal
    const rawPrice = (formData.get('price') as string) ?? ''
    const price = Number(rawPrice.replace(',', '.'))
    // Aceptar solo dígitos en stock
    const stock = parseInt(((formData.get('stock') as string) ?? '').replace(/[^0-9]/g, ''), 10)
    const category = formData.get('category') as string
    const region = formData.get('region') as string
    const year = formData.get('year') as string
    const varietal = formData.get('varietal') as string
    const featured = formData.get('featured') === 'on'
    const is_visible = formData.get('is_visible') === 'on'
    const free_shipping = formData.get('free_shipping') === 'on'
    const is_box = formData.get('is_box') === 'on'

    // Si category o region son 'none', usar string vacío
    const finalCategory = category === 'none' ? '' : mapCategoryToDB(category)
    const finalRegion = region === 'none' ? '' : normalizeRegion(region)
    
    // Para boxes, establecer valores por defecto apropiados
    const isBox = category === 'Boxes'
    const finalYear = isBox ? 'N/A' : (year || '')
    const finalVarietal = isBox ? 'Múltiples' : normalizeVarietal(varietal || '')

    // Construir update parcial
    const updateData: Record<string, unknown> = {
      name,
      description,
      price,
      stock,
      category: finalCategory,
      region: finalRegion,
      year: finalYear,
      varietal: finalVarietal,
      featured,
      is_visible,
      free_shipping,
      is_box,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }

    // Manejar imagen si se subió una nueva
    const imageFile = formData.get('image_file') as File
    if (imageFile?.size > 0) {
      const fileExt = imageFile.type.split('/')[1]
      const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      updateData.image = publicUrl
    } else {
      // Si hay una URL de imagen en el form, usarla
      const imageUrl = formData.get('image') as string
      if (imageUrl && imageUrl.trim() !== '') {
        updateData.image = imageUrl
      }
    }

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/account')
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    revalidateTag(`product-${updateData.slug}`)
    
    // Log de acción exitosa
    if (userId) {
      logAdminAction.productUpdated(userId, id, name, updateData)
    }
    
    return successResponse(updateData, 'Producto actualizado correctamente')

  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'updateProduct', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al actualizar producto')
  }
}



export async function createProduct(formData: FormData): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
    const supabase = await createClient()
    // Extraer datos básicos
    const category = formData.get('category') as string
    const isBox = category === 'Boxes'
    
    // Extraer y validar datos
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      category: mapCategoryToDB(category),
      region: normalizeRegion(formData.get('region') as string || ''),
      stock: Number(formData.get('stock')),
      year: isBox ? 'N/A' : (formData.get('year') || ''),
      varietal: isBox ? 'Múltiples' : normalizeVarietal(formData.get('varietal') as string || ''),
      featured: formData.get('featured') === 'on',
      is_visible: formData.get('is_visible') === 'on',
      free_shipping: formData.get('free_shipping') === 'on',
      is_box: formData.get('is_box') === 'on',
      slug: generateSlug(formData.get('name') as string || ''),
      image: '/placeholder.svg' // Imagen por defecto
    }

    // Validar datos con Zod
    const validatedData = ProductSchema.parse(rawData)

    // Manejar imagen si existe
    const imageFile = formData.get('image_file') as File
    if (imageFile?.size > 0) {
      const fileExt = imageFile.type.split('/')[1]
      const fileName = `${validatedData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      validatedData.image = publicUrl
    }

    // Crear producto
    const { data, error } = await supabase
      .from('products')
      .insert(validatedData)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/account')
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    revalidateTag(`product-${validatedData.slug}`)
    
    // Log de acción exitosa
    if (userId && data) {
      logAdminAction.productCreated(userId, data.id, validatedData.name)
    }
    
    return successResponse(data, 'Producto creado correctamente')

  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'createProduct', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al crear producto')
  }
}

export async function deleteProducts(ids: string[]): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
    const supabase = await createClient()

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
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    // Revalidar todos los productos eliminados
    ids.forEach(id => revalidateTag(`product-${id}`))
    
    // Log de acción exitosa
    if (userId) {
      logAdminAction.productDeleted(userId, ids)
    }
    
    return successResponse(undefined, `${ids.length} producto(s) eliminado(s) correctamente`)
  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'deleteProducts', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al eliminar productos')
  }
}

export async function toggleProductVisibility(
  productId: string, 
  visible: boolean
): Promise<ActionResponse> {
  let userId: string | undefined
  try {
    // Verificar permisos de admin
    userId = await verifyAdmin()
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .update({ is_visible: visible })
      .eq('id', productId)

    if (error) throw error

    revalidatePath('/account')
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    revalidateTag(`product-${productId}`)
    
    // Log de acción exitosa
    if (userId) {
      logAdminAction.productVisibilityToggled(userId, productId, visible)
    }
    
    return successResponse(
      { productId, visible },
      `Producto ${visible ? 'visible' : 'oculto'} correctamente`
    )

  } catch (error) {
    if (userId) {
      logAdminAction.error(userId, 'toggleProductVisibility', error instanceof Error ? error : new Error(String(error)))
    }
    return handleActionError(error, 'Error al cambiar visibilidad del producto')
  }
}

export async function toggleProductFeatured(
  productId: string, 
  featured: boolean
): Promise<ActionResponse> {
  try {
    // Verificar permisos de admin
    await verifyAdmin()
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .update({ featured })
      .eq('id', productId)

    if (error) throw error

    revalidatePath('/account')
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.FEATURED_PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    revalidateTag(`product-${productId}`)
    
    return successResponse(
      { productId, featured },
      `Producto ${featured ? 'destacado' : 'no destacado'} correctamente`
    )

  } catch (error) {
    return handleActionError(error, 'Error al cambiar estado destacado del producto')
  }
}

export async function uploadProductImage(file: File, slug: string) {
  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${slug}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`
  const { error: uploadError } = await supabase.storage
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
    // Verificar permisos de admin
    await verifyAdmin()
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return successResponse(products)

  } catch (error) {
    return handleActionError(error, 'Error al obtener productos')
  }
}

/**
 * Obtener productos con paginación real desde el servidor
 */
export async function getProductsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    visibility?: 'all' | 'visible' | 'hidden'
    search?: string
  }
): Promise<ActionResponse<{ products: any[], total: number, page: number, pageSize: number, totalPages: number }>> {
  try {
    // Verificar permisos de admin
    await verifyAdmin()
    const supabase = await createClient()
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filters?.visibility === 'visible') {
      query = query.eq('is_visible', true)
    } else if (filters?.visibility === 'hidden') {
      query = query.eq('is_visible', false)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Aplicar paginación
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    query = query.range(from, to)

    const { data: products, error, count } = await query

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / pageSize)

    return successResponse({
      products: products || [],
      total: count || 0,
      page,
      pageSize,
      totalPages
    })

  } catch (error) {
    return handleActionError(error, 'Error al obtener productos paginados')
  }
} 