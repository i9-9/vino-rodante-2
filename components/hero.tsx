import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { getAvailablePlans } from '@/app/account/actions/subscriptions'
import type { SubscriptionPlan } from '@/app/account/types'
import { Truck, Clock, Wine } from "lucide-react"

export default async function Hero() {
  // Obtener los 4 planes activos y visibles
  const { data: plans = [] } = await getAvailablePlans() as { data: SubscriptionPlan[] }
  const weeklyPlans = plans.slice(0, 4)

  return (
    <section className="w-full bg-white relative md:h-[calc(100vh-4rem)]">
      {/* Columna izquierda: contenido alineado con el logo */}
      <div className="container h-full">
        <div className="flex flex-col items-start text-left z-10 h-full justify-center w-full py-16 md:py-6 mb-28 md:mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#5B0E2D] leading-tight mb-6 max-w-xl">
            Weekly Wine
          </h1>
          <p className="text-base md:text-lg text-[#444] max-w-xl whitespace-pre-line mb-8 leading-relaxed">
            {`En Vino Rodante lo sabemos: tu tiempo es para disfrutar, no para buscar.
Por eso te llevamos a casa una cuidada selección de vinos de calidad a precios irresistibles.
Descorcha sin salir de casa. Disfruta sin complicaciones.`}
          </p>
          <div className="flex flex-row gap-4 mb-8 w-full justify-start">
            <Button size="lg" variant="primary" asChild className="text-base px-8 py-3 w-full sm:w-auto">
              <Link href="/weekly-wine">Ver suscripciones</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="text-base px-8 py-3 w-full sm:w-auto">
              <Link href="/products">Ver productos</Link>
            </Button>
          </div>
          <div className="flex flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-[#444] items-center mt-2">
            <div className="flex items-center gap-1.5">
              <Truck size={16} strokeWidth={1.5} className="text-[#444] flex-shrink-0" />
              <span>Envío gratis a toda Argentina</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} strokeWidth={1.5} className="text-[#444] flex-shrink-0" />
              <span>Entrega rápida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wine size={16} strokeWidth={1.5} className="text-[#444] flex-shrink-0" />
              <span>Selección curada</span>
            </div>
          </div>
        </div>
      </div>
      {/* Mosaico de la derecha: mural absoluto en desktop, bloque normal en mobile */}
      <div className="md:absolute md:top-0 md:right-0 md:w-1/2 md:h-full h-auto w-full md:block z-0">
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0 min-h-[70vw] md:min-h-0">
          {weeklyPlans.map((plan, index) => (
            <div
              key={plan.id}
              className="group relative w-full h-full min-h-[140px] aspect-[4/5] overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Image
                src={plan.image || '/placeholder.svg'}
                alt={plan.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
              {/* Overlay gradiente sutil permanente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              {/* Overlay para texto en hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Contenido del texto */}
              <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-white text-sm md:text-base truncate drop-shadow-lg">
                    {plan.name}
                  </div>
                  {plan.tagline && (
                    <div className="text-white/90 text-xs md:text-sm drop-shadow line-clamp-2 leading-relaxed">
                      {plan.tagline}
                    </div>
                  )}
                  <Button size="sm" variant="primary" asChild className="mt-2 w-fit">
                    <Link href={`/weekly-wine/${plan.type}`}>Ver plan</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}