"use client"

import Zoom from 'react-medium-image-zoom'
import Image from 'next/image'
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
  // Usar imagen de alta resolución si está disponible
  const zoomImageSrc = highResSrc || src

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-gray-100 group", className)}>
      <Zoom>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover cursor-zoom-in transition-transform duration-200 ease-out hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </Zoom>
      
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
  )
}
