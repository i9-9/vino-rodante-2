"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/lib/providers/translations-provider"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react"

const slides = [
  {
    image: "/images/hero_bg.png",
    title: "Descubre el mundo del vino",
    subtitle: "Explora nuestra selección de vinos excepcionales de las mejores regiones vitivinícolas de Argentina",
    cta: "Ver Productos",
    secondaryCta: "Conoce más",
    ctaLink: "/products",
    secondaryCtaLink: "/about"
  },
  {
    image: "/images/hero_bg2.jpg",
    title: "Weekly Wine",
    subtitle: "Suscribite y recibí una selección cuidadosamente elegida de vinos cada semana",
    cta: "Suscribirse",
    secondaryCta: "Más información",
    ctaLink: "/weekly-wine",
    secondaryCtaLink: "/about"
  },
  {
    image: "/images/hero_bg3.jpg",
    title: "Experiencias únicas",
    subtitle: "Descubre el arte de la cata de vinos con nuestros expertos",
    cta: "Reservar",
    secondaryCta: "Ver eventos",
    ctaLink: "/events",
    secondaryCtaLink: "/about"
  },
  {
    image: "/images/hero_bg4.jpg",
    title: "Vinos de autor",
    subtitle: "Descubre nuestra selección de vinos premium de los mejores enólogos de Argentina",
    cta: "Explorar",
    secondaryCta: "Ver colección",
    ctaLink: "/collections/premium",
    secondaryCtaLink: "/about"
  }
]

export default function Hero() {
  const t = useTranslations()
  const [api, setApi] = useState<any>()
  const [current, setCurrent] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]))

  // Preload all images when component mounts
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new window.Image()
      img.src = slide.image
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]))
      }
    })
  }, [])

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 7000)

    return () => clearInterval(interval)
  }, [api])

  useEffect(() => {
    if (!api) return

    api.on("select", () => {
      const newIndex = api.selectedScrollSnap()
      setCurrent(newIndex)
    })
  }, [api])

  return (
    <section className="w-full relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[70vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index <= 1}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    quality={75}
                    className="object-cover object-center transition-opacity duration-300"
                    style={{
                      filter: "brightness(0.7)",
                      opacity: loadedImages.has(index) ? 1 : 0,
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=1080&width=1920";
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                <div className="absolute inset-0 bg-black/10" />
                <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
                  <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
                    {slide.subtitle}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
                      <Link href={slide.ctaLink}>{slide.cta}</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                      <Link href={slide.secondaryCtaLink}>{slide.secondaryCta}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index ? "bg-white w-4" : "bg-white/50"
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </section>
  )
}
