"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { ProductSchema } from '../types/product'
import { CACHE_TAGS } from '@/lib/cache-tags'

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

export interface ActionResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

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
  'Naranja': 'Naranja',
  'naranja': 'Naranja',
  'NARANJA': 'Naranja',
  'Naranjo': 'Naranja', // Unificar a "Naranja"
  'naranjo': 'Naranja',
  'NARANJO': 'Naranja',
  
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
  return CATEGORY_MAPPING[category] || category
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
    'chardonnay': 'Chardonnay',
    'sauvignon blanc': 'Sauvignon Blanc',
    'sauvignon-blanc': 'Sauvignon Blanc',
    'pinot noir': 'Pinot Noir',
    'pinot-noir': 'Pinot Noir',
    'merlot': 'Merlot',
    'syrah': 'Syrah',
    'tempranillo': 'Tempranillo',
    'bonarda': 'Bonarda'
  }
  
  return varietalMapping[normalized] || varietal.charAt(0).toUpperCase() + varietal.slice(1).toLowerCase()
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
    'mendoza': 'Mendoza',
    'san juan': 'San Juan',
    'san-juan': 'San Juan',
    'salta': 'Salta',
    'la rioja': 'La Rioja',
    'la-rioja': 'La Rioja',
    'rioja': 'La Rioja',
    'patagonia': 'Patagonia',
    'neuquen': 'Neuquén',
    'neuquén': 'Neuquén',
    'rio negro': 'Río Negro',
    'rio-negro': 'Río Negro',
    'buenos aires': 'Buenos Aires',
    'buenos-aires': 'Buenos Aires'
  }
  
  return regionMapping[normalized] || region.charAt(0).toUpperCase() + region.slice(1).toLowerCase()
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



export async function updateProduct(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'No autorizado' }
    }

    // Verificar si es admin
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!customer?.is_admin) {
      return { success: false, error: 'No autorizado - Se requiere ser admin' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'ID de producto requerido' }
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
    return { success: true, message: 'Producto actualizado correctamente' }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al actualizar producto'
    }
  }
}



export async function createProduct(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  // Validar que el usuario sea admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    // Verificar si es admin
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!customer?.is_admin) {
      return { success: false, error: 'No autorizado - Se requiere ser admin' }
    }
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
    return { success: true, data }

  } catch (error) {
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
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    // Revalidar todos los productos eliminados
    ids.forEach(id => revalidateTag(`product-${id}`))
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
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    revalidateTag(`product-${productId}`)
    
    return { 
      success: true, 
      message: `Producto ${visible ? 'visible' : 'oculto'} correctamente` 
    }

  } catch (error) {
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
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.FEATURED_PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    revalidateTag(`product-${productId}`)
    
    return { 
      success: true, 
      message: `Producto ${featured ? 'destacado' : 'no destacado'} correctamente` 
    }

  } catch (error) {
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
    return { 
      success: false, 
      error: 'Error al obtener productos' 
    }
  }
} 