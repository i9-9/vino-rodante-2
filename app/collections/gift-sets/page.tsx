"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"

export default function GiftSetsPage() {
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
        // Filter for gift sets (mid to high-priced products ideal for gifting)
        const giftSets = (allProducts || [])
          .filter(product => product.stock > 0 && product.price >= 30) // Products over $30, good for gifts
          .sort((a, b) => b.price - a.price) // Sort by price descending
          .slice(0, 8) // Show top 8 gift-worthy products
        setProducts(giftSets)
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
        <h1 className="text-4xl font-bold mb-4">{t.megamenu?.giftSets || "Sets de Regalo"}</h1>
        <p className="text-muted-foreground text-lg">
          {t.collections?.giftSetsDescription || "Perfectos para regalar en ocasiones especiales"}
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