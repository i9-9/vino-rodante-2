import { getTranslations } from "@/lib/get-translations"
import ProductsClient from "./ProductsClient"
import SEO from '@/components/SEO'
import { collectionSEO } from '@/lib/seo-config'

// Forzar renderizado dinámico para páginas que dependen de datos de Supabase
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const t = await getTranslations()
  
  return {
    title: t.products.title,
    description: t.products.description,
  }
}

export default async function ProductsPage() {
  const t = await getTranslations()
  
  const seoConfig = collectionSEO({
    name: t.products.title || "Todos los Vinos",
    description: t.products.description || "Descubre nuestra completa selección de vinos argentinos",
    slug: "products"
  })
  
  return (
    <SEO seo={seoConfig}>
      <ProductsClient t={t} />
    </SEO>
  )
}
