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
import { CartProvider } from "@/lib/providers/cart-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { TranslationsProvider } from "@/lib/providers/translations-provider"
import { Toaster } from "@/components/ui/toaster"


const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://www.vinorodante.com'
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Vino Rodante | Selección de Vinos Argentinos",
  description:
    "Descubre vinos excepcionales de todo el país, cuidadosamente seleccionados para los paladares más exigentes.",
  keywords: [
    "vino", "wine", "argentina", "malbec", "cabernet", "chardonnay", "vinos online", "ecommerce vino", "vinorodante", "comprar vino", "vinos argentinos", "suscripcion de vino", "riesling", "vino de jujuy", "vino de la patagonia", "vino de mendoza", "club de vino", "club tinto", "club blanco", "club mixto", "club naranjo"
  ],
  openGraph: {
    title: "Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia",
    description: "Tienda online rodante de vinos de toda la Argentina.",
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
    description: "Tienda online rodante de vinos de toda la Argentina.",
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
      { url: "/logo/logo_vr.svg", type: "image/svg+xml" },
    ],
    apple: "/logo/logo_vr.svg",
    shortcut: "/logo/logo_vr.svg",
  },
  alternates: {
    canonical: "https://www.vinorodante.com"
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
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/brq4dey.css" />
        <meta name="theme-color" content="#5B0E2D" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <TranslationsProvider>
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
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
