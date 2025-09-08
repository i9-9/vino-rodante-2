"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageZoomProps {
  src: string
  alt: string
  className?: string
  highResSrc?: string
}

export function ProductImageZoom({ 
  src, 
  alt, 
  className,
  highResSrc
}: ProductImageZoomProps) {
  const [isZooming, setIsZooming] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()

    setMousePosition({ 
      x: e.clientX, 
      y: e.clientY 
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
        
        {/* Overlay sutil en hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
        
        {/* Indicador de zoom */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lupa simple que aparece en hover */}
      {isZooming && (
        <div 
          className="fixed z-50 pointer-events-none hidden md:block"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y - 100,
            width: 200,
            height: 200,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div 
            className="w-full h-full rounded-lg border-2 border-white shadow-2xl overflow-hidden bg-white"
          >
            <Image
              src={highResSrc || src || "/placeholder.svg"}
              alt={alt}
              fill
              className="object-cover"
              quality={95}
              priority
            />
          </div>
        </div>
      )}

      {/* Modal simple para móviles */}
      {isZooming && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:hidden">
          <div className="relative max-w-full max-h-full">
            <Image
              src={highResSrc || src || "/placeholder.svg"}
              alt={alt}
              width={400}
              height={400}
              className="object-contain max-w-full max-h-full rounded-lg"
              quality={95}
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}
