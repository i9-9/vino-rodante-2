"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProductsByCategory } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { useEffect, useState, use } from "react"
import type { Product } from "@/lib/types"

export default function CollectionPage({ params }: { params: Promise<{ type: string }> }) {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { type } = use(params)
  
  // Mapeo de tipos de vino a títulos
  const typeTitles: Record<string, string> = {
    red: t.navigation.redWines,
    white: t.navigation.whiteWines,
    sparkling: t.navigation.sparklingWines,
    rose: t.wineTypes.rose,
    dessert: t.wineTypes.dessert,
    fortified: t.wineTypes.fortified
  }

  const title = typeTitles[type] || type

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const filteredProducts = await getProductsByCategory(type)
      setProducts(filteredProducts)
      setLoading(false)
    }
    loadProducts()
  }, [type])

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
          <p className="text-muted-foreground">No se encontraron productos en esta categoría.</p>
        </div>
      )}
    </div>
  )
} 