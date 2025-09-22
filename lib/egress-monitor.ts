// Sistema de monitoreo de egress para Supabase
interface EgressMetrics {
  timestamp: number
  endpoint: string
  size: number
  type: 'api' | 'storage' | 'function'
  cached: boolean
}

class EgressMonitor {
  private metrics: EgressMetrics[] = []
  private readonly MAX_METRICS = 1000 // Máximo 1000 métricas en memoria
  private readonly EGRESS_LIMIT = 5 * 1024 * 1024 * 1024 // 5GB en bytes
  private currentEgress = 0

  // Registrar una métrica de egress
  recordEgress(endpoint: string, size: number, type: 'api' | 'storage' | 'function', cached: boolean = false) {
    const metric: EgressMetrics = {
      timestamp: Date.now(),
      endpoint,
      size,
      type,
      cached
    }

    this.metrics.push(metric)
    this.currentEgress += size

    // Limpiar métricas antiguas si excedemos el límite
    if (this.metrics.length > this.MAX_METRICS) {
      const removed = this.metrics.shift()
      if (removed) {
        this.currentEgress -= removed.size
      }
    }

    // Log warning si nos acercamos al límite
    if (this.currentEgress > this.EGRESS_LIMIT * 0.8) {
      console.warn(`⚠️ Egress usage at ${this.getUsagePercentage().toFixed(1)}% of monthly limit`)
    }

    // Log error si excedemos el límite
    if (this.currentEgress > this.EGRESS_LIMIT) {
      console.error(`🚨 EGRESS LIMIT EXCEEDED! Current usage: ${this.formatBytes(this.currentEgress)}`)
    }
  }

  // Obtener estadísticas de uso
  getStats() {
    const now = Date.now()
    const last24h = this.metrics.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000)
    const last7d = this.metrics.filter(m => now - m.timestamp < 7 * 24 * 60 * 60 * 1000)

    const byType = this.metrics.reduce((acc, metric) => {
      acc[metric.type] = (acc[metric.type] || 0) + metric.size
      return acc
    }, {} as Record<string, number>)

    const byEndpoint = this.metrics.reduce((acc, metric) => {
      acc[metric.endpoint] = (acc[metric.endpoint] || 0) + metric.size
      return acc
    }, {} as Record<string, number>)

    return {
      totalEgress: this.currentEgress,
      usagePercentage: this.getUsagePercentage(),
      last24h: {
        count: last24h.length,
        size: last24h.reduce((sum, m) => sum + m.size, 0)
      },
      last7d: {
        count: last7d.length,
        size: last7d.reduce((sum, m) => sum + m.size, 0)
      },
      byType,
      byEndpoint: Object.entries(byEndpoint)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10), // Top 10 endpoints
      isNearLimit: this.currentEgress > this.EGRESS_LIMIT * 0.8,
      isOverLimit: this.currentEgress > this.EGRESS_LIMIT
    }
  }

  // Obtener porcentaje de uso
  getUsagePercentage(): number {
    return (this.currentEgress / this.EGRESS_LIMIT) * 100
  }

  // Formatear bytes a formato legible
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Limpiar métricas
  clear() {
    this.metrics = []
    this.currentEgress = 0
  }

  // Obtener recomendaciones de optimización
  getOptimizationRecommendations() {
    const stats = this.getStats()
    const recommendations: string[] = []

    if (stats.byType.storage > stats.byType.api * 2) {
      recommendations.push('Consider using image optimization and CDN for storage')
    }

    if (stats.byType.api > stats.byType.storage) {
      recommendations.push('Consider implementing API caching to reduce database calls')
    }

    const topEndpoint = stats.byEndpoint[0]
    if (topEndpoint && topEndpoint[1] > this.EGRESS_LIMIT * 0.3) {
      recommendations.push(`Optimize endpoint: ${topEndpoint[0]} (${this.formatBytes(topEndpoint[1])})`)
    }

    if (stats.last24h.size > this.EGRESS_LIMIT * 0.1) {
      recommendations.push('High daily usage detected - consider implementing more aggressive caching')
    }

    return recommendations
  }
}

// Instancia singleton
export const egressMonitor = new EgressMonitor()

// Hook para usar el monitor
export function useEgressMonitor() {
  return {
    recordEgress: egressMonitor.recordEgress.bind(egressMonitor),
    getStats: egressMonitor.getStats.bind(egressMonitor),
    getUsagePercentage: egressMonitor.getUsagePercentage.bind(egressMonitor),
    getOptimizationRecommendations: egressMonitor.getOptimizationRecommendations.bind(egressMonitor),
    clear: egressMonitor.clear.bind(egressMonitor)
  }
}

// Interceptor para fetch requests
export function interceptSupabaseRequests() {
  const originalFetch = window.fetch

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url
    const startTime = Date.now()

    try {
      const response = await originalFetch(input, init)
      
      // Estimar tamaño de respuesta
      const contentLength = response.headers.get('content-length')
      const size = contentLength ? parseInt(contentLength) : 0

      // Determinar tipo de request
      let type: 'api' | 'storage' | 'function' = 'api'
      if (url.includes('/storage/')) type = 'storage'
      if (url.includes('/functions/')) type = 'function'

      // Registrar métrica
      egressMonitor.recordEgress(url, size, type, false)

      return response
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }
}

