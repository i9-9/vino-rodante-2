import { getProductBySlug, getProducts } from '@/lib/products-client'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { notFound } from "next/navigation"
import { addToCart } from "@/lib/actions"
import { getTranslations } from "@/lib/get-translations"
import AddToCartButton from "@/components/add-to-cart-button"
import type { Product } from "@/lib/types"
import ProductCard from '@/components/product-card'

export const dynamic = "force-dynamic";

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
  const { data: products } = await getProducts()

  if (!products) {
    return []
  }

  return products.map((product) => ({
    slug: product.slug,
  }))
}

function capitalizeWords(str: string) {
  return str
    .toLocaleLowerCase('es-AR')
    .replace(/(?:^|\s|\b)([a-záéíóúüñ])/g, (match) => match.toLocaleUpperCase('es-AR'));
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  const t = await getTranslations()

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.products.title || "Producto no encontrado"}</h1>
        <p className="text-gray-500">{t.products.description || "El producto solicitado no existe o fue eliminado."}</p>
      </div>
    )
  }

  // Validar campos esenciales
  const requiredFields = [
    "name", "slug", "description", "price", "image", "category", "year", "region", "varietal", "stock"
  ]
  const missingFields = requiredFields.filter(field => (product as any)[field] === null || (product as any)[field] === undefined || (product as any)[field] === "")

  if (missingFields.length > 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.products.title || "Producto con información incompleta"}</h1>
        <p className="text-gray-500">Faltan los siguientes campos: {missingFields.join(", ")}</p>
      </div>
    )
  }

  // Obtener productos relacionados
  const { data: allProducts } = await getProducts()
  let related = allProducts?.filter(p => p.id !== product.id && p.varietal === product.varietal) || []
  if (related.length < 4) {
    const regionRelated = (allProducts || []).filter(p => p.id !== product.id && p.region === product.region && p.varietal !== product.varietal)
    related = [...related, ...regionRelated].slice(0, 4)
  } else {
    related = related.slice(0, 4)
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
            {product.year} • {capitalizeWords(product.region)}
          </p>

          <div className="mb-6">
            <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
            <AddToCartButton product={product} label={t.products.addToCart} />

            <div className="flex items-center text-sm text-[#1F1F1F]/70 mb-4 mt-10">
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
                <p className="text-[#1F1F1F]/70">{capitalizeWords(product.varietal)}</p>
              </div>
              <div>
                <h3 className="font-medium text-[#5B0E2D]">{t.products.region}</h3>
                <p className="text-[#1F1F1F]/70">{capitalizeWords(product.region)}</p>
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
      {/* Productos relacionados */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
