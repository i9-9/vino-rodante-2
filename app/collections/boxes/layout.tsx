import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Boxes de Vinos | Vino Rodante",
  description: "Descubrí nuestras cajas seleccionadas con los mejores vinos argentinos. Perfectas para regalar o para disfrutar en casa.",
  openGraph: {
    title: "Boxes de Vinos | Vino Rodante",
    description: "Descubrí nuestras cajas seleccionadas con los mejores vinos argentinos. Perfectas para regalar o para disfrutar en casa.",
  },
}

export default function BoxesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
