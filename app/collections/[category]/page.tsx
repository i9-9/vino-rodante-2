"use client"

import { getProductsByCategory } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState, use } from "react"
import type { Product } from "@/lib/types"
import { CATEGORY_SLUG_MAP } from "@/lib/wine-data"

// Mapeo de categorías en español a inglés para la consulta a la base de datos
const SPANISH_TO_ENGLISH_MAP: Record<string, string> = {
  'tinto': 'red',
  'blanco': 'white', 
  'rosado': 'rose',
  'espumante': 'sparkling',
  'naranjo': 'naranjo',
  'dulce': 'dessert',
  'sidra': 'cider',
  'gin': 'gin',
  'otras-bebidas': 'other-drinks',
  'boxes': 'boxes'
}

// Títulos en español para cada categoría
const CATEGORY_TITLES: Record<string, string> = {
  'tinto': 'Tintos',
  'blanco': 'Blancos',
  'rosado': 'Rosados',
  'espumante': 'Espumantes',
  'naranjo': 'Naranjos',
  'dulce': 'Dulces',
  'sidra': 'Sidras',
  'gin': 'Gins',
  'otras-bebidas': 'Otras Bebidas',
  'boxes': 'Boxes'
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { category } = use(params)
  
  // Verificar si la categoría es válida
  const isValidCategory = SPANISH_TO_ENGLISH_MAP[category] || CATEGORY_SLUG_MAP[category]
  const categoryTitle = CATEGORY_TITLES[category] || category.charAt(0).toUpperCase() + category.slice(1)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      
      if (isValidCategory) {
        // Usar la categoría en inglés para la consulta a la base de datos
        const queryCategory = SPANISH_TO_ENGLISH_MAP[category] || category
        const { data: filteredProducts, error } = await getProductsByCategory(queryCategory)
        
        if (error) {
          console.error("Error loading products:", error)
          setProducts([])
        } else {
          setProducts(filteredProducts || [])
        }
      } else {
        setProducts([])
      }
      setLoading(false)
    }
    loadProducts()
  }, [category, isValidCategory])

  if (!isValidCategory) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-medium mb-8">Categoría no encontrada</h1>
        <p className="text-muted-foreground">La categoría de vino solicitada no existe.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-medium mb-8">{categoryTitle}</h1>
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron productos en esta categoría.</p>
        </div>
      )}
    </div>
  )
}
