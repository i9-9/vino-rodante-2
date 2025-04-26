"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function AboutUs() {
  const t = useTranslations()
  
  return (
    <section className="w-full py-16 bg-[#D9D3C8]/30">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-[#5B0E2D] mb-4">Nuestra Filosofía</h2>
            <p className="text-[#1F1F1F]/80 mb-4">
              ¿Cómo llegamos hasta acá? Lo que hoy llamamos enología moderna tiene raíces profundas en prácticas que se han usado durante siglos. En cada botella, se fusionan métodos ancestrales y técnicas contemporáneas, demostrando que lo antiguo no desaparece, sino que evoluciona y convive con lo nuevo.
            </p>
            <p className="text-[#1F1F1F]/80 mb-6">
              Nos interesa descubrir las curiosidades que despertaron a los productores en cada época y entender cómo cada período de la historia dejó su huella en el vino. Porque el vino no solo se bebe, también se lee, se escucha y se siente. Y en Vino Rodante, queremos recorrer ese camino juntos.
            </p>
            <Button variant="primary" asChild>
              <Link href="/about">Conocer más sobre nosotros</Link>
            </Button>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Vino Rodante vineyard"
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block w-48 h-48 rounded-lg overflow-hidden shadow-lg border-4 border-white">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Wine tasting"
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
