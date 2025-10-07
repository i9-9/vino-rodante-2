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
        <SheetContent side="left" className="w-full sm:w-[400px] px-4">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center justify-start">
              <Image 
                src="/logo/logo2.svg" 
                alt="Vino Rodante Logo" 
                width={120} 
                height={40} 
                priority
                className="h-10 w-auto"
                style={{
                  imageRendering: 'crisp-edges'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/logo/logo_vr.svg";
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
      <SheetContent side="left" className="w-full sm:w-[400px] px-4">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center justify-start">
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
        <div className="py-6">
          <div className="flex items-center gap-2 mb-4">
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

          <Separator className="mb-4" />

          <div className="grid grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <Link
                href="/"
                className="block text-foreground hover:text-primary text-base font-semibold transition-colors py-1"
                onClick={onClose}
              >
                {t.navigation.home}
              </Link>

              <div className="space-y-3">
                <Link
                  href="/weekly-wine"
                  className="block text-foreground hover:text-primary text-base font-semibold transition-colors py-1"
                  onClick={onClose}
                >
                  {t.navigation.weeklyWine}
                </Link>
                <div className="pl-3 space-y-1.5 border-l-2 border-muted">
                  <Link
                    href="/weekly-wine/tinto"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    Club Tinto
                  </Link>
                  <Link
                    href="/weekly-wine/blanco"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    Club Blanco
                  </Link>
                  <Link
                    href="/weekly-wine/mixto"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    Club Mixto
                  </Link>
                  <Link
                    href="/weekly-wine/naranjo"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    Club Naranjo
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-foreground text-base font-semibold py-1">
                  {t.megamenu.collections}
                </span>
                <div className="pl-3 space-y-1.5 border-l-2 border-muted">
                  <Link
                    href="/collections/featured"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.megamenu.featured}
                  </Link>
                  <Link
                    href="/collections/new-arrivals"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.megamenu.newArrivals}
                  </Link>
                  <Link
                    href="/collections/bestsellers"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.megamenu.bestsellers}
                  </Link>
                  <Link
                    href="/collections/boxes"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.megamenu.boxes}
                  </Link>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div className="space-y-3">
                <Link
                  href="/products"
                  className="block text-foreground hover:text-primary text-base font-semibold transition-colors py-1"
                  onClick={onClose}
                >
                  {t.navigation.products}
                </Link>
                <div className="pl-3 space-y-1.5 border-l-2 border-muted">
                  <Link
                    href="/collections/tinto"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.navigation.redWines}
                  </Link>
                  <Link
                    href="/collections/blanco"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.navigation.whiteWines}
                  </Link>
                  <Link
                    href="/collections/espumante"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.navigation.sparklingWines}
                  </Link>
                  <Link
                    href="/collections/naranjo"
                    className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5"
                    onClick={onClose}
                  >
                    {t.navigation.orangeWines}
                  </Link>
                </div>
              </div>

              <Link
                href="/about"
                className="block text-foreground hover:text-primary text-base font-semibold transition-colors py-1"
                onClick={onClose}
              >
                {t.navigation.about}
              </Link>

              <Link
                href="/contact"
                className="block text-foreground hover:text-primary text-base font-semibold transition-colors py-1"
                onClick={onClose}
              >
                {t.navigation.contact}
              </Link>
            </div>
          </div>

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
