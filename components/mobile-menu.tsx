"use client"

import { X, Wine, User, ShoppingBag, LogOut, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { useAuth } from "@/lib/providers/auth-provider"
import { useTranslations } from "@/lib/providers/translations-provider"
import { useLanguage } from "@/lib/providers/translations-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { user, signOut } = useAuth()
  const t = useTranslations()
  const { language, setLanguage } = useLanguage()

  const handleLanguageChange = (newLanguage: "en" | "es") => {
    setLanguage(newLanguage)
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
            <span className="font-medium">{t.language[language as keyof typeof t.language]}</span>
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
            href="/products"
            className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
            onClick={onClose}
          >
            {t.navigation.products}
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

          <Link
            href="/collections/red"
            className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
            onClick={onClose}
          >
            {t.navigation.redWines}
          </Link>
          <Link
            href="/collections/white"
            className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
            onClick={onClose}
          >
            {t.navigation.whiteWines}
          </Link>
          <Link
            href="/collections/sparkling"
            className="text-foreground hover:text-secondary text-lg font-medium transition-colors"
            onClick={onClose}
          >
            {t.navigation.sparklingWines}
          </Link>
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
            <>
              <Link
                href="/auth/sign-in"
                className="flex items-center gap-2 text-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={onClose}
              >
                <User className="h-5 w-5" />
                {t.common.signIn}
              </Link>
              <Link
                href="/auth/sign-up"
                className="flex items-center gap-2 text-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={onClose}
              >
                {t.common.signUp}
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
