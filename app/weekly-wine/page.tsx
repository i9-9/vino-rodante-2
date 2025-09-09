"use client"

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
    <div className="container mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16 gap-4">
        <h1 className="text-4xl md:text-5xl font-medium">Weekly Wine</h1>
        <p className="text-lg text-muted-foreground max-w-xl leading-tight ">
          Descubrí nuestros clubs de vino y recibí una selección cuidadosamente elegida cada semana.
        </p>
      </div>

      {/* Clubs - Movido al principio y más grandes */}
      <div className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CLUBS.map((club) => (
            <Link key={club.id} href={club.link} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Image
                  src={club.image}
                  alt={club.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">{club.title}</h3>
                  <p className="text-base text-white/90 leading-relaxed">{club.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>


    </div>
  )
} 