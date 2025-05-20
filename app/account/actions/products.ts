"use server"

import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { StorageError } from '@supabase/storage-js'
import type { Product } from '@/lib/types'

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  return { data, error }
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  return { data: null, error }
}

export async function uploadProductImage(file: File, slug: string) {
  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${slug}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`
  const { data: uploadData, error: uploadError } = await supabase.storage
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