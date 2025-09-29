import { getTranslations } from "@/lib/get-translations"
import ProductsClient from "./ProductsClient"
import SEO from '@/components/SEO'
import { collectionSEO } from '@/lib/seo-config'

// Forzar renderizado dinámico para páginas que dependen de datos de Supabase
// Usar SSG con revalidación cada 30 minutos
export const revalidate = 1800 // 30 minutos en segundos

export async function generateMetadata() {
  const t = await getTranslations()
  
  // Usar la configuración SEO completa para la colección de productos
  return collectionSEO({
    name: t.products.title || "Todos los Vinos",
    description: t.products.description || "Descubre nuestra completa selección de vinos argentinos",
    slug: "products"
  })
}

export default async function ProductsPage() {
  const t = await getTranslations()
  
  return (
    <SEO>
      <ProductsClient t={t} />
    </SEO>
  )
}
