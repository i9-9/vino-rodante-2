"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/lib/providers/translations-provider"
import { useEffect, useState } from "react"

export default function Hero() {
  const t = useTranslations()
  const [imageLoaded, setImageLoaded] = useState(false)

  const heroSlide = {
    image: "/images/hero_bg.png",
    title: t.home.hero.title,
    subtitle: t.home.hero.subtitle,
    cta: t.home.hero.cta,
    secondaryCta: t.home.hero.secondaryCta,
    ctaLink: "/products",
    secondaryCtaLink: "/about"
  }

  // Preload the image when component mounts
  useEffect(() => {
    const img = new window.Image()
    img.src = heroSlide.image
    img.onload = () => {
      setImageLoaded(true)
    }
  }, [])

  return (
    <section className="w-full relative">
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroSlide.image}
            alt={heroSlide.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            quality={75}
            className="object-cover object-center transition-opacity duration-300"
            style={{
              filter: "brightness(0.7)",
              opacity: imageLoaded ? 1 : 0,
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg?height=1080&width=1920";
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {heroSlide.title}
          </h1>
          <div className="max-w-2xl text-lg text-[#F2F2F2]/90 sm:text-xl">
            {heroSlide.subtitle.split('\n').map((line, index) => (
              <p key={index} className="">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
              <Link href={heroSlide.ctaLink}>{heroSlide.cta}</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Link href={heroSlide.secondaryCtaLink}>{heroSlide.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
