"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProductsByCategory } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"

export default function BoxesCollectionPage() {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      console.log('🔍 [BoxesCollectionPage] Loading boxes products')
      
      const { data: filteredProducts, error } = await getProductsByCategory('boxes')
      console.log('🔍 [BoxesCollectionPage] Products result:', { data: filteredProducts?.length, error })
      
      if (error) {
        console.error("Error loading boxes products:", error)
        setProducts([])
      } else {
        setProducts(filteredProducts || [])
      }
      setLoading(false)
    }
    loadProducts()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Boxes de Vinos</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Descubrí nuestras cajas seleccionadas con los mejores vinos argentinos. 
          Perfectas para regalar o para disfrutar en casa.
        </p>
      </div>

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
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
            <p className="text-muted-foreground mb-6">
              Estamos preparando una selección especial de boxes de vinos. 
              ¡Muy pronto estarán disponibles!
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <h4 className="font-medium mb-3">¿Qué incluirán nuestros boxes?</h4>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• Selección de vinos premium de diferentes bodegas</li>
                <li>• Guías de cata y maridaje</li>
                <li>• Empaquetado elegante para regalo</li>
                <li>• Vinos tintos, blancos y espumantes</li>
                <li>• Opciones para diferentes presupuestos</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
