"use client"

import Image from "next/image"
import { useState } from "react"

interface BoxProduct {
  product_id: string
  quantity: number
  id: string
  name: string
  price: number
  image: string
  varietal: string
  year: string
  region: string
  description: string
}

interface BoxProductsProps {
  products: BoxProduct[]
  boxName: string
}

export default function BoxProducts({ products, boxName }: BoxProductsProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Mostrar solo los primeros 4 productos por defecto
  const displayedProducts = showAll ? products : products.slice(0, 4)
  const hasMore = products.length > 4

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">
          <span className="text-4xl">🍷</span>
        </div>
        <h4 className="font-semibold mb-2">Vinos incluidos</h4>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Este box incluye una selección especial de vinos cuidadosamente elegidos por nuestros sommeliers.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Vinos incluidos en {boxName}</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Estos son los vinos que encontrarás en este box:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              {product.image && (
                <div className="relative w-16 h-20 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm mb-1 truncate">
                  {product.name}
                </h5>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{product.year} • {product.region}</div>
                  <div>{product.varietal}</div>
                  <div className="font-medium">Cantidad: {product.quantity}</div>
                </div>
              </div>
            </div>
            {product.description && (
              <p className="text-xs text-muted-foreground mt-2 overflow-hidden" style={{ 
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical' 
              }}>
                {product.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            {showAll ? 'Ver menos' : `Ver todos los ${products.length} vinos`}
          </button>
        </div>
      )}
    </div>
  )
}
