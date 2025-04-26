"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function AboutPageContent() {
  const t = useTranslations() as any;
  
  return (
    <>
      <section className="relative h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=1600')",
            filter: "brightness(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B0E2D]/80 to-transparent" />
        <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Nuestra Historia</h1>
          <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
            El vino rueda en el tiempo y crece con la historia.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6">Nuestro Recorrido</h2>
              <p className="text-[#1F1F1F]/80 mb-4">
                En Vino Rodante queremos recorrer la historia del vino en Argentina de una manera clara y cercana. Cada vino es una cápsula de historia, una conversación entre el pasado y el presente. En cada botella, se fusionan métodos ancestrales y técnicas contemporáneas, demostrando que lo antiguo no desaparece, sino que evoluciona y convive con lo nuevo.
              </p>
              <p className="text-[#1F1F1F]/80 mb-4">
                En 2010, colaboramos con un proyecto que se llamó XXVII donde participamos de cerca en la creación de una etiqueta personal. En 2014, creamos @hachealmacen, un espacio para pequeños productores, donde el relato tradicional se fusiona con las anécdotas de las personas que trazan la historia en cada etiqueta.
              </p>
              <p className="text-[#1F1F1F]/80">
                En el 2021: un viaje hacia el sur del país, con Hache Patagonia en Esquel, acercando etiquetas desconocidas a una provincia en pleno desarrollo vitivinícola, permitiendo la comparación de perfiles de producción y apreciar la fusión de lo recorrido.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Vino Rodante founders"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F2F2F2]">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6 text-center">Nuestros Valores</h2>
          <p className="text-[#1F1F1F]/80 mb-12 text-center max-w-3xl mx-auto">
            Celebramos la constante búsqueda personal en cada vino entendiendo al tiempo como una línea circular que define la decisión íntima de la producción.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-[#5B0E2D]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Image src="/placeholder.svg?height=40&width=40" alt="Tradición" width={40} height={40} />
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-3 text-center">Tradición</h3>
              <p className="text-[#1F1F1F]/70 text-center">
                Desde la época de los georgianos, los primeros jeroglíficos ya hablaban del vino como un producto hecho a mano. El arte del pisado de uvas simboliza la búsqueda en la extracción de la esencia.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-[#5B0E2D]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Image src="/placeholder.svg?height=40&width=40" alt="Evolución" width={40} height={40} />
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-3 text-center">Evolución</h3>
              <p className="text-[#1F1F1F]/70 text-center">
                La evolución se plasma en la prensa, que marcó un antes y un después en la producción. Las barricas, con su fermentación y crianza, narran la búsqueda por perfeccionar y conservar la tradición.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-[#5B0E2D]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Image src="/placeholder.svg?height=40&width=40" alt="Innovación" width={40} height={40} />
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-3 text-center">Innovación</h3>
              <p className="text-[#1F1F1F]/70 text-center">
                Volver a la vasija de barro nos recuerda la importancia de honrar lo ancestral. El círculo siempre vuelve a comenzar y el "huevo de cemento" se convierte en un símbolo de la convivencia entre la experiencia y lo aprendido.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6">Weekly Wine</h2>
              <p className="text-[#1F1F1F]/80 mb-4">
                En Vino Rodante presentamos nuestro Weekly Wine, una propuesta semanal que va más allá de la recomendación del vino. Queremos crear un recorrido que nos conecte con la experiencia humana detrás de cada etiqueta.
              </p>
              <p className="text-[#1F1F1F]/80 mb-4">
                Sentimos que cada proyecto es un reflejo del tiempo y del lugar en el que nace su productor y cada etiqueta representa una búsqueda diferente que conversa con el recorrido del productor. ¿Qué nos dice este vino sobre la época en la que vivimos? ¿Cómo dialoga con las prácticas de antaño y con las tendencias actuales?
              </p>
              <p className="text-[#1F1F1F]/80 mb-6">
                La búsqueda nace en trazar un puente vivo entre la enología tradicional y la innovación, demostrando que lo moderno siempre puede rendir homenaje a lo ancestral y convivir con el presente.
              </p>
              <Button className="bg-[#A83935] hover:bg-[#A83935]/90 text-white" asChild>
                <Link href="/products">Explorar Nuestra Colección</Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Weekly Wine selection"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#5B0E2D] text-white">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Únete a Nuestro Viaje Vinícola</h2>
            <p className="text-white/80 mb-8">
              Sumate a esta nueva propuesta y descubrí cómo cada Weekly Wine busca revelar y reflexionar acerca del tiempo y el lugar en que nace el productor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Tu dirección de correo electrónico"
                className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
              <Button className="border border-white bg-transparent text-white hover:bg-white/10 sm:w-auto">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
} 