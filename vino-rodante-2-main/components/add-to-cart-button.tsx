"use client"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/hooks/use-cart"
import type { Product } from "@/lib/types"

export default function AddToCartButton({ product, label }: { product: Product, label: string }) {
  const { addToCart } = useCart()
  return (
    <Button size="lg" className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white" onClick={() => addToCart(product)}>
      {label}
    </Button>
  )
} 