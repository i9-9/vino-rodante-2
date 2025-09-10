import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Más Vendidos | Vino Rodante",
  description: "Los vinos y boxes más populares entre nuestros clientes",
  openGraph: {
    title: "Más Vendidos | Vino Rodante",
    description: "Los vinos y boxes más populares entre nuestros clientes",
  },
}

export default function BestsellersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
