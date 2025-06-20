import { getTranslations } from "@/lib/get-translations"
import ProductsClient from "./ProductsClient"
import SupabaseGuard from "@/components/SupabaseGuard"

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
  return (
    <SupabaseGuard>
      <ProductsClient t={t} />
    </SupabaseGuard>
  )
}
