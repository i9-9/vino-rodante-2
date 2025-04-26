import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutUs() {
  return (
    <section className="w-full py-16 bg-[#D9D3C8]/30">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-[#5B0E2D] mb-4">Our Story</h2>
            <p className="text-[#1F1F1F]/80 mb-4">
              Vino Rodante was born from a passion for exceptional wines and a desire to share them with the world. Our
              journey began in the rolling vineyards of Argentina, where we discovered the magic that happens when
              tradition meets innovation.
            </p>
            <p className="text-[#1F1F1F]/80 mb-6">
              Today, we travel the world in search of unique wines with character and story. Each bottle in our
              collection represents not just a wine, but a journey, a tradition, and the passionate people behind it.
            </p>
            <Button className="bg-[#AB434C] hover:bg-[#AB434C]/90 text-white" asChild>
              <Link href="/about">Learn More About Us</Link>
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
