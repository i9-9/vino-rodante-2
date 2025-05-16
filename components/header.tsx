"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, User, LogOut } from "lucide-react"
import { useCart } from "@/lib/hooks/use-cart"
import { useAuth } from "@/lib/providers/auth-provider"
import { useTranslations } from "@/lib/providers/translations-provider"
import MobileMenu from "./mobile-menu"
import CartSidebar from "./cart-sidebar"
import MegaMenu from "./mega-menu"
import LanguageSwitcher from "./language-switcher"
import SearchDialog from "./search-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAllWineTypes, getAllWineRegions, getAllWineVarietals } from "@/lib/wine-data"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { cartItems } = useCart()
  const { user, signOut } = useAuth()
  const t = useTranslations()

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const types = getAllWineTypes(t).map(type => ({
    name: type.name,
    href: `/collections/${type.slug}`,
  }))
  const regions = getAllWineRegions(t).map(region => ({
    name: region.name,
    slug: region.slug,
    href: `/collections/region/${region.slug}`,
  }))
  const varietals = getAllWineVarietals(t).map(varietal => ({
    name: varietal.name,
    slug: varietal.slug,
    href: `/collections/varietal/${varietal.slug}`,
  }))
  const collections = [
    { name: t.navigation.featured || t.megamenu.featured || "Destacados", href: "/collections/featured" },
    { name: t.navigation.new || t.megamenu.newArrivals || "Novedades", href: "/collections/new-arrivals" },
    { name: t.navigation.bestsellers || t.megamenu.bestsellers || "Más Vendidos", href: "/collections/bestsellers" },
    { name: t.navigation.gifts || t.megamenu.giftSets || "Sets de Regalo", href: "/collections/gift-sets" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">{t.common.menu}</span>
        </Button>

        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo/logo_vr.svg" 
            alt="Vino Rodante Logo" 
            width={120} 
            height={40} 
            priority
            className="h-10 w-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo/logo2.svg";
            }}
          />
        </Link>

        <div className="mx-auto flex flex-1 justify-center">
          <MegaMenu
            types={types}
            regions={regions}
            varietals={varietals}
            collections={collections}
          />
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SearchDialog />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">{t.common.account}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">{t.navigation.myAccount}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account?tab=orders">{t.navigation.myOrders}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.common.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/auth/sign-in">
                <User className="h-5 w-5" />
                <span className="sr-only">{t.common.signIn}</span>
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-white">
                {cartItemsCount}
              </span>
            )}
            <span className="sr-only">{t.common.cart}</span>
          </Button>
        </div>
      </div>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}
