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
    <section className="w-full bg-white border-b">
      <div className="container px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[750px]">
        {/* Columna Izquierda: Texto alineado a la izquierda y centrado verticalmente, pero más arriba */}
        <div className="flex flex-col items-start text-left z-10 mb-20">
          <div className="w-full">
            <h1 className="text-4xl md:text-5xl font-medium text-[#1F1F1F] leading-tight mb-4">
              Weekly Wine
            </h1>
            <p className="text-lg text-[#555] max-w-xl whitespace-pre-line mb-6">
              {`En Vino Rodante lo sabemos: tu tiempo es para disfrutar, no para buscar.
Por eso te llevamos a casa una cuidada selección de vinos de calidad a precios irresistibles.
Descorcha sin salir de casa. Disfruta sin complicaciones.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button size="lg" variant="primary" asChild>
                <Link href="/weekly-wine">Ver suscripciones</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">Ver productos</Link>
              </Button>
            </div>
            <div className="flex flex-row justify-center sm:justify-start gap-6 text-sm text-[#444] items-center text-left">
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2">
                <Truck size={22} strokeWidth={1.5} className="text-[#444]" />
                <span>Envío gratis</span>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2">
                <Clock size={22} strokeWidth={1.5} className="text-[#444]" />
                <span>Entrega rápida</span>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2">
                <Wine size={22} strokeWidth={1.5} className="text-[#444]" />
                <span>Selección curada</span>
              </div>
            </div>
          </div>
        </div>
        {/* Columna Derecha: Grid 2x2 de planes de suscripción */}
        <div className="grid grid-cols-2 gap-4 mb-20">
          {weeklyPlans.map((plan) => (
            <div
              key={plan.id}
              className="group relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
            >
              <Image
                src={plan.image || '/placeholder.svg'}
                alt={plan.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
              {/* Overlay para texto */}
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent px-4 py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="font-semibold text-white text-base truncate mb-1 drop-shadow">
                  {plan.name}
                </div>
                {plan.tagline && (
                  <div className="text-white/80 text-xs mb-2 drop-shadow line-clamp-2">
                    {plan.tagline}
                  </div>
                )}
                <Button size="sm" variant="secondary" asChild className="mt-1">
                  <Link href={`/weekly-wine/${plan.type}`}>Ver plan</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
