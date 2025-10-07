'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export function WebVitalsDashboard() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show dashboard in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }

    // Listen for Web Vitals events
    const handleWebVital = (event: CustomEvent) => {
      const metric = event.detail as WebVitalMetric
      setMetrics(prev => [...prev, metric])
    }

    window.addEventListener('web-vital', handleWebVital as EventListener)
    
    return () => {
      window.removeEventListener('web-vital', handleWebVital as EventListener)
    }
  }, [])

  if (!isVisible) return null

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'good': return 'Bueno'
      case 'needs-improvement': return 'Mejorable'
      case 'poor': return 'Malo'
      default: return 'Desconocido'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white shadow-lg border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-900">
            📊 Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {metrics.length === 0 ? (
            <p className="text-xs text-gray-500">
              Esperando métricas...
            </p>
          ) : (
            <div className="space-y-2">
              {metrics.slice(-5).map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{metric.name}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      {metric.name === 'CLS' 
                        ? metric.value.toFixed(3)
                        : `${metric.value.toFixed(0)}ms`
                      }
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-white text-xs px-1 py-0 ${getRatingColor(metric.rating)}`}
                    >
                      {getRatingText(metric.rating)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3 pt-2 border-t text-xs text-gray-500">
            <div className="flex justify-between">
              <span>LCP: &lt;2.5s</span>
              <span>FID: &lt;100ms</span>
              <span>CLS: &lt;0.1</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Performance monitoring component for specific pages
export function PagePerformanceMonitor({ pageName }: { pageName: string }) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const loadTime = performance.now() - startTime
      console.log(`📄 ${pageName} page load time: ${loadTime.toFixed(2)}ms`)
      
      // Send custom event
      const event = new CustomEvent('web-vital', {
        detail: {
          name: 'PAGE_LOAD',
          value: loadTime,
          rating: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'needs-improvement' : 'poor',
          timestamp: Date.now()
        }
      })
      
      window.dispatchEvent(event)
    }
  }, [pageName])
  
  return null
}
