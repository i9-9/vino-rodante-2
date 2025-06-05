import { createClient } from '@/lib/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'
import { StorageError } from '@supabase/storage-js'
import { CATEGORY_SLUG_MAP } from './wine-data'
import type { Product } from '@/lib/types'

export interface ApiResponse<T> {
  data: T | null
  error: PostgrestError | StorageError | null
}

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  console.log('🔍 [getProducts] Function called')
  
  try {
    const supabase = createClient()
    console.log('🔍 [getProducts] Supabase client created')
    
    // RETRY LOGIC para problemas intermitentes
    let lastError: any = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 [getProducts] Attempt ${attempt}/${maxRetries}`)
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
        
        console.log('🔍 [getProducts] Supabase query completed')
        console.log('🔍 [getProducts] Raw result:', { 
          data: data, 
          error: error,
          dataType: typeof data,
          dataIsArray: Array.isArray(data),
          dataLength: data?.length
        })

        if (error) {
          lastError = error
          console.error(`🔍 [getProducts] Supabase error (attempt ${attempt}):`, error)
          
          // DETECT problemas específicos
          if (error.message?.includes('JWT') || error.code === 'PGRST301') {
            console.error('🚨 [getProducts] JWT/Auth error detected - posible token grande o suspensión')
          }
          if (error.message?.includes('CORS') || error.message?.includes('Network')) {
            console.error('🚨 [getProducts] CORS/Network error detected - problema intermitente')
          }
          if (error.message?.includes('suspended') || error.code === 'PGRST') {
            console.error('🚨 [getProducts] Database suspended error detected')
          }
          
          // Retry en algunos tipos de error
          if (attempt < maxRetries && (
            error.message?.includes('Network') ||
            error.message?.includes('CORS') ||
            error.code === 'PGRST301'
          )) {
            console.log(`🔄 [getProducts] Retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
          
          return { data: null, error }
        }

        if (!data) {
          console.log('🔍 [getProducts] No data returned (null/undefined)')
          return { data: [], error: null }
        }

        console.log('🔍 [getProducts] Success! Returning', data.length, 'products')
        return { data, error: null }
        
      } catch (fetchError) {
        lastError = fetchError
        console.error(`🔍 [getProducts] Fetch exception (attempt ${attempt}):`, fetchError)
        
        if (attempt < maxRetries) {
          console.log(`🔄 [getProducts] Retrying fetch in ${attempt * 1000}ms...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
          continue
        }
      }
    }
    
    // Si llegamos aquí, todos los retries fallaron
    console.error('🔍 [getProducts] All retries failed, returning last error:', lastError)
    return { data: null, error: lastError as PostgrestError }
    
  } catch (err) {
    console.error('🔍 [getProducts] Outer exception caught:', err)
    return { data: null, error: err as PostgrestError }
  }
}

export async function getProduct(slug: string): Promise<ApiResponse<Product>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  return { data, error }
}

export async function getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProductsByCategory(categorySlug: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  
  // Mapeo para buscar tanto en español como en inglés
  const category = CATEGORY_SLUG_MAP[categorySlug] || categorySlug // ej: "red" → "tinto"
  
  // También buscar la versión en inglés por si hay productos mal categorizados
  const englishCategory = categorySlug // ej: "red", "white", etc.
  
  console.log('🔍 [getProductsByCategory] Searching for categorySlug:', categorySlug)
  console.log('🔍 [getProductsByCategory] Mapped to spanish:', category)
  console.log('🔍 [getProductsByCategory] Also searching english:', englishCategory)
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`category.eq.${category},category.eq.${englishCategory}`) // Buscar AMBOS: "blanco" OR "white"
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  if (data) {
    console.log('🔍 [getProductsByCategory] Found products:', data.length)
    console.log('🔍 [getProductsByCategory] Categories found:', [...new Set(data.map(p => p.category))])
  }

  return { data, error }
}

export async function getProductsByRegion(region: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('region', region)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProductsByVarietal(varietal: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('varietal', varietal)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()
  if (error) {
    console.error('Error fetching product by slug:', error)
    return undefined
  }
  return data as Product
} 