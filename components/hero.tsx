"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function Hero() {
  const t = useTranslations()

  return (
    <section className="w-full relative">
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
            filter: "brightness(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
        <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
          <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t.home.hero.title}
          </h1>
          <p className="mb-8 max-w-xl text-lg text-white/90 sm:text-xl">{t.home.hero.subtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
              <Link href="/products">{t.home.hero.cta}</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-neutral text-neutral hover:bg-neutral/10" asChild>
              <Link href="/about">{t.home.hero.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
