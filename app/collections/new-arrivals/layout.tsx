import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Novedades | Vino Rodante",
  description: "Descubre nuestros vinos y boxes más recientes",
  openGraph: {
    title: "Novedades | Vino Rodante",
    description: "Descubre nuestros vinos y boxes más recientes",
  },
}

export default function NewArrivalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
