"use client"

import { getProducts } from '@/lib/products-client'
import type { Product } from '@/lib/types'
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProductsClientProps {
  t: any
}

export default function ProductsClient({ t }: ProductsClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await getProducts()
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // Obtener regiones únicas de los productos
  const uniqueRegions = products ? Array.from(new Set(products.map((p: Product) => p.region))).filter(Boolean) : []
  // Obtener varietales únicos de los productos
  const uniqueVarietals = products ? Array.from(new Set(products.map((p: Product) => p.varietal))).filter(Boolean) : []

  // Mapeo de regiones a traducción si existe
  function getRegionLabel(region: string) {
    // Normalizar para buscar en traducciones
    const normalized = region
      .toLowerCase()
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/\s|\./g, '')
      .replace(/-/g, '')
    // Buscar en t.wineRegions
    for (const key in t.wineRegions) {
      if (key.toLowerCase().replace(/-/g, '').replace(/\s/g, '') === normalized) {
        return t.wineRegions[key as keyof typeof t.wineRegions]
      }
    }
    return region
  }

  // Mapeo de varietales a traducción si existe
  function getVarietalLabel(varietal: string) {
    // Normalizar para buscar en traducciones
    const normalized = varietal
      .toLowerCase()
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/\s|\./g, '')
      .replace(/-/g, '')
    // Buscar en t.wineVarietals
    for (const key in t.wineVarietals) {
      if (key.toLowerCase().replace(/-/g, '').replace(/\s/g, '') === normalized) {
        return t.wineVarietals[key as keyof typeof t.wineVarietals]
      }
    }
    return varietal
  }

  // Función para filtrar productos por rango de precio
  function filterProductsByPrice(min: number, max: number) {
    return products ? products.filter((p: Product) => p.price >= min && p.price <= max) : []
  }

  // Función para navegar a la colección de categoría
  function navigateToCategory(type: string) {
    router.push(`/collections/${type}`)
  }

  // Función para navegar a la colección de región
  function navigateToRegion(region: string) {
    router.push(`/collections/region/${region}`)
  }

  // Función para navegar a la colección de varietal
  function navigateToVarietal(varietal: string) {
    router.push(`/collections/varietal/${varietal}`)
  }

  if (loading) {
    return <div className="container px-4 py-12">Loading...</div>
  }

  return (
    <div className="container px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#5B0E2D] mb-4">{t.products.title}</h1>
        <p className="text-[#1F1F1F]/70 max-w-3xl">
          {t.products.subtitle}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.categories}</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToCategory('all')}>
                {t.navigation.allWines}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToCategory('red')}>
                {t.navigation.redWines}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToCategory('white')}>
                {t.navigation.whiteWines}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToCategory('sparkling')}>
                {t.navigation.sparklingWines}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.priceRange}</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => filterProductsByPrice(0, 30)}>
                {t.filters?.under30 || "Menos de $30"}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => filterProductsByPrice(30, 50)}>
                {t.filters?.between30and50 || "$30 - $50"}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => filterProductsByPrice(50, 100)}>
                {t.filters?.between50and100 || "$50 - $100"}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => filterProductsByPrice(100, Infinity)}>
                {t.filters?.over100 || "Más de $100"}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.region}</h2>
            <div className="space-y-2">
              {uniqueRegions.length === 0 ? (
                <span className="text-muted-foreground text-sm">{t.common.noResults}</span>
              ) : (
                uniqueRegions.map((region: string) => (
                  <Button key={region} variant="ghost" className="w-full justify-start" onClick={() => navigateToRegion(region)}>
                    {getRegionLabel(region)}
                  </Button>
                ))
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.varietal}</h2>
            <div className="space-y-2">
              {uniqueVarietals.length === 0 ? (
                <span className="text-muted-foreground text-sm">{t.common.noResults}</span>
              ) : (
                uniqueVarietals.map((varietal: string) => (
                  <Button key={varietal} variant="ghost" className="w-full justify-start" onClick={() => navigateToVarietal(varietal)}>
                    {getVarietalLabel(varietal)}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products && products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 