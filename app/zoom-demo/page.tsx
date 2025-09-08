import { ZoomVariantsDemo } from '@/components/image-zoom-variants'

export default function ZoomDemoPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#5B0E2D] mb-4">
          Opciones de Diseño para Zoom de Imágenes
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explora diferentes estilos de zoom para las imágenes de productos. 
          Cada variante tiene su propio diseño y personalidad.
        </p>
      </div>
      
      <ZoomVariantsDemo />
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Cómo usar cada variante:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-[#5B0E2D]">Minimal</h3>
            <p>Diseño limpio y simple, perfecto para sitios minimalistas.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#5B0E2D]">Elegant</h3>
            <p>Estilo elegante con bordes sutiles y sombras sofisticadas.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#5B0E2D]">Modern</h3>
            <p>Diseño moderno con gradientes y colores de tu marca.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#5B0E2D]">Glass</h3>
            <p>Efecto glassmorphism con transparencias y blur.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#5B0E2D]">Dark</h3>
            <p>Tema oscuro para sitios con estética dark mode.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#5B0E2D]">Colorful</h3>
            <p>Diseño vibrante con gradientes animados y colores llamativos.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
