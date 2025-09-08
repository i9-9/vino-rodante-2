"use client"

import ReactImageMagnify from 'react-image-magnify'
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
}: ProductImageZoomProps) {
  // Usar imagen de alta resolución si está disponible, sino usar la misma imagen pero con parámetros de calidad
  const zoomImageSrc = highResSrc || src
  
  // Crear URL con parámetros de calidad para mejor renderizado
  const getHighQualitySrc = (imageSrc: string) => {
    if (imageSrc.includes('placeholder.svg')) return imageSrc
    // Añadir parámetros para mejor calidad si es posible
    return imageSrc
  }

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-gray-100 group", className)}>
      <ReactImageMagnify
        {...{
          smallImage: {
            alt: alt,
            isFluidWidth: true,
            src: src || "/placeholder.svg",
            sizes: "(max-width: 768px) 100vw, 50vw",
          },
          largeImage: {
            src: getHighQualitySrc(zoomImageSrc || "/placeholder.svg"),
            width: 1600, // Resolución optimizada
            height: 1600,
            alt: alt,
          },
          enlargedImageContainerStyle: { 
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(4px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.1),
              0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 0 100px rgba(255, 255, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          },
          enlargedImageContainerDimensions: {
            width: '250%', // Tamaño optimizado
            height: '250%',
          },
          enlargedImagePosition: 'over',
          hoverDelayInMs: 150,
          hoverOffDelayInMs: 200,
          isHintEnabled: true,
          shouldHideHintAfterFirstActivation: false,
          shouldUsePositiveSpaceLens: true,
          lensStyle: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(2px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          enlargedImageStyle: {
            borderRadius: '8px',
            imageRendering: 'high-quality', // Mejorar renderizado
            imageRendering: '-webkit-optimize-contrast'
          }
        }}
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
  )
}
