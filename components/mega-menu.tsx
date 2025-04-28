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

export default function MegaMenu() {
  const t = useTranslations()

  // Sample data for the megamenu
  const regions = [
    { name: t.wineRegions.mendoza || "Mendoza", href: "/collections/region/mendoza" },
    { name: t.wineRegions.valleDeUco || "Valle de Uco", href: "/collections/region/valle-de-uco" },
    { name: t.wineRegions.sanJuan || "San Juan", href: "/collections/region/san-juan" },
    { name: t.wineRegions.salta || "Salta", href: "/collections/region/salta" },
    { name: t.wineRegions.rioNegro || "Río Negro", href: "/collections/region/rio-negro" },
    { name: t.wineRegions.neuquen || "Neuquén", href: "/collections/region/neuquen" },
    { name: t.wineRegions.laPampa || "La Pampa", href: "/collections/region/la-pampa" },
    { name: t.wineRegions.catamarca || "Catamarca", href: "/collections/region/catamarca" },
    { name: t.wineRegions.cordoba || "Córdoba", href: "/collections/region/cordoba" },
    { name: t.wineRegions.jujuy || "Jujuy", href: "/collections/region/jujuy" },
    { name: t.wineRegions.patagonia || "Patagonia", href: "/collections/region/patagonia" },
    { name: t.wineRegions.cuyana || "Cuyana", href: "/collections/region/cuyana" },
    { name: t.wineRegions.noroeste || "Noroeste", href: "/collections/region/noroeste" },
    { name: t.wineRegions.centro || "Centro", href: "/collections/region/centro" },
    { name: t.wineRegions.litoral || "Litoral", href: "/collections/region/litoral" }
  ]

  const varietals = [
    { name: t.wineVarietals?.malbec || "Malbec", href: "/collections/varietal/malbec" },
    { name: t.wineVarietals?.cabernetSauvignon || "Cabernet Sauvignon", href: "/collections/varietal/cabernet-sauvignon" },
    { name: t.wineVarietals?.merlot || "Merlot", href: "/collections/varietal/merlot" },
    { name: t.wineVarietals?.pinotNoir || "Pinot Noir", href: "/collections/varietal/pinot-noir" },
    { name: t.wineVarietals?.chardonnay || "Chardonnay", href: "/collections/varietal/chardonnay" },
    { name: t.wineVarietals?.sauvignonBlanc || "Sauvignon Blanc", href: "/collections/varietal/sauvignon-blanc" },
    { name: t.wineVarietals?.riesling || "Riesling", href: "/collections/varietal/riesling" },
    { name: t.wineVarietals?.syrah || "Syrah", href: "/collections/varietal/syrah" },
  ]

  const types = [
    { name: t.navigation.redWines, href: "/collections/red" },
    { name: t.navigation.whiteWines, href: "/collections/white" },
    { name: t.navigation.sparklingWines, href: "/collections/sparkling" },
    { name: t.wineTypes?.rose || "Rosé", href: "/collections/rose" },
    { name: t.wineTypes?.dessert || "Postre", href: "/collections/dessert" },
    { name: t.wineTypes?.fortified || "Fortificado", href: "/collections/fortified" },
  ]

  const collections = [
    { name: t.navigation.featured || t.megamenu.featured || "Destacados", href: "/collections/featured" },
    { name: t.navigation.new || t.megamenu.newArrivals || "Novedades", href: "/collections/new-arrivals" },
    { name: t.navigation.bestsellers || t.megamenu.bestsellers || "Más Vendidos", href: "/collections/bestsellers" },
    { name: t.navigation.gifts || t.megamenu.giftSets || "Sets de Regalo", href: "/collections/gift-sets" },
  ]

  const featuredProducts = [
    {
      name: t.featuredProducts?.malbecReserve || "Malbec Reserva 2018",
      description: t.featuredProducts?.malbecDesc || "Un Malbec audaz y robusto con notas de mora, ciruela y un toque de chocolate.",
      image: "/placeholder.svg?height=400&width=400",
      href: "/products/malbec-reserve-2018",
    },
    {
      name: t.featuredProducts?.chardonnayEstate || "Chardonnay Estate 2020",
      description: t.featuredProducts?.chardonnayDesc || "Elegante y crujiente con acidez equilibrada y notas de manzana verde, pera y vainilla.",
      image: "/placeholder.svg?height=400&width=400",
      href: "/products/chardonnay-estate-2020",
    },
    {
      name: t.featuredProducts?.cabernetSauvignon || "Cabernet Sauvignon 2016",
      description: t.featuredProducts?.cabernetDesc || "De cuerpo completo con taninos ricos y sabores complejos de grosella negra, cedro y especias.",
      image: "/placeholder.svg?height=400&width=400",
      href: "/products/cabernet-sauvignon-gran-reserva-2016",
    },
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
                      {types.map((type) => (
                        <li key={type.href}>
                          <Link href={type.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                            {type.name}
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
                        {regions.slice(0, 4).map((region) => (
                          <li key={region.href}>
                            <Link href={region.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {region.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {regions.slice(4).map((region) => (
                          <li key={region.href}>
                            <Link href={region.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {region.name}
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
                        {varietals.slice(0, 4).map((varietal) => (
                          <li key={varietal.href}>
                            <Link href={varietal.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {varietal.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {varietals.slice(4).map((varietal) => (
                          <li key={varietal.href}>
                            <Link href={varietal.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                              {varietal.name}
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
                      {featuredProducts.map((product, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-16 h-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                            <Link href={product.href} className="text-xs text-primary hover:underline mt-1 inline-block">
                              {t.megamenu.viewDetails}
                            </Link>
                          </div>
                        </div>
                      ))}
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
