"use client"

import { useTranslations } from "@/lib/providers/translations-provider"
import { getProductsByCategory } from "@/lib/products-client"
import ProductCard from "@/components/product-card"
import { useEffect, useState, use } from "react"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const CLUB_INFO = {
  tinto: {
    title: "Club Tinto",
    description: "Descubrí una selección cuidadosamente elegida de vinos tintos de las mejores bodegas de Argentina.",
    image: "/images/club/tinto.jpg",
    category: "tinto",
    longDescription: "Nuestro Club Tinto está diseñado para los amantes de los vinos tintos. Cada semana recibirás una selección curada de los mejores vinos tintos de Argentina, desde Malbecs robustos hasta Cabernet Sauvignons elegantes. Nuestros sommeliers expertos seleccionan cada botella para asegurar una experiencia enológica excepcional.",
    benefits: [
      "Vinos tintos premium de las mejores bodegas",
      "Guía de cata detallada con notas de maridaje",
      "Acceso a eventos exclusivos de cata",
      "Descuentos en compras adicionales",
      "Flexibilidad para pausar o cancelar"
    ]
  },
  blanco: {
    title: "Club Blanco",
    description: "Explorá nuestra curada selección de vinos blancos, perfectos para cada ocasión.",
    image: "/images/club/blanco.jpg",
    category: "blanco",
    longDescription: "El Club Blanco está dedicado a los vinos blancos más refinados de Argentina. Desde Torrontés aromáticos hasta Chardonnays complejos, cada entrega te sorprenderá con la diversidad y calidad de los vinos blancos argentinos. Perfecto para quienes buscan refrescantes opciones para el día a día.",
    benefits: [
      "Selección de vinos blancos premium",
      "Guías de maridaje con comida",
      "Eventos exclusivos de cata",
      "Descuentos especiales",
      "Suscripción flexible"
    ]
  },
  mixto: {
    title: "Club Mixto",
    description: "Una combinación perfecta de tintos y blancos para disfrutar de la mejor experiencia enológica.",
    image: "/images/club/mixto.jpg",
    category: "all",
    longDescription: "El Club Mixto ofrece lo mejor de ambos mundos: una cuidadosa selección de vinos tintos y blancos. Ideal para quienes quieren explorar la diversidad de la vitivinicultura argentina. Cada entrega incluye una combinación equilibrada de diferentes estilos y variedades.",
    benefits: [
      "Mezcla de vinos tintos y blancos",
      "Guías de cata completas",
      "Eventos exclusivos mensuales",
      "Descuentos en compras",
      "Flexibilidad total"
    ]
  },
  naranjo: {
    title: "Club Naranjo",
    description: "Descubrí el mundo de los vinos naranjos, una experiencia única y diferente.",
    image: "/images/club/naranjo.jpg",
    category: "naranjo",
    longDescription: "El Club Naranjo es para los aventureros del vino. Exploramos el fascinante mundo de los vinos naranjos, una tendencia creciente en la enología moderna. Cada entrega te sorprenderá con vinos únicos y técnicas tradicionales de vinificación.",
    benefits: [
      "Vinos naranjos exclusivos",
      "Guías de cata especializadas",
      "Eventos con productores",
      "Descuentos exclusivos",
      "Suscripción flexible"
    ]
  }
} as const

export default function ClubPage({ params }: { params: Promise<{ club: string }> }) {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState("monthly")
  const { club } = use(params)
  
  const clubInfo = CLUB_INFO[club as keyof typeof CLUB_INFO]

  // Opciones de suscripción traducidas y con 3 botellas
  const SUBSCRIPTION_OPTIONS = [
    {
      id: "monthly",
      title: t.club.subscription.monthly,
      price: "4.999",
      description: t.club.subscription.desc.replace("{bottles}", "3"),
      features: [
        t.club.subscription.deliveries.replace("{count}", "4"),
        t.club.subscription.bottles.replace("{count}", "12"),
        t.club.subscription.tastingGuide,
        t.club.subscription.events
      ]
    },
    {
      id: "quarterly",
      title: t.club.subscription.quarterly,
      price: "13.999",
      description: t.club.subscription.desc.replace("{bottles}", "3"),
      features: [
        t.club.subscription.deliveries.replace("{count}", "12"),
        t.club.subscription.bottles.replace("{count}", "36"),
        t.club.subscription.tastingGuide,
        t.club.subscription.events,
        t.club.subscription.discount5
      ]
    },
    {
      id: "yearly",
      title: t.club.subscription.yearly,
      price: "49.999",
      description: t.club.subscription.desc.replace("{bottles}", "3"),
      features: [
        t.club.subscription.deliveries.replace("{count}", "48"),
        t.club.subscription.bottles.replace("{count}", "144"),
        t.club.subscription.tastingGuide,
        t.club.subscription.events,
        t.club.subscription.discount15,
        t.club.subscription.annualEvent
      ]
    }
  ]

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      if (clubInfo) {
        const { data: filteredProducts, error } = await getProductsByCategory(clubInfo.category)
        if (error) {
          console.error("Error loading products:", error)
          setProducts([])
        } else {
          setProducts(filteredProducts || [])
        }
      } else {
        setProducts([])
      }
      setLoading(false)
    }
    loadProducts()
  }, [club, clubInfo])

  if (!clubInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">Club no encontrado</h1>
        <p className="text-muted-foreground">El club solicitado no existe.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Banner estático similar al hero */}
      <section className="w-full relative">
        <div className="relative h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={clubInfo.image}
              alt={clubInfo.title}
              fill
              priority
              sizes="100vw"
              quality={75}
              className="object-cover object-center"
              style={{ filter: "brightness(0.7)" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg?height=1080&width=1920";
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#5B0E2D]/80 to-transparent" />
          <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {clubInfo.title}
            </h1>
            <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
              {clubInfo.description}
            </p>
          </div>
        </div>
      </section>

      {/* Grid principal: producto destacado + detalles */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Imagen grande del producto destacado */}
          <div className="flex flex-col items-center">
            {loading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : products.length > 0 ? (
              <>
                <div className="relative w-full aspect-[4/5] max-w-md rounded-lg overflow-hidden mb-4">
                  <Image
                    src={products[0].image || clubInfo.image}
                    alt={products[0].name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Miniaturas: si en el futuro hay más imágenes, aquí se puede mapear un array */}
                {/* Ejemplo: products[0].images?.map((img: string, idx: number) => ... ) */}
              </>
            ) : (
              <div className="text-center py-8">No hay productos disponibles</div>
            )}
          </div>

          {/* Detalles del club y suscripción */}
          <div className="flex flex-col gap-6 justify-center">
            <h2 className="text-3xl font-bold mb-2">{clubInfo.title}</h2>
            <div className="text-2xl text-primary font-semibold mb-2">
              {products[0]?.price ? `$${products[0].price}` : "$4.999"}
            </div>
            <div className="mb-2">
              <span className="font-medium">Suscribite:</span>
              <RadioGroup
                value={selectedSubscription}
                onValueChange={setSelectedSubscription}
                className="flex flex-col gap-2 mt-2"
              >
                {SUBSCRIPTION_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id}>{option.title} ({option.description})</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="gift" className="accent-primary" />
              <label htmlFor="gift" className="text-sm">¿Es un regalo?</label>
            </div>
            <Button size="lg" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white w-full max-w-xs">Suscribirse</Button>
            {/* Tabs de info */}
            <div className="mt-6">
              <div className="flex gap-4 border-b mb-2">
                <button className="py-2 px-4 font-medium border-b-2 border-primary text-primary">Descripción</button>
                <button className="py-2 px-4 font-medium text-muted-foreground">Sobre el club</button>
                <button className="py-2 px-4 font-medium text-muted-foreground">Los vinos</button>
              </div>
              <div className="text-muted-foreground text-sm">
                {clubInfo.longDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios (What You Get) */}
        <div className="py-12 bg-muted rounded-lg mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">¿Qué recibís?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <span className="text-4xl">🍷</span>
              </div>
              <div className="font-semibold mb-1">Vinos seleccionados</div>
              <div className="text-muted-foreground text-sm">Solo vinos que amamos y bodegas boutique. Sorpresas cada mes.</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <span className="text-4xl">📦</span>
              </div>
              <div className="font-semibold mb-1">Entrega a domicilio</div>
              <div className="text-muted-foreground text-sm">Recibí tu selección en la puerta de tu casa, sin esfuerzo.</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <span className="text-4xl">🎁</span>
              </div>
              <div className="font-semibold mb-1">Beneficios exclusivos</div>
              <div className="text-muted-foreground text-sm">Descuentos, eventos y sorpresas solo para miembros del club.</div>
            </div>
          </div>
        </div>

        {/* About the Wines */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Sobre los vinos</h3>
          <div className="text-muted-foreground max-w-2xl mx-auto">
            {clubInfo.longDescription}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-center">Preguntas frecuentes</h3>
          <div className="divide-y rounded-lg border">
            <details className="p-4">
              <summary className="font-medium cursor-pointer">¿Puedo pausar o cancelar mi suscripción cuando quiera?</summary>
              <div className="mt-2 text-muted-foreground text-sm">Sí, podés pausar o cancelar tu suscripción en cualquier momento desde tu cuenta.</div>
            </details>
            <details className="p-4">
              <summary className="font-medium cursor-pointer">¿Qué vinos recibo cada semana?</summary>
              <div className="mt-2 text-muted-foreground text-sm">Recibís una selección curada por nuestros sommeliers, diferente cada semana.</div>
            </details>
            <details className="p-4">
              <summary className="font-medium cursor-pointer">¿Hay costo de envío?</summary>
              <div className="mt-2 text-muted-foreground text-sm">El envío es gratis en CABA y GBA. Consultá por otras zonas.</div>
            </details>
            <details className="p-4">
              <summary className="font-medium cursor-pointer">¿Puedo regalar una suscripción?</summary>
              <div className="mt-2 text-muted-foreground text-sm">¡Sí! Solo marcá la opción "Es un regalo" al suscribirte.</div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
} 