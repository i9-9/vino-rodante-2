import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import "../styles/zoom.css"
import "../styles/zoom-variants.css"
import "../styles/react-image-magnify.css"
import "../styles/medium-zoom.css"
import "../styles/product-gallery.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import WhatsappButton from "@/components/whatsapp-button"
import MarqueeBanner from "@/components/marquee-banner"
import { CartProvider } from "@/lib/providers/cart-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { TranslationsProvider } from "@/lib/providers/translations-provider"
import { Toaster } from "@/components/ui/toaster"
import { generateLocalBusinessSchema, generateOrganizationSchema } from "@/lib/seo-utils"


const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // En desarrollo, detectar el puerto correcto
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'
    return `http://localhost:${port}`
  }
  return 'https://www.vinorodante.com'
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Vino Rodante | Selección de Vinos Argentinos",
  description:
    "Descubre vinos excepcionales de todo el país, cuidadosamente seleccionados para los paladares más exigentes. Malbec, Cabernet, Chardonnay y más. Envío gratis en compras +$5000.",
  keywords: [
    // Primary wine keywords
    "vino", "wine", "argentina", "malbec", "cabernet", "chardonnay", "vinos online", "ecommerce vino", "vinorodante", "comprar vino", "vinos argentinos", "tienda vinos",
    // Regional targeting
    "vinos mendoza", "vinos salta", "vinos patagonia", "vinos san juan", "vinos la rioja", "vinos neuquen", "vinos córdoba", "vinos buenos aires",
    // Local delivery
    "delivery vino buenos aires", "envío vino córdoba", "vino online rosario", "delivery vino caba", "envío gratis vino", "delivery vino argentina",
    // Wine club & subscriptions
    "suscripcion de vino", "club de vino", "club tinto", "club blanco", "club mixto", "club naranjo", "wine club argentina", "suscripción vino mensual",
    // Specific varietals
    "malbec argentino", "torrontés", "cabernet sauvignon", "chardonnay argentino", "pinot noir patagonia", "syrah san juan", "sauvignon blanc", "riesling",
    // E-commerce terms
    "comprar vino online", "tienda vinos", "vinos premium", "vinos boutique", "envío gratis vinos", "ofertas vinos", "vinos naturales", "vinos orgánicos",
    // Long-tail keywords
    "mejor tienda vinos argentina", "comprar malbec online", "delivery vino premium", "club vino argentino", "vinos mendoza online"
  ],
  openGraph: {
    title: "Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia",
    description: "Tienda online de vinos argentinos premium. Malbec, Cabernet, Chardonnay y más. Envío gratis en compras +$5000. Club de vino semanal disponible.",
    url: "https://www.vinorodante.com",
    siteName: "Vino Rodante",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vino Rodante - El Vino Rueda en el Tiempo y Crece con la Historia"
      }
    ],
    locale: "es_AR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia",
    description: "Tienda online de vinos argentinos premium. Malbec, Cabernet, Chardonnay y más. Envío gratis en compras +$5000.",
    site: "@vinorodante",
    creator: "@vinorodante",
    images: [
      "/og-image.jpg"
    ]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "/logo/logo2.svg", type: "image/svg+xml" },
    ],
    apple: "/logo/logo2.svg",
    shortcut: "/logo/logo2.svg",
  },
  alternates: {
    canonical: getBaseUrl()
  },
  authors: [{ name: "Vino Rodante" }],
  creator: "Vino Rodante",
  publisher: "Vino Rodante",
}

export const viewport: Viewport = {
  themeColor: "#5B0E2D",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const localBusinessSchema = generateLocalBusinessSchema()
  const organizationSchema = generateOrganizationSchema()

  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/brq4dey.css" />
        {/* hreflang for regional targeting */}
        <link rel="alternate" hrefLang="es-AR" href="https://www.vinorodante.com" />
        <link rel="alternate" hrefLang="es" href="https://www.vinorodante.com" />
        {/* Local Business Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema)
          }}
        />
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <TranslationsProvider>
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <MarqueeBanner />
                <Header />
                <div className="flex-1">{children}</div>
                <Footer />
              </div>
              <WhatsappButton />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  )
}
