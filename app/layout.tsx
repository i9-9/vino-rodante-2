import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/lib/providers/cart-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { TranslationsProvider } from "@/lib/providers/translations-provider"
import { Toaster } from "@/components/ui/toaster"

// This is a placeholder for the custom fonts the user will add
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
})

// The user will replace this with their custom fonts
const fontClasses = `${inter.variable}`

export const metadata: Metadata = {
  title: "Vino Rodante | Selección de Vinos Finos",
  description:
    "Descubre vinos excepcionales de todo el mundo, cuidadosamente seleccionados para los paladares más exigentes.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={fontClasses}>
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
