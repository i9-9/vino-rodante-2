import { getSubscriptionPlanByClub } from '@/lib/subscriptions-client'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

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

export default async function ClubPage({ params }: { params: { club: string } }) {
  const { plan, error } = await getSubscriptionPlanByClub(params.club)
  const clubInfo = CLUB_INFO[params.club as keyof typeof CLUB_INFO]

  if (error || !plan || !clubInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">Club no encontrado</h1>
        <p className="text-muted-foreground">El club solicitado no existe.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Banner hero */}
      <section className="w-full relative">
        <div className="relative h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={plan.banner_image || clubInfo.image}
              alt={plan.name}
              fill
              priority
              sizes="100vw"
              quality={75}
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Grid principal: producto destacado + detalles */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Imagen grande del producto/plan */}
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[4/5] max-w-md rounded-lg overflow-hidden mb-4">
              <Image
                src={plan.image || clubInfo.image}
                alt={plan.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Detalles del club y suscripción */}
          <div className="flex flex-col gap-6 justify-center">
            <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
            <div className="text-2xl text-primary font-semibold mb-2">
              {plan.price_monthly ? `$${plan.price_monthly}` : ""}
            </div>
            <div className="mb-2">
              <span className="font-medium">Precios:</span>
              <ul className="list-disc ml-6 mt-2">
                <li>Mensual: ${plan.price_monthly}</li>
                <li>Trimestral: ${plan.price_quarterly}</li>
                <li>Anual: ${plan.price_yearly}</li>
              </ul>
            </div>
            {/* Aquí podés agregar radio buttons, lógica de suscripción, etc. */}
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

        {/* Beneficios */}
        <div className="py-12 bg-muted rounded-lg mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">¿Qué recibís?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {clubInfo.benefits.slice(0, 3).map((benefit, idx) => (
              <div key={idx}>
                <div className="flex justify-center mb-2">
                  <span className="text-4xl">🍷</span>
                </div>
                <div className="font-semibold mb-1">{benefit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* About the Wines */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Sobre los vinos</h3>
          <div className="text-muted-foreground max-w-2xl mx-auto">
            {clubInfo.longDescription}
          </div>
        </div>

        {/* FAQ - Accordion restaurado */}
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