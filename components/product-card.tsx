import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { addToCart } from "@/lib/actions"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-[#5B0E2D]">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {product.year} • {product.region}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <p className="font-medium text-[#1F1F1F]">${product.price.toFixed(2)}</p>
          <form action={addToCart}>
            <input type="hidden" name="productId" value={product.id} />
            <Button type="submit" size="sm" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
              Add to Cart
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
