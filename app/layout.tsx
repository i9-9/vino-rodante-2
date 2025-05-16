import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/lib/providers/cart-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { TranslationsProvider } from "@/lib/providers/translations-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Vino Rodante | Selección de Vinos Finos",
  description:
    "Descubre vinos excepcionales de todo el mundo, cuidadosamente seleccionados para los paladares más exigentes.",
  keywords: [
    "vino", "wine", "argentina", "malbec", "cabernet", "chardonnay", "vinos online", "ecommerce vino", "vinorodante", "comprar vino", "vinos argentinos"
  ],
  openGraph: {
    title: "Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia",
    description: "Tienda online rodante de vinos de toda la Argentina.",
    url: "https://vinorodante.com",
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
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo/logo_vr.svg",
  },
  alternates: {
    canonical: "https://vinorodante.com"
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  )
}
