import { getTranslations } from "@/lib/get-translations"
import ProductsClient from "./ProductsClient"

export async function generateMetadata() {
  const t = await getTranslations()
  
  return {
    title: t.products.title,
    description: t.products.description,
  }
}

export default async function ProductsPage() {
  const t = await getTranslations()
  return <ProductsClient t={t} />
}
