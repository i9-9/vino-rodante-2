'use client'

import { useEffect } from 'react'
import { initWebVitals, performanceUtils, getWebVitalsConfig } from '@/lib/web-vitals'

// Component to initialize Web Vitals monitoring
export function WebVitalsMonitor() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    const config = getWebVitalsConfig()
    initWebVitals(config)
    
    // Monitor page load performance
    performanceUtils.monitorPageLoad()
    
    // Log initialization
    if (config.debug) {
      console.log('🚀 Web Vitals monitoring initialized for Vino Rodante')
    }
  }, [])
  
  return null // This component doesn't render anything
}

// Hook for custom performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor specific performance metrics for Vino Rodante
    
    // Monitor product image loading
    const productImages = document.querySelectorAll('img[alt*="vino"], img[alt*="Vino"]')
    productImages.forEach((img, index) => {
      if (img instanceof HTMLImageElement) {
        performanceUtils.monitorImageLoad(img, `Product Image ${index + 1}`)
      }
    })
    
    // Monitor cart interactions
    const cartButtons = document.querySelectorAll('[data-testid="add-to-cart"], button[class*="cart"]')
    cartButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const startTime = performance.now()
        
        // Measure cart interaction time
        setTimeout(() => {
          performanceUtils.measureCustomMetric(`Cart Interaction ${index + 1}`, startTime)
        }, 100)
      })
    })
    
  }, [])
  
  return {
    measureCustomMetric: performanceUtils.measureCustomMetric,
    monitorImageLoad: performanceUtils.monitorImageLoad
  }
}

// Performance monitoring for specific Vino Rodante features
export const vinoRodantePerformance = {
  // Monitor product page load
  monitorProductPageLoad: (productName: string) => {
    const startTime = performance.now()
    
    return {
      end: () => {
        const loadTime = performance.now() - startTime
        console.log(`🍷 Product page "${productName}" loaded in: ${loadTime.toFixed(2)}ms`)
        
        // Send to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'product_page_load', {
            event_category: 'Performance',
            event_label: productName,
            value: Math.round(loadTime)
          })
        }
        
        return loadTime
      }
    }
  },
  
  // Monitor search performance
  monitorSearchPerformance: (searchTerm: string) => {
    const startTime = performance.now()
    
    return {
      end: (resultCount: number) => {
        const searchTime = performance.now() - startTime
        console.log(`🔍 Search "${searchTerm}" completed in: ${searchTime.toFixed(2)}ms (${resultCount} results)`)
        
        // Send to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'search_performance', {
            event_category: 'Performance',
            event_label: searchTerm,
            value: Math.round(searchTime),
            custom_map: {
              result_count: resultCount
            }
          })
        }
        
        return searchTime
      }
    }
  },
  
  // Monitor checkout performance
  monitorCheckoutPerformance: () => {
    const startTime = performance.now()
    
    return {
      end: (step: string) => {
        const stepTime = performance.now() - startTime
        console.log(`🛒 Checkout step "${step}" completed in: ${stepTime.toFixed(2)}ms`)
        
        // Send to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'checkout_step', {
            event_category: 'Performance',
            event_label: step,
            value: Math.round(stepTime)
          })
        }
        
        return stepTime
      }
    }
  }
}
