"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showLabel?: boolean
  label?: string
  animated?: boolean
}

export function ProgressBar({ 
  progress, 
  className,
  showLabel = false,
  label,
  animated = true
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (animated) {
      // Animar el progreso suavemente
      const timer = setTimeout(() => {
        setDisplayProgress(progress)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setDisplayProgress(progress)
    }
  }, [progress, animated])

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || "Progreso"}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(displayProgress)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={cn(
            "bg-gradient-to-r from-[#A83935] to-[#8B2E2A] h-full transition-all duration-500 ease-out rounded-full",
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${Math.min(Math.max(displayProgress, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-[#A83935]",
        sizeClasses[size]
      )} />
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  progress?: number
  children: React.ReactNode
}

export function LoadingOverlay({ 
  isLoading, 
  message = "Cargando...", 
  progress,
  children 
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
        )}
        {progress !== undefined && (
          <div className="mt-4 w-64">
            <ProgressBar progress={progress} showLabel />
          </div>
        )}
      </div>
    </div>
  )
}

