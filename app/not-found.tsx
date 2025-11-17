import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: '404 - Página no encontrada | Vino Rodante',
  description: 'La página que buscas no existe o fue movida.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
      <h1 className="text-6xl font-bold text-[#5B0E2D] mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="primary">
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/products">Ver productos</Link>
        </Button>
      </div>
    </div>
  )
}






