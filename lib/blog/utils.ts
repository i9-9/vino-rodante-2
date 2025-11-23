import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import type { BlogPost, BlogPostFrontmatter } from './types'

const blogDirectory = path.join(process.cwd(), 'content', 'blog')

/**
 * Lee todos los archivos markdown del blog y retorna sus metadatos
 */
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(blogDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(blogDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(blogDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      const frontmatter = data as BlogPostFrontmatter

      // Calcular tiempo de lectura (aproximado: 200 palabras por minuto)
      const wordCount = content.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200)

      return {
        slug: frontmatter.slug || slug,
        title: frontmatter.title,
        excerpt: frontmatter.excerpt,
        content: '', // No incluimos el contenido en el listado
        date: frontmatter.date,
        author: frontmatter.author || 'Vino Rodante',
        category: frontmatter.category,
        tags: frontmatter.tags || [],
        image: frontmatter.image,
        published: frontmatter.published !== false, // Por defecto publicado
        readingTime,
      }
    })
    .filter((post) => {
      // En desarrollo, mostrar todos los posts (para poder trabajar en ellos)
      // En producción, solo mostrar los publicados
      const isDevelopment = process.env.NODE_ENV === 'development'
      return isDevelopment || post.published
    })
    .sort((a, b) => {
      // Ordenar por fecha (más recientes primero)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return allPostsData
}

/**
 * Obtiene un post específico por su slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`)
    
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const frontmatter = data as BlogPostFrontmatter

    // Convertir markdown a HTML
    const processedContent = await remark()
      .use(remarkGfm) // Soporte para GitHub Flavored Markdown
      .use(remarkHtml)
      .process(content)

    const htmlContent = processedContent.toString()

    // Calcular tiempo de lectura
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    return {
      slug: frontmatter.slug || slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      content: htmlContent,
      date: frontmatter.date,
      author: frontmatter.author || 'Vino Rodante',
      category: frontmatter.category,
      tags: frontmatter.tags || [],
      image: frontmatter.image,
      published: frontmatter.published !== false,
      readingTime,
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

/**
 * Obtiene posts por categoría
 */
export function getBlogPostsByCategory(category: string): BlogPost[] {
  return getAllBlogPosts().filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Obtiene posts por tag
 */
export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * Obtiene todas las categorías únicas
 */
export function getAllCategories(): string[] {
  const posts = getAllBlogPosts()
  const categories = new Set(posts.map((post) => post.category))
  return Array.from(categories).sort()
}

/**
 * Obtiene todos los tags únicos
 */
export function getAllTags(): string[] {
  const posts = getAllBlogPosts()
  const tags = new Set(posts.flatMap((post) => post.tags))
  return Array.from(tags).sort()
}

/**
 * Obtiene posts relacionados (misma categoría o tags similares)
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getAllBlogPosts().find((post) => post.slug === currentSlug)
  if (!currentPost) return []

  const related = getAllBlogPosts()
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      let score = 0

      // Misma categoría: +2 puntos
      if (post.category === currentPost.category) {
        score += 2
      }

      // Tags comunes: +1 punto por tag
      const commonTags = post.tags.filter((tag) =>
        currentPost.tags.includes(tag)
      )
      score += commonTags.length

      return { post, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post)

  return related
}

