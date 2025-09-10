import { NextSeoProps } from 'next-seo'

export const generateProductStructuredData = (product: {
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
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  const productUrl = `${baseUrl}/products/${product.slug}`
  const productImage = product.image ? `${baseUrl}${product.image}` : `${baseUrl}/og-image.jpg`

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": productImage,
    "url": productUrl,
    "brand": {
      "@type": "Brand",
      "name": "Vino Rodante"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ARS",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Vino Rodante"
      }
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Región",
        "value": product.region
      },
      {
        "@type": "PropertyValue",
        "name": "Categoría",
        "value": product.category
      },
      ...(product.varietal ? [{
        "@type": "PropertyValue",
        "name": "Varietal",
        "value": product.varietal
      }] : []),
      ...(product.year ? [{
        "@type": "PropertyValue",
        "name": "Año",
        "value": product.year
      }] : [])
    ]
  }
}

export const generateCollectionStructuredData = (collection: {
  name: string
  description: string
  slug: string
  products?: Array<{
    name: string
    slug: string
    price: number
    image?: string
  }>
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  const collectionUrl = `${baseUrl}/collections/${collection.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collection.name,
    "description": collection.description,
    "url": collectionUrl,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": collection.products?.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `${baseUrl}/products/${product.slug}`,
          "image": product.image ? `${baseUrl}${product.image}` : undefined,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "ARS"
          }
        }
      })) || []
    }
  }
}

export const generateWebsiteStructuredData = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vino Rodante",
    "description": "El Vino Rueda en el Tiempo y Crece con la Historia",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Vino Rodante",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo/logo_vr.svg`
      }
    }
  }
}

export const addStructuredDataToSEO = (seo: NextSeoProps, structuredData: any): NextSeoProps => {
  return {
    ...seo,
    additionalMetaTags: [
      ...(seo.additionalMetaTags || []),
      {
        type: 'application/ld+json',
        content: JSON.stringify(structuredData)
      }
    ]
  }
}
