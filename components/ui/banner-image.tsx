'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface BannerImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fallbackSrc?: string
  overlay?: boolean
  overlayGradient?: string
}

export function BannerImage({
  src,
  alt,
  className,
  priority = true,
  quality = 85, // Calidad HD alta para banners pero optimizada
  sizes = "100vw",
  fallbackSrc = "/placeholder.svg",
  overlay = false,
  overlayGradient = "from-black/20 to-transparent"
}: BannerImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      
      {/* Main image */}
      <Image
        src={imageError ? fallbackSrc : src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={quality}
        className={cn(
          "object-cover object-center transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        // Optimizaciones adicionales para alta calidad
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
      
      {/* Overlay gradient */}
      {overlay && (
        <div className={cn("absolute inset-0 bg-gradient-to-r", overlayGradient)} />
      )}
    </div>
  )
}

// Componente especializado para banners de suscripciones
interface SubscriptionBannerProps {
  bannerImage: string
  fallbackImage: string
  planName: string
  className?: string
  height?: string
}

export function SubscriptionBanner({
  bannerImage,
  fallbackImage,
  planName,
  className,
  height = "h-[70vh]"
}: SubscriptionBannerProps) {
  return (
    <section className={cn("w-full relative", className)}>
      <div className={cn("relative w-full overflow-hidden", height)}>
        <div className="absolute inset-0">
          <BannerImage
            src={bannerImage}
            alt={`Banner de ${planName}`}
            fallbackSrc={fallbackImage}
            priority
            quality={75}
            sizes="100vw"
            overlay
            overlayGradient="from-black/30 via-black/10 to-transparent"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}
