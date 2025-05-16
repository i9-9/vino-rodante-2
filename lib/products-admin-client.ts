import { createClient } from './supabase/client'
import type { Product } from './types'

export async function createProduct(product: Omit<Product, "id">): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return null
  }

  return data
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return false
  }

  return true
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return null
  }

  return data
}

export async function uploadProductImage(file: File, slug: string): Promise<string | null> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${slug || Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Error uploading image:', error)
    return null
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
} 