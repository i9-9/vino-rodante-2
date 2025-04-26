"use client"

import { X, Wine, User, ShoppingBag, LogOut, Globe } from "lucide-react"
import Link from "next/link"
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

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  const handleLanguageChange = (lang: "en" | "es") => {
    setLanguage(lang)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">Vino Rodante</span>
          </SheetTitle>
          <SheetClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">{t.common.close}</span>
          </SheetClose>
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
            {t.navigation.allWines}
          </Link>
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
                {t.navigation.myAccount}
              </Link>
              <Link
                href="/account?tab=orders"
                className="flex items-center gap-2 text-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={onClose}
              >
                <ShoppingBag className="h-5 w-5" />
                {t.navigation.myOrders}
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
