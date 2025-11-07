import { cn } from "@/lib/utils"

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Imagen con gradiente mejorado */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-t-lg" />
        
        {/* Contenido */}
        <div className="flex flex-1 flex-col p-4 space-y-3">
          {/* Título */}
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
          
          {/* Subtítulo */}
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3" />
          </div>
          
          {/* Precio y botón */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

