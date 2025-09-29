import { NextSeoProps } from 'next-seo'
import { generateProductStructuredData, generateCollectionStructuredData, generateWebsiteStructuredData, addStructuredDataToSEO } from './seo-utils'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // En desarrollo, detectar el puerto correcto
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'
    return `http://localhost:${port}`
  }
  return 'https://www.vinorodante.com'
}

// Función para generar descriptions ricas en keywords
const generateRichDescription = (product: {
  name: string
  description: string
  price: number
  region: string
  varietal?: string
  year?: string
  category: string
}) => {
  const baseDescription = product.description.slice(0, 80)
  const keywords = []
  
  // Keywords específicos por varietal
  if (product.varietal) {
    const varietalLower = product.varietal.toLowerCase()
    if (varietalLower.includes('malbec')) {
      keywords.push('malbec argentino', 'mejor malbec')
    } else if (varietalLower.includes('cabernet')) {
      keywords.push('cabernet sauvignon', 'cabernet argentino')
    } else if (varietalLower.includes('chardonnay')) {
      keywords.push('chardonnay argentino', 'chardonnay premium')
    } else if (varietalLower.includes('torrontés') || varietalLower.includes('torrontes')) {
      keywords.push('torrontés argentino', 'torrontés salta')
    }
  }
  
  // Keywords específicos por región
  const regionLower = product.region.toLowerCase()
  if (regionLower.includes('mendoza')) {
    keywords.push('vinos mendoza', 'malbec mendoza')
  } else if (regionLower.includes('salta')) {
    keywords.push('vinos salta', 'torrontés salta')
  } else if (regionLower.includes('patagonia')) {
    keywords.push('vinos patagonia', 'pinot noir patagonia')
  }
  
  // Keywords por categoría
  if (product.category.toLowerCase().includes('box')) {
    keywords.push('box vinos', 'pack vinos', 'selección vinos')
  }
  
  const keywordString = keywords.length > 0 ? ` ${keywords.slice(0, 3).join(', ')}.` : ''
  
  return `🍷 ${product.name} ${product.year ? `(${product.year})` : ''} - ${product.varietal || 'Vino'} de ${product.region}. ${baseDescription}... ¡Comprá online por $${product.price.toFixed(2)}! Envío gratis en compras +$5000.${keywordString} Vinos argentinos premium.`
}

export const defaultSEO: NextSeoProps = {
  title: "Vino Rodante | Selección de Vinos Argentinos",
  description: "Descubrí vinos excepcionales de todo el país, cuidadosamente seleccionados para los paladares más exigentes.",
  canonical: getBaseUrl(),
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: getBaseUrl(),    
    siteName: 'Vino Rodante',
    title: 'Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia',
    description: 'Tienda online de Vino Rodante. Envíos a todo el país',
    images: [
      {
        url: `${getBaseUrl()}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Vino Rodante - El Vino Rueda en el Tiempo y Crece con la Historia',
      }
    ]
  },
  twitter: {
    handle: '@vinorodante',
    site: '@vinorodante',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'vino, wine, argentina, malbec, cabernet, chardonnay, vinos online, ecommerce vino, vinorodante, comprar vino, vinos argentinos, suscripcion de vino, riesling, vino de jujuy, vino de la patagonia, vino de mendoza, club de vino, club tinto, club blanco, club mixto, club naranjo'
    },
    {
      name: 'author',
      content: 'Vino Rodante'
    },
    {
      name: 'robots',
      content: 'index, follow'
    }
  ]
}

export const productSEO = (product: {
  name: string
  description: string
  image?: string
  price: number
  region: string
  varietal?: string
  year?: string
  category: string
  slug: string
  stock: number
}): NextSeoProps => {
  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/products/${product.slug}`
  const productImage = product.image ? product.image : `${baseUrl}/og-image.jpg`
  
  const title = `${product.name} | Vino Rodante`
  const description = generateRichDescription(product)
  
  const baseSEO: NextSeoProps = {
    title,
    description,
    canonical: productUrl,
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: productUrl,
      siteName: 'Vino Rodante',
      title,
      description,
      images: [
        {
          url: productImage,
          width: 800,
          height: 600,
          alt: product.name,
        }
      ]
    },
    twitter: {
      handle: '@vinorodante',
      site: '@vinorodante',
      cardType: 'summary_large_image',
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: `vino, ${product.name}, ${product.varietal || ''}, ${product.region}, ${product.category}, vinos argentinos, comprar vino online, vinorodante, delivery vino, vinos premium, ${product.varietal ? `${product.varietal.toLowerCase()} argentino` : ''}, vinos ${product.region.toLowerCase()}, tienda vinos`
      },
      {
        property: 'product:price:amount',
        content: product.price.toString()
      },
      {
        property: 'product:price:currency',
        content: 'ARS'
      },
      {
        property: 'product:availability',
        content: product.stock > 0 ? 'in stock' : 'out of stock'
      },
      {
        property: 'product:condition',
        content: 'new'
      }
    ]
  }

  const structuredData = generateProductStructuredData(product)
  return addStructuredDataToSEO(baseSEO, structuredData)
}

export const collectionSEO = (collection: {
  name: string
  description: string
  slug: string
  image?: string
  products?: Array<{
    name: string
    slug: string
    price: number
    image?: string
  }>
}): NextSeoProps => {
  const baseUrl = getBaseUrl()
  const collectionUrl = `${baseUrl}/collections/${collection.slug}`
  const collectionImage = collection.image ? `${baseUrl}${collection.image}` : `${baseUrl}/og-image.jpg`
  
  const title = `${collection.name} | Vino Rodante`
  
  const baseSEO: NextSeoProps = {
    title,
    description: collection.description,
    canonical: collectionUrl,
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: collectionUrl,
      siteName: 'Vino Rodante',
      title,
      description: collection.description,
      images: [
        {
          url: collectionImage,
          width: 1200,
          height: 630,
          alt: collection.name,
        }
      ]
    },
    twitter: {
      handle: '@vinorodante',
      site: '@vinorodante',
      cardType: 'summary_large_image',
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: `vino, ${collection.name}, vinos argentinos, colección, ${collection.slug}, vinorodante, comprar vino online, delivery vino, vinos premium, tienda vinos, club de vinos`
      }
    ]
  }

  const structuredData = generateCollectionStructuredData(collection)
  return addStructuredDataToSEO(baseSEO, structuredData)
}

export const homeSEO: NextSeoProps = {
  ...defaultSEO,
  title: "Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia",
  description: "🍷 Descubrí los mejores vinos argentinos en Vino Rodante. Malbec, Cabernet, Chardonnay, Torrontés y más. ¡Comprá online con envío gratis! Club de vino semanal disponible. Vinos premium de Mendoza, Salta y toda Argentina.",
  canonical: getBaseUrl(),
}

export const getHomeSEOWithStructuredData = (): NextSeoProps => {
  const structuredData = generateWebsiteStructuredData()
  return addStructuredDataToSEO(homeSEO, structuredData)
}
