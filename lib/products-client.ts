import { createClient } from './supabase/client'
import type { Product } from './types'

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data as Product[]
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