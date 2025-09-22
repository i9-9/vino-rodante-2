// Sistema de cache para imágenes que reduce egress de Supabase
import { createClient } from '@/utils/supabase/client'

interface CachedImage {
  url: string
  timestamp: number
  size: number
}

class ImageCache {
  private cache = new Map<string, CachedImage>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas
  private readonly MAX_CACHE_SIZE = 50 // Máximo 50 imágenes en cache

  private cleanup() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    // Eliminar entradas expiradas
    entries.forEach(([key, value]) => {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    })

    // Si aún hay muchas entradas, eliminar las más antiguas
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE)
      toDelete.forEach(([key]) => this.cache.delete(key))
    }
  }

  getCachedUrl(path: string): string | null {
    this.cleanup()
    const cached = this.cache.get(path)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url
    }
    return null
  }

  setCachedUrl(path: string, url: string, size: number = 0) {
    this.cache.set(path, {
      url,
      timestamp: Date.now(),
      size
    })
    this.cleanup()
  }

  // Obtener URL optimizada con cache
  async getOptimizedImageUrl(path: string, options?: {
    width?: number
    height?: number
    quality?: number
  }): Promise<string> {
    // Verificar cache primero
    const cachedUrl = this.getCachedUrl(path)
    if (cachedUrl) {
      return cachedUrl
    }

    // Generar URL con parámetros de optimización
    const supabase = createClient()
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    // Agregar parámetros de optimización si se especifican
    let optimizedUrl = publicUrl
    if (options) {
      const params = new URLSearchParams()
      if (options.width) params.set('w', options.width.toString())
      if (options.height) params.set('h', options.height.toString())
      if (options.quality) params.set('q', options.quality.toString())
      
      if (params.toString()) {
        optimizedUrl += `?${params.toString()}`
      }
    }

    // Cachear la URL
    this.setCachedUrl(path, optimizedUrl)
    
    return optimizedUrl
  }

  // Limpiar cache manualmente
  clear() {
    this.cache.clear()
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      duration: this.CACHE_DURATION
    }
  }
}

// Instancia singleton
export const imageCache = new ImageCache()

// Hook para usar el cache de imágenes
export function useImageCache() {
  return {
    getOptimizedUrl: imageCache.getOptimizedImageUrl.bind(imageCache),
    clearCache: imageCache.clear.bind(imageCache),
    getStats: imageCache.getStats.bind(imageCache)
  }
}

