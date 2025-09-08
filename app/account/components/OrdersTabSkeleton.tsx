import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function OrdersTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header con título y contador */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" /> {/* Title */}
        <Skeleton className="h-4 w-20" /> {/* Order count */}
      </div>

      {/* Grid de órdenes */}
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Información básica */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24" /> {/* Order ID */}
                    <Skeleton className="h-6 w-20" /> {/* Status Badge */}
                  </div>
                  <Skeleton className="h-4 w-36" /> {/* Date */}
                </div>

                {/* Resumen y Acciones */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Skeleton className="h-5 w-16 mb-1" /> {/* Total price */}
                    <Skeleton className="h-4 w-20" /> {/* Products count */}
                  </div>
                  <Skeleton className="h-8 w-8" /> {/* Expand button */}
                </div>
              </div>
            </CardHeader>

            {/* Contenido expandido simulado solo para el primer item */}
            {i === 0 && (
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Lista de productos skeleton */}
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-start gap-4">
                        <Skeleton className="w-20 h-20 rounded-md flex-shrink-0" /> {/* Product image */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" /> {/* Product name */}
                              <Skeleton className="h-3 w-40" /> {/* Product details */}
                            </div>
                            <div className="flex items-center gap-4 sm:text-right">
                              <Skeleton className="h-4 w-16" /> {/* Price x quantity */}
                              <Skeleton className="h-4 w-12" /> {/* Total */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Separator */}
                  <div className="border-t"></div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-12" /> {/* "Total" text */}
                    <Skeleton className="h-6 w-20" /> {/* Total amount */}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 