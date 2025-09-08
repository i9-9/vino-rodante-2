"use client"

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

// Hook para detectar dispositivo
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setIsMobile(mobile)
      setIsTouch(touch)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return { isMobile, isTouch, isDesktop: !isMobile && !isTouch }
}

// Componente Hover Zoom para Desktop
const HoverZoom = ({ src, alt, highResSrc }: { src: string, alt: string, highResSrc?: string }) => {
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) })
    setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="relative overflow-hidden">
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        className="object-cover cursor-crosshair transition-transform duration-200 hover:scale-105"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      
      {/* Magnifier */}
      {showMagnifier && (
        <div
          className="absolute border-2 border-white shadow-2xl rounded-full pointer-events-none z-10"
          style={{
            left: cursorPosition.x - 75,
            top: cursorPosition.y - 75,
            width: '150px',
            height: '150px',
            backgroundImage: `url(${highResSrc || src})`,
            backgroundSize: '400% 400%',
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundRepeat: 'no-repeat',
            transform: 'translate(-50%, -50%)',
            backdropFilter: 'blur(1px)',
          }}
        />
      )}
      
      {/* Indicador */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        <ZoomIn className="w-3 h-3 inline mr-1" />
        Hover para ampliar
      </div>
    </div>
  )
}

// Componente Mobile Zoom
const MobileZoom = ({ src, alt, children, highResSrc }: { 
  src: string, 
  alt: string, 
  children: React.ReactNode, 
  highResSrc?: string 
}) => {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <>
      <div onClick={() => setIsZoomed(true)} className="cursor-zoom-in">
        {children}
      </div>
      
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full animate-in zoom-in duration-300">
            <Image 
              src={highResSrc || src} 
              alt={alt}
              width={800}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ cursor: 'zoom-out' }}
              priority
            />
            <button 
              className="absolute top-4 right-4 text-white text-2xl hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setIsZoomed(false)
              }}
            >
              ×
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              Toca fuera para cerrar
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Componente Principal de Galería
interface ProductGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export const ProductGallery = ({ images, productName, className = '' }: ProductGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0)
  const { isMobile, isTouch, isDesktop } = useDeviceDetection()
  
  // Debug: mostrar las imágenes que recibimos
  console.log('ProductGallery images:', images)
  console.log('Current image:', images[currentImage])
  
  // Simular URLs de alta resolución
  const highResImages = images.map(img => img.replace('w=600', 'w=1200'))
  const thumbnails = images.map(img => img.replace('w=600', 'w=120'))

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Imagen Principal */}
      <div className="relative bg-gray-50 rounded-xl overflow-hidden group aspect-square">
        
        {/* Desktop: Hover Zoom */}
        {isDesktop ? (
          <HoverZoom
            src={images[currentImage]}
            highResSrc={highResImages[currentImage]}
            alt={`${productName} - Vista ${currentImage + 1}`}
          />
        ) : (
          /* Mobile/Touch: Click Zoom */
          <MobileZoom
            src={images[currentImage]}
            highResSrc={highResImages[currentImage]}
            alt={`${productName} - Vista ${currentImage + 1}`}
          >
            <div className="relative w-full h-full">
              <Image 
                src={images[currentImage]}
                alt={`${productName} - Vista ${currentImage + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* Badge de zoom para móvil */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                <Expand className="w-3 h-3 inline mr-1" />
                Toca para ampliar
              </div>
            </div>
          </MobileZoom>
        )}
        
        {/* Navegación de imágenes */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-white rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-white rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
        
        {/* Contador de imágenes */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
          {currentImage + 1} / {images.length}
        </div>
        
        {/* Indicadores de navegación */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentImage === index 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              )}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {thumbnails.map((thumb, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={cn(
              "flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
              currentImage === index 
                ? 'border-blue-500 ring-2 ring-blue-200 scale-105 shadow-lg' 
                : 'border-gray-200 hover:border-gray-400 hover:scale-102 hover:shadow-md'
            )}
            aria-label={`Ver imagen ${index + 1}`}
          >
            <Image
              src={thumb}
              alt={`Miniatura ${index + 1}`}
              width={80}
              height={80}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
