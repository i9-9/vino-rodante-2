import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { getTranslations } from "@/lib/get-translations"

export async function generateMetadata() {
  const t = await getTranslations()
  
  return {
    title: `${t.products.title} | Vino Rodante`,
    description: t.products.subtitle,
  }
}

export default async function ProductsPage() {
  const products = await getProducts()
  const t = await getTranslations()

  return (
    <div className="container px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#5B0E2D] mb-4">{t.products.title}</h1>
        <p className="text-[#1F1F1F]/70 max-w-3xl">
          {t.products.subtitle}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.categories}</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                {t.navigation.allWines}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.navigation.redWines}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.navigation.whiteWines}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.navigation.sparklingWines}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.priceRange}</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                {t.filters?.under30 || "Menos de $30"}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.filters?.between30and50 || "$30 - $50"}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.filters?.between50and100 || "$50 - $100"}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.filters?.over100 || "Más de $100"}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">{t.products.region}</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                {t.wineRegions.france}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.wineRegions.italy}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.wineRegions.spain}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.wineRegions.unitedStates}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.wineRegions.argentina}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t.wineRegions.chile}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
