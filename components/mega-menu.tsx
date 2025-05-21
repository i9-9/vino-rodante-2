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
  const weeklyWineTriggerRef = useRef<HTMLButtonElement | null>(null)

  // Función para cerrar el menú programáticamente
  const closeMenu = () => {
    setTimeout(() => {
      triggerRef.current?.click()
    }, 50)
  }

  const closeWeeklyWineMenu = () => {
    setTimeout(() => {
      weeklyWineTriggerRef.current?.click()
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
          <NavigationMenuTrigger ref={weeklyWineTriggerRef}>{t.navigation.weeklyWine}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-screen left-0 fixed">
              <div className="container mx-auto px-4 py-6 bg-background border border-border rounded-lg shadow-lg">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12">
                    <h3 className="mb-6 text-2xl font-medium border-b pb-2">{t.navigation.weeklyWine}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Link href="/weekly-wine/tinto" className="group" onClick={closeWeeklyWineMenu}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src="/images/weekly-wine/tinto1.jpg"
                            alt="Tintos"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold">Tintos</h4>
                            <p className="text-sm text-white/80">Selección de vinos tintos</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/weekly-wine/blanco" className="group" onClick={closeWeeklyWineMenu}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src="/images/weekly-wine/blanco2.jpg"
                            alt="Blancos"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold">Blancos</h4>
                            <p className="text-sm text-white/80">Selección de vinos blancos</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/weekly-wine/mixto" className="group" onClick={closeWeeklyWineMenu}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src="/images/weekly-wine/mixto3.jpg"
                            alt="Mixto"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold">Mixto</h4>
                            <p className="text-sm text-white/80">Tintos, blancos y más</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/weekly-wine/naranjo" className="group" onClick={closeWeeklyWineMenu}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src="/images/weekly-wine/naranjo1.jpg"
                            alt="Naranjo"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold">Naranjo</h4>
                            <p className="text-sm text-white/80">Selección de vinos naranjos</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
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
