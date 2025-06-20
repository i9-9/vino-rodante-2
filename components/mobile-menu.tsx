"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Globe, User, LogOut, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations, useLanguage } from "@/lib/providers/translations-provider"
import { useAuth } from "@/lib/providers/auth-provider"

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { user, signOut, isInitialized, initError } = useAuth()
  const t = useTranslations()
  const { language, setLanguage } = useLanguage()

  if (!isInitialized) {
    return null; // El menú móvil no se muestra durante la inicialización
  }

  if (initError) {
    return null; // El menú móvil no se muestra si hay error de auth
  }

  if (!t || !language) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center justify-center">
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
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-6">
            <Link href="/" className="text-foreground hover:text-secondary text-lg font-medium transition-colors">
              Inicio
            </Link>
            <Link href="/auth/sign-in" className="text-foreground hover:text-secondary text-lg font-medium transition-colors">
              Iniciar Sesión
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const handleLanguageChange = (lang: "en" | "es") => {
    setLanguage(lang)
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center justify-center">
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
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{t.language[language]}</span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("en")}
              >
                EN
              </Button>
              <Button
                variant={language === "es" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("es")}
              >
                ES
              </Button>
            </div>
          </div>

          <Separator />

          <Link
            href="/"
            className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
            onClick={onClose}
          >
            {t.navigation.home}
          </Link>

          <div className="space-y-2">
            <Link
              href="/weekly-wine"
              className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
              onClick={onClose}
            >
              {t.navigation.weeklyWine}
            </Link>
            <div className="pl-4 space-y-2">
              <Link
                href="/weekly-wine/tinto"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                Club Tinto
              </Link>
              <Link
                href="/weekly-wine/blanco"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                Club Blanco
              </Link>
              <Link
                href="/weekly-wine/mixto"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                Club Mixto
              </Link>
              <Link
                href="/weekly-wine/naranjo"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                Club Naranjo
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/products"
              className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
              onClick={onClose}
            >
              {t.navigation.products}
            </Link>
            <div className="pl-4 space-y-2">
              <Link
                href="/collections/red"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.navigation.redWines}
              </Link>
              <Link
                href="/collections/white"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.navigation.whiteWines}
              </Link>
              <Link
                href="/collections/sparkling"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.navigation.sparklingWines}
              </Link>
              <Link
                href="/collections/naranjo"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.navigation.orangeWines}
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-foreground text-lg font-medium">
              {t.megamenu.collections}
            </span>
            <div className="pl-4 space-y-2">
              <Link
                href="/collections/featured"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.megamenu.featured}
              </Link>
              <Link
                href="/collections/new-arrivals"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.megamenu.newArrivals}
              </Link>
              <Link
                href="/collections/bestsellers"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.megamenu.bestsellers}
              </Link>
              <Link
                href="/collections/gift-sets"
                className="block text-foreground hover:text-secondary text-base transition-colors"
                onClick={onClose}
              >
                {t.megamenu.giftSets}
              </Link>
            </div>
          </div>

          <Link
            href="/about"
            className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
            onClick={onClose}
          >
            {t.navigation.about}
          </Link>

          <Link
            href="/contact"
            className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
            onClick={onClose}
          >
            {t.navigation.contact}
          </Link>

          <Separator className="my-2" />

          {user ? (
            <>
              <Link
                href="/account"
                className="flex items-center gap-2 text-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={onClose}
              >
                <User className="h-5 w-5" />
                {t.navigation.account}
              </Link>
              <Link
                href="/account?tab=orders"
                className="flex items-center gap-2 text-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={onClose}
              >
                <ShoppingBag className="h-5 w-5" />
                {t.account.orders}
              </Link>
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-2 text-foreground hover:text-secondary text-lg font-medium"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                {t.common.signOut}
              </Button>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="flex items-center gap-2 text-foreground hover:text-secondary text-lg font-medium transition-colors"
              onClick={onClose}
            >
              <User className="h-5 w-5" />
              {t.common.signIn}
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
