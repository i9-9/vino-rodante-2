// Google Analytics 4 configuration for Vino Rodante
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export interface GA4Config {
  measurementId: string
  debug?: boolean
  sampleRate?: number
  customDimensions?: Record<string, string>
}

// Initialize Google Analytics 4
export function initGA4(config: GA4Config) {
  if (typeof window === 'undefined') return

  const { measurementId, debug = false, sampleRate = 1 } = config

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  
  // Define gtag function
  window.gtag = function() {
    window.dataLayer.push(arguments)
  }

  // Configure GA4
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    // Performance settings
    send_page_view: true,
    transport_type: 'beacon',
    
    // Custom settings for Vino Rodante
    custom_map: {
      'custom_parameter_1': 'product_category',
      'custom_parameter_2': 'wine_region',
      'custom_parameter_3': 'wine_varietal',
      'custom_parameter_4': 'product_year'
    },
    
    // Enhanced ecommerce
    enhanced_ecommerce: true,
    
    // Debug mode
    debug_mode: debug,
    
    // Sample rate
    sample_rate: sampleRate,
    
    // Custom dimensions
    custom_parameters: config.customDimensions || {}
  })

  if (debug) {
    console.log('🚀 Google Analytics 4 initialized for Vino Rodante')
  }
}

// E-commerce tracking for Vino Rodante
export const ecommerceTracking = {
  // Track product views
  trackProductView: (product: {
    id: string
    name: string
    category: string
    brand: string
    price: number
    currency: string
    region?: string
    varietal?: string
    year?: string
  }) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'view_item', {
      currency: product.currency,
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price,
        currency: product.currency,
        // Custom parameters for wine
        wine_region: product.region,
        wine_varietal: product.varietal,
        wine_year: product.year
      }]
    })

    console.log('📊 GA4: Product view tracked', product.name)
  },

  // Track add to cart
  trackAddToCart: (product: {
    id: string
    name: string
    category: string
    price: number
    currency: string
    quantity?: number
  }) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'add_to_cart', {
      currency: product.currency,
      value: product.price * (product.quantity || 1),
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: product.quantity || 1,
        currency: product.currency
      }]
    })

    console.log('🛒 GA4: Add to cart tracked', product.name)
  },

  // Track purchase
  trackPurchase: (transaction: {
    transaction_id: string
    value: number
    currency: string
    items: Array<{
      id: string
      name: string
      category: string
      price: number
      quantity: number
    }>
  }) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'purchase', {
      transaction_id: transaction.transaction_id,
      value: transaction.value,
      currency: transaction.currency,
      items: transaction.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
        currency: transaction.currency
      }))
    })

    console.log('💰 GA4: Purchase tracked', transaction.transaction_id)
  },

  // Track search
  trackSearch: (searchTerm: string, resultCount?: number) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'search', {
      search_term: searchTerm,
      custom_map: {
        result_count: resultCount || 0
      }
    })

    console.log('🔍 GA4: Search tracked', searchTerm)
  },

  // Track newsletter signup
  trackNewsletterSignup: (email: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'sign_up', {
      method: 'newsletter',
      custom_map: {
        email_domain: email.split('@')[1]
      }
    })

    console.log('📧 GA4: Newsletter signup tracked')
  },

  // Track wine club subscription
  trackWineClubSubscription: (clubType: string, plan: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'subscribe', {
      method: 'wine_club',
      custom_map: {
        club_type: clubType,
        subscription_plan: plan
      }
    })

    console.log('🍷 GA4: Wine club subscription tracked', clubType)
  }
}

// Custom events for Vino Rodante
export const customEvents = {
  // Track FAQ interactions
  trackFAQInteraction: (question: string, category: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'faq_interaction', {
      event_category: 'Engagement',
      event_label: question,
      custom_map: {
        faq_category: category
      }
    })
  },

  // Track wine education content
  trackWineEducation: (contentType: string, contentTitle: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'wine_education', {
      event_category: 'Content',
      event_label: contentTitle,
      custom_map: {
        content_type: contentType
      }
    })
  },

  // Track regional wine interest
  trackRegionalInterest: (region: string, action: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'regional_interest', {
      event_category: 'Wine Interest',
      event_label: region,
      custom_map: {
        wine_region: region,
        action_type: action
      }
    })
  },

  // Track varietal interest
  trackVarietalInterest: (varietal: string, action: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'varietal_interest', {
      event_category: 'Wine Interest',
      event_label: varietal,
      custom_map: {
        wine_varietal: varietal,
        action_type: action
      }
    })
  }
}

// Enhanced measurement events
export const enhancedMeasurement = {
  // Track scroll depth
  trackScrollDepth: (depth: number) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'scroll', {
      event_category: 'Engagement',
      scroll_depth: depth
    })
  },

  // Track outbound clicks
  trackOutboundClick: (url: string, linkText: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'click', {
      event_category: 'Outbound',
      event_label: linkText,
      custom_map: {
        outbound_url: url
      }
    })
  },

  // Track file downloads
  trackFileDownload: (fileName: string, fileType: string) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'file_download', {
      event_category: 'Downloads',
      event_label: fileName,
      custom_map: {
        file_type: fileType
      }
    })
  }
}

// Configuration for different environments
export const getGA4Config = (): GA4Config => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'

  return {
    measurementId: process.env.NEXT_PUBLIC_GA_ID || '',
    debug: isDevelopment,
    sampleRate: isProduction ? 0.1 : 1, // 10% in production, 100% in development
    customDimensions: {
      'wine_region': 'Wine Region',
      'wine_varietal': 'Wine Varietal',
      'wine_year': 'Wine Year',
      'product_category': 'Product Category'
    }
  }
}
