"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Truck, Clock, Wine } from "lucide-react"
import { useTranslations } from '@/lib/providers/translations-provider'
import * as React from "react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import type { SubscriptionPlan } from '@/app/account/types'

interface HeroClientProps {
  weeklyPlans: SubscriptionPlan[]
}

export default function HeroClient({ weeklyPlans }: HeroClientProps) {
  const t = useTranslations()
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(null)
  const [heroHeight, setHeroHeight] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!carouselApi) return
    const intervalId = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext()
      } else {
        carouselApi.scrollTo(0)
      }
    }, 3000)
    return () => clearInterval(intervalId)
  }, [carouselApi])

  // Ensure navbar + banner + hero = 100vh (avoid tiny overflow on desktop)
  React.useEffect(() => {
    const computeHeight = () => {
      const header = document.querySelector('header') as HTMLElement | null
      const banner = document.querySelector('[data-marquee-banner]') as HTMLElement | null
      const headerHeight = header?.getBoundingClientRect().height || 0
      const bannerHeight = banner?.getBoundingClientRect().height || 0
      const available = Math.max(window.innerHeight - headerHeight - bannerHeight, 0)
      setHeroHeight(available)
    }
    computeHeight()
    window.addEventListener('resize', computeHeight)
    return () => window.removeEventListener('resize', computeHeight)
  }, [])

  return (
    <section className="w-full bg-white relative h-[calc(100vh-4rem)] flex flex-col overflow-hidden" style={heroHeight ? { height: heroHeight } : undefined}>
      {/* Columna izquierda: contenido alineado con el logo */}
      <div className="container lg:h-full">
        <div className="flex flex-col items-start text-left z-10 w-full py-6 lg:py-20 mb-0 lg:mb-0 lg:h-full lg:justify-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium tracking-[-0.04em] text-[#5B0E2D] leading-tight mb-6 max-w-xl">
            {t.home?.hero?.title || "Weekly Wine"}
          </h1>
          <p className="text-base lg:text-base text-[#444] max-w-lg lg:max-w-xl whitespace-pre-line mb-8 leading-relaxed">
            {t.home?.hero?.subtitle || "En Vino Rodante lo sabemos: tu tiempo es para disfrutar, no para buscar.\nPor eso te llevamos a casa una cuidada selección de vinos de calidad a precios irresistibles. Descorchá sin salir de casa. Disfrutá sin complicaciones."}
          </p>
          <div className="flex flex-row gap-4 mb-8 w-full justify-start">
            <Button size="lg" variant="primary" asChild className="text-base px-8 py-3 w-full sm:w-auto">
              <Link href="/weekly-wine">{t.home?.hero?.cta || "Ver suscripciones"}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="text-base px-8 py-3 w-full sm:w-auto">
              <Link href="/products">{t.home?.hero?.secondaryCta || "Explorar vinos"}</Link>
            </Button>
          </div>
          <div className="flex flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-[#444] items-center mt-2">
            <div className="flex items-center gap-1.5">
              <Truck size={16} strokeWidth={1.5} className="text-[#444] flex-shrink-0" />
              <span>{t.home?.hero?.shipping || "Envío gratis en CABA"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} strokeWidth={1.5} className="text-[#444] flex-shrink-0" />
              <span>{t.home?.hero?.fastDelivery || "Entrega rápida"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wine size={16} strokeWidth={1.5} className="text-[#444] flex-shrink-0" />
              <span>{t.home?.hero?.curatedSelection || "Selección curada"}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Mosaico / Slider de la derecha */}
      <div className="lg:absolute lg:top-0 lg:right-0 lg:w-1/2 lg:h-full h-auto w-full lg:block z-0 flex-1">
        {/* Mobile: un slider mostrando una tarjeta a la vez */}
        <div className="block lg:hidden w-full h-[45vh] min-h-[220px]">
          {weeklyPlans.length > 0 ? (
            <div className="container px-4 h-full">
              <Carousel setApi={setCarouselApi} className="h-full">
              <CarouselContent className="h-full ml-0">
                {weeklyPlans.map((plan) => (
                  <CarouselItem key={plan.id} className="h-full pl-0">
                    <div className="group relative flex h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                      <Link href={`/weekly-wine/${plan.club}`} className="relative block w-full h-full">
                        <Image
                          src={plan.image || '/placeholder.svg'}
                          alt={plan.name}
                          fill
                          quality={75}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="100vw"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                          <div className="font-semibold text-white text-base truncate drop-shadow-lg">{plan.name}</div>
                        </div>
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-400">
                <Wine size={32} className="mx-auto mb-2" />
                <p className="text-sm">{t.home?.hero?.noPlansAvailable || "No hay planes disponibles"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: grilla 2x2 */}
        <div className="hidden lg:grid grid-cols-2 grid-rows-2 w-full h-full gap-0 min-h-0">
          {weeklyPlans.length > 0 ? (
            weeklyPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/weekly-wine/${plan.club}`}
                className="group relative w-full h-full min-h-[140px] aspect-[4/5] overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
              >
                <Image
                  src={plan.image || '/placeholder.svg'}
                  alt={plan.name}
                  fill
                  quality={70}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="25vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="font-semibold text-white text-sm md:text-base truncate drop-shadow-lg">
                    {plan.name}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 row-span-2 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Wine size={32} className="mx-auto mb-2" />
                <p className="text-sm">{t.home?.hero?.noPlansAvailable || "No hay planes disponibles"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
