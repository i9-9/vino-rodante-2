"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProductsByCategory } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"
import { createClient } from "@/utils/supabase/client"

interface BoxProduct {
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  varietal: string
  year: string
  region: string
}

export default function BoxesCollectionPage() {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [boxDetails, setBoxDetails] = useState<Record<string, BoxProduct[]>>({})

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      
      try {
        // Cargar productos de boxes
        const { data: filteredProducts, error } = await getProductsByCategory('boxes')
        
        if (error) {
          console.error("Error loading boxes products:", error)
          setProducts([])
        } else {
          setProducts(filteredProducts || [])
          
          // Cargar detalles de cada box
          if (filteredProducts && filteredProducts.length > 0) {
            await loadBoxDetails(filteredProducts)
          }
        }
      } catch (error) {
        console.error("Error:", error)
        setProducts([])
      }
      
      setLoading(false)
    }
    loadProducts()
  }, [])

  const loadBoxDetails = async (boxes: Product[]) => {
    const supabase = createClient()
    const details: Record<string, BoxProduct[]> = {}
    
    for (const box of boxes) {
      try {
        // Usar la función SQL que ya tienes implementada
        const { data, error } = await supabase.rpc('get_box_products', {
          box_id_param: box.id
        })
        
        if (!error && data) {
          details[box.id] = data
        }
      } catch (error) {
        console.error(`Error loading details for box ${box.id}:`, error)
      }
    }
    
    setBoxDetails(details)
  }

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
        <div className="space-y-8">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-6 bg-card">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Imagen del box */}
                <div className="lg:col-span-1">
                  <ProductCard product={product} />
                </div>
                
                {/* Detalles del box */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    
                    {/* Información del box */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Precio:</span>
                        <p className="text-xl font-bold text-primary">${product.price}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Stock:</span>
                        <p className="text-lg">{product.stock} disponibles</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vinos incluidos en el box */}
                  {boxDetails[product.id] && boxDetails[product.id].length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Vinos incluidos:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {boxDetails[product.id].map((boxProduct, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <div className="flex-1">
                              <p className="font-medium">{boxProduct.product_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {boxProduct.varietal} • {boxProduct.year} • {boxProduct.region}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Cantidad: {boxProduct.quantity}</p>
                              <p className="font-medium">${boxProduct.product_price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
