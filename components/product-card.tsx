"use client"

import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/hooks/use-cart"
import { useTranslations } from "@/lib/providers/translations-provider"

function capitalizeWords(str: string) {
  return str
    .toLocaleLowerCase('es-AR')
    .replace(/(?:^|\s|\b)([a-záéíóúüñ])/g, (match) => match.toLocaleUpperCase('es-AR'));
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
          {product.year} • {capitalizeWords(product.region)}{product.varietal ? ` • ${capitalizeWords(product.varietal)}` : ''}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <p className="font-medium text-[#1F1F1F]">${product.price.toFixed(2)}</p>
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
  )
}
