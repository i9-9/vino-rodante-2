import { createClient } from '@/lib/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'
import { StorageError } from '@supabase/storage-js'
import type { Product, ApiResponse } from './products-client'

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Product>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

  return { data, error }
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Product>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  const supabase = createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  return { data: null, error }
}

export async function uploadProductImage(file: File, slug: string): Promise<ApiResponse<string>> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${slug}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file)

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath)

  return { data: publicUrl, error: null }
} 