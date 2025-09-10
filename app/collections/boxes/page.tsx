"use client"

import { getProductsByCategory } from "@/lib/products-client"
import BoxCard from "@/components/box-card"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"
import { getCollectionTranslation } from "@/lib/translations-server"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function BoxesCollectionPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Try to get client translations, fallback to server translations
  let t: any = null
  try {
    t = useTranslations()
  } catch {
    // Client translations not available during SSR/SSG
    t = null
  }
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    if (isClient && t) {
      // Use client translations when available
      const keys = key.split('.')
      let value: any = t
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          return fallback
        }
      }
      
      return typeof value === 'string' ? value : fallback
    } else {
      // Use server translations during SSR/SSG
      return getCollectionTranslation('boxes', key, 'es') || fallback
    }
  }

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)
      
      try {
        console.log("🔍 [BoxesPage] Loading boxes products...")
        
        // Cargar productos de boxes
        const { data: filteredProducts, error: apiError } = await getProductsByCategory('boxes')
        
        console.log("🔍 [BoxesPage] API Response:", { 
          data: filteredProducts, 
          error: apiError,
          dataLength: filteredProducts?.length 
        })
        
        if (apiError) {
          console.error("❌ [BoxesPage] Error loading boxes products:", apiError)
          setError(apiError.message)
          setProducts([])
        } else {
          console.log("✅ [BoxesPage] Products loaded successfully:", filteredProducts?.length || 0)
          setProducts(filteredProducts || [])
        }
      } catch (error) {
        console.error("❌ [BoxesPage] Exception:", error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setProducts([])
      }
      
      setLoading(false)
    }
    loadProducts()
  }, [])

  return (
    <div className="container mx-auto px-6 md:px-8 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16 gap-4">
          <h1 className="text-4xl md:text-5xl font-medium">
            {getTranslation('title', 'Boxes de Vinos')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-tight">
            {getTranslation('description', 'Descubrí nuestras cajas seleccionadas con los mejores vinos argentinos. Perfectas para regalar o para disfrutar en casa.')}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {getTranslation('loading', 'Cargando productos...')}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">
              {getTranslation('error', 'Error')}: {error}
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <BoxCard key={product.id} product={product} />
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
