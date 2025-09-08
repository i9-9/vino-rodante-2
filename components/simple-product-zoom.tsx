"use client"

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Expand, ZoomIn } from 'lucide-react'
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
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) })
    setCursorPosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="relative overflow-hidden w-full h-full">
      <div
        ref={imageRef}
        className="w-full h-full relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover cursor-crosshair transition-transform duration-200 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      
      {/* Magnifier */}
      {showMagnifier && (
        <div
          className="fixed border-2 border-white shadow-2xl rounded-full pointer-events-none z-50"
          style={{
            left: cursorPosition.x + 20,
            top: cursorPosition.y - 120,
            width: '240px',
            height: '240px',
            backgroundImage: `url(${highResSrc || src})`,
            backgroundSize: '800% 800%',
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
      <div onClick={() => setIsZoomed(true)} className="cursor-zoom-in w-full h-full">
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

// Componente Principal
interface SimpleProductZoomProps {
  src: string
  alt: string
  className?: string
  highResSrc?: string
}

export const SimpleProductZoom = ({ src, alt, className, highResSrc }: SimpleProductZoomProps) => {
  const { isMobile, isTouch, isDesktop } = useDeviceDetection()
  
  console.log('SimpleProductZoom src:', src)
  console.log('Device detection:', { isMobile, isTouch, isDesktop })

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-gray-100 group", className)}>
      {/* Desktop: Hover Zoom */}
      {isDesktop ? (
        <HoverZoom
          src={src}
          highResSrc={highResSrc}
          alt={alt}
        />
      ) : (
        /* Mobile/Touch: Click Zoom */
        <MobileZoom
          src={src}
          highResSrc={highResSrc}
          alt={alt}
        >
          <div className="relative w-full h-full">
            <Image 
              src={src}
              alt={alt}
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
    </div>
  )
}
