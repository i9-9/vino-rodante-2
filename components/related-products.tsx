'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RelatedProductsProps {
  products: Product[]
  currentProductId?: string
  title?: string
  className?: string
}

export function RelatedProducts({ 
  products, 
  currentProductId, 
  title = "Productos Relacionados",
  className 
}: RelatedProductsProps) {
  // Filter out current product and limit to 4 products
  const relatedProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, 4)

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
          {title}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {product.region}
                  </span>
                  {product.varietal && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {product.varietal}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-red-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.year}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Component for category-based related products
export function CategoryRelatedProducts({ 
  products, 
  category, 
  currentProductId,
  className 
}: {
  products: Product[]
  category: string
  currentProductId?: string
  className?: string
}) {
  const categoryProducts = products.filter(
    product => product.category.toLowerCase() === category.toLowerCase() && 
    product.id !== currentProductId
  )

  return (
    <RelatedProducts
      products={categoryProducts}
      currentProductId={currentProductId}
      title={`Más ${category}s`}
      className={className}
    />
  )
}

// Component for varietal-based related products
export function VarietalRelatedProducts({ 
  products, 
  varietal, 
  currentProductId,
  className 
}: {
  products: Product[]
  varietal: string
  currentProductId?: string
  className?: string
}) {
  const varietalProducts = products.filter(
    product => product.varietal?.toLowerCase() === varietal.toLowerCase() && 
    product.id !== currentProductId
  )

  return (
    <RelatedProducts
      products={varietalProducts}
      currentProductId={currentProductId}
      title={`Más ${varietal}s`}
      className={className}
    />
  )
}

// Component for region-based related products
export function RegionRelatedProducts({ 
  products, 
  region, 
  currentProductId,
  className 
}: {
  products: Product[]
  region: string
  currentProductId?: string
  className?: string
}) {
  const regionProducts = products.filter(
    product => product.region.toLowerCase() === region.toLowerCase() && 
    product.id !== currentProductId
  )

  return (
    <RelatedProducts
      products={regionProducts}
      currentProductId={currentProductId}
      title={`Más vinos de ${region}`}
      className={className}
    />
  )
}

// Smart related products that combines multiple criteria
export function SmartRelatedProducts({ 
  products, 
  currentProduct,
  className 
}: {
  products: Product[]
  currentProduct: Product
  className?: string
}) {
  // Score products based on similarity
  const scoredProducts = products
    .filter(product => product.id !== currentProduct.id)
    .map(product => {
      let score = 0
      
      // Same category = 3 points
      if (product.category === currentProduct.category) {
        score += 3
      }
      
      // Same varietal = 2 points
      if (product.varietal === currentProduct.varietal) {
        score += 2
      }
      
      // Same region = 2 points
      if (product.region === currentProduct.region) {
        score += 2
      }
      
      // Similar price range = 1 point
      const priceDiff = Math.abs(product.price - currentProduct.price)
      if (priceDiff < currentProduct.price * 0.3) {
        score += 1
      }
      
      return { product, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.product)

  return (
    <RelatedProducts
      products={scoredProducts}
      currentProductId={currentProduct.id}
      title="Te puede interesar"
      className={className}
    />
  )
}

