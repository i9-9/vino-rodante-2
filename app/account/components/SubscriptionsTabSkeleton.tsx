import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SubscriptionsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Sección de suscripciones activas */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" /> {/* Section title */}
        
        {/* Active subscriptions skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" /> {/* Plan name */}
                    <Skeleton className="h-4 w-48" /> {/* Plan description */}
                  </div>
                  <Skeleton className="h-6 w-16" /> {/* Status badge */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Subscription details */}
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" /> {/* Details title */}
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-28" /> {/* Frequency */}
                      <Skeleton className="h-3 w-36" /> {/* Next delivery */}
                      <Skeleton className="h-3 w-24" /> {/* Price */}
                      <Skeleton className="h-3 w-32" /> {/* Wines per delivery */}
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" /> {/* "Included" title */}
                    <div className="space-y-1">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Skeleton key={j} className="h-3 w-40" /> /* Feature item */
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Skeleton className="h-8 w-20" /> {/* Pause button */}
                <Skeleton className="h-8 w-20" /> {/* Cancel button */}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Sección de planes disponibles */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" /> {/* Available plans title */}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-28" /> {/* Plan name */}
                <Skeleton className="h-4 w-44" /> {/* Plan description */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Pricing options */}
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" /> {/* "Pricing" title */}
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded-full" /> {/* Radio button */}
                          <Skeleton className="h-3 w-32" /> {/* Frequency and price */}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" /> {/* "Features" title */}
                    <div className="space-y-1">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-3 w-36" /> /* Feature item */
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" /> {/* Subscribe button */}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 