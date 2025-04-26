import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "All Wines | Vino Rodante",
  description: "Browse our complete collection of exceptional wines from around the world.",
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#5B0E2D] mb-4">Our Wine Collection</h1>
        <p className="text-[#1F1F1F]/70 max-w-3xl">
          Explore our handpicked selection of exceptional wines from around the world, each with its own unique story
          and flavor profile.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">Categories</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                All Wines
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Red Wines
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                White Wines
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Sparkling Wines
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">Price Range</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                Under $30
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                $30 - $50
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                $50 - $100
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Over $100
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-lg mb-3">Region</h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                France
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Italy
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Spain
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                United States
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Argentina
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Chile
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
