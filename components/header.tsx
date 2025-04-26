"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, Search, User, Wine, LogOut } from "lucide-react"
import { useCart } from "@/lib/hooks/use-cart"
import { useAuth } from "@/lib/providers/auth-provider"
import { useTranslations } from "@/lib/providers/translations-provider"
import MobileMenu from "./mobile-menu"
import CartSidebar from "./cart-sidebar"
import MegaMenu from "./mega-menu"
import LanguageSwitcher from "./language-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { cartItems } = useCart()
  const { user, signOut } = useAuth()
  const t = useTranslations()

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">{t.common.menu}</span>
        </Button>

        <Link href="/" className="flex items-center gap-2">
          <Wine className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">Vino Rodante</span>
        </Link>

        <div className="mx-6 flex-1">
          <MegaMenu />
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">{t.common.search}</span>
          </Button>

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
