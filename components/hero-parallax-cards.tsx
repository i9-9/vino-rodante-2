'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import type { SubscriptionPlan } from '@/app/account/types'

interface ParallaxCardsProps {
  plans: SubscriptionPlan[]
  translations: any
}

export function ParallaxCards({ plans, translations }: ParallaxCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translationsState, setTranslationsState] = useState<number[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      // Calcular la posición relativa del contenedor
      const containerTop = rect.top + scrollY
      const containerBottom = containerTop + rect.height
      
      // Solo aplicar parallax cuando el contenedor está visible
      if (scrollY + windowHeight > containerTop && scrollY < containerBottom) {
        const progress = (scrollY - containerTop + windowHeight) / (windowHeight + rect.height)
        
        // Aplicar diferentes velocidades de parallax a cada card
        const newTranslations = plans.map((_, index) => {
          const speed = 0.1 + (index * 0.05) // Diferentes velocidades para cada card
          return progress * speed * 100
        })
        
        setTranslationsState(newTranslations)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Ejecutar una vez al montar

    return () => window.removeEventListener('scroll', handleScroll)
  }, [plans])

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0 min-h-[70vw] md:min-h-0"
    >
      {plans.map((plan, index) => (
        <div
          key={plan.id}
          className="group relative w-full h-full min-h-[140px] aspect-[4/5] overflow-hidden hover:shadow-lg transition-shadow duration-300"
          style={{
            transform: `translateY(${translationsState[index] || 0}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <Image
            src={plan.image || '/placeholder.svg'}
            alt={plan.name}
            fill
            quality={70}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority
          />
          {/* Overlay gradiente sutil permanente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {/* Overlay para texto en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Contenido del texto */}
          <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 flex flex-row items-end justify-between gap-2
            md:transform md:translate-y-full md:group-hover:translate-y-0 md:transition-transform md:duration-300
            bg-gradient-to-t from-black/70 to-transparent">
            <div>
              <div className="font-semibold text-white text-sm md:text-base truncate drop-shadow-lg">
                {plan.name}
              </div>
              {plan.tagline && (
                <div className="text-white/90 text-xs md:text-sm drop-shadow line-clamp-2 leading-relaxed">
                  {plan.tagline}
                </div>
              )}
            </div>
            <Button size="sm" variant="primary" asChild className="mt-2 w-fit">
              <Link href={`/weekly-wine/${plan.type}`}>{translations.home.hero.cta}</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 