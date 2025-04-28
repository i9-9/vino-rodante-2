"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { useEffect, useState, use } from "react"
import type { Product } from "@/lib/types"

export default function VarietalPage({ params }: { params: Promise<{ varietal: string }> }) {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { varietal } = use(params)
  
  // Mapeo de varietales a títulos
  const varietalTitles: Record<string, string> = {
    malbec: t.wineVarietals.malbec,
    "cabernet-sauvignon": t.wineVarietals.cabernetSauvignon,
    merlot: t.wineVarietals.merlot,
    "pinot-noir": t.wineVarietals.pinotNoir,
    chardonnay: t.wineVarietals.chardonnay,
    "sauvignon-blanc": t.wineVarietals.sauvignonBlanc,
    riesling: t.wineVarietals.riesling,
    syrah: t.wineVarietals.syrah
  }

  const title = varietalTitles[varietal] || varietal

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const allProducts = await getProducts()
      // Filtrar productos por varietal
      const filteredProducts = allProducts.filter(
        product => product.varietal.toLowerCase() === varietal.replace("-", " ")
      )
      setProducts(filteredProducts)
      setLoading(false)
    }
    loadProducts()
  }, [varietal])

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
          <p className="text-muted-foreground">No se encontraron productos de este varietal.</p>
        </div>
      )}
    </div>
  )
} 