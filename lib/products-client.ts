import { createClient } from '@/lib/supabase/client'
import { createAdaptiveClient } from '@/lib/supabase/client-incognito'
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
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    console.log('🔍 [getProducts] Supabase client created')
    
    // Reducir retries y delays para la página principal
    const maxRetries = 2
    const baseDelay = 500 // ms
    
    let lastError: any = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 [getProducts] Attempt ${attempt}/${maxRetries}`)
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
        
        if (error) {
          lastError = error
          console.error(`🔍 [getProducts] Supabase error (attempt ${attempt}):`, error)
          
          // Solo retry en errores de red/CORS
          if (attempt < maxRetries && (
            error.message?.includes('Network') ||
            error.message?.includes('CORS')
          )) {
            console.log(`🔄 [getProducts] Retrying in ${baseDelay * attempt}ms...`)
            await new Promise(resolve => setTimeout(resolve, baseDelay * attempt))
            continue
          }
          
          // Si es error de autenticación, intentar con cliente público
          if (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116') {
            console.log('🔍 [getProducts] Auth error, trying public client')
            const publicSupabase = createAdaptiveClient()
            const { data: publicData, error: publicError } = await publicSupabase
              .from('products')
              .select('*')
              .eq('is_visible', true)
              .order('created_at', { ascending: false })
            
            if (publicError) {
              console.error('🔍 [getProducts] Public client error:', publicError)
              return { data: null, error: publicError }
            }
            
            console.log('🔍 [getProducts] Public client success! Returning', publicData?.length, 'products')
            return { data: publicData, error: null }
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
          await new Promise(resolve => setTimeout(resolve, baseDelay * attempt))
          continue
        }
      }
    }
    
    return { data: null, error: lastError }
  } catch (error) {
    console.error('🔍 [getProducts] Exception:', error)
    return { data: null, error: error as any }
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
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (data && !error) {
      return { data, error: null }
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      console.log('🔍 [getFeaturedProducts] Auth error, trying public client')
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('🔍 [getFeaturedProducts] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      return { data: publicData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [getFeaturedProducts] Exception:', error)
    return { data: null, error: error as any }
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<ApiResponse<Product[]>> {
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    
    // Mapeo para buscar tanto en español como en inglés
    const category = CATEGORY_SLUG_MAP[categorySlug] || categorySlug // ej: "red" → "tinto"
    
    // También buscar la versión en inglés por si hay productos mal categorizados
    const englishCategory = categorySlug // ej: "red", "white", etc.
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`category.eq.${category},category.eq.${englishCategory}`) // Buscar AMBOS: "blanco" OR "white"
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (data && !error) {
      return { data, error: null }
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('products')
        .select('*')
        .or(`category.eq.${category},category.eq.${englishCategory}`)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('🔍 [getProductsByCategory] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      return { data: publicData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [getProductsByCategory] Exception:', error)
    return { data: null, error: error as any }
  }
}

export async function getProductsByRegion(region: string): Promise<ApiResponse<Product[]>> {
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('region', region)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (data && !error) {
      return { data, error: null }
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      console.log('🔍 [getProductsByRegion] Auth error, trying public client')
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('products')
        .select('*')
        .eq('region', region)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('🔍 [getProductsByRegion] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      return { data: publicData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [getProductsByRegion] Exception:', error)
    return { data: null, error: error as any }
  }
}

export async function getProductsByVarietal(varietal: string): Promise<ApiResponse<Product[]>> {
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('varietal', varietal)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (data && !error) {
      return { data, error: null }
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      console.log('🔍 [getProductsByVarietal] Auth error, trying public client')
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('products')
        .select('*')
        .eq('varietal', varietal)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('🔍 [getProductsByVarietal] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      return { data: publicData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [getProductsByVarietal] Exception:', error)
    return { data: null, error: error as any }
  }
}

export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (data && !error) {
      return { data, error: null }
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      console.log('🔍 [searchProducts] Auth error, trying public client')
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('🔍 [searchProducts] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      return { data: publicData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [searchProducts] Exception:', error)
    return { data: null, error: error as any }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_visible', true)
      .single()

    if (data && !error) {
      return data as Product
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      console.log('🔍 [getProductBySlug] Auth error, trying public client')
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_visible', true)
        .single()

      if (publicError) {
        console.error('🔍 [getProductBySlug] Public client error:', publicError)
        return undefined
      }

      return publicData as Product
    }

    if (error) {
      console.error('Error fetching product by slug:', error)
      return undefined
    }
    
    return data as Product
  } catch (error) {
    console.error('🔍 [getProductBySlug] Exception:', error)
    return undefined
  }
} 