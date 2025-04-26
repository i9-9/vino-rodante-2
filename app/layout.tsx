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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo/logo_vr.svg",
  },
  keywords: ["vino", "wine", "argentina", "malbec", "cabernet", "chardonnay", "wines", "vinos", "ecommerce"],
  authors: [{ name: "Vino Rodante" }],
  creator: "Vino Rodante",
  publisher: "Vino Rodante",
  generator: 'v0.dev',
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
