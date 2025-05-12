import { getProductBySlug, getProducts } from "@/lib/products"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { notFound } from "next/navigation"
import { addToCart } from "@/lib/actions"
import { getTranslations } from "@/lib/get-translations"
import AddToCartButton from "@/components/add-to-cart-button"
import type { Product } from "@/lib/types"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Product Not Found | Vino Rodante",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} | Vino Rodante`,
    description: product.description,
  }
}

export async function generateStaticParams() {
  const products = await getProducts()

  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  const t = await getTranslations()

  if (!product) {
    notFound()
  }

  return (
    <div className="container px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-[#5B0E2D] mb-2">{product.name}</h1>
          <p className="text-lg text-[#1F1F1F]/70 mb-4">
            {product.year} • {product.region}
          </p>

          <div className="mb-6">
            <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
            <AddToCartButton product={product} label={t.products.addToCart} />

            <div className="flex items-center text-sm text-[#1F1F1F]/70 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>
                {product.stock > 0 
                  ? `${t.products.inStock} (${product.stock} ${t.products.available})` 
                  : t.products.outOfStock
                }
              </span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">{t.products.description}</h2>
            <p className="text-[#1F1F1F]/80 mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-[#5B0E2D]">{t.products.varietal}</h3>
                <p className="text-[#1F1F1F]/70">{product.varietal}</p>
              </div>
              <div>
                <h3 className="font-medium text-[#5B0E2D]">{t.products.region}</h3>
                <p className="text-[#1F1F1F]/70">{product.region}</p>
              </div>
              <div>
                <h3 className="font-medium text-[#5B0E2D]">{t.products.year}</h3>
                <p className="text-[#1F1F1F]/70">{product.year}</p>
              </div>
              <div>
                <h3 className="font-medium text-[#5B0E2D]">{t.products.category}</h3>
                <p className="text-[#1F1F1F]/70">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
