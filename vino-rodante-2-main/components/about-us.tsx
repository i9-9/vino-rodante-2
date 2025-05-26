"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function AboutUs() {
  const t = useTranslations()
  
  return (
    <section className="w-full py-16 bg-[#D9D3C8]/30">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-[#5B0E2D] mb-4">{t.home.about.title}</h2>
            <p className="text-[#1F1F1F]/80 mb-4">
              {t.home.about.paragraph1}
            </p>
            <p className="text-[#1F1F1F]/80 mb-6">
              {t.home.about.paragraph2}
            </p>
            <Button variant="primary" asChild>
              <Link href="/about">{t.home.about.cta}</Link>
            </Button>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/nosotros/us.jpg"
                alt="Vino Rodante equipo"
                width={800}
                height={600}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
