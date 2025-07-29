import { getSubscriptionPlansByClub, getSubscriptionPlanProducts } from '@/lib/subscriptions-client'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import ClubTabs from "./ClubTabs"
import SubscriptionSelector from "./SubscriptionSelector"
import { Accordion } from "@/components/ui/accordion"

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

export default async function ClubPage({ params }: { params: Promise<{ club: string }> }) {
  const { club } = await params
  const { plans, error } = await getSubscriptionPlansByClub(club)
  const clubInfo = CLUB_INFO[club as keyof typeof CLUB_INFO]
  
  // Obtener productos del primer plan si existe
  let planProducts: any[] = []
  if (plans && plans.length > 0) {
    const { products, error: productsError } = await getSubscriptionPlanProducts(plans[0].id)
    if (!productsError && products) {
      planProducts = products
    }
  }

  if (error || !plans || plans.length === 0 || !clubInfo) {
    return (
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">Club no encontrado</h1>
        <p className="text-muted-foreground">El club solicitado no existe o no tiene planes activos.</p>
      </div>
    )
  }

  // Use the first plan for display purposes (banner, image, etc.)
  const displayPlan = plans[0]

  return (
    <div className="min-h-screen">
      {/* Banner hero */}
      <section className="w-full relative">
        <div className="relative h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={displayPlan.banner_image || clubInfo.image}
              alt={displayPlan.name}
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
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Imagen grande del producto/plan */}
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[4/5] max-w-xl rounded-lg overflow-hidden mb-4">
              <Image
                src={displayPlan.image || clubInfo.image}
                alt={displayPlan.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Detalles del club y suscripción */}
          <div className="flex flex-col gap-6 justify-center">
            <h2 className="text-3xl font-bold mb-2">{displayPlan.name}</h2>
            {displayPlan.tagline && (
              <p className="text-lg text-muted-foreground mb-4">{displayPlan.tagline}</p>
            )}
            
            {/* Selector de suscripción */}
            <div className="mb-6">
              <SubscriptionSelector plans={plans} />
            </div>
            
            {/* Tabs funcionales */}
            <ClubTabs plan={displayPlan} products={planProducts} clubInfo={clubInfo} />
          </div>
        </div>

        {/* Beneficios */}
        <div className="py-12 bg-muted rounded-lg mb-12 px-6">
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
        {planProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-center">Vinos destacados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planProducts.slice(0, 6).map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    {item.products.image && (
                      <div className="relative w-24 h-32 mb-4">
                        <Image
                          src={item.products.image}
                          alt={item.products.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <h4 className="font-semibold mb-2">{item.products.name}</h4>
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      <div>{item.products.year} • {item.products.region}</div>
                      <div>{item.products.varietal}</div>
                      <div className="font-medium">Cantidad: {item.quantity}</div>
                    </div>
                    {item.products.description && (
                      <p className="text-xs text-muted-foreground overflow-hidden" style={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical' 
                      }}>
                        {item.products.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ - Accordion con animación */}
        <div className="mb-12 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-center">Preguntas frecuentes</h3>
          <Accordion
            items={[
              {
                title: "¿Puedo pausar o cancelar mi suscripción cuando quiera?",
                content: "Sí, podés pausar o cancelar tu suscripción en cualquier momento desde tu cuenta."
              },
              {
                title: "¿Qué vinos recibo cada semana?",
                content: "Recibís una selección curada por nuestros sommeliers, diferente cada semana."
              },
              {
                title: "¿Hay costo de envío?",
                content: "El envío es gratis en CABA y GBA. Consultá por otras zonas."
              },
              {
                title: "¿Puedo regalar una suscripción?",
                content: "¡Sí! Solo marcá la opción \"Es un regalo\" al suscribirte."
              }
            ]}
          />
        </div>
      </div>
    </div>
  )
} 