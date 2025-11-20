"use client"

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { useTranslations } from "@/lib/providers/translations-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { WINE_VARIETALS, getAllWineTypes, getAllWineRegions, getAllWineVarietals, prettyLabel, CATEGORY_SLUG_MAP, REGION_SLUG_MAP, VARIETAL_SLUG_MAP } from "@/lib/wine-data"
import { getProductsForMenu } from '@/lib/products-client'
import type { Product } from '@/lib/types'
import Image from "next/image"

const RED_VARIETALS = [
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

const WHITE_VARIETALS = [
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

const ORANGE_VARIETALS = [
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
    name: "Boxes",
    href: "/collections/boxes",
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
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isErrorProducts, setIsErrorProducts] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  const wineTypesData = getAllWineTypes(t)
  const regionsData = getAllWineRegions(t)
  const varietalsData = getAllWineVarietals(t)

  // Mapeo de slugs en inglés a español para las URLs
  const englishToSpanishSlugs: Record<string, string> = {
    'red': 'tinto',
    'white': 'blanco',
    'rose': 'rosado',
    'sparkling': 'espumante',
    'naranjo': 'naranjo',
    'dessert': 'dulce',
    'cider': 'sidra',
    'gin': 'gin',
    'other-drinks': 'otras-bebidas',
    'boxes': 'boxes'
  }

  const allTypes = wineTypesData.map(type => ({
    name: type.name,
    slug: englishToSpanishSlugs[type.slug] || type.slug,
    href: `/collections/${englishToSpanishSlugs[type.slug] || type.slug}`,
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

  // Función helper para normalizar strings para comparación
  const normalizeForComparison = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD') // Descompone caracteres con acentos
      .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
      .replace(/\s+/g, ' ') // Normaliza espacios múltiples
      .replace(/[-\s]/g, '') // Elimina guiones y espacios para comparación
  }

  const finalAvailableTypes = allTypes.filter(type => {
    // Si hay error, no mostrar ningún tipo
    if (isErrorProducts) {
      return false
    }
    
    // Si aún no se han cargado los productos, mostrar todos los tipos definidos
    // Esto mejora la UX durante la carga inicial
    if (!hasInitialLoad || isLoadingProducts || !products || products.length === 0) {
      return true
    }
    
    const spanishSlug = type.href.split('/').pop() || ''
    // Convertir el slug en español al slug en inglés para buscar en CATEGORY_SLUG_MAP
    const englishSlug = Object.keys(englishToSpanishSlugs).find(key => englishToSpanishSlugs[key] === spanishSlug) || spanishSlug
    const dbCategories = CATEGORY_SLUG_MAP[englishSlug] || [englishSlug]
    
    // Normalizar categorías para comparación
    const normalizedDbCategories = dbCategories.map(cat => normalizeForComparison(cat))
    
    // Verificar si hay productos de esta categoría
    return products.some(product => {
      if (!product.category) return false
      
      const normalizedProductCategory = normalizeForComparison(product.category)
      
      // Verificar si la categoría del producto coincide con alguna de las categorías mapeadas
      return dbCategories.some(dbCategory => {
        // Comparación exacta
        if (product.category === dbCategory) return true
        
        // Comparación case-insensitive
        if (product.category.toLowerCase() === dbCategory.toLowerCase()) return true
        
        return false
      }) || normalizedDbCategories.some(normalizedDbCat => {
        // Comparación normalizada (sin acentos, espacios, guiones)
        return normalizedProductCategory === normalizedDbCat
      })
    })
  })

  const availableRegions = allRegions.filter(region => {
    // Si hay error, no mostrar ninguna región
    if (isErrorProducts) {
      return false
    }
    
    // Si aún no se han cargado los productos, mostrar todas las regiones definidas
    // Esto mejora la UX durante la carga inicial
    if (!hasInitialLoad || isLoadingProducts || !products || products.length === 0) {
      return true
    }
    
    // Mapear el slug de la región al nombre completo como se almacena en DB
    const dbRegionName = REGION_SLUG_MAP[region.slug] || region.slug
    
    // Normalizar valores para comparación
    const normalizedDbRegion = normalizeForComparison(dbRegionName)
    const normalizedRegionSlug = normalizeForComparison(region.slug)
    const normalizedRegionName = normalizeForComparison(region.name)
    
    // Verificar si hay productos en esta región con comparación flexible
    const hasProducts = products.some(product => {
      if (!product.region) return false
      
      const normalizedProductRegion = normalizeForComparison(product.region)
      
      // Comparación exacta (original)
      if (product.region === dbRegionName) return true
      if (product.region === region.slug) return true
      if (product.region === region.name) return true
      
      // Comparación case-insensitive (original)
      if (product.region.toLowerCase() === dbRegionName.toLowerCase()) return true
      if (product.region.toLowerCase() === region.slug.toLowerCase()) return true
      if (product.region.toLowerCase() === region.name.toLowerCase()) return true
      
      // Comparación normalizada (sin acentos, espacios, guiones)
      if (normalizedProductRegion === normalizedDbRegion) return true
      if (normalizedProductRegion === normalizedRegionSlug) return true
      if (normalizedProductRegion === normalizedRegionName) return true
      
      // Comparación parcial (para casos como "Valle de Uco" vs "Valle de Uco, Mendoza")
      if (normalizedProductRegion.includes(normalizedDbRegion) || normalizedDbRegion.includes(normalizedProductRegion)) return true
      
      return false
    })
    
    return hasProducts
  })

  const availableVarietals = allVarietals.filter(varietal => {
    // Si hay error, no mostrar ningún varietal
    if (isErrorProducts) {
      return false
    }
    
    // Si aún no se han cargado los productos, mostrar todos los varietales definidos
    // Esto mejora la UX durante la carga inicial
    if (!hasInitialLoad || isLoadingProducts || !products || products.length === 0) {
      return true
    }
    
    // Mapear el slug del varietal al nombre completo como se almacena en DB
    const dbVarietalName = VARIETAL_SLUG_MAP[varietal.slug] || varietal.name
    
    // Normalizar valores para comparación
    const normalizedVarietalSlug = normalizeForComparison(varietal.slug)
    const normalizedVarietalName = normalizeForComparison(varietal.name)
    const normalizedDbVarietal = normalizeForComparison(dbVarietalName)
    
    // Verificar si hay productos con este varietal usando comparación flexible
    return products.some(product => {
      if (!product.varietal) return false
      
      const normalizedProductVarietal = normalizeForComparison(product.varietal)
      
      // Comparación exacta (original)
      if (product.varietal === varietal.slug) return true
      if (product.varietal === varietal.name) return true
      if (product.varietal === dbVarietalName) return true
      
      // Comparación case-insensitive (original)
      if (product.varietal.toLowerCase() === varietal.slug.toLowerCase()) return true
      if (product.varietal.toLowerCase() === varietal.name.toLowerCase()) return true
      if (product.varietal.toLowerCase() === dbVarietalName.toLowerCase()) return true
      
      // Comparación normalizada (sin acentos, espacios, guiones)
      if (normalizedProductVarietal === normalizedVarietalSlug) return true
      if (normalizedProductVarietal === normalizedVarietalName) return true
      if (normalizedProductVarietal === normalizedDbVarietal) return true
      
      // Comparación parcial (para casos como "Cabernet Franc" vs "Cabernet Franc Reserva")
      if (normalizedProductVarietal.includes(normalizedVarietalSlug) || normalizedVarietalSlug.includes(normalizedProductVarietal)) return true
      if (normalizedProductVarietal.includes(normalizedVarietalName) || normalizedVarietalName.includes(normalizedProductVarietal)) return true
      if (normalizedProductVarietal.includes(normalizedDbVarietal) || normalizedDbVarietal.includes(normalizedProductVarietal)) return true
      
      return false
    })
  })

  const closeMenus = () => {
    // Los menús se cierran automáticamente con Radix UI
  }

  useEffect(() => {
    if (!hasInitialLoad && !isLoadingProducts) {
      setIsLoadingProducts(true)
      getProductsForMenu()
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

  // Clubes para el menú
  const clubs = [
    {
      name: "Club Tinto",
      slug: "tinto",
      image: "/images/weekly-wine/tinto1.jpg",
      description: "Descubrí una selección cuidadosamente elegida de vinos tintos de las mejores bodegas de Argentina.",
      href: "/weekly-wine/tinto",
    },
    {
      name: "Club Blanco",
      slug: "blanco",
      image: "/images/weekly-wine/blanco2.jpg",
      description: "Explorá nuestra curada selección de vinos blancos, perfectos para cada ocasión.",
      href: "/weekly-wine/blanco",
    },
    {
      name: "Club Mixto",
      slug: "mixto",
      image: "/images/weekly-wine/mixto3.jpg",
      description: "Una combinación perfecta de tintos y blancos para disfrutar de la mejor experiencia enológica.",
      href: "/weekly-wine/mixto",
    },
    {
      name: "Club Naranjo",
      slug: "naranjo",
      image: "/images/weekly-wine/naranjo1.jpg",
      description: "Descubrí el mundo de los vinos naranjos, una experiencia única y diferente.",
      href: "/weekly-wine/naranjo",
    },
  ]

  return (
    <NavigationMenu 
      className="hidden md:flex justify-center"
      delayDuration={200}
      skipDelayDuration={300}
    >
      <NavigationMenuList className="flex items-center space-x-6">
        <NavigationMenuItem key="home">
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.navigation?.home || "Inicio"}</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* WEEKLY WINE: click navega, hover muestra menú */}
        <NavigationMenuItem 
          key="weekly-wine"
          value="weekly-wine"
        >
          <NavigationMenuTrigger>
            {t.navigation?.weeklyWine || "Weekly Wine"}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="left-1/2 -translate-x-1/2 w-auto max-w-6xl bg-background border border-border rounded-lg shadow-lg overflow-visible [&[data-state=open]]:bg-background">
            <div className="px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-medium border-b pb-2">{t.navigation?.weeklyWine || "Weekly Wine"}</h3>
                      <Link href="/weekly-wine" className="text-primary hover:underline" onClick={closeMenus}>
                        {t.common?.view || "Ver todos"} {t.common?.all || "los clubs"}
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {clubs.map(club => (
                        <Link
                          key={club.slug}
                          href={club.href}
                          onClick={closeMenus}
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground shadow group"
                        >
                          <div className="relative w-full aspect-square mb-2 rounded overflow-hidden">
                            <Image
                              src={club.image}
                              alt={club.name}
                              fill
                              style={{objectFit: 'cover'}}
                              className="rounded group-hover:scale-105 transition-transform duration-200"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          </div>
                          <div className="text-sm font-medium leading-none mb-1">{club.name}</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{club.description}</p>
                        </Link>
                      ))}
                    </div>
              </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* PRODUCTS: click navega, hover muestra menú */}
        <NavigationMenuItem 
          key="products"
          value="products"
        >
          <NavigationMenuTrigger>
            {t.navigation?.products || "Productos"}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="left-1/2 -translate-x-1/2 w-auto max-w-6xl bg-background border border-border rounded-lg shadow-lg overflow-visible p-0 [&[data-state=open]]:bg-background">
            <div className="px-6 py-6">
                <div className="grid grid-cols-12 gap-6">
                  {/* Main categories - 4 columns */}
                  <div className="col-span-12 md:col-span-4">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu?.byType || "Por Tipo"}</h3>
                    <ul className="space-y-2">
                      {finalAvailableTypes.map((type) => (
                        <li key={type.href}>
                          <Link href={type.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenus}>
                            {formatName(type.name, t)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    
                    <h3 className="mb-3 mt-6 text-lg font-medium border-b pb-2">{t.megamenu?.collections || "Colecciones"}</h3>
                    <ul className="space-y-2">
                      {collections.map((collection) => (
                        <li key={collection.href}>
                          <Link href={collection.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenus}>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Regions - 4 columns */}
                  <div className="col-span-12 md:col-span-4">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu?.byRegion || "Por Región"}</h3>
                    <ul className="space-y-2">
                      {availableRegions.map((region) => (
                        <li key={region.href}>
                          <Link href={region.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenus}>
                            {formatName(region.name, t)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Varietals - 4 columns */}
                  <div className="col-span-12 md:col-span-4">
                    <h3 className="mb-3 text-lg font-medium border-b pb-2">{t.megamenu?.byVarietal || "Por Varietal"}</h3>
                    <ul className="space-y-2">
                      {availableVarietals.map((varietal) => (
                        <li key={varietal.slug}>
                          <Link href={`/collections/varietal/${varietal.slug}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenus}>
                            {formatName(varietal.name, t)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem key="corporate-gifts">
          <Link href="/corporate-gifts" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Regalos Empresariales</NavigationMenuLink>
          </Link>
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