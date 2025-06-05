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
    
    console.log('🔍 [getProducts] About to execute query...')
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
      console.error('🔍 [getProducts] Supabase error:', error)
      return { data: null, error }
    }

    if (!data) {
      console.log('🔍 [getProducts] No data returned (null/undefined)')
      return { data: [], error: null }
    }

    console.log('🔍 [getProducts] Success! Returning', data.length, 'products')
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