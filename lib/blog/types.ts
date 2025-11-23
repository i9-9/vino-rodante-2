export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  category: string
  tags: string[]
  image?: string
  published: boolean
  readingTime?: number
}

export interface BlogPostFrontmatter {
  title: string
  slug: string
  excerpt: string
  date: string
  author: string
  category: string
  tags: string[]
  image?: string
  published?: boolean
}

