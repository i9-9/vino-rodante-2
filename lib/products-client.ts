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
    
    // Check if environment variables are available in browser
    console.log('🔍 [getProducts] Environment check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'EXISTS' : 'MISSING',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING'
    })
    
    // Check if we're in incognito mode by trying to access sessionStorage
    let isIncognito = false
    try {
      const testKey = '__test_incognito__'
      sessionStorage.setItem(testKey, 'test')
      sessionStorage.removeItem(testKey)
    } catch (e) {
      isIncognito = true
      console.log('🔍 [getProducts] Detected incognito mode')
    }
    
    console.log('🔍 [getProducts] About to execute main query...')
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
      dataLength: data?.length,
      isIncognito
    })

    if (error) {
      console.error('🔍 [getProducts] Supabase error:', error)
      
      // En modo incógnito, si hay error de autenticación, intentar sin filtros de seguridad
      if (isIncognito && (error.message?.includes('auth') || error.message?.includes('policy') || error.code === 'PGRST116')) {
        console.log('🔍 [getProducts] Attempting incognito-friendly query...')
        
        // Intentar query más simple para modo incógnito
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select('id, name, slug, description, price, image, category, region, varietal, year, stock, featured, is_visible')
          .eq('is_visible', true)
          .limit(50)
        
        if (fallbackError) {
          console.error('🔍 [getProducts] Fallback query also failed:', fallbackError)
          return { data: null, error: fallbackError }
        }
        
        console.log('🔍 [getProducts] Fallback query succeeded:', fallbackData?.length, 'products')
        return { data: fallbackData || [], error: null }
      }
      
      return { data: null, error }
    }

    if (!data) {
      console.log('🔍 [getProducts] No data returned (null/undefined)')
      return { data: [], error: null }
    }

    console.log('🔍 [getProducts] Success! Returning', data.length, 'products')
    console.log('🔍 [getProducts] First few products:', data.slice(0, 3).map(p => ({ 
      id: p.id, 
      name: p.name, 
      category: p.category, 
      is_visible: p.is_visible 
    })))

    return { data, error: null }
  } catch (err) {
    console.error('🔍 [getProducts] Exception caught:', err)
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
  const category = CATEGORY_SLUG_MAP[categorySlug] || categorySlug // fallback por si ya viene en español
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

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