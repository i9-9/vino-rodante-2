/**
 * Cache tags para revalidación on-demand
 */

export const CACHE_TAGS = {
  PRODUCTS: 'products',
  PRODUCT_BY_SLUG: 'product-by-slug',
  FEATURED_PRODUCTS: 'featured-products',
  PRODUCTS_BY_CATEGORY: 'products-by-category',
  PRODUCTS_BY_REGION: 'products-by-region',
  PRODUCTS_BY_VARIETAL: 'products-by-varietal',
  BOXES: 'boxes',
  SUBSCRIPTION_PLANS: 'subscription-plans',
  DISCOUNTS: 'discounts',
} as const

/**
 * Función helper para agregar tags a consultas de Supabase
 * En Next.js 15, los tags se manejan a nivel de fetch, no de Supabase
 */
export function addCacheTag(tag: string) {
  // Los tags se agregan en el fetch() call, no en la consulta de Supabase
  return tag
}

/**
 * Tags para diferentes tipos de consultas de productos
 */
export const PRODUCT_CACHE_TAGS = {
  all: [CACHE_TAGS.PRODUCTS],
  bySlug: (slug: string) => [CACHE_TAGS.PRODUCT_BY_SLUG, `product-${slug}`],
  featured: [CACHE_TAGS.FEATURED_PRODUCTS],
  byCategory: (category: string) => [CACHE_TAGS.PRODUCTS_BY_CATEGORY, `category-${category}`],
  byRegion: (region: string) => [CACHE_TAGS.PRODUCTS_BY_REGION, `region-${region}`],
  byVarietal: (varietal: string) => [CACHE_TAGS.PRODUCTS_BY_VARIETAL, `varietal-${varietal}`],
} as const
