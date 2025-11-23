import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag } from 'lucide-react'
import type { BlogPost } from '@/lib/blog/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = format(new Date(post.date), "d 'de' MMMM, yyyy", {
    locale: es,
  })

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {post.image && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          {post.readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min</span>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>

        <p className="text-muted-foreground mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
              {post.category}
            </span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="w-3 h-3" />
              <span>{post.tags.slice(0, 2).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

