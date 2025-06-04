"use client"

import { getProducts } from '@/lib/products-client'
import type { Product } from '@/lib/types'
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { CATEGORY_SLUG_MAP } from '@/lib/wine-data'

interface ProductsClientProps {
  t: any
}

export default function ProductsClient({ t }: ProductsClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [activePrice, setActivePrice] = useState<[number, number] | null>(null)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [activeVarietal, setActiveVarietal] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await getProducts()
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    setFilteredProducts(products)
  }, [products])

  useEffect(() => {
    let result = [...products]
    if (activeCategory) {
      const dbCategory = CATEGORY_SLUG_MAP[activeCategory] || activeCategory
      result = result.filter((p) => p.category === dbCategory)
    }
    if (activePrice) {
      result = result.filter((p) => p.price >= activePrice[0] && p.price < activePrice[1])
    }
    if (activeRegion) {
      result = result.filter((p) => p.region === activeRegion)
    }
    if (activeVarietal) {
      result = result.filter((p) => p.varietal === activeVarietal)
    }
    setFilteredProducts(result)
  }, [activeCategory, activePrice, activeRegion, activeVarietal, products])

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
          <Button variant="outline" className="w-full mb-2" onClick={() => { setActiveCategory(null); setActivePrice(null); setActiveRegion(null); setActiveVarietal(null); }}>
            Limpiar filtros
          </Button>
          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.categories}</h2>
            <div className="space-y-2">
              <Button variant={activeCategory === 'tinto' ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveCategory(activeCategory === 'tinto' ? null : 'tinto')}>
                {t.navigation.redWines}
              </Button>
              <Button variant={activeCategory === 'blanco' ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveCategory(activeCategory === 'blanco' ? null : 'blanco')}>
                {t.navigation.whiteWines}
              </Button>
              <Button variant={activeCategory === 'espumante' ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveCategory(activeCategory === 'espumante' ? null : 'espumante')}>
                {t.navigation.sparklingWines}
              </Button>
              <Button variant={activeCategory === 'rosado' ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveCategory(activeCategory === 'rosado' ? null : 'rosado')}>
                {t.navigation.roseWines || "Vinos Rosé"}
              </Button>
              <Button variant={activeCategory === 'naranjo' ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveCategory(activeCategory === 'naranjo' ? null : 'naranjo')}>
                {t.navigation.orangeWines || "Vinos Naranjo"}
              </Button>
              <Button variant={activeCategory === 'dessert' ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveCategory(activeCategory === 'dessert' ? null : 'dessert')}>
                {t.navigation.dessertWines || "Vinos de Postre"}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.priceRange}</h2>
            <div className="space-y-2">
              <Button variant={activePrice?.[0] === 0 && activePrice?.[1] === 10000 ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActivePrice([0, 10000])}>
                $0 - $10.000
              </Button>
              <Button variant={activePrice?.[0] === 10000 && activePrice?.[1] === 20000 ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActivePrice([10000, 20000])}>
                $10.000 - $20.000
              </Button>
              <Button variant={activePrice?.[0] === 20000 && activePrice?.[1] === 30000 ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActivePrice([20000, 30000])}>
                $20.000 - $30.000
              </Button>
              <Button variant={activePrice?.[0] === 30000 && activePrice?.[1] === Infinity ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActivePrice([30000, Infinity])}>
                $30.000+
              </Button>
              <Button variant={!activePrice ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActivePrice(null)}>
                Todos los precios
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
                  <Button key={region} variant={activeRegion === region ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveRegion(region === activeRegion ? null : region)}>
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
                  <Button key={varietal} variant={activeVarietal === varietal ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveVarietal(varietal === activeVarietal ? null : varietal)}>
                    {getVarietalLabel(varietal)}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">{t.common.noResults || "No se encontraron productos en esta categoría."}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 