import { createClient } from '@/lib/supabase/client'
import { createAdaptiveClient } from '@/lib/supabase/client-incognito'
import { PostgrestError } from '@supabase/supabase-js'
import { StorageError } from '@supabase/storage-js'
import { CATEGORY_SLUG_MAP, REGION_SLUG_MAP } from './wine-data'
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
    
    let lastError: unknown = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 [getProducts] Attempt ${attempt}/${maxRetries}`)
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true)
          .not('category', 'in', '("boxes","Boxes")') // Excluir boxes de productos generales
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
              .not('category', 'in', '("boxes","Boxes")') // Excluir boxes de productos generales
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
    
    return { data: null, error: lastError as PostgrestError | StorageError | null }
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

export async function getBoxesProducts(): Promise<ApiResponse<Product[]>> {
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or('category.eq.boxes,category.eq.Boxes')
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
        .or('category.eq.boxes,category.eq.Boxes')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('🔍 [getBoxesProducts] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      return { data: publicData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [getBoxesProducts] Exception:', error)
    return { data: null, error: error as any }
  }
}

// Función para obtener los productos individuales de un box
export async function getBoxProducts(boxId: string): Promise<ApiResponse<any[]>> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('box_product_relations')
      .select(`
        product_id,
        quantity,
        products:product_id (
          id,
          name,
          price,
          image,
          varietal,
          year,
          region,
          description
        )
      `)
      .eq('box_id', boxId)

    if (data && !error) {
      // Formatear los datos para que sean más fáciles de usar
      const formattedData = data.map(relation => ({
        product_id: relation.product_id,
        quantity: relation.quantity,
        ...relation.products
      }))
      
      return { data: formattedData, error: null }
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('box_product_relations')
        .select(`
          product_id,
          quantity,
          products:product_id (
            id,
            name,
            price,
            image,
            varietal,
            year,
            region,
            description
          )
        `)
        .eq('box_id', boxId)

      if (publicError) {
        console.error('🔍 [getBoxProducts] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      // Formatear los datos para que sean más fáciles de usar
      const formattedData = publicData?.map(relation => ({
        product_id: relation.product_id,
        quantity: relation.quantity,
        ...relation.products
      })) || []

      return { data: formattedData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [getBoxProducts] Exception:', error)
    return { data: null, error: error as any }
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<ApiResponse<Product[]>> {
  try {
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    
    // Mapeo para buscar tanto en español como en inglés, con soporte para mayúsculas y minúsculas
    const categories = CATEGORY_SLUG_MAP[categorySlug] || [categorySlug] // ej: "red" → ["Tinto", "tinto"]
    
    // Usar las categorías del mapeo o fallback al slug original
    const searchCategories = categories
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('category', searchCategories) // Buscar en las categorías especificadas
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
        .in('category', searchCategories)
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
    // Convertir slug de región al nombre completo como se almacena en DB
    const dbRegionName = REGION_SLUG_MAP[region] || region
    
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('region', dbRegionName)
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
        .eq('region', dbRegionName)
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
      .ilike('varietal', varietal) // Case-insensitive search
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
        .ilike('varietal', varietal) // Case-insensitive search
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

export async function getProductsByVarietalAndRegion(varietal: string, region: string): Promise<ApiResponse<Product[]>> {
  try {
    // Convertir slug de región al nombre completo como se almacena en DB
    const dbRegionName = REGION_SLUG_MAP[region] || region

    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('varietal', varietal) // Case-insensitive search for varietal
      .eq('region', dbRegionName) // Exact match for region
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (data && !error) {
      return { data, error: null }
    }

    // Si hay error de autenticación, usar cliente público
    if (error && (error.message?.includes('auth') || error.message?.includes('policy') || (error as any).code === 'PGRST116')) {
      console.log('🔍 [getProductsByVarietalAndRegion] Auth error, trying public client')
      const publicSupabase = createAdaptiveClient()
      const { data: publicData, error: publicError } = await publicSupabase
        .from('products')
        .select('*')
        .ilike('varietal', varietal)
        .eq('region', dbRegionName)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('🔍 [getProductsByVarietalAndRegion] Public client error:', publicError)
        return { data: null, error: publicError }
      }

      return { data: publicData, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error('🔍 [getProductsByVarietalAndRegion] Exception:', error)
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

// Función auxiliar para intentar buscar un producto con diferentes variaciones del slug
async function tryFindProductWithVariations(slug: string, supabase: any): Promise<Product | undefined> {
  // Generar diferentes variaciones del slug
  const variations = [
    slug, // Slug original
    slug.replace(/-/g, ''), // Sin guiones: '4040malbec'
    slug.replace(/-/g, '_'), // Con guiones bajos: '40_40_malbec'
    slug.replace(/-/g, '').toLowerCase(), // Sin guiones y minúsculas
  ]

  for (const variation of variations) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', variation)
        .eq('is_visible', true)
        .single()

      if (data && !error) {
        console.log('🔍 [getProductBySlug] Found product with variation:', variation)
        return data as Product
      }
    } catch (error) {
      // Continuar con la siguiente variación
      continue
    }
  }

  return undefined
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    // Decodificar el slug para manejar caracteres especiales como tildes
    const decodedSlug = decodeURIComponent(slug)
    console.log('🔍 [getProductBySlug] Original slug:', slug)
    console.log('🔍 [getProductBySlug] Decoded slug:', decodedSlug)
    
    // Intentar primero con el cliente autenticado
    const supabase = createClient()
    let product = await tryFindProductWithVariations(decodedSlug, supabase)
    
    if (product) {
      return product
    }

    // Si no encontramos con cliente autenticado, intentar con cliente público
    console.log('🔍 [getProductBySlug] Trying public client')
    const publicSupabase = createAdaptiveClient()
    product = await tryFindProductWithVariations(decodedSlug, publicSupabase)
    
    if (product) {
      return product
    }

    console.log('🔍 [getProductBySlug] Product not found with any variation')
    return undefined
  } catch (error) {
    console.error('🔍 [getProductBySlug] Exception:', error)
    return undefined
  }
}

// Función específica para el mega menú que incluye todas las categorías para filtrado
export async function getProductsForMenu(): Promise<ApiResponse<Product[]>> {
  console.log('🔍 [getProductsForMenu] Function called for mega menu')
  
  try {
    const supabase = createClient()
    
    const maxRetries = 2
    const baseDelay = 500 // ms
    
    let lastError: unknown = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 [getProductsForMenu] Attempt ${attempt}/${maxRetries}`)
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true)
          // Incluir todas las categorías para el mega menú (incluso boxes para filtrado)
          .order('created_at', { ascending: false })
        
        if (error) {
          lastError = error
          console.error(`🔍 [getProductsForMenu] Supabase error (attempt ${attempt}):`, error)
          
          // Solo retry en errores de red/CORS
          if (attempt < maxRetries && (
            error.message?.includes('Network') ||
            error.message?.includes('CORS')
          )) {
            console.log(`🔄 [getProductsForMenu] Retrying in ${baseDelay * attempt}ms...`)
            await new Promise(resolve => setTimeout(resolve, baseDelay * attempt))
            continue
          }
          
          throw error
        }
        
        console.log(`✅ [getProductsForMenu] Success: ${data?.length || 0} products loaded`)
        return { data: data || [], error: null }
        
      } catch (attemptError) {
        lastError = attemptError
        console.error(`🔍 [getProductsForMenu] Attempt ${attempt} failed:`, attemptError)
        
        if (attempt === maxRetries) {
          break
        }
        
        await new Promise(resolve => setTimeout(resolve, baseDelay * attempt))
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    console.error('🔍 [getProductsForMenu] All attempts failed, trying incognito client')
    
    // Fallback al cliente incógnito
    const incognitoSupabase = createAdaptiveClient()
    const { data: fallbackData, error: fallbackError } = await incognitoSupabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
    
    if (fallbackError) {
      console.error('🔍 [getProductsForMenu] Incognito client also failed:', fallbackError)
      return { data: null, error: fallbackError }
    }
    
    console.log(`✅ [getProductsForMenu] Incognito success: ${fallbackData?.length || 0} products loaded`)
    return { data: fallbackData || [], error: null }
    
  } catch (error) {
    console.error('🔍 [getProductsForMenu] Exception:', error)
    return { data: null, error: error as PostgrestError }
  }
} 