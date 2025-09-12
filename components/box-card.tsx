"use client"

import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/hooks/use-cart"
import { useTranslations } from "@/lib/providers/translations-provider"
import { ProductDiscountBadge } from "./ProductDiscountBadge"
import { useState, useEffect } from "react"
import { getBoxProducts } from "@/lib/products-client"
import BoxProducts from "./box-products"

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getValidImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return "/placeholder.svg"
  }
  
  try {
    if (imageUrl.startsWith('/')) {
      return imageUrl
    }
    
    new URL(imageUrl)
    return imageUrl
  } catch {
    return "/placeholder.svg"
  }
}

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

export default function BoxCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const t = useTranslations()
  const [boxProducts, setBoxProducts] = useState<BoxProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showProducts, setShowProducts] = useState(false)

  // Cargar productos del box cuando se muestre
  useEffect(() => {
    if (showProducts && boxProducts.length === 0) {
      setLoading(true)
      getBoxProducts(product.id)
        .then(({ data, error }) => {
          if (data && !error) {
            setBoxProducts(data)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [showProducts, product.id, boxProducts.length])

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-gray-100">
        <Image
          src={getValidImageUrl(product.image)}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-[#5B0E2D]">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Box de Vinos • {capitalizeWords(product.region)}
        </p>
        
        {/* Botón para mostrar/ocultar productos */}
        <div className="mt-2">
          <button
            onClick={() => setShowProducts(!showProducts)}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            {showProducts ? 'Ocultar vinos' : 'Ver vinos incluidos'}
          </button>
        </div>

        {/* Productos del box */}
        {showProducts && (
          <div className="mt-4 pt-4 border-t">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Cargando vinos...</p>
              </div>
            ) : (
              <BoxProducts products={boxProducts} boxName={product.name} />
            )}
          </div>
        )}

        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-right">
              {product.discount ? (
                <ProductDiscountBadge product={product} size="sm" />
              ) : (
                <p className="font-medium text-[#1F1F1F]">${product.price.toFixed(2)}</p>
              )}
            </div>
            <Button 
              onClick={() => addToCart(product)} 
              size="sm" 
              className="bg-[#A83935] hover:bg-[#A83935]/90 text-white"
            >
              {t.products.addToCart}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
