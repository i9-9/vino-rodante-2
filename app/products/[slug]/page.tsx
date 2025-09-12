import { getProductBySlug, getProducts } from '@/lib/products-client'
import { getTranslations } from "@/lib/get-translations"
import AddToCartButton from "@/components/add-to-cart-button"
import type { Product } from "@/lib/types"
import ProductCard from '@/components/product-card'
import { SimpleProductZoom } from '@/components/simple-product-zoom'
import { ProductDiscountBadge } from '@/components/ProductDiscountBadge'
import SEO from '@/components/SEO'
import { productSEO } from '@/lib/seo-config'

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

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
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  const t = await getTranslations()
  
  // Obtener descuentos activos y aplicarlos al producto
  let productWithDiscounts = product
  if (product) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/discounts/active`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const { discounts } = await response.json()
        if (discounts && discounts.length > 0) {
          const { applyDiscountsToProducts } = await import('@/lib/discount-utils')
          const productsWithDiscounts = applyDiscountsToProducts([product], discounts)
          productWithDiscounts = productsWithDiscounts[0] || product
        }
      }
    } catch (error) {
      console.error('Error loading discounts for product:', error)
    }
  }

  if (!productWithDiscounts) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.products.title || "Producto no encontrado"}</h1>
        <p className="text-gray-500">{t.products.description || "El producto solicitado no existe o fue eliminado."}</p>
      </div>
    )
  }

  // Validar campos esenciales - diferente validación para boxes vs botellas
  const isBox = productWithDiscounts.category?.toLowerCase() === 'boxes' || productWithDiscounts.category?.toLowerCase() === 'box'
  
  const requiredFields = [
    "name", "slug", "description", "price", "image", "category", "region", "stock"
  ]
  
  // Para productos individuales (no boxes), year y varietal son requeridos
  if (!isBox) {
    requiredFields.push("year", "varietal")
  }
  
  const missingFields = requiredFields.filter(field => (productWithDiscounts as any)[field] === null || (productWithDiscounts as any)[field] === undefined || (productWithDiscounts as any)[field] === "")

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
  let related: Product[] = []
  
  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p className="text-gray-500">El producto que buscas no existe o no está disponible.</p>
      </div>
    )
  }
  
  console.log('🔍 [ProductPage] Product details:', {
    id: productWithDiscounts.id,
    name: productWithDiscounts.name,
    varietal: productWithDiscounts.varietal,
    region: productWithDiscounts.region,
    category: productWithDiscounts.category,
    isBox
  })
  
  console.log('🔍 [ProductPage] All products count:', allProducts?.length || 0)
  
  // Simplificar la lógica: siempre mostrar productos relacionados
  if (allProducts && allProducts.length > 1) {
    // Filtrar el producto actual y tomar los primeros 4
    related = allProducts
      .filter(p => p.id !== productWithDiscounts.id)
      .slice(0, 4)
    console.log('🔍 [ProductPage] Related products found:', related.length)
  } else {
    console.log('🔍 [ProductPage] No products available for related section')
  }
  
  console.log('🔍 [ProductPage] Final related products:', related.length)

  const seoConfig = productSEO({
    name: productWithDiscounts.name,
    description: productWithDiscounts.description,
    image: productWithDiscounts.image,
    price: productWithDiscounts.price,
    region: productWithDiscounts.region,
    varietal: productWithDiscounts.varietal,
    year: productWithDiscounts.year,
    category: productWithDiscounts.category,
    slug: productWithDiscounts.slug,
    stock: productWithDiscounts.stock
  })

  return (
    <SEO seo={seoConfig}>
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <SimpleProductZoom
            src={productWithDiscounts.image || "/placeholder.svg"}
            alt={productWithDiscounts.name}
          />

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-[#5B0E2D] mb-2">{productWithDiscounts.name}</h1>
            <p className="text-lg text-[#1F1F1F]/70 mb-4">
              {isBox ? capitalizeWords(productWithDiscounts.region) : `${productWithDiscounts.year} • ${capitalizeWords(productWithDiscounts.region)}`}
            </p>

            <div className="mb-6">
              {/* Mostrar precio con descuento si existe */}
              {productWithDiscounts.discount ? (
                <div className="mb-4">
                  <ProductDiscountBadge product={productWithDiscounts} size="lg" />
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-2xl font-bold">${productWithDiscounts.price.toFixed(2)}</p>
                </div>
              )}
              <AddToCartButton product={productWithDiscounts} label={t.products.addToCart} />

              <div className="flex items-center text-sm text-[#1F1F1F]/70 mb-4 mt-10">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>
                  {productWithDiscounts.stock > 0 
                    ? t.products.inStock
                    : t.products.outOfStock
                  }
                </span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">{t.products.description}</h2>
              <p className="text-[#1F1F1F]/80 mb-6">{productWithDiscounts.description}</p>

              <div className="grid grid-cols-2 gap-4">
                {!isBox && (
                  <>
                    <div>
                      <h3 className="font-medium text-[#5B0E2D]">{t.products.varietal}</h3>
                      <p className="text-[#1F1F1F]/70">{capitalizeWords(productWithDiscounts.varietal)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#5B0E2D]">{t.products.year}</h3>
                      <p className="text-[#1F1F1F]/70">{productWithDiscounts.year}</p>
                    </div>
                  </>
                )}
                <div>
                  <h3 className="font-medium text-[#5B0E2D]">{t.products.region}</h3>
                  <p className="text-[#1F1F1F]/70">{capitalizeWords(productWithDiscounts.region)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#5B0E2D]">{t.products.category}</h3>
                  <p className="text-[#1F1F1F]/70">
                    {isBox ? 'Box de Vinos' : productWithDiscounts.category.charAt(0).toUpperCase() + productWithDiscounts.category.slice(1)}
                  </p>
                </div>
                {isBox && (
                  <div>
                    <h3 className="font-medium text-[#5B0E2D]">Contenido</h3>
                    <p className="text-[#1F1F1F]/70">Vinos varietales múltiples</p>
                  </div>
                )}
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
    </SEO>
  )
}
