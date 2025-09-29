'use client'

import { OptimizedImage } from './optimized-image'

interface ImageQualityProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

// Componente para imágenes de productos - HD optimizado
export function ProductImage(props: ImageQualityProps) {
  return (
    <OptimizedImage
      {...props}
      quality={80} // HD pero optimizado para performance
      loading={props.priority ? 'eager' : 'lazy'}
    />
  )
}

// Componente para banners - HD alta calidad
export function BannerImageHD(props: ImageQualityProps) {
  return (
    <OptimizedImage
      {...props}
      quality={85} // HD alta calidad para banners
      priority={true}
      loading="eager"
    />
  )
}

// Componente para miniaturas - Optimizado
export function ThumbnailImage(props: ImageQualityProps) {
  return (
    <OptimizedImage
      {...props}
      quality={75} // Optimizado para miniaturas
      loading="lazy"
    />
  )
}

// Componente para galerías - HD balanceado
export function GalleryImage(props: ImageQualityProps) {
  return (
    <OptimizedImage
      {...props}
      quality={80} // HD balanceado para galerías
      loading="lazy"
    />
  )
}

// Componente para imágenes críticas - HD premium
export function CriticalImageHD(props: ImageQualityProps) {
  return (
    <OptimizedImage
      {...props}
      quality={85} // HD premium para imágenes críticas
      priority={true}
      loading="eager"
    />
  )
}
