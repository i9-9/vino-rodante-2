'use client'

import { Suspense, Component, ReactNode } from 'react'

interface LoadingBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function DefaultLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

class SimpleErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error en LoadingBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

function DefaultErrorFallback() {
  return (
    <div className="rounded-lg border-2 border-dashed border-red-300 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-6 w-6 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">Error al cargar contenido</h3>
      <p className="mt-2 text-gray-500">
        Ocurrió un error inesperado. Por favor, recarga la página.
      </p>
    </div>
  )
}

export default function LoadingBoundary({ 
  children, 
  fallback = <DefaultLoadingSkeleton />
}: LoadingBoundaryProps) {
  return (
    <SimpleErrorBoundary fallback={<DefaultErrorFallback />}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </SimpleErrorBoundary>
  )
} 