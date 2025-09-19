// Performance utilities for SEO optimization
export const performanceConfig = {
  // Image optimization settings
  imageQuality: {
    hero: 90,
    product: 85,
    thumbnail: 75,
    gallery: 80
  },
  
  // Lazy loading thresholds
  lazyLoadThreshold: {
    mobile: 0.5, // Load when 50% visible on mobile
    desktop: 0.3 // Load when 30% visible on desktop
  },
  
  // Critical resource hints
  preloadResources: [
    '/fonts/inter-var.woff2',
    '/images/hero-bg.webp',
    '/logo/logo_vr.svg'
  ],
  
  // Service worker cache strategies
  cacheStrategies: {
    images: 'cache-first',
    api: 'network-first',
    static: 'stale-while-revalidate'
  }
}

// Core Web Vitals optimization
export const optimizeCoreWebVitals = {
  // Largest Contentful Paint (LCP) - Target: < 2.5s
  lcp: {
    optimizeHeroImages: true,
    preloadCriticalImages: true,
    useWebP: true,
    lazyLoadNonCritical: true
  },
  
  // First Input Delay (FID) - Target: < 100ms
  fid: {
    minimizeJavaScript: true,
    deferNonCriticalJS: true,
    useWebWorkers: true
  },
  
  // Cumulative Layout Shift (CLS) - Target: < 0.1
  cls: {
    reserveImageSpace: true,
    avoidDynamicContent: true,
    useSkeletonLoaders: true
  }
}

// SEO-friendly loading states
export const skeletonConfig = {
  productCard: {
    height: '400px',
    borderRadius: '8px',
    animation: 'pulse'
  },
  hero: {
    height: '600px',
    borderRadius: '0px',
    animation: 'wave'
  },
  text: {
    height: '1rem',
    borderRadius: '4px',
    animation: 'pulse'
  }
}

