"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/providers/translations-provider"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useEffect, useState } from "react"
import { getFeaturedProducts, getProducts } from "@/lib/products"
import type { Product } from "@/lib/types"
import { getAllWineTypes, getAllWineRegions, getAllWineVarietals } from "@/lib/wine-data"

export default function MegaMenu() {
  const t = useTranslations()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function fetchData() {
      const featured = await getFeaturedProducts()
      setFeaturedProducts(featured)
      const allProducts = await getProducts()
      setProducts(allProducts)
    }
    fetchData()
  }, [])

  // Obtener regiones, varietales y categorías únicas
  const uniqueRegions = Array.from(new Set(products.map(p => p.region))).filter(Boolean)
  const uniqueVarietals = Array.from(new Set(products.map(p => p.varietal))).filter(Boolean)
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean)

  // Obtener datos usando las funciones centralizadas
  const types = getAllWineTypes(t).map(type => ({
    name: type.name,
    href: `/collections/${type.slug}`
  }))

  const regions = getAllWineRegions(t).map(region => ({
    name: region.name,
    href: `/collections/region/${region.slug}`
  }))

  const varietals = getAllWineVarietals(t).map(varietal => ({
    name: varietal.name,
    href: `/collections/varietal/${varietal.slug}`
  }))

  const collections = [
    { name: t.navigation.featured || t.megamenu.featured || "Destacados", href: "/collections/featured" },
    { name: t.navigation.new || t.megamenu.newArrivals || "Novedades", href: "/collections/new-arrivals" },
    { name: t.navigation.bestsellers || t.megamenu.bestsellers || "Más Vendidos", href: "/collections/bestsellers" },
    { name: t.navigation.gifts || t.megamenu.giftSets || "Sets de Regalo", href: "/collections/gift-sets" },
  ]

  return (
    <NavigationMenu className="hidden md:flex w-full justify-center">
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation.home}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>{t.navigation.products}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-screen left-0 fixed">
              <div className="container mx-auto px-4 py-6 bg-background border border-border rounded-lg shadow-lg">
                <div className="grid grid-cols-12 gap-6">
                  {/* Categorías principales - 3 columnas */}
                  <div className="col-span-3">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu.byType}</h3>
                    <ul className="space-y-2">
                      {uniqueCategories.map((cat) => (
                        <li key={cat}>
                          <Link href={`/collections/${cat.toLowerCase()}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                            {cat}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    
                    <h3 className="mb-3 mt-6 text-lg font-medium border-b pb-2">{t.megamenu.collections}</h3>
                    <ul className="space-y-2">
                      {collections.map((collection) => (
                        <li key={collection.href}>
                          <Link href={collection.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Regiones - 3 columnas */}
                  <div className="col-span-3">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu.byRegion}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <ul className="space-y-2">
                        {uniqueRegions.slice(0, 4).map((region) => (
                          <li key={region}>
                            <Link href={`/collections/region/${region.toLowerCase().replace(/\s+/g, '-')}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {region}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {uniqueRegions.slice(4).map((region) => (
                          <li key={region}>
                            <Link href={`/collections/region/${region.toLowerCase().replace(/\s+/g, '-')}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {region}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Varietales - 3 columnas */}
                  <div className="col-span-3">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu.byVarietal}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <ul className="space-y-2">
                        {uniqueVarietals.slice(0, 4).map((varietal) => (
                          <li key={varietal}>
                            <Link href={`/collections/varietal/${varietal.toLowerCase().replace(/\s+/g, '-')}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {varietal}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {uniqueVarietals.slice(4).map((varietal) => (
                          <li key={varietal}>
                            <Link href={`/collections/varietal/${varietal.toLowerCase().replace(/\s+/g, '-')}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {varietal}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Productos destacados - 3 columnas */}
                  <div className="col-span-3 border-l pl-6">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu.featuredProduct}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {featuredProducts.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No hay productos destacados.</p>
                      ) : (
                        featuredProducts.map((product) => (
                          <div key={product.id} className="flex items-center gap-3">
                            <div className="w-16 h-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover transition-transform hover:scale-105"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{product.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                              <Link href={`/products/${product.slug}`} className="text-xs text-primary hover:underline mt-1 inline-block">
                                {t.megamenu.viewDetails}
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation.about}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/contact" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation.contact}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
