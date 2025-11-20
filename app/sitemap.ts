import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products-client'
import { getAllHybridSlugs } from '@/lib/hybrid-combinations'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  
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
    {
      url: `${baseUrl}/corporate-gifts`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
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
    // Wine category pages in Spanish
    {
      url: `${baseUrl}/collections/tinto`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/blanco`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/rosado`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/espumante`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/naranjo`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/dulce`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/sidra`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  let productPages: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await getProducts()
    if (products) {
      // Filtrar productos válidos: deben tener slug y campos requeridos
      const validProducts = products.filter((product) => {
        // Debe tener slug
        if (!product.slug || product.slug.trim() === '') {
          return false
        }
        
        // Validar campos esenciales
        const isBox = product.category?.toLowerCase() === 'boxes' || product.category?.toLowerCase() === 'box'
        const requiredFields = ['name', 'slug', 'description', 'price', 'image', 'category', 'region', 'stock']
        
        // Para productos individuales (no boxes), year y varietal son requeridos
        if (!isBox) {
          requiredFields.push('year', 'varietal')
        }
        
        // Verificar que todos los campos requeridos estén presentes
        const hasAllFields = requiredFields.every(field => {
          const value = (product as any)[field]
          return value !== null && value !== undefined && value !== ''
        })
        
        return hasAllFields
      })
      
      productPages = validProducts.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error generating product sitemap:', error)
  }


  const varietalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/collections/varietal/malbec`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/varietal/cabernet-sauvignon`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/varietal/chardonnay`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/varietal/sauvignon-blanc`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/varietal/riesling`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  ]

  const regionPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/collections/region/mendoza`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/region/san-juan`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/region/la-rioja`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/region/salta`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections/region/neuquen`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  ]

  // Hybrid varietal-region pages (high-value SEO pages)
  const hybridSlugs = getAllHybridSlugs()
  const hybridPages: MetadataRoute.Sitemap = hybridSlugs.map(slug => ({
    url: `${baseUrl}/vinos/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75, // Higher priority - these are money pages
  }))

  return [
    ...staticPages,
    ...productPages,
    ...varietalPages,
    ...regionPages,
    ...hybridPages
  ]
}
