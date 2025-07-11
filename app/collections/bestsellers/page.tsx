"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"

export default function BestsellersPage() {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const { data: allProducts, error } = await getProducts()
      if (error) {
        console.error("Error loading products:", error)
        setProducts([])
      } else {
        // Filter for bestsellers (products with higher prices or lower stock indicating popularity)
        const bestsellers = (allProducts || [])
          .filter(product => product.stock > 0) // Only in-stock products
          .sort((a, b) => {
            // Sort by combination of price (higher = more premium/popular) and inverse stock (lower stock = more sold)
            const scoreA = a.price - a.stock * 0.1
            const scoreB = b.price - b.stock * 0.1
            return scoreB - scoreA
          })
          .slice(0, 8) // Show top 8 bestsellers
        setProducts(bestsellers)
      }
      setLoading(false)
    }
    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-96" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-medium mb-4">{t.megamenu?.bestsellers || "Más Vendidos"}</h1>
        <p className="text-muted-foreground text-lg">
          {t.collections?.bestsellersDescription || "Los vinos más populares entre nuestros clientes"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.products?.noProductsFound || "No se encontraron productos"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
} 