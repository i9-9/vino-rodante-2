"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/hooks/use-cart"
import { useTranslations } from "@/lib/providers/translations-provider"
import { ProductDiscountBadge } from "./ProductDiscountBadge"
import { generateImageAltText } from "@/lib/image-seo-utils"
import { useProductTracking } from "@/lib/hooks/use-tracking"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Check, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getValidImageUrl(imageUrl: string | null | undefined): string {
  // Check if the image URL is valid
  if (!imageUrl || imageUrl.trim() === '') {
    return "/placeholder.svg"
  }
  
  try {
    // For relative URLs, assume they're valid
    if (imageUrl.startsWith('/')) {
      return imageUrl
    }
    
    // For absolute URLs, validate them
    new URL(imageUrl)
    return imageUrl
  } catch {
    // If URL is invalid, return placeholder
    return "/placeholder.svg"
  }
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const t = useTranslations()
  const { toast } = useToast()
  const { trackAddToCart, trackProductView } = useProductTracking()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  
  // Detectar si es un box
  const isBox = product.category?.toLowerCase() === 'boxes' || product.category?.toLowerCase() === 'box'

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    // Pequeño delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 150))
    
    addToCart(product)
    trackAddToCart(product)
    
    // Mostrar toast notification con mejor feedback
    toast({
      title: "¡Agregado!",
      description: `${product.name} agregado al carrito`,
      duration: 2000,
    })
    
    setJustAdded(true)
    setIsAdding(false)
    
    // Resetear después de 1.5 segundos
    setTimeout(() => {
      setJustAdded(false)
    }, 1500)
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-gray-100">
        <Image
          src={getValidImageUrl(product.image)}
          alt={generateImageAltText.thumbnail({
            name: product.name,
            varietal: product.varietal,
            region: product.region,
            year: product.year,
            category: product.category,
            isBox: isBox
          })}
          width={300}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          quality={85}
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
          {isBox 
            ? `Box de Vinos • ${capitalizeWords(product.region)}` 
            : `${product.year} • ${capitalizeWords(product.region)}${product.varietal ? ` • ${capitalizeWords(product.varietal)}` : ''}`
          }
        </p>
        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-right">
              {(product as any).discount ? (
                <ProductDiscountBadge product={product as any} size="sm" />
              ) : (
                <p className="font-medium text-[#1F1F1F]">${product.price.toFixed(2)}</p>
              )}
            </div>
            <Button 
              onClick={handleAddToCart}
              size="sm" 
              disabled={isAdding || justAdded}
              className={cn(
                "text-white transition-all duration-300 relative overflow-hidden font-medium",
                justAdded 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-[#A83935] hover:bg-[#7A2521] active:bg-[#6B1F1C] shadow-sm hover:shadow-md"
              )}
            >
              <span className="flex items-center gap-1.5">
                {isAdding ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Agregando...</span>
                  </>
                ) : justAdded ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span className="text-xs">¡Agregado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3" />
                    <span className="text-xs">{(t as any).products?.addToCart || 'Agregar'}</span>
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
