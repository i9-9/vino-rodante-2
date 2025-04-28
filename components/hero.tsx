"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function Hero() {
  const t = useTranslations()

  return (
    <section className="w-full relative">
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero_bg.png" 
            alt="Paisaje de viñedo"
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover object-center"
            style={{
              filter: "brightness(0.7)",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg?height=1080&width=1920";
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B0E2D]/80 to-transparent" />
        <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t.home.hero.title}
          </h1>
          <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
            {t.home.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
              <Link href="/products">{t.home.hero.cta}</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Link href="/about">{t.home.hero.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
