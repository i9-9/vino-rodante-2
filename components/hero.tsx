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
          <h1 className="mb-4 max-w-2xl text-4xl tracking-tight sm:text-5xl md:text-6xl">
            {t.home?.hero?.title || "El vino rueda en el tiempo y crece con la historia"}
          </h1>
          <p className="mb-8 max-w-xl text-lg text-white/90 sm:text-xl">
            {"En Vino Rodante queremos recorrer la historia del vino en Argentina de una manera clara y cercana. Cada botella es una cápsula de historia, una conversación entre el pasado y el presente."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="primary" asChild>
              <Link href="/products">{t.home?.hero?.cta || "Explorar Colección"}</Link>
            </Button>
            <Button size="lg" variant="white-outline" asChild>
              <Link href="/about">{t.home?.hero?.secondaryCta || "Nuestra Historia"}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
