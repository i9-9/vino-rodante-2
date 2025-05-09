"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { useEffect, useState, use } from "react"
import type { Product } from "@/lib/types"

export default function RegionPage({ params }: { params: { region: string } }) {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const { region } = use(params)

  // Mapeo de regiones a títulos
  const regionTitles: Record<string, string> = {
    mendoza: t.wineRegions.mendoza,
    "valle-de-uco": t.wineRegions.valleDeUco,
    "san-juan": t.wineRegions.sanJuan,
    salta: t.wineRegions.salta,
    "rio-negro": t.wineRegions.rioNegro,
    neuquen: t.wineRegions.neuquen,
    "la-pampa": t.wineRegions.laPampa,
    catamarca: t.wineRegions.catamarca,
    cordoba: t.wineRegions.cordoba,
    jujuy: t.wineRegions.jujuy,
    patagonia: t.wineRegions.patagonia,
    cuyana: t.wineRegions.cuyana,
    noroeste: t.wineRegions.noroeste,
    centro: t.wineRegions.centro,
    litoral: t.wineRegions.litoral
  }

  const title = regionTitles[region] || region

  // Función para normalizar strings (sin tildes, minúsculas, sin guiones, sin espacios dobles)
  function normalize(str: string) {
    return str
      .toLowerCase()
      .normalize('NFD').replace(/[\f0-\x7f]/g, c => c.normalize('NFD').replace(/\p{Diacritic}/gu, ''))
      .replace(/[\u0300-\u036f]/g, '') // quita tildes
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const regionParam = normalize(region)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const allProducts = await getProducts()
      // Filtrar productos por región (robusto)
      const filteredProducts = allProducts.filter(
        product => normalize(product.region).includes(regionParam)
      )
      setProducts(filteredProducts)
      setLoading(false)
    }
    loadProducts()
  }, [region])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron productos de esta región.</p>
        </div>
      )}
    </div>
  )
} 