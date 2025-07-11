"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/lib/providers/translations-provider"

const CLUBS = [
  {
    id: "tinto",
    title: "Club Tinto",
    description: "Descubrí una selección cuidadosamente elegida de vinos tintos de las mejores bodegas de Argentina.",
    image: "/images/weekly-wine/tinto1.jpg",
    link: "/weekly-wine/tinto"
  },
  {
    id: "blanco",
    title: "Club Blanco",
    description: "Explorá nuestra curada selección de vinos blancos, perfectos para cada ocasión.",
    image: "/images/weekly-wine/blanco2.jpg",
    link: "/weekly-wine/blanco"
  },
  {
    id: "mixto",
    title: "Club Mixto",
    description: "Una combinación perfecta de tintos y blancos para disfrutar de la mejor experiencia enológica.",
    image: "/images/weekly-wine/mixto3.jpg",
    link: "/weekly-wine/mixto"
  },
  {
    id: "naranjo",
    title: "Club Naranjo",
    description: "Descubrí el mundo de los vinos naranjos, una experiencia única y diferente.",
    image: "/images/weekly-wine/naranjo1.jpg",
    link: "/weekly-wine/naranjo"
  }
]

export default function WeeklyWinePage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-medium mb-6">Weekly Wine</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Descubrí nuestros clubs de vino y recibí una selección cuidadosamente elegida cada semana.
        </p>
      </div>

      {/* Cómo funciona */}
      <div className="mb-16">
        <h2 className="text-2xl font-medium mb-8 text-center">{t.club.howItWorks.title}</h2>
        <ol className="max-w-2xl mx-auto space-y-6 list-decimal list-inside text-left">
          <li className="text-base md:text-lg font-medium text-foreground">
            {t.club.howItWorks.step1}
          </li>
          <li className="text-base md:text-lg font-medium text-foreground">
            {t.club.howItWorks.step2}
          </li>
          <li className="text-base md:text-lg font-medium text-foreground">
            {t.club.howItWorks.step3}
          </li>
          <li className="text-base md:text-lg font-medium text-foreground">
            {t.club.howItWorks.step4}
          </li>
        </ol>
      </div>

      {/* Beneficios */}
      <div className="mb-16">
        <h2 className="text-2xl font-medium mb-8 text-center">{t.club.benefits.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm mx-auto mb-4">✓</div>
            <p className="text-sm leading-relaxed">{t.club.benefits.benefit1}</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm mx-auto mb-4">✓</div>
            <p className="text-sm leading-relaxed">{t.club.benefits.benefit2}</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm mx-auto mb-4">✓</div>
            <p className="text-sm leading-relaxed">{t.club.benefits.benefit3}</p>
          </div>
        </div>
      </div>

      {/* Eventos */}
      <div className="mb-16 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-medium mb-6 text-center">{t.club.events.title}</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.club.events.description}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.club.events.thursdays}
          </p>
          <p className="text-sm font-medium text-primary">
            {t.club.events.invitation}
          </p>
        </div>
      </div>

      {/* Clubs */}
      <div>
        <h2 className="text-2xl font-medium mb-8 text-center">Nuestros Clubs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLUBS.map((club) => (
            <Link key={club.id} href={club.link} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={club.image}
                  alt={club.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <h3 className="text-lg font-medium mb-2">{club.title}</h3>
                  <p className="text-xs text-white/80 leading-relaxed">{club.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 