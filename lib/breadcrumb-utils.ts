// Server-side breadcrumb utilities
export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

// Structured data for breadcrumbs - Server version
export const generateBreadcrumbStructuredData = (items: BreadcrumbItem[]) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": baseUrl
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href ? `${baseUrl}${item.href}` : undefined
      }))
    ]
  }
}
