import { createClient } from '@/lib/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'
import { StorageError } from '@supabase/storage-js'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  category: string
  year: string
  region: string
  varietal: string
  stock: number
  featured: boolean
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: PostgrestError | StorageError | null
}

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProduct(slug: string): Promise<ApiResponse<Product>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  return { data, error }
}

export async function getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProductsByRegion(region: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('region', region)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProductsByVarietal(varietal: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('varietal', varietal)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
  if (error) {
    console.error('Error fetching product by slug:', error)
    return undefined
  }
  return data as Product
} 