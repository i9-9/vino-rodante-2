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
  
  // Use getProducts() directly like ProductsClient
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isErrorProducts, setIsErrorProducts] = useState<any>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true)
        setIsErrorProducts(null)
        console.log('🔍 [MegaMenu] Calling getProducts() directly')
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
  
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const weeklyWineTriggerRef = useRef<HTMLButtonElement | null>(null)

  // Category mapping: Database categories to URL slugs
  const categoryToSlugMap: Record<string, string> = {
    // Spanish (DB) → English (URL)
    'tinto': 'red',
    'blanco': 'white',
    'rosado': 'rose',
    'espumante': 'sparkling',
    'naranjo': 'naranjo',
    'sidra': 'cider',
    'gin': 'gin',
    // Fallbacks
    'white': 'white',
    'red': 'red',
    'rose': 'rose',
    'sparkling': 'sparkling',
    'dessert': 'dessert',
    'fortified': 'fortified',
    'cider': 'cider'
  }

  // Filter categories based on available visible products
  const availableTypes = types.filter(type => {
    if (isLoadingProducts || isErrorProducts || !products || products.length === 0) {
      return false
    }
    
    const typeSlug = type.href.split('/').pop()
    
    const hasProducts = products.some(product => {
      const productCategorySlug = categoryToSlugMap[product.category] || product.category
      const match = productCategorySlug === typeSlug
      const directMatch = product.category === typeSlug
      return match || directMatch
    })
    
    return hasProducts
  })
  
  // Fallback for incognito mode: basic categories
  const fallbackTypes = types.filter(type => 
    ['red', 'white', 'rose', 'sparkling'].includes(type.href.split('/').pop() || '')
  )
  
  const finalAvailableTypes = isErrorProducts 
    ? fallbackTypes
    : availableTypes.length > 0 
      ? availableTypes 
      : (products && products.length > 0 ? 
          types.filter(type => ['red', 'white', 'rose'].includes(type.href.split('/').pop() || '')) : 
          []
        )

  console.log('🔍 [MegaMenu] Final available types:', finalAvailableTypes.length, 'of', types.length)

  const availableRegions = regions.filter(region => {
    if (isLoadingProducts || isErrorProducts || !products || products.length === 0) {
      return false
    }
    return products.some(product => product.region === region.slug)
  })

  const availableVarietals = varietals.filter(varietal => {
    if (isLoadingProducts || isErrorProducts || !products || products.length === 0) {
      return false
    }
    return products.some(product => product.varietal === varietal.slug)
  })

  // Functions to close menu programmatically
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
          <NavigationMenuTrigger 
            ref={triggerRef}
            onClick={(e) => {
              // If it's a simple click (not opening dropdown), navigate to products
              if (e.detail === 1) {
                setTimeout(() => {
                  window.location.href = '/products';
                }, 100);
              }
            }}
          >
            {t.navigation.products}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-screen left-0 fixed">
              <div className="container mx-auto px-4 py-6 bg-background border border-border rounded-lg shadow-lg">
                <div className="grid grid-cols-12 gap-6">
                  {/* Main categories - 3 columns */}
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

                  {/* Regions - 3 columns */}
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

                  {/* Varietales - 3 columns */}
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

                  {/* Empty column to maintain the grid */}
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
