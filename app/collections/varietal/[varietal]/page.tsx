"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState, use } from "react"
import type { Product } from "@/lib/types"
import { WINE_VARIETALS, isValidWineVarietal, getWineVarietalData } from "@/lib/wine-data"

export default function VarietalPage({ params }: { params: Promise<{ varietal: string }> }) {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { varietal } = use(params)
  
  // Validar varietal
  const isValid = isValidWineVarietal(varietal)
  const varietalData = isValid ? getWineVarietalData(varietal, t) : null

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      if (isValid) {
        const { data: allProducts, error } = await getProducts()
        if (error) {
          console.error("Error loading products:", error)
          setProducts([])
        } else {
          const filteredProducts = allProducts?.filter(p => p.varietal === varietal) || []
          setProducts(filteredProducts)
        }
      } else {
        setProducts([])
      }
      setLoading(false)
    }
    loadProducts()
  }, [varietal, isValid])

  if (!isValid) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">{t.products.title || "Varietal no encontrado"}</h1>
        <p className="text-muted-foreground">{t.products.description || "El varietal solicitado no existe."}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{varietalData?.name}</h1>
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