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
    { name: "France", href: "/collections/region/france" },
    { name: "Italy", href: "/collections/region/italy" },
    { name: "Spain", href: "/collections/region/spain" },
    { name: "Argentina", href: "/collections/region/argentina" },
    { name: "Chile", href: "/collections/region/chile" },
    { name: "United States", href: "/collections/region/united-states" },
    { name: "Australia", href: "/collections/region/australia" },
    { name: "New Zealand", href: "/collections/region/new-zealand" },
  ]

  const varietals = [
    { name: "Malbec", href: "/collections/varietal/malbec" },
    { name: "Cabernet Sauvignon", href: "/collections/varietal/cabernet-sauvignon" },
    { name: "Merlot", href: "/collections/varietal/merlot" },
    { name: "Pinot Noir", href: "/collections/varietal/pinot-noir" },
    { name: "Chardonnay", href: "/collections/varietal/chardonnay" },
    { name: "Sauvignon Blanc", href: "/collections/varietal/sauvignon-blanc" },
    { name: "Riesling", href: "/collections/varietal/riesling" },
    { name: "Syrah", href: "/collections/varietal/syrah" },
  ]

  const types = [
    { name: t.navigation.redWines, href: "/collections/red" },
    { name: t.navigation.whiteWines, href: "/collections/white" },
    { name: t.navigation.sparklingWines, href: "/collections/sparkling" },
    { name: "Rosé", href: "/collections/rose" },
    { name: "Dessert", href: "/collections/dessert" },
    { name: "Fortified", href: "/collections/fortified" },
  ]

  const collections = [
    { name: t.navigation.featured, href: "/collections/featured" },
    { name: t.navigation.new, href: "/collections/new-arrivals" },
    { name: t.navigation.bestsellers, href: "/collections/bestsellers" },
    { name: t.navigation.gifts, href: "/collections/gift-sets" },
  ]

  const featuredProduct = {
    name: "Malbec Reserve 2018",
    description: "A bold and robust Malbec with notes of blackberry, plum, and a hint of chocolate.",
    image: "/placeholder.svg?height=400&width=400",
    href: "/products/malbec-reserve-2018",
  }

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation.home}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>{t.navigation.products}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[800px] grid-cols-4 gap-3 p-4">
              <div className="col-span-1">
                <h3 className="mb-2 text-lg font-medium">{t.megamenu.byRegion}</h3>
                <ul className="space-y-1">
                  {regions.map((region) => (
                    <li key={region.href}>
                      <Link href={region.href} className="block rounded-md px-2 py-1 text-sm hover:bg-muted">
                        {region.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1">
                <h3 className="mb-2 text-lg font-medium">{t.megamenu.byVarietal}</h3>
                <ul className="space-y-1">
                  {varietals.map((varietal) => (
                    <li key={varietal.href}>
                      <Link href={varietal.href} className="block rounded-md px-2 py-1 text-sm hover:bg-muted">
                        {varietal.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1">
                <h3 className="mb-2 text-lg font-medium">{t.megamenu.byType}</h3>
                <ul className="space-y-1">
                  {types.map((type) => (
                    <li key={type.href}>
                      <Link href={type.href} className="block rounded-md px-2 py-1 text-sm hover:bg-muted">
                        {type.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <h3 className="mb-2 mt-6 text-lg font-medium">{t.megamenu.collections}</h3>
                <ul className="space-y-1">
                  {collections.map((collection) => (
                    <li key={collection.href}>
                      <Link href={collection.href} className="block rounded-md px-2 py-1 text-sm hover:bg-muted">
                        {collection.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1 border-l pl-4">
                <h3 className="mb-2 text-lg font-medium">{t.megamenu.featuredProduct}</h3>
                <div className="space-y-3">
                  <div className="aspect-square overflow-hidden rounded-md">
                    <Image
                      src={featuredProduct.image || "/placeholder.svg"}
                      alt={featuredProduct.name}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <h4 className="font-medium">{featuredProduct.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{featuredProduct.description}</p>
                  <Button asChild size="sm" className="w-full">
                    <Link href={featuredProduct.href}>{t.megamenu.viewDetails}</Link>
                  </Button>
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
