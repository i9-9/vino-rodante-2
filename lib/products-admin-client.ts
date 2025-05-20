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
  try {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${slug}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    console.log('[Upload] Attempting to upload file:', { 
      fileName, 
      filePath,
      fileSize: file.size,
      fileType: file.type
    })

    console.log('[Upload] File object:', file)
    const { data: uploadData, error: uploadError, ...rest } = await supabase.storage
      .from('product-images')
      .upload(`products/${fileName}`, file)

    console.log('[Upload] upload() response:', { uploadData, uploadError, ...rest })

    if (uploadError) {
      try {
        console.error('[Upload] Error uploading file (stringified):', JSON.stringify(uploadError))
      } catch (e) {
        console.error('[Upload] Error uploading file (raw):', uploadError)
      }
      return { data: null, error: uploadError }
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    console.log('[Upload] getPublicUrl() response:', { publicUrlData })

    const publicUrl = publicUrlData?.publicUrl
    console.log('[Upload] Generated public URL:', publicUrl)

    return { data: publicUrl, error: null }
  } catch (error) {
    console.error('[Upload] Unexpected error:', error)
    return { 
      data: null, 
      error: new Error(error instanceof Error ? error.message : 'Unknown error occurred during upload') as StorageError 
    }
  }
} 