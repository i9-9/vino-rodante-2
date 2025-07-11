import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Skeleton para AdminOrdersTab
export function AdminOrdersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Status label */}
                <Skeleton className="h-8 w-16" /> {/* Count number */}
              </div>
              <Skeleton className="h-6 w-12" /> {/* Percentage badge */}
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" /> {/* Search input */}
        <Skeleton className="h-10 w-[180px]" /> {/* Status filter */}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="bg-muted/50">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24" /> {/* Order ID */}
                    <Skeleton className="h-6 w-20" /> {/* Status Badge */}
                  </div>
                  <Skeleton className="h-4 w-48" /> {/* Date and customer */}
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-[180px]" /> {/* Status selector */}
                  <Skeleton className="h-8 w-8" /> {/* Expand button */}
                </div>
              </div>
            </CardHeader>
            {/* Expanded content for first item */}
            {i === 0 && (
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-16 w-full" />
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

// Skeleton para AdminProductsTab
export function AdminProductsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" /> {/* Title */}
        <Skeleton className="h-9 w-24" /> {/* Create button */}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" /> {/* Search */}
        <Skeleton className="h-10 w-[120px]" /> {/* Category filter */}
        <Skeleton className="h-10 w-[100px]" /> {/* Visibility filter */}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square relative">
              <Skeleton className="w-full h-full" /> {/* Product image */}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-24" /> {/* Product name */}
                  <Skeleton className="h-5 w-16" /> {/* Price */}
                </div>
                <Skeleton className="h-3 w-full" /> {/* Description line 1 */}
                <Skeleton className="h-3 w-3/4" /> {/* Description line 2 */}
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-12" /> {/* Stock */}
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" /> {/* Edit button */}
                    <Skeleton className="h-8 w-8" /> {/* Delete button */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Skeleton para AdminSubscriptionsTab
export function AdminSubscriptionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Stat label */}
              <Skeleton className="h-8 w-12" /> {/* Stat number */}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" /> {/* Search */}
        <Skeleton className="h-10 w-[150px]" /> {/* Status filter */}
        <Skeleton className="h-10 w-[120px]" /> {/* Plan filter */}
      </div>

      {/* Subscriptions table */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {/* Table header */}
            <div className="border-b bg-muted/50 p-4">
              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b p-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Skeleton para AdminPlansTab
export function AdminPlansSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-40" /> {/* Title */}
        <Skeleton className="h-9 w-28" /> {/* Create plan button */}
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
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
                {/* Pricing */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
                {/* Features */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-1">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-3 w-full" />
                    ))}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 