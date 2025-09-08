"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageZoomProps {
  src: string
  alt: string
  className?: string
  highResSrc?: string
  zoomLevel?: number
}

export function ProductImageZoom({ 
  src, 
  alt, 
  className,
  highResSrc,
  zoomLevel = 2.5
}: ProductImageZoomProps) {
  const [isZooming, setIsZooming] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Usar imagen de alta resolución si está disponible
  const zoomImageSrc = highResSrc || src

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Actualizar posición del mouse para la lupa
    setMousePosition({ 
      x: e.clientX, 
      y: e.clientY 
    })

    // Calcular la posición de la imagen ampliada
    const relativeX = (x / rect.width) * 100
    const relativeY = (y / rect.height) * 100

    setImagePosition({
      x: -(relativeX * (zoomLevel - 1)),
      y: -(relativeY * (zoomLevel - 1))
    })
  }

  const handleMouseEnter = () => {
    setIsZooming(true)
  }

  const handleMouseLeave = () => {
    setIsZooming(false)
  }

  return (
    <div className="relative">
      {/* Contenedor principal de la imagen */}
      <div 
        ref={containerRef}
        className={cn("relative aspect-square overflow-hidden rounded-lg bg-gray-100 group cursor-zoom-in", className)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 ease-out"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        {/* Overlay glassmorphism en hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
        
        {/* Indicador de zoom glassmorphism */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 shadow-lg">
            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lupa glassmorphism que aparece en hover */}
      {isZooming && (
        <div 
          className="fixed z-50 pointer-events-none hidden md:block"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y - 120,
            width: 240,
            height: 240,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Contenedor glassmorphism */}
          <div 
            className="w-full h-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 0 100px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
          >
            {/* Debug info */}
            <div className="absolute top-1 left-1 text-xs text-white bg-black/50 px-1 rounded z-10">
              {Math.round(imagePosition.x)}%, {Math.round(imagePosition.y)}%
            </div>
            
            {/* Imagen ampliada con zoom */}
            <div 
              className="w-full h-full relative overflow-hidden"
              style={{
                transform: `scale(${zoomLevel}) translate(${imagePosition.x}%, ${imagePosition.y}%)`,
                transformOrigin: 'center center'
              }}
            >
              <img
                src={zoomImageSrc || "/placeholder.svg"}
                alt={alt}
                className="absolute w-full h-full object-cover"
                style={{
                  width: '100%',
                  height: '100%',
                  left: '0',
                  top: '0'
                }}
                onError={(e) => {
                  console.log('Error loading image:', zoomImageSrc)
                  e.currentTarget.src = '/placeholder.svg'
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', zoomImageSrc)
                }}
              />
            </div>
            
            {/* Fallback si no carga la imagen */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
              {!zoomImageSrc && 'No image'}
            </div>
          </div>
        </div>
      )}

      {/* Modal glassmorphism para móviles */}
      {isZooming && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:hidden">
          <div 
            className="relative max-w-full max-h-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden"
            style={{
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 0 100px rgba(255, 255, 255, 0.1)
              `
            }}
          >
            <Image
              src={zoomImageSrc || "/placeholder.svg"}
              alt={alt}
              width={400}
              height={400}
              className="object-contain max-w-full max-h-full"
              quality={95}
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}
