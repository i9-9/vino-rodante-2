"use client"

import React from "react"
import { useProductsByRegion } from "@/lib/hooks/use-products"
import { LoadingError } from "@/components/ui/loading-error"
import { ProductGrid } from "@/components/product-grid"
import { prettyLabel } from "@/lib/wine-data"

export default function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = React.use(params)
  const { products, isLoading, isError } = useProductsByRegion(region)

  React.useEffect(() => {
    console.log('[RegionPage] Render. products:', products, 'isLoading:', isLoading, 'isError:', isError)
  }, [products, isLoading, isError])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-medium mb-8">
        {prettyLabel(region)}
      </h1>
      
      <LoadingError isLoading={isLoading} error={isError}>
        {isError ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-500">Error al cargar productos. Revisa la consola para más detalles.</p>
        </div>
        ) : products && products.length > 0 ? (
          <ProductGrid products={products} />
      ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              No se encontraron productos
            </p>
        </div>
      )}
      </LoadingError>
    </div>
  )
} 