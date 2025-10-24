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
  id?: string
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  const productUrl = `${baseUrl}/products/${product.slug}`
  const productImage = product.image ? `${baseUrl}${product.image}` : `${baseUrl}/og-image.jpg`

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": {
      "@type": "ImageObject",
      "url": productImage,
      "width": 800,
      "height": 600,
      "caption": `${product.name} - ${product.varietal || product.category} de ${product.region}`
    },
    "url": productUrl,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Vino Rodante"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ARS",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": productUrl,
      "priceValidUntil": new Date(Date.now() + 30*24*60*60*1000).toISOString(),
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

export const generateLocalBusinessSchema = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "Store"],
    "name": "Vino Rodante",
    "description": "Tienda online especializada en vinos argentinos premium. Selección curada de los mejores vinos de Mendoza, Salta, San Juan y todas las regiones vitivinícolas de Argentina.",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo/logo_vr.svg`,
      "width": 400,
      "height": 400
    },
    "image": {
      "@type": "ImageObject",
      "url": `${baseUrl}/og-image.jpg`,
      "width": 1200,
      "height": 630
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR",
      "addressRegion": "Argentina",
      "addressLocality": "Buenos Aires"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-34.6118",
      "longitude": "-58.3960"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Argentina"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Buenos Aires"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Córdoba"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Santa Fe"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Mendoza"
      }
    ],
    "serviceType": "Venta de vinos online",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Vinos Argentinos",
      "itemListElement": [
        {
          "@type": "OfferCategory",
          "name": "Vinos Tintos"
        },
        {
          "@type": "OfferCategory",
          "name": "Vinos Blancos"
        },
        {
          "@type": "OfferCategory",
          "name": "Vinos Rosados"
        },
        {
          "@type": "OfferCategory",
          "name": "Vinos Espumantes"
        },
        {
          "@type": "OfferCategory",
          "name": "Club de Vinos"
        }
      ]
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Envío gratis en CABA",
          "description": "Envío sin costo en Capital Federal, $30.000 en GBA y $55.000 resto del país"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Argentina"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Club de Vinos Mensual",
          "description": "Suscripción mensual con selección curada de vinos argentinos"
        }
      }
    ],
    "openingHours": "Mo-Su 00:00-23:59",
    "telephone": "+54-11-xxxx-xxxx",
    "email": "info@vinorodante.com",
    "priceRange": "$$",
    "paymentAccepted": ["Credit Card", "Debit Card", "MercadoPago"],
    "currenciesAccepted": "ARS",
    "foundingDate": "2023",
    "specialty": "Vinos argentinos premium",
    "keywords": "vinos argentinos, malbec, cabernet sauvignon, chardonnay, torrontés, vinos mendoza, vinos salta, club de vinos, suscripción vino",
    "sameAs": [
      "https://www.instagram.com/vinorodante",
      "https://www.facebook.com/vinorodante"
    ],
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/products?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "OrderAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/checkout`
        }
      }
    ]
  }
}

export const generateOrganizationSchema = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vino Rodante",
    "alternateName": "Vino Rodante Argentina",
    "description": "El Vino Rueda en el Tiempo y Crece con la Historia - Especialistas en vinos argentinos premium",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo/logo_vr.svg`
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+54-11-xxxx-xxxx",
      "contactType": "customer service",
      "areaServed": "AR",
      "availableLanguage": "Spanish"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR",
      "addressRegion": "Buenos Aires"
    },
    "foundingDate": "2023",
    "numberOfEmployees": "1-10",
    "knowsAbout": [
      "Vinos Argentinos",
      "Malbec",
      "Cabernet Sauvignon",
      "Chardonnay",
      "Torrontés",
      "Vinos de Mendoza",
      "Vinos de Salta",
      "Maridajes",
      "Cata de vinos"
    ],
    "award": "Selección Premium de Vinos Argentinos 2024"
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
