
const clubs = [
  {
    id: 'tinto',
    name: 'Club Tinto',
    description: 'Descubre los mejores vinos tintos de Argentina',
    image: '/images/club/tinto.jpg',
  },
  {
    id: 'blanco',
    name: 'Club Blanco',
    description: 'Explora la frescura de nuestros vinos blancos',
    image: '/images/club/blanco.jpg',
  },
  {
    id: 'naranjo',
    name: 'Club Naranjo',
    description: 'Sumérgete en el mundo de los vinos naranjos',
    image: '/images/club/naranjo.jpg',
  },
  {
    id: 'mixto',
    name: 'Club Mixto',
    description: 'Una selección variada de nuestros mejores vinos',
    image: '/images/club/mixto.jpg',
  },
]

export default function WineClubsShowcase() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container px-4 mx-auto">
        {/* <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-[#5B0E2D] mb-4">
            Nuestros Clubes de Vino
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Únete a uno de nuestros exclusivos clubes y recibe una selección mensual de vinos cuidadosamente elegidos
          </p>
        </div> */}
        
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="group relative overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={club.image}
                  alt={club.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                <p className="text-sm mb-4 opacity-90">{club.description}</p>
                <Link href={`/weekly-wine/${club.id}`}>
                  <Button className="w-full bg-white text-[#5B0E2D] hover:bg-white/90">
                    Conocer más
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
} 