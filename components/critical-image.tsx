'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CriticalImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  // Performance optimizations
  preload?: boolean
  fetchPriority?: 'high' | 'low' | 'auto'
  // Progressive loading
  lowQualitySrc?: string
  highQualitySrc?: string
}

export function CriticalImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = true,
  quality = 85, // Calidad HD para imágenes críticas
  sizes,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  preload = true,
  fetchPriority = 'high',
  lowQualitySrc,
  highQualitySrc,
  ...props
}: CriticalImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src)

  // Preload critical images
  useEffect(() => {
    if (preload && src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
      
      return () => {
        document.head.removeChild(link)
      }
    }
  }, [src, preload])

  // Progressive loading: start with low quality, then high quality
  useEffect(() => {
    if (lowQualitySrc && highQualitySrc) {
      // Load high quality after low quality is loaded
      const timer = setTimeout(() => {
        setCurrentSrc(highQualitySrc)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [lowQualitySrc, highQualitySrc])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Error al cargar</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <Image
          src={currentSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={cn(
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={fetchPriority}
          {...props}
        />
      )}
    </div>
  )
}

// Specialized components for different critical image types
export function HeroCriticalImage(props: Omit<CriticalImageProps, 'priority' | 'fetchPriority' | 'preload'>) {
  return (
    <CriticalImage
      {...props}
      priority={true}
      fetchPriority="high"
      preload={true}
      quality={85} // HD para banners pero optimizado
    />
  )
}

export function ProductCriticalImage(props: Omit<CriticalImageProps, 'priority' | 'fetchPriority'>) {
  return (
    <CriticalImage
      {...props}
      priority={false}
      fetchPriority="auto"
      quality={85} // HD optimizado para productos
    />
  )
}
