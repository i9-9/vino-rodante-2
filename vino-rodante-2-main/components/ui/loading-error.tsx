import { Loader2 } from "lucide-react"

interface LoadingErrorProps {
  isLoading?: boolean
  error?: Error | null
  children: React.ReactNode
}

export function LoadingError({ isLoading, error, children }: LoadingErrorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#A83935]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-red-600">Error al cargar los datos</p>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
      </div>
    )
  }

  return <>{children}</>
} 