"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Gift, CheckCircle2, Package, Truck } from "lucide-react"
import CorporateGiftsQuoteForm from "@/components/corporate-gifts-quote-form"

export default function CorporateGiftsPageContent() {
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false)

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <Image
          src="/images/Banner_us.png"
          alt="Regalos Empresariales Banner"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B0E2D]/80 to-transparent" />
        <div className="container relative z-10 flex h-full flex-col justify-end pb-8 px-4 text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Regalos Empresariales
          </h1>
          <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
            Transforme un simple regalo en una poderosa herramienta de networking
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-[#1F1F1F]/80 leading-relaxed mb-6">
              En Vino Rodante, entendemos que un regalo empresarial es mucho más que un detalle: es un gesto de reconocimiento que comunica valores, refuerza vínculos y celebra las alianzas estratégicas que hacen rodar a su negocio.
            </p>
            <p className="text-lg text-[#1F1F1F]/80 leading-relaxed">
              Hemos seleccionado cuidadosamente una colección de vinos y boxes especiales, pensados para que cada obsequio se convierta en una experiencia memorable.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-[#F2F2F2]">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-medium text-[#5B0E2D] mb-8 text-center">
              Por qué elegir Vino Rodante para sus Regalos Corporativos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Selección Curada */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Gift className="h-8 w-8 text-[#5B0E2D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[#5B0E2D] mb-3">
                      Selección Curada
                    </h3>
                    <p className="text-[#1F1F1F]/80">
                      De Alta Gama a etiquetas innovadoras, cada botella es elegida por su historia, su calidad y el placer que promete en cada descorche.
                    </p>
                  </div>
                </div>
              </div>

              {/* El Arte de Conectar */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-8 w-8 text-[#5B0E2D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[#5B0E2D] mb-3">
                      El Arte de Conectar
                    </h3>
                    <p className="text-[#1F1F1F]/80">
                      Regalar vino es regalar un momento de disfrute y una excusa para la pausa. Es un reconocimiento que trasciende lo material y se instala en la memoria.
                    </p>
                  </div>
                </div>
              </div>

              {/* Soluciones a Medida */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-[#5B0E2D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[#5B0E2D] mb-3">
                      Soluciones a Medida
                    </h3>
                    <p className="text-[#1F1F1F]/80">
                      Sabemos que cada empresa es única. Por eso, ofrecemos opciones de personalización y la posibilidad de armar propuestas adaptadas al perfil de sus clientes, colaboradores o socios estratégicos, ajustándonos a su presupuesto y visión.
                    </p>
                  </div>
                </div>
              </div>

              {/* Logística Impecable */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Truck className="h-8 w-8 text-[#5B0E2D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[#5B0E2D] mb-3">
                      Logística Impecable
                    </h3>
                    <p className="text-[#1F1F1F]/80">
                      Su tranquilidad es nuestra prioridad. Nos encargamos de que cada regalo llegue en tiempo y forma, con la presentación que su marca merece.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-medium text-[#5B0E2D] mb-6">
              Haga que su marca se asocie al buen gusto y a la celebración
            </h2>
            <p className="text-lg text-[#1F1F1F]/80 mb-8 leading-relaxed">
              Queremos ser el socio estratégico para sus regalos de fin de año, lanzamientos o conmemoraciones especiales.
            </p>
            <p className="text-lg text-[#1F1F1F]/80 mb-8 leading-relaxed">
              Contáctenos hoy para solicitar su cotización personalizada y descubra cómo podemos transformar un simple regalo en una poderosa herramienta de networking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={() => setIsQuoteFormOpen(true)}>
                Solicitar Cotización
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/collections/boxes">Ver Boxes Disponibles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de cotización modal */}
      <CorporateGiftsQuoteForm open={isQuoteFormOpen} onOpenChange={setIsQuoteFormOpen} />
    </>
  )
}

