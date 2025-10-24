"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, Instagram } from "lucide-react"
import { NewsletterForm } from "@/components/ui/newsletter-form"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function Footer() {
  const t = useTranslations()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between h-full self-stretch">
            <Link href="/" className="flex items-center gap-2 mb-4 ">
              <Image 
                src="/logo/logo2.svg" 
                alt="Vino Rodante Logo" 
                width={240}
                height={80}
                className="h-20 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t.navigation.products}
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/red"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t.navigation.redWines}
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/white"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t.navigation.whiteWines}
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/sparkling"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t.navigation.sparklingWines}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t.navigation.about}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">{t.footer.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <a 
                  href="https://wa.me/5493492706025" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  +54 9 3492.706025
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <a 
                  href="mailto:info@vinorodante.com" 
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  info@vinorodante.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-accent flex-shrink-0" />
                <a
                  href="https://www.instagram.com/vinorodante/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  @vinorodante
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">{t.footer.newsletter}</h3>
            <p className="text-primary-foreground/70 mb-4">{t.newsletter.subtitle}</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-6 text-center text-primary-foreground/70 text-sm">
          <p>{t.footer.copyright.replace("{year}", currentYear.toString())}</p>
        </div>
      </div>
    </footer>
  )
}
