"use client"

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { useTranslations } from "@/lib/providers/translations-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { WINE_TYPES, WINE_REGIONS, WINE_VARIETALS, getAllWineTypes, getAllWineRegions, getAllWineVarietals, prettyLabel, CATEGORY_SLUG_MAP } from "@/lib/wine-data"
import type { WineType, WineVarietal, WineRegion, WineTypeData, WineRegionData, WineVarietalData } from "@/lib/wine-data"
import { getProducts } from '@/lib/products-client'
import type { Product } from '@/lib/types'
import { cn } from "@/lib/utils"

const RED_VARIETALS: WineVarietal[] = [
  WINE_VARIETALS.MALBEC,
  WINE_VARIETALS.CABERNET_SAUVIGNON,
  WINE_VARIETALS.BONARDA,
  WINE_VARIETALS.SYRAH,
  WINE_VARIETALS.MERLOT,
  WINE_VARIETALS.TEMPRANILLO,
  WINE_VARIETALS.PETIT_VERDOT,
  WINE_VARIETALS.CABERNET_FRANC,
  WINE_VARIETALS.TANNAT,
  WINE_VARIETALS.PINOT_NOIR,
]

const WHITE_VARIETALS: WineVarietal[] = [
  WINE_VARIETALS.CHARDONNAY,
  WINE_VARIETALS.SAUVIGNON_BLANC,
  WINE_VARIETALS.PEDRO_GIMENEZ,
  WINE_VARIETALS.VIOGNIER,
  WINE_VARIETALS.SEMILLON,
  WINE_VARIETALS.GEWURZTRAMINER,
  WINE_VARIETALS.RIESLING,
  WINE_VARIETALS.CHENIN_BLANC,
  WINE_VARIETALS.MOSCATEL_ALEJANDRIA,
  WINE_VARIETALS.TORRONTES_RIOJANO,
]

const ORANGE_VARIETALS: WineVarietal[] = [
  WINE_VARIETALS.ORANGE_WINE,
]

const collections = [
  {
    name: "Más Vendidos",
    href: "/collections/bestsellers",
  },
  {
    name: "Novedades",
    href: "/collections/new-arrivals",
  },
  {
    name: "Sets de Regalo",
    href: "/collections/gift-sets",
  },
]

// Función para formatear nombres
const formatName = (name: string, t: any) => {
  return t.wineTypes?.[name.toLowerCase() as keyof typeof t.wineTypes] || 
         t.wineRegions?.[name.toLowerCase() as keyof typeof t.wineRegions] || 
         t.wineVarietals?.[name.toLowerCase() as keyof typeof t.wineVarietals] ||
         prettyLabel(name)
}

export default function MegaMenu() {
  const t = useTranslations()
  const router = useRouter()
  const [isWeeklyWineOpen, setIsWeeklyWineOpen] = useState(false)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isErrorProducts, setIsErrorProducts] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  const wineTypesData = getAllWineTypes(t)
  const regionsData = getAllWineRegions(t)
  const varietalsData = getAllWineVarietals(t)

  const allTypes = wineTypesData.map(type => ({
    name: type.name,
    slug: type.slug,
    href: `/collections/type/${type.slug}`,
  }))

  const allRegions = regionsData.map(region => ({
    name: region.name,
    slug: region.slug,
    href: `/collections/region/${region.slug}`,
  }))

  const allVarietals = varietalsData.map(varietal => ({
    name: varietal.name,
    slug: varietal.slug,
  }))

  const finalAvailableTypes = allTypes.filter(type => {
    if (isErrorProducts || !products || products.length === 0) return true
    const slug = type.href.split('/').pop() || ''
    const dbCategory = CATEGORY_SLUG_MAP[slug] || slug
    return products.some(product => product.category === dbCategory)
  })

  const availableRegions = allRegions.filter(region => {
    if (isErrorProducts || !products || products.length === 0) return true
    return products.some(product => product.region === region.slug)
  })

  const availableVarietals = allVarietals.filter(varietal => {
    if (isErrorProducts || !products || products.length === 0) return true
    return products.some(product => product.varietal === varietal.slug)
  })

  const closeWeeklyWineMenu = () => {
    setIsWeeklyWineOpen(false)
  }

  const closeProductsMenu = () => {
    setIsProductsOpen(false)
  }

  useEffect(() => {
    if (!hasInitialLoad && !isLoadingProducts) {
      setIsLoadingProducts(true)
      getProducts()
        .then(({ data, error }) => {
          if (error) {
            setIsErrorProducts(true)
          } else {
            setProducts(data || [])
          }
        })
        .catch(() => setIsErrorProducts(true))
        .finally(() => {
          setIsLoadingProducts(false)
          setHasInitialLoad(true)
        })
    }
  }, [hasInitialLoad, isLoadingProducts])

  return (
    <NavigationMenu className="hidden md:flex w-full justify-center mega-menu-container">
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem key="home">
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation?.home || "Inicio"}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem key="weekly-wine">
          <NavigationMenuTrigger
            onClick={() => setIsWeeklyWineOpen(!isWeeklyWineOpen)}
            className={isWeeklyWineOpen ? "text-primary" : ""}
          >
            {t.navigation?.weeklyWine || "Weekly Wine"}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-screen left-0 fixed">
              <div className="container mx-auto px-4 py-6 bg-background border border-border rounded-lg shadow-lg">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-medium border-b pb-2">{t.navigation?.weeklyWine || "Weekly Wine"}</h3>
                      <Link href="/weekly-wine" className="text-primary hover:underline" onClick={closeWeeklyWineMenu}>
                        {t.common?.view || "Ver todos"} {t.common?.all || "los clubs"}
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <Link href="/weekly-wine/tinto" onClick={closeWeeklyWineMenu}>
                          <div className="text-sm font-medium leading-none mb-2">Club Tinto</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Descubrí una selección cuidadosamente elegida de vinos tintos de las mejores bodegas de Argentina.
                          </p>
                        </Link>
                      </div>
                      <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <Link href="/weekly-wine/blanco" onClick={closeWeeklyWineMenu}>
                          <div className="text-sm font-medium leading-none mb-2">Club Blanco</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Explorá nuestra curada selección de vinos blancos, perfectos para cada ocasión.
                          </p>
                        </Link>
                      </div>
                      <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <Link href="/weekly-wine/mixto" onClick={closeWeeklyWineMenu}>
                          <div className="text-sm font-medium leading-none mb-2">Club Mixto</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Una combinación perfecta de tintos y blancos para disfrutar de la mejor experiencia enológica.
                          </p>
                        </Link>
                      </div>
                      <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <Link href="/weekly-wine/naranjo" onClick={closeWeeklyWineMenu}>
                          <div className="text-sm font-medium leading-none mb-2">Club Naranjo</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Descubrí el mundo de los vinos naranjos, una experiencia única y diferente.
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem key="products">
          <NavigationMenuTrigger
            onClick={() => setIsProductsOpen(!isProductsOpen)}
            className={isProductsOpen ? "text-primary" : ""}
          >
            {t.navigation?.products || "Productos"}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-screen left-0 fixed">
              <div className="container mx-auto px-4 py-6 bg-background border border-border rounded-lg shadow-lg">
                <div className="grid grid-cols-12 gap-6">
                  {/* Main categories - 4 columns */}
                  <div className="col-span-4">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu?.byType || "Por Tipo"}</h3>
                    <ul className="space-y-2">
                      {finalAvailableTypes.map((type) => (
                        <li key={type.href}>
                          <Link href={type.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeProductsMenu}>
                            {formatName(type.name, t)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    
                    <h3 className="mb-3 mt-6 text-lg font-medium border-b pb-2">{t.megamenu?.collections || "Colecciones"}</h3>
                    <ul className="space-y-2">
                      {collections.map((collection) => (
                        <li key={collection.href}>
                          <Link href={collection.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeProductsMenu}>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Regions - 4 columns */}
                  <div className="col-span-4">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu?.byRegion || "Por Región"}</h3>
                    <ul className="space-y-2">
                      {availableRegions.map((region) => (
                        <li key={region.href}>
                          <Link href={region.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeProductsMenu}>
                            {formatName(region.name, t)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Varietals - 4 columns */}
                  <div className="col-span-4">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu?.byVarietal || "Por Varietal"}</h3>
                    <ul className="space-y-2">
                      {availableVarietals.map((varietal) => (
                        <li key={varietal.slug}>
                          <Link href={`/collections/varietal/${varietal.slug}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeProductsMenu}>
                            {formatName(varietal.name, t)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem key="about">
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation?.about || "Nosotros"}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem key="contact">
          <Link href="/contact" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation?.contact || "Contacto"}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
