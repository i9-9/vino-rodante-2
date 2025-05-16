"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState, use } from "react"
import type { Product } from "@/lib/types"
import { WINE_TYPES, isValidWineType, getWineTypeData } from "@/lib/wine-data"

export default function CollectionPage({ params }: { params: Promise<{ type: string }> }) {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { type } = use(params)
  
  // Validar tipo
  const isValid = isValidWineType(type)
  const typeData = isValid ? getWineTypeData(type, t) : null

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      if (isValid) {
        const allProducts = await getProducts()
        const filteredProducts = allProducts.filter(p => p.category === type)
      setProducts(filteredProducts)
      } else {
        setProducts([])
      }
      setLoading(false)
    }
    loadProducts()
  }, [type, isValid])

  if (!isValid) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">{t.products.title || "Colección no encontrada"}</h1>
        <p className="text-muted-foreground">{t.products.description || "El tipo de vino solicitado no existe."}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{typeData?.name}</h1>
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