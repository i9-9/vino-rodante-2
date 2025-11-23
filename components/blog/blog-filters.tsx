'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface BlogFiltersProps {
  categories: string[]
  tags: string[]
  activeCategory?: string
  activeTag?: string
}

export function BlogFilters({
  categories,
  tags,
  activeCategory,
  activeTag,
}: BlogFiltersProps) {
  const searchParams = useSearchParams()

  const buildUrl = (category?: string, tag?: string) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (tag) params.set('tag', tag)
    return `/blog${params.toString() ? `?${params.toString()}` : ''}`
  }

  const clearFilters = () => {
    return '/blog'
  }

  const hasActiveFilters = activeCategory || activeTag

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Filtros activos:</span>
          {activeCategory && (
            <Badge variant="secondary" className="gap-2">
              Categoría: {activeCategory}
              <Link href={clearFilters()}>
                <X className="w-3 h-3 cursor-pointer" />
              </Link>
            </Badge>
          )}
          {activeTag && (
            <Badge variant="secondary" className="gap-2">
              Tag: {activeTag}
              <Link href={clearFilters()}>
                <X className="w-3 h-3 cursor-pointer" />
              </Link>
            </Badge>
          )}
          <Link href={clearFilters()}>
            <Button variant="ghost" size="sm">
              Limpiar filtros
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {categories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={buildUrl(
                    category === activeCategory ? undefined : category,
                    activeTag
                  )}
                >
                  <Button
                    variant={
                      category === activeCategory ? 'default' : 'outline'
                    }
                    size="sm"
                  >
                    {category}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 10).map((tag) => (
                <Link
                  key={tag}
                  href={buildUrl(
                    activeCategory,
                    tag === activeTag ? undefined : tag
                  )}
                >
                  <Badge
                    variant={tag === activeTag ? 'default' : 'secondary'}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

