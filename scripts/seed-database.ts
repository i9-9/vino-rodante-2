import { createClient } from "@supabase/supabase-js"

// This script is meant to be run locally to seed your Supabase database
// You would run it with: npx tsx scripts/seed-database.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.API_KEY! // Use your service role key for this script

const products = [
  {
    name: "Malbec Reserve 2018",
    slug: "malbec-reserve-2018",
    description:
      "A bold and robust Malbec with notes of blackberry, plum, and a hint of chocolate. Perfect with grilled meats.",
    price: 45.99,
    image: "/placeholder.svg?height=400&width=400",
    category: "red",
    year: "2018",
    region: "Mendoza, Argentina",
    varietal: "Malbec",
    stock: 24,
    featured: true,
  },
  {
    name: "Chardonnay Estate 2020",
    slug: "chardonnay-estate-2020",
    description: "Elegant and crisp with balanced acidity and notes of green apple, pear, and a touch of vanilla.",
    price: 38.5,
    image: "/placeholder.svg?height=400&width=400",
    category: "white",
    year: "2020",
    region: "Napa Valley, USA",
    varietal: "Chardonnay",
    stock: 18,
    featured: true,
  },
  {
    name: "Cabernet Sauvignon Gran Reserva 2016",
    slug: "cabernet-sauvignon-gran-reserva-2016",
    description:
      "Full-bodied with rich tannins and complex flavors of black currant, cedar, and spice. Aged in French oak barrels.",
    price: 65.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "red",
    year: "2016",
    region: "Maipo Valley, Chile",
    varietal: "Cabernet Sauvignon",
    stock: 12,
    featured: true,
  },
  {
    name: "Prosecco Superiore DOCG",
    slug: "prosecco-superiore-docg",
    description:
      "Refreshing and lively with fine bubbles and notes of green apple, pear, and white flowers. Perfect for celebrations.",
    price: 29.99,
    image: "/placeholder.svg?height=400&width=400",
    category: "sparkling",
    year: "NV",
    region: "Veneto, Italy",
    varietal: "Glera",
    stock: 30,
    featured: true,
  },
  {
    name: "Pinot Noir Reserve 2019",
    slug: "pinot-noir-reserve-2019",
    description:
      "Elegant and silky with notes of red cherry, raspberry, and subtle earthy undertones. Aged in French oak.",
    price: 52.5,
    image: "/placeholder.svg?height=400&width=400",
    category: "red",
    year: "2019",
    region: "Willamette Valley, USA",
    varietal: "Pinot Noir",
    stock: 15,
    featured: false,
  },
  {
    name: "Sauvignon Blanc 2021",
    slug: "sauvignon-blanc-2021",
    description:
      "Crisp and aromatic with vibrant notes of citrus, passion fruit, and fresh-cut grass. Refreshing finish.",
    price: 32.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "white",
    year: "2021",
    region: "Marlborough, New Zealand",
    varietal: "Sauvignon Blanc",
    stock: 22,
    featured: false,
  },
  {
    name: "Champagne Brut Reserve",
    slug: "champagne-brut-reserve",
    description:
      "Elegant and complex with fine bubbles and notes of brioche, apple, and citrus. Perfect for special occasions.",
    price: 85.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "sparkling",
    year: "NV",
    region: "Champagne, France",
    varietal: "Chardonnay, Pinot Noir, Pinot Meunier",
    stock: 10,
    featured: false,
  },
  {
    name: "Tempranillo Reserva 2017",
    slug: "tempranillo-reserva-2017",
    description:
      "Rich and complex with notes of dark cherry, leather, and vanilla. Aged in American and French oak barrels.",
    price: 48.75,
    image: "/placeholder.svg?height=400&width=400",
    category: "red",
    year: "2017",
    region: "Rioja, Spain",
    varietal: "Tempranillo",
    stock: 18,
    featured: false,
  },
  // Nuevos productos con más categorías
  {
    name: "Rosé de Provence 2022",
    slug: "rose-de-provence-2022",
    description:
      "Delicate and fresh rosé with notes of strawberry, peach, and citrus. Light and refreshing, perfect for summer.",
    price: 34.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "rose",
    year: "2022",
    region: "Provence, France",
    varietal: "Grenache, Cinsault",
    stock: 25,
    featured: true,
  },
  {
    name: "Orange Wine Ancestral 2021",
    slug: "orange-wine-ancestral-2021",
    description:
      "Unique orange wine with skin contact fermentation. Complex notes of dried fruits, honey, and spices. Natural and wild.",
    price: 42.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "naranjo",
    year: "2021",
    region: "Mendoza, Argentina",
    varietal: "Torrontés",
    stock: 8,
    featured: true,
  },
  {
    name: "Malbec Rosé 2022",
    slug: "malbec-rose-2022",
    description:
      "Vibrant Argentine rosé made from Malbec grapes. Fresh and fruity with notes of red berries and a crisp finish.",
    price: 28.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "rose",
    year: "2022",
    region: "Mendoza, Argentina",
    varietal: "Malbec",
    stock: 20,
    featured: false,
  },
  {
    name: "Port Vintage 2015",
    slug: "port-vintage-2015",
    description:
      "Rich and complex fortified wine with notes of dark chocolate, figs, and spices. Perfect for dessert pairing.",
    price: 75.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "dessert",
    year: "2015",
    region: "Douro, Portugal",
    varietal: "Touriga Nacional, Tinta Roriz",
    stock: 6,
    featured: false,
  },
  // Productos de Boxes
  {
    name: "Box Malbec Premium",
    slug: "box-malbec-premium",
    description:
      "Caja elegante con 3 botellas de Malbec Premium de diferentes bodegas de Mendoza. Incluye guía de cata y maridaje.",
    price: 120.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "boxes",
    year: "2022",
    region: "Mendoza, Argentina",
    varietal: "Malbec",
    stock: 15,
    featured: true,
  },
  {
    name: "Box Vinos Blancos",
    slug: "box-vinos-blancos",
    description:
      "Selección de 4 vinos blancos premium: Chardonnay, Sauvignon Blanc, Torrontés y Viognier. Perfecto para descubrir nuevos sabores.",
    price: 95.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "boxes",
    year: "2023",
    region: "Mendoza, Argentina",
    varietal: "Blend",
    stock: 12,
    featured: true,
  },
  {
    name: "Box Regalo Especial",
    slug: "box-regalo-especial",
    description:
      "Caja de regalo premium con 2 vinos tintos, 1 blanco y 1 espumante. Incluye copas de cristal y guía de cata.",
    price: 180.0,
    image: "/placeholder.svg?height=400&width=400",
    category: "boxes",
    year: "2023",
    region: "Argentina",
    varietal: "Blend",
    stock: 8,
    featured: true,
  },
]

async function seedDatabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or key. Please set the environment variables.")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("Seeding products...")

  // Insert products
  const { error } = await supabase.from("products").insert(products)

  if (error) {
    console.error("Error seeding products:", error)
  } else {
    console.log("Products seeded successfully")
  }

  console.log("Database seeding complete")
}

seedDatabase()
