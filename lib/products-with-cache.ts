import { createClient } from '@/utils/supabase/server'
import { createAdaptiveClient } from '@/lib/supabase-cache-config'
import { PRODUCT_CACHE_TAGS } from './cache-tags'
import type { Product } from './types'

/**
 * Wrapper para consultas de productos con cache tags para revalidación on-demand
 */

export async function getProductsWithCache(): Promise<Product[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .not('category', 'in', '("boxes","Boxes")')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

export async function getProductBySlugWithCache(slug: string): Promise<Product | undefined> {
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

export async function getFeaturedProductsWithCache(): Promise<Product[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data as Product[]
}

export async function getProductsByCategoryWithCache(category: string): Promise<Product[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }

  return data as Product[]
}

export async function getProductsByRegionWithCache(region: string): Promise<Product[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .eq('region', region)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by region:', error)
    return []
  }

  return data as Product[]
}

export async function getProductsByVarietalWithCache(varietal: string): Promise<Product[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .eq('varietal', varietal)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by varietal:', error)
    return []
  }

  return data as Product[]
}
