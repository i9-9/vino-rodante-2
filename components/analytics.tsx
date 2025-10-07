'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { initGA4, getGA4Config } from '@/lib/analytics'

// Google Analytics 4 component
export function GoogleAnalytics() {
  const config = getGA4Config()
  
  // Don't render if no measurement ID
  if (!config.measurementId) {
    if (config.debug) {
      console.warn('⚠️ Google Analytics: No measurement ID provided')
    }
    return null
  }

  useEffect(() => {
    // Initialize GA4
    initGA4(config)
  }, [config])

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`}
      />
      
      {/* Global Site Tag */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              transport_type: 'beacon',
              enhanced_ecommerce: true,
              debug_mode: ${config.debug},
              sample_rate: ${config.sampleRate},
              custom_map: {
                'custom_parameter_1': 'product_category',
                'custom_parameter_2': 'wine_region', 
                'custom_parameter_3': 'wine_varietal',
                'custom_parameter_4': 'wine_year'
              }
            });
          `,
        }}
      />
    </>
  )
}

// Hook for GA4 tracking
export function useAnalytics() {
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 GA4 Event:', eventName, parameters)
      }
    }
  }

  const trackPageView = (pagePath: string, pageTitle: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', getGA4Config().measurementId, {
        page_path: pagePath,
        page_title: pageTitle
      })
    }
  }

  return {
    trackEvent,
    trackPageView
  }
}

// Analytics provider for the app
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  )
}
