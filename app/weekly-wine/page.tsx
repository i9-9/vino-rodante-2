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
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Weekly Wine</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Descubrí nuestros clubs de vino y recibí una selección cuidadosamente elegida cada semana.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">{t.club.howItWorks.title}</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl">1</span>
              <span>{t.club.howItWorks.step1}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl">2</span>
              <span>{t.club.howItWorks.step2}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl">3</span>
              <span>{t.club.howItWorks.step3}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl">4</span>
              <span>{t.club.howItWorks.step4}</span>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">{t.club.benefits.title}</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl">✓</span>
              <span>{t.club.benefits.benefit1}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl">✓</span>
              <span>{t.club.benefits.benefit2}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl">✓</span>
              <span>{t.club.benefits.benefit3}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sección de Eventos */}
      <div className="mb-12 bg-[#F2F2F2] rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t.club.events.title}</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-lg text-[#1F1F1F]/80">
            {t.club.events.description}
          </p>
          <p className="text-lg text-[#1F1F1F]/80">
            {t.club.events.thursdays}
          </p>
          <p className="text-lg font-medium text-[#5B0E2D]">
            {t.club.events.invitation}
          </p>
        </div>
      </div>

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
                <h3 className="text-xl font-semibold mb-2">{club.title}</h3>
                <p className="text-sm text-white/80">{club.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 