'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}
    >
      {/* Home link */}
      <Link 
        href="/" 
        className="flex items-center hover:text-gray-700 transition-colors"
        aria-label="Ir al inicio"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Inicio</span>
      </Link>
      
      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.current ? (
            <span 
              className="font-medium text-gray-900"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href!} 
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

// Structured data for breadcrumbs
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

// Predefined breadcrumb configurations
export const breadcrumbConfigs = {
  product: (productName: string, category: string, varietal?: string) => [
    { label: 'Productos', href: '/products' },
    ...(varietal ? [{ label: varietal, href: `/collections/varietal/${varietal.toLowerCase().replace(/\s+/g, '-')}` }] : []),
    { label: category, href: `/collections/${category.toLowerCase()}` },
    { label: productName, current: true }
  ],
  
  collection: (collectionName: string, parentCollection?: string) => [
    { label: 'Colecciones', href: '/collections' },
    ...(parentCollection ? [{ label: parentCollection, href: `/collections/${parentCollection.toLowerCase()}` }] : []),
    { label: collectionName, current: true }
  ],
  
  weeklyWine: (clubType: string) => [
    { label: 'Club de Vino', href: '/weekly-wine' },
    { label: clubType.charAt(0).toUpperCase() + clubType.slice(1), current: true }
  ],
  
  account: (section: string) => [
    { label: 'Mi Cuenta', href: '/account' },
    { label: section, current: true }
  ]
}

