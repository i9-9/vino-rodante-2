'use client'

import { useState, useEffect } from 'react'

interface SmartLoaderProps {
  skeleton: React.ReactNode
  children: React.ReactNode
  delay?: number // Delay en milliseconds para mostrar el skeleton
}

export default function SmartLoader({ skeleton, children, delay = 300 }: SmartLoaderProps) {
  const [showSkeleton, setShowSkeleton] = useState(true)

  useEffect(() => {
    // Mostrar skeleton brevemente para feedback visual
    const timer = setTimeout(() => {
      setShowSkeleton(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (showSkeleton) {
    return <>{skeleton}</>
  }

  return <>{children}</>
} 