"use client"

import type { Product } from "@/lib/types"
import ProductCard from "./product-card"
import Link from "next/link"
import { Button } from "./ui/button"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function ProductShowcase({ products }: { products: Product[] }) {
  const t = useTranslations()
  
  return (
    <section className="w-full py-16 bg-[#F2F2F2]">
      <div className="container px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-medium text-[#5B0E2D] mb-4">{t.home.featuredWines.title}</h2>
          <p className="text-[#1F1F1F]/70 max-w-2xl mx-auto">
            {t.home.featuredWines.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <Button variant="primary" asChild>
            <Link href="/products">{t.home.featuredWines.viewAll}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
