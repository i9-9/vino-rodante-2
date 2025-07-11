"use client"

import { useState, Suspense, useEffect } from "react"
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

// Componente para el menú de usuario
function UserMenuContent() {
  const { user, signOut, isInitialized, initError } = useAuth()
  const t = useTranslations()

  if (!isInitialized) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/auth/sign-in">
          <User className="h-5 w-5" />
          <span className="sr-only">Iniciar Sesión</span>
        </Link>
      </Button>
    )
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">{t.common.account}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background text-foreground">
          <DropdownMenuItem asChild className="text-foreground hover:bg-accent hover:text-accent-foreground">
            <Link href="/account">{t.navigation.account}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-foreground hover:bg-accent hover:text-accent-foreground">
            <Link href="/account?tab=orders">{t.account.orders}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="text-foreground hover:bg-accent hover:text-accent-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            {t.common.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/auth/sign-in">
        <User className="h-5 w-5" />
        <span className="sr-only">{t.common.signIn}</span>
      </Link>
    </Button>
  )
}

// Componente para el carrito
function CartButton({ onOpen }: { onOpen: () => void }) {
  const { itemCount } = useCart()
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onOpen}>
      <ShoppingCart className="h-5 w-5" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-white">
          {itemCount}
        </span>
      )}
      <span className="sr-only">{t.common.cart}</span>
    </Button>
  )
}

export default function Header() {
  const t = useTranslations()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container h-16 grid grid-cols-[auto_1fr_auto] items-center px-4">
        {/* Logo a la izquierda */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">{t.common.menu}</span>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo/logo2.svg" 
              alt="Vino Rodante Logo" 
              width={240} 
              height={80} 
              priority
              className="h-10 w-auto object-contain"
              style={{
                imageRendering: 'crisp-edges'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/logo/logo_vr.svg";
              }}
            />
          </Link>
        </div>
        {/* Navegación centrada */}
        <div className="justify-self-center w-full flex justify-center">
          <Suspense fallback={
            <div className="hidden md:flex w-full justify-center">
              <div className="h-10 w-96 bg-gray-100 rounded animate-pulse" />
            </div>
          }>
            <MegaMenu />
          </Suspense>
        </div>
        {/* Íconos a la derecha */}
        <div className="flex items-center gap-2 justify-self-end">
          <LanguageSwitcher />
          <Suspense fallback={
            <Button variant="ghost" size="icon" disabled>
              <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
            </Button>
          }>
            <SearchDialog />
          </Suspense>
          <Suspense fallback={
            <Button variant="ghost" size="icon">
              <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
            </Button>
          }>
            <UserMenuContent />
          </Suspense>
          <Suspense fallback={
            <Button variant="ghost" size="icon">
              <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
            </Button>
          }>
            <CartButton onOpen={() => setIsCartOpen(true)} />
          </Suspense>
        </div>
      </div>
      <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <CartSidebar open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
