import type { Product } from "@/lib/types"
import ProductCard from "./product-card"
import Link from "next/link"
import { Button } from "./ui/button"

export default function ProductShowcase({ products }: { products: Product[] }) {
  return (
    <section className="w-full py-16 bg-[#F2F2F2]">
      <div className="container px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[#5B0E2D] mb-4">Featured Wines</h2>
          <p className="text-[#1F1F1F]/70 max-w-2xl mx-auto">
            Explore our handpicked selection of exceptional wines, each with its own unique story and flavor profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white" asChild>
            <Link href="/products">View All Wines</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
