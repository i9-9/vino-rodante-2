"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts, getBoxesProducts } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"

export default function NewArrivalsPage() {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      
      try {
        // Cargar productos normales y boxes
        const [productsResult, boxesResult] = await Promise.all([
          getProducts(),
          getBoxesProducts()
        ])
        
        let allProducts: Product[] = []
        
        // Agregar productos normales
        if (productsResult.data) {
          allProducts.push(...productsResult.data)
        }
        
        // Agregar productos de boxes
        if (boxesResult.data) {
          allProducts.push(...boxesResult.data)
        }
        
        if (productsResult.error && boxesResult.error) {
          console.error("Error loading products:", productsResult.error)
          setProducts([])
        } else {
          // Filter for new arrivals (most recent products by ID)
          const sortedProducts = allProducts
            .sort((a, b) => b.id.localeCompare(a.id)) // Sort by ID descending (newer first)
            .slice(0, 12) // Show newest 12 products (including boxes)
          setProducts(sortedProducts)
        }
      } catch (error) {
        console.error("Error loading products:", error)
        setProducts([])
      }
      
      setLoading(false)
    }
    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-96" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-medium mb-4">{t.megamenu?.newArrivals || "Novedades"}</h1>
        <p className="text-muted-foreground text-lg">
          {t.collections?.newArrivalsDescription || "Descubre nuestros vinos y boxes más recientes"}
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