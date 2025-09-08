"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import Zoom from 'react-medium-image-zoom'

type ZoomVariant = 'minimal' | 'elegant' | 'modern' | 'glass' | 'dark' | 'colorful'

interface ProductImageZoomProps {
  src: string
  alt: string
  className?: string
  highResSrc?: string
  variant?: ZoomVariant
}

const variantConfig = {
  minimal: {
    overlayBgColorEnd: "rgba(0, 0, 0, 0.9)",
    overlayBgColorStart: "rgba(0, 0, 0, 0)",
    zoomMargin: 40,
    overlayClassName: "zoom-overlay zoom-minimal",
    closeClassName: "zoom-close zoom-minimal",
    zoomImageClassName: "zoom-image zoom-minimal"
  },
  elegant: {
    overlayBgColorEnd: "rgba(0, 0, 0, 0.95)",
    overlayBgColorStart: "rgba(0, 0, 0, 0.8)",
    zoomMargin: 50,
    overlayClassName: "zoom-overlay zoom-elegant",
    closeClassName: "zoom-close zoom-elegant",
    zoomImageClassName: "zoom-image zoom-elegant"
  },
  modern: {
    overlayBgColorEnd: "rgba(91, 14, 45, 0.95)",
    overlayBgColorStart: "rgba(91, 14, 45, 0.9)",
    zoomMargin: 60,
    overlayClassName: "zoom-overlay zoom-modern",
    closeClassName: "zoom-close zoom-modern",
    zoomImageClassName: "zoom-image zoom-modern"
  },
  glass: {
    overlayBgColorEnd: "rgba(0, 0, 0, 0.7)",
    overlayBgColorStart: "rgba(0, 0, 0, 0.3)",
    zoomMargin: 40,
    overlayClassName: "zoom-overlay zoom-glass",
    closeClassName: "zoom-close zoom-glass",
    zoomImageClassName: "zoom-image zoom-glass"
  },
  dark: {
    overlayBgColorEnd: "rgba(0, 0, 0, 0.95)",
    overlayBgColorStart: "rgba(26, 26, 26, 0.8)",
    zoomMargin: 40,
    overlayClassName: "zoom-overlay zoom-dark",
    closeClassName: "zoom-close zoom-dark",
    zoomImageClassName: "zoom-image zoom-dark"
  },
  colorful: {
    overlayBgColorEnd: "rgba(255, 107, 107, 0.9)",
    overlayBgColorStart: "rgba(78, 205, 196, 0.8)",
    zoomMargin: 50,
    overlayClassName: "zoom-overlay zoom-colorful",
    closeClassName: "zoom-close zoom-colorful",
    zoomImageClassName: "zoom-image zoom-colorful"
  }
}

export function ProductImageZoom({ 
  src, 
  alt, 
  className,
  highResSrc,
  variant = 'minimal'
}: ProductImageZoomProps) {
  const zoomImageSrc = highResSrc || src
  const config = variantConfig[variant]

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-gray-100 group", className)}>
      <Zoom
        overlayBgColorEnd={config.overlayBgColorEnd}
        overlayBgColorStart={config.overlayBgColorStart}
        zoomMargin={config.zoomMargin}
        zoomImage={{
          src: zoomImageSrc,
          alt: alt,
          className: config.zoomImageClassName
        }}
        overlayClassName={config.overlayClassName}
        closeClassName={config.closeClassName}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover cursor-zoom-in transition-transform duration-200 ease-out hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </Zoom>
      
      {/* Overlay con indicador de zoom */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar todas las variantes (para testing)
export function ZoomVariantsDemo() {
  const variants: ZoomVariant[] = ['minimal', 'elegant', 'modern', 'glass', 'dark', 'colorful']
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {variants.map((variant) => (
        <div key={variant} className="space-y-2">
          <h3 className="text-lg font-semibold capitalize">{variant}</h3>
          <ProductImageZoom
            src="/placeholder.svg"
            alt={`Demo ${variant}`}
            variant={variant}
            className="w-full h-48"
          />
        </div>
      ))}
    </div>
  )
}
