import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "About Us | Vino Rodante",
  description: "Learn about Vino Rodante's journey, mission, and passion for exceptional wines.",
}

export default function AboutPage() {
  return (
    <main>
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
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Our Story</h1>
          <p className="max-w-xl text-lg text-[#F2F2F2]/90 sm:text-xl">
            Passionate about wine, dedicated to quality, committed to sharing the world's finest vintages.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6">Our Journey</h2>
              <p className="text-[#1F1F1F]/80 mb-4">
                Vino Rodante was born from a passion for exceptional wines and a desire to share them with the world.
                Our journey began in the rolling vineyards of Argentina, where we discovered the magic that happens when
                tradition meets innovation.
              </p>
              <p className="text-[#1F1F1F]/80 mb-4">
                Founded in 2015 by sommelier Maria Rodriguez and winemaker Carlos Mendoza, Vino Rodante (which means
                "Rolling Wine" in Spanish) started as a small boutique wine shop in Buenos Aires. Our founders' vision
                was to create a space where wine enthusiasts could discover unique, high-quality wines from small
                producers around the world.
              </p>
              <p className="text-[#1F1F1F]/80">
                Today, we've grown into an international online retailer, but our mission remains the same: to bring
                exceptional wines to discerning palates, and to share the stories and passion behind each bottle we
                sell.
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

      <section className="py-16 bg-[#D9D3C8]/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#5B0E2D] mb-4">Our Values</h2>
            <p className="max-w-2xl mx-auto text-[#1F1F1F]/70">
              At Vino Rodante, we're guided by a set of core values that inform everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#A83935] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-2">Quality</h3>
              <p className="text-[#1F1F1F]/70">
                We meticulously select each wine in our collection, ensuring that every bottle meets our high standards
                for quality and character.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#A83935] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-2">Authenticity</h3>
              <p className="text-[#1F1F1F]/70">
                We value wines that express their terroir and the unique vision of their makers, showcasing the
                authentic character of their origin.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#A83935] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#5B0E2D] mb-2">Sustainability</h3>
              <p className="text-[#1F1F1F]/70">
                We prioritize wines from producers who practice sustainable, organic, or biodynamic viticulture,
                respecting both the land and its people.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-[#5B0E2D] mb-6">Our Selection Process</h2>
              <p className="text-[#1F1F1F]/80 mb-4">
                Every wine in our collection has been carefully selected through a rigorous tasting process. Our team of
                sommeliers and wine experts travels the world, visiting vineyards and meeting with winemakers to
                discover exceptional wines with character and story.
              </p>
              <p className="text-[#1F1F1F]/80 mb-4">
                We look for wines that not only taste exceptional but also tell a story – about the land they come from,
                the people who made them, and the traditions they represent.
              </p>
              <p className="text-[#1F1F1F]/80 mb-6">
                This commitment to quality and authenticity means that our collection is constantly evolving, with new
                discoveries being added regularly alongside our trusted favorites.
              </p>
              <Button className="bg-[#A83935] hover:bg-[#A83935]/90 text-white" asChild>
                <Link href="/products">Explore Our Collection</Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Wine selection process"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#5B0E2D] text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Wine Journey</h2>
          <p className="max-w-2xl mx-auto mb-8 text-[#F2F2F2]/90">
            Subscribe to our newsletter to receive updates on new arrivals, special promotions, and invitations to
            exclusive tasting events.
          </p>
          <div className="max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-md flex-1 text-[#1F1F1F]"
              />
              <Button className="bg-[#E6802E] hover:bg-[#E6802E]/90 text-white">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
