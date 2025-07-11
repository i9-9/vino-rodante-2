"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function AboutPageContent() {
  const t = useTranslations()
  
  return (
    <>
      <section className="relative h-[50vh] overflow-hidden">
        <Image
          src="/images/Banner_us.png"
          alt="About Us Banner"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B0E2D]/80 to-transparent" />
        <div className="container relative z-10 flex h-full flex-col justify-end pb-8 px-4 text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{t.about.title}</h1>
          <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
            {t.about.tagline}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-medium text-[#5B0E2D] mb-6">{t.about.journey.title}</h2>
            <div className="space-y-6 text-[#1F1F1F]/80">
              <p>{t.about.journey.paragraph1}</p>
              <p>{t.about.journey.paragraph2}</p>
              <p>{t.about.journey.paragraph3}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F2F2F2]">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-medium text-[#5B0E2D] mb-4">{t.about.values.title}</h2>
            <p className="text-[#1F1F1F]/80">{t.about.values.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-[#5B0E2D] mb-3">{t.about.values.quality.title}</h3>
              <p className="text-[#1F1F1F]/80">{t.about.values.quality.description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-[#5B0E2D] mb-3">{t.about.values.authenticity.title}</h3>
              <p className="text-[#1F1F1F]/80">{t.about.values.authenticity.description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-[#5B0E2D] mb-3">{t.about.values.sustainability.title}</h3>
              <p className="text-[#1F1F1F]/80">{t.about.values.sustainability.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-medium text-[#5B0E2D] mb-6">{t.about.selection.title}</h2>
            <div className="space-y-6 text-[#1F1F1F]/80">
              <p>{t.about.selection.paragraph1}</p>
              <p>{t.about.selection.paragraph2}</p>
              <p>{t.about.selection.paragraph3}</p>
            </div>
            <div className="mt-8">
              <Button variant="primary" asChild>
                <Link href="/products">{t.about.selection.cta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F2F2F2]">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-medium text-[#5B0E2D] mb-4">{t.about.newsletter.title}</h2>
            <p className="text-[#1F1F1F]/80 mb-8">{t.about.newsletter.subtitle}</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t.about.newsletter.placeholder}
                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                required
              />
              <Button type="submit" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
                {t.about.newsletter.button}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
} 