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
import { useProducts, useFeaturedProducts } from "@/lib/hooks/use-products"
import { getAllWineTypes, getAllWineRegions, getAllWineVarietals, prettyLabel } from "@/lib/wine-data"
import { useRef } from "react"

export interface MegaMenuProps {
  types: { name: string; href: string }[]
  regions: { name: string; slug: string; href: string }[]
  varietals: { name: string; slug: string; href: string }[]
  collections: { name: string; href: string }[]
}

export default function MegaMenu({ types, regions, varietals, collections }: MegaMenuProps) {
  const t = useTranslations()
  const { products, isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts()
  const { products: featuredProducts, isLoading: isLoadingFeatured, isError: isErrorFeatured } = useFeaturedProducts()
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // Función para cerrar el menú programáticamente
  const closeMenu = () => {
    setTimeout(() => {
      triggerRef.current?.click()
    }, 50)
  }

  return (
    <NavigationMenu className="hidden md:flex w-full justify-center">
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation.home}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger ref={triggerRef}>{t.navigation.products}</NavigationMenuTrigger>
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
                          <Link href={type.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
                            {type.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    
                    <h3 className="mb-3 mt-6 text-lg font-medium border-b pb-2">{t.megamenu.collections}</h3>
                    <ul className="space-y-2">
                      {collections.map((collection) => (
                        <li key={collection.href}>
                          <Link href={collection.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
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
                        {regions.slice(0, Math.ceil(regions.length / 2)).map((region) => (
                          <li key={region.href}>
                            <Link href={region.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
                              {t.wineRegions[region.slug as keyof typeof t.wineRegions] || prettyLabel(region.slug)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {regions.slice(Math.ceil(regions.length / 2)).map((region) => (
                          <li key={region.href}>
                            <Link href={region.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
                              {t.wineRegions[region.slug as keyof typeof t.wineRegions] || prettyLabel(region.slug)}
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
                        {varietals.slice(0, Math.ceil(varietals.length / 2)).map((varietal) => (
                          <li key={varietal.href}>
                            <Link href={varietal.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
                              {t.wineVarietals[varietal.slug as keyof typeof t.wineVarietals] || prettyLabel(varietal.slug)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {varietals.slice(Math.ceil(varietals.length / 2)).map((varietal) => (
                          <li key={varietal.href}>
                            <Link href={varietal.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
                              {t.wineVarietals[varietal.slug as keyof typeof t.wineVarietals] || prettyLabel(varietal.slug)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Espacio vacío para mantener el grid */}
                  <div className="col-span-3" />
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
