// Core Web Vitals monitoring for Vino Rodante
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export interface WebVitalMetric {
  name: string
  value: number
  delta: number
  id: string
  navigationType: string
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export interface WebVitalsConfig {
  analyticsId?: string
  debug?: boolean
  sampleRate?: number
  customEndpoint?: string
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
} as const

// Determine rating based on thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Send metrics to analytics
function sendToAnalytics(metric: WebVitalMetric, config: WebVitalsConfig) {
  const { analyticsId, customEndpoint, debug } = config
  
  if (debug) {
    console.log('📊 Web Vital:', {
      name: metric.name,
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
      timestamp: new Date(metric.timestamp).toISOString()
    })
  }
  
  // Send to Google Analytics 4
  if (analyticsId && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: Math.round(metric.value),
      custom_map: {
        metric_id: metric.id,
        metric_delta: metric.delta,
        metric_navigation_type: metric.navigationType
      }
    })
  }
  
  // Send to custom endpoint
  if (customEndpoint) {
    fetch(customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metric,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(error => {
      if (debug) console.warn('Failed to send Web Vital to custom endpoint:', error)
    })
  }
}

// Initialize Web Vitals monitoring
export function initWebVitals(config: WebVitalsConfig = {}) {
  const { debug = false, sampleRate = 1 } = config
  
  if (debug) {
    console.log('🚀 Initializing Web Vitals monitoring...')
  }
  
  // Only monitor for a percentage of users (sample rate)
  if (Math.random() > sampleRate) {
    return
  }
  
  // Monitor Largest Contentful Paint
  getLCP((metric) => {
    const webVitalMetric: WebVitalMetric = {
      name: 'LCP',
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      rating: getRating('LCP', metric.value),
      timestamp: Date.now()
    }
    
    sendToAnalytics(webVitalMetric, config)
  })
  
  // Monitor First Input Delay
  getFID((metric) => {
    const webVitalMetric: WebVitalMetric = {
      name: 'FID',
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      rating: getRating('FID', metric.value),
      timestamp: Date.now()
    }
    
    sendToAnalytics(webVitalMetric, config)
  })
  
  // Monitor Cumulative Layout Shift
  getCLS((metric) => {
    const webVitalMetric: WebVitalMetric = {
      name: 'CLS',
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      rating: getRating('CLS', metric.value),
      timestamp: Date.now()
    }
    
    sendToAnalytics(webVitalMetric, config)
  })
  
  // Monitor First Contentful Paint
  getFCP((metric) => {
    const webVitalMetric: WebVitalMetric = {
      name: 'FCP',
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      rating: getRating('FCP', metric.value),
      timestamp: Date.now()
    }
    
    sendToAnalytics(webVitalMetric, config)
  })
  
  // Monitor Time to First Byte
  getTTFB((metric) => {
    const webVitalMetric: WebVitalMetric = {
      name: 'TTFB',
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      rating: getRating('TTFB', metric.value),
      timestamp: Date.now()
    }
    
    sendToAnalytics(webVitalMetric, config)
  })
  
  if (debug) {
    console.log('✅ Web Vitals monitoring initialized')
  }
}

// Performance monitoring utilities
export const performanceUtils = {
  // Measure custom performance metrics
  measureCustomMetric: (name: string, startTime: number) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    
    return duration
  },
  
  // Monitor image loading performance
  monitorImageLoad: (imageElement: HTMLImageElement, imageName: string) => {
    const startTime = performance.now()
    
    imageElement.addEventListener('load', () => {
      const loadTime = performance.now() - startTime
      console.log(`🖼️ ${imageName} loaded in: ${loadTime.toFixed(2)}ms`)
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'image_load', {
          event_category: 'Performance',
          event_label: imageName,
          value: Math.round(loadTime)
        })
      }
    })
    
    imageElement.addEventListener('error', () => {
      console.warn(`❌ ${imageName} failed to load`)
      
      // Send error to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'image_error', {
          event_category: 'Performance',
          event_label: imageName
        })
      }
    })
  },
  
  // Monitor page load performance
  monitorPageLoad: () => {
    if (typeof window === 'undefined') return
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      }
      
      console.log('📄 Page Load Metrics:', {
        'DOM Content Loaded': `${metrics.domContentLoaded.toFixed(2)}ms`,
        'Load Complete': `${metrics.loadComplete.toFixed(2)}ms`,
        'Total Load Time': `${metrics.totalLoadTime.toFixed(2)}ms`
      })
      
      // Send to analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'page_load', {
          event_category: 'Performance',
          event_label: 'page_load_time',
          value: Math.round(metrics.totalLoadTime)
        })
      }
    })
  }
}

// Environment-specific configuration
export const getWebVitalsConfig = (): WebVitalsConfig => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return {
    analyticsId: process.env.NEXT_PUBLIC_GA_ID,
    debug: isDevelopment,
    sampleRate: isProduction ? 0.1 : 1, // Monitor 10% in production, 100% in development
    customEndpoint: process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT
  }
}
