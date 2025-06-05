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
import { getProducts } from '@/lib/products-client'
import type { Product } from '@/lib/types'
import { useFeaturedProducts } from "@/lib/hooks/use-products"
import { getAllWineTypes, getAllWineRegions, getAllWineVarietals, prettyLabel } from "@/lib/wine-data"
import { useRef, useEffect, useState } from "react"

export interface MegaMenuProps {
  types: { name: string; href: string }[]
  regions: { name: string; slug: string; href: string }[]
  varietals: { name: string; slug: string; href: string }[]
  collections: { name: string; href: string }[]
}

export default function MegaMenu({ types, regions, varietals, collections }: MegaMenuProps) {
  const t = useTranslations()
  console.log('🔍 [MegaMenu] Component rendering')
  
  // CAMBIO: Usar getProducts() directamente como en ProductsClient
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isErrorProducts, setIsErrorProducts] = useState<any>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true)
        setIsErrorProducts(null)
        console.log('🔍 [MegaMenu] Calling getProducts() directly (like ProductsClient)')
        const { data, error } = await getProducts()
        
        console.log('🔍 [MegaMenu] getProducts result:', { 
          dataLength: data?.length, 
          error: error?.message || error 
        })
        
        if (error) {
          console.error('🔍 [MegaMenu] Error loading products:', error)
          setIsErrorProducts(error)
          setProducts([])
        } else {
          console.log('🔍 [MegaMenu] ✅ Products loaded successfully:', data?.length || 0)
          setProducts(data || [])
        }
      } catch (err) {
        console.error('🔍 [MegaMenu] Exception:', err)
        setIsErrorProducts(err)
        setProducts([])
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])
  
  console.log('🔍 [MegaMenu] Current state:', { 
    productsLength: products?.length, 
    isLoadingProducts, 
    isErrorProducts: isErrorProducts?.message || isErrorProducts 
  })
  
  // DETAILED LOGGING cuando llegan los productos
  if (products && products.length > 0) {
    console.log('🔍 [MegaMenu] ✅ PRODUCTS AVAILABLE!')
    console.log('🔍 [MegaMenu] Sample products:', products.slice(0, 3).map(p => ({ 
      name: p.name, 
      category: p.category 
    })))
    console.log('🔍 [MegaMenu] All unique categories:', [...new Set(products.map(p => p.category))])
  } else {
    console.log('🔍 [MegaMenu] ❌ NO PRODUCTS YET')
  }
  
  const { products: featuredProducts, isLoading: isLoadingFeatured, isError: isErrorFeatured } = useFeaturedProducts()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const weeklyWineTriggerRef = useRef<HTMLButtonElement | null>(null)

  // Mapeo de categorías de la base de datos a slugs de URL
  const categoryToSlugMap: Record<string, string> = {
    // Categorías en español (las que aparecen en tu DB)
    'tinto': 'red',
    'blanco': 'white', 
    'rosado': 'rose',
    'espumante': 'sparkling',
    'naranjo': 'naranjo',
    'sidra': 'cider',
    'gin': 'gin',
    // Categorías que ya vienen en inglés en tu DB
    'white': 'white',
    'red': 'red',
    'rose': 'rose',
    'sparkling': 'sparkling',
    'dessert': 'dessert',
    'fortified': 'fortified',
    'cider': 'cider'
  }

  console.log('🔍 [MegaMenu] Category mapping:', categoryToSlugMap)

  // DEBUG TEMPORAL: Ver qué está pasando con el mapeo SOLO cuando hay productos
  if (products && products.length > 0) {
    console.log('🔍 [MegaMenu] 🧪 TESTING CATEGORY MATCHING...')
    console.log('🔍 [MegaMenu] Available type slugs:', types.map(t => t.href.split('/').pop()))
    console.log('🔍 [MegaMenu] Unique product categories:', [...new Set(products.map(p => p.category))])
    console.log('🔍 [MegaMenu] Mapped categories:', [...new Set(products.map(p => categoryToSlugMap[p.category] || p.category))])
    
    // TEST: Ver si alguna categoría hace match
    types.forEach(type => {
      const typeSlug = type.href.split('/').pop()
      const matchingProducts = products.filter(product => {
        const productCategorySlug = categoryToSlugMap[product.category] || product.category
        const matches = productCategorySlug === typeSlug
        return matches
      })
      console.log(`🔍 [MegaMenu] Type "${typeSlug}" matches ${matchingProducts.length} products:`, 
        matchingProducts.map(p => `${p.name} (${p.category})`).slice(0, 2)
      )
    })
    
    // DEBUGGING ESPECÍFICO PARA TINTO vs BLANCO
    const tintoProducts = products.filter(p => p.category === 'tinto')
    const blancoProducts = products.filter(p => p.category === 'blanco')
    console.log('🔍 [MegaMenu] 🍷 TINTO products:', tintoProducts.length, tintoProducts.slice(0, 2).map(p => p.name))
    console.log('🔍 [MegaMenu] 🍷 BLANCO products:', blancoProducts.length, blancoProducts.slice(0, 2).map(p => p.name))
    
    // Test mapeo específico
    console.log('🔍 [MegaMenu] 🔄 tinto maps to:', categoryToSlugMap['tinto'])
    console.log('🔍 [MegaMenu] 🔄 blanco maps to:', categoryToSlugMap['blanco'])
    
    // Test si red y white están en types
    const redType = types.find(t => t.href.split('/').pop() === 'red')
    const whiteType = types.find(t => t.href.split('/').pop() === 'white')
    console.log('🔍 [MegaMenu] 📋 RED type found:', !!redType, redType?.name)
    console.log('🔍 [MegaMenu] 📋 WHITE type found:', !!whiteType, whiteType?.name)
  }

  // Filtrar categorías basándose en productos visibles disponibles
  const availableTypes = types.filter(type => {
    // Si los productos están cargando o hay error, no mostrar categorías
    if (isLoadingProducts || isErrorProducts || !products || products.length === 0) {
      return false
    }
    
    const typeSlug = type.href.split('/').pop() // Esto será 'red', 'white', etc.
    
    // Buscar productos que tengan esta categoría
    const hasProducts = products.some(product => {
      // El producto ya viene filtrado por is_visible: true desde getProducts()
      const productCategorySlug = categoryToSlugMap[product.category] || product.category
      const match = productCategorySlug === typeSlug
      return match
    })
    
    return hasProducts
  })
  
  // FALLBACK para modo incógnito: Si hay error o no hay productos, mostrar categorías básicas
  const fallbackTypes = types.filter(type => ['red', 'white', 'rose', 'sparkling'].includes(type.href.split('/').pop() || ''))
  
  // Si hay error de productos (común en modo incógnito), usar fallback
  const finalAvailableTypes = isErrorProducts 
    ? fallbackTypes
    : availableTypes.length > 0 
      ? availableTypes 
      : (products && products.length > 0 ? 
          types.filter(type => ['red', 'white', 'rose'].includes(type.href.split('/').pop() || '')) : 
          []
        )

  console.log('🔍 [MegaMenu] Available types:', availableTypes.length, 'of', types.length)
  console.log('🔍 [MegaMenu] Using fallback types due to error:', isErrorProducts)
  console.log('🔍 [MegaMenu] Final available types:', finalAvailableTypes.length)
  console.log('🔍 [MegaMenu] Products loaded:', products?.length || 0)

  const availableRegions = regions.filter(region => {
    if (isLoadingProducts || isErrorProducts || !products || products.length === 0) {
      return false
    }
    // Los productos ya vienen filtrados por is_visible: true
    return products.some(product => product.region === region.slug)
  })

  const availableVarietals = varietals.filter(varietal => {
    if (isLoadingProducts || isErrorProducts || !products || products.length === 0) {
      return false
    }
    // Los productos ya vienen filtrados por is_visible: true
    return products.some(product => product.varietal === varietal.slug)
  })

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
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-medium border-b pb-2">{t.navigation.weeklyWine}</h3>
                      <Link href="/weekly-wine" className="text-primary hover:underline" onClick={closeWeeklyWineMenu}>
                        Ver todos los clubs
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Link href="/weekly-wine/tinto" className="group" onClick={closeWeeklyWineMenu}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src="/images/weekly-wine/tinto1.jpg"
                            alt="Tintos"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold leading-none">Club Tinto</h4>
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
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold leading-none">Club Blanco</h4>
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
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold leading-none">Club Mixto</h4>
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
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                            <h4 className="text-xl font-semibold leading-none">Club Naranjo</h4>
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
                      {finalAvailableTypes.map((type) => (
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
                        {availableRegions.slice(0, Math.ceil(availableRegions.length / 2)).map((region) => (
                          <li key={region.href}>
                            <Link href={region.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
                              {t.wineRegions[region.slug as keyof typeof t.wineRegions] || prettyLabel(region.slug)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {availableRegions.slice(Math.ceil(availableRegions.length / 2)).map((region) => (
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
                        {availableVarietals.slice(0, Math.ceil(availableVarietals.length / 2)).map((varietal) => (
                          <li key={varietal.href}>
                            <Link href={varietal.href} className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={closeMenu}>
                              {t.wineVarietals[varietal.slug as keyof typeof t.wineVarietals] || prettyLabel(varietal.slug)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {availableVarietals.slice(Math.ceil(availableVarietals.length / 2)).map((varietal) => (
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
