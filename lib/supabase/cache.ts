import { PostgrestError } from '@supabase/supabase-js'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class SupabaseCache {
  private cache: Map<string, CacheEntry<any>>
  private defaultTTL: number

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutos por defecto
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  async get<T>(
    key: string,
    fetchFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    ttl = this.defaultTTL
  ): Promise<{ data: T | null; error: PostgrestError | null }> {
    const cached = this.cache.get(key)
    const now = Date.now()

    // Si hay datos en cache y no han expirado
    if (cached && now - cached.timestamp < ttl) {
      return { data: cached.data, error: null }
    }

    // Si no hay cache o expiró, hacemos la consulta
    const result = await fetchFn()
    
    // Solo guardamos en cache si la consulta fue exitosa
    if (result.data && !result.error) {
      this.cache.set(key, {
        data: result.data,
        timestamp: now
      })
    }

    return result
  }

  // Método para invalidar el cache de una key específica
  invalidate(key: string) {
    this.cache.delete(key)
  }

  // Método para limpiar todo el cache
  clear() {
    this.cache.clear()
  }
}

// Exportamos una instancia singleton
export const supabaseCache = new SupabaseCache() 