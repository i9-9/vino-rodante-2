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
  const productImage = product.image ? `${baseUrl}${product.image}` : `${baseUrl}/og-image.jpg`
  
  const title = `${product.name} | Vino Rodante`
  const description = `🍷 ${product.name} ${product.year ? `(${product.year})` : ''} - ${product.varietal || 'Vino'} de ${product.region}. ${product.description.slice(0, 100)}... ¡Comprá ahora por $${product.price.toFixed(2)}! Envío gratis en compras +$5000.`
  
  const baseSEO: NextSeoProps = {
    title,
    description,
    canonical: productUrl,
    openGraph: {
      type: 'product',
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
        content: `vino, ${product.name}, ${product.varietal || ''}, ${product.region}, ${product.category}, vinos argentinos, comprar vino, vinorodante`
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
        content: `vino, ${collection.name}, vinos argentinos, colección, ${collection.slug}, vinorodante`
      }
    ]
  }

  const structuredData = generateCollectionStructuredData(collection)
  return addStructuredDataToSEO(baseSEO, structuredData)
}

export const homeSEO: NextSeoProps = {
  ...defaultSEO,
  title: "Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia",
  description: "🍷 Descubrí los mejores vinos argentinos en Vino Rodante. Malbec, Cabernet, Chardonnay y más. ¡Comprá online con envío gratis! Club de vino semanal disponible.",
  canonical: getBaseUrl(),
}

export const getHomeSEOWithStructuredData = (): NextSeoProps => {
  const structuredData = generateWebsiteStructuredData()
  return addStructuredDataToSEO(homeSEO, structuredData)
}
