// Configuración de cache optimizada para Supabase
export const SUPABASE_CACHE_CONFIG = {
  // Configuración de revalidación por tipo de página
  revalidation: {
    // Páginas estáticas - revalidar cada 2-4 horas
    static: {
      home: 3600, // 1 hora
      products: 1800, // 30 minutos
      productDetail: 7200, // 2 horas
      collections: 3600, // 1 hora
    },
    
    // Páginas dinámicas - revalidar más frecuentemente
    dynamic: {
      account: 0, // Siempre dinámico
      checkout: 0, // Siempre dinámico
      auth: 0, // Siempre dinámico
    }
  },

  // Configuración de cache para diferentes tipos de datos
  dataCache: {
    products: {
      ttl: 30 * 60 * 1000, // 30 minutos
      maxSize: 100, // Máximo 100 productos en cache
    },
    images: {
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      maxSize: 50, // Máximo 50 imágenes en cache
    },
    subscriptions: {
      ttl: 15 * 60 * 1000, // 15 minutos
      maxSize: 20, // Máximo 20 suscripciones en cache
    }
  },

  // Configuración de headers de cache
  cacheHeaders: {
    // Para páginas estáticas
    static: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, s-maxage=3600',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=3600'
    },
    
    // Para datos de API
    api: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      'CDN-Cache-Control': 'public, s-maxage=1800',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=1800'
    },
    
    // Para imágenes
    images: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'public, s-maxage=86400',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=86400'
    }
  },

  // Configuración de optimización de queries
  queryOptimization: {
    // Usar select específico en lugar de *
    useSpecificSelect: true,
    
    // Límites de paginación
    pagination: {
      default: 20,
      max: 100
    },
    
    // Configuración de retry
    retry: {
      maxAttempts: 2,
      baseDelay: 500,
      maxDelay: 2000
    }
  }
}

// Función para obtener configuración de revalidación por ruta
export function getRevalidationConfig(pathname: string): number {
  const config = SUPABASE_CACHE_CONFIG.revalidation
  
  if (pathname === '/') return config.static.home
  if (pathname.startsWith('/products/')) return config.static.productDetail
  if (pathname === '/products') return config.static.products
  if (pathname.startsWith('/collections/')) return config.static.collections
  if (pathname.startsWith('/account/')) return config.dynamic.account
  if (pathname.startsWith('/checkout/')) return config.dynamic.checkout
  if (pathname.startsWith('/auth/')) return config.dynamic.auth
  
  // Default para páginas no especificadas
  return config.static.home
}

// Función para obtener headers de cache por tipo
export function getCacheHeaders(type: 'static' | 'api' | 'images'): Record<string, string> {
  return SUPABASE_CACHE_CONFIG.cacheHeaders[type]
}

// Función para optimizar queries de Supabase
export function optimizeSupabaseQuery(query: any, options: {
  select?: string[]
  limit?: number
  offset?: number
} = {}) {
  let optimizedQuery = query
  
  // Usar select específico si se proporciona
  if (options.select && options.select.length > 0) {
    optimizedQuery = optimizedQuery.select(options.select.join(', '))
  }
  
  // Aplicar paginación si se especifica
  if (options.limit) {
    optimizedQuery = optimizedQuery.limit(options.limit)
  }
  
  if (options.offset) {
    optimizedQuery = optimizedQuery.range(options.offset, options.offset + (options.limit || 20) - 1)
  }
  
  return optimizedQuery
}

