"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function AboutPageContent() {
  const t = useTranslations() as any;
  
  return (
    <>
      <section className="relative h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=1600')",
            filter: "brightness(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B0E2D]/80 to-transparent" />
        <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{t.about.title}</h1>
          <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
            {t.about.tagline}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6">{t.about.journey.title}</h2>
              <p className="text-[#1F1F1F]/80 mb-4">
                {t.about.journey.paragraph1}
              </p>
              <p className="text-[#1F1F1F]/80 mb-4">
                {t.about.journey.paragraph2}
              </p>
              <p className="text-[#1F1F1F]/80">
                {t.about.journey.paragraph3}
              </p>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Vino Rodante founders"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F2F2F2]">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6 text-center">{t.about.values.title}</h2>
          <p className="text-[#1F1F1F]/80 mb-12 text-center max-w-3xl mx-auto">
            {t.about.values.subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-[#5B0E2D]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Image src="/placeholder.svg?height=40&width=40" alt="Quality" width={40} height={40} />
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-3 text-center">{t.about.values.quality.title}</h3>
              <p className="text-[#1F1F1F]/70 text-center">
                {t.about.values.quality.description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-[#5B0E2D]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Image src="/placeholder.svg?height=40&width=40" alt="Authenticity" width={40} height={40} />
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-3 text-center">{t.about.values.authenticity.title}</h3>
              <p className="text-[#1F1F1F]/70 text-center">
                {t.about.values.authenticity.description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-[#5B0E2D]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Image src="/placeholder.svg?height=40&width=40" alt="Sustainability" width={40} height={40} />
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-3 text-center">{t.about.values.sustainability.title}</h3>
              <p className="text-[#1F1F1F]/70 text-center">
                {t.about.values.sustainability.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6">{t.about.selection.title}</h2>
              <p className="text-[#1F1F1F]/80 mb-4">
                {t.about.selection.paragraph1}
              </p>
              <p className="text-[#1F1F1F]/80 mb-4">
                {t.about.selection.paragraph2}
              </p>
              <p className="text-[#1F1F1F]/80 mb-6">
                {t.about.selection.paragraph3}
              </p>
              <Button className="bg-[#A83935] hover:bg-[#A83935]/90 text-white" asChild>
                <Link href="/products">{t.about.selection.cta}</Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Wine selection process"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#5B0E2D] text-white">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t.about.newsletter.title}</h2>
            <p className="text-white/80 mb-8">
              {t.about.newsletter.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder={t.about.newsletter.placeholder}
                className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
              <Button className="bg-white text-[#5B0E2D] hover:bg-white/90 sm:w-auto">
                {t.about.newsletter.button}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
} 