import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products-client'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/bestsellers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/boxes`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    // Weekly Wine Club pages
    {
      url: `${baseUrl}/weekly-wine`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/weekly-wine/tinto`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/weekly-wine/blanco`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/weekly-wine/mixto`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/weekly-wine/naranjo`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Auth pages
    {
      url: `${baseUrl}/auth/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/reset-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.2,
    },
    // Checkout pages
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/checkout/subscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await getProducts()
    if (products) {
      productPages = products.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error generating product sitemap:', error)
  }

  // Dynamic subscription plan pages
  let subscriptionPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('slug, club, updated_at')
      .eq('is_active', true)
      .eq('is_visible', true)
    
    if (plans) {
      subscriptionPages = plans.map((plan) => ({
        url: `${baseUrl}/weekly-wine/${plan.club}`,
        lastModified: new Date(plan.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error generating subscription sitemap:', error)
  }

  // Dynamic varietal pages
  let varietalPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: varietals } = await supabase
      .from('products')
      .select('varietal')
      .eq('is_visible', true)
      .not('varietal', 'is', null)
      .not('varietal', 'eq', '')
      .not('varietal', 'eq', 'Múltiples')
    
    if (varietals) {
      // Get unique varietals and create pages
      const uniqueVarietals = [...new Set(varietals.map(v => v.varietal))]
      varietalPages = uniqueVarietals.map((varietal) => ({
        url: `${baseUrl}/collections/varietal/${varietal.toLowerCase().replace(/\s+/g, '-')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error generating varietal sitemap:', error)
  }

  // Dynamic region pages
  let regionPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: regions } = await supabase
      .from('products')
      .select('region')
      .eq('is_visible', true)
      .not('region', 'is', null)
      .not('region', 'eq', '')
      .not('region', 'eq', 'Múltiples')
    
    if (regions) {
      // Get unique regions and create pages
      const uniqueRegions = [...new Set(regions.map(r => r.region))]
      regionPages = uniqueRegions.map((region) => ({
        url: `${baseUrl}/collections/region/${region.toLowerCase().replace(/\s+/g, '-')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error generating region sitemap:', error)
  }

  return [
    ...staticPages, 
    ...productPages, 
    ...subscriptionPages, 
    ...varietalPages, 
    ...regionPages
  ]
}
