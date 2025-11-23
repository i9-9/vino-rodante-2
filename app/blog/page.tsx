import { getAllBlogPosts, getAllCategories, getAllTags } from '@/lib/blog/utils'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogFilters } from '@/components/blog/blog-filters'
import SEO from '@/components/SEO'
import { Metadata } from 'next'
import { getAppBaseUrl } from '@/lib/url-utils'

export const revalidate = 3600 // Revalidar cada hora

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getAppBaseUrl()
  
  return {
    title: 'Blog de Vinos | Vino Rodante',
    description:
      'Descubrí las mejores guías de vinos argentinos, maridajes, catas y consejos de expertos. Todo lo que necesitás saber sobre Malbec, Cabernet, Chardonnay y más.',
    keywords: [
      'blog vinos',
      'guía vinos argentinos',
      'maridaje vinos',
      'cata vinos',
      'consejos vino',
      'malbec argentino',
      'vinos mendoza',
      'club de vino',
    ],
    openGraph: {
      title: 'Blog de Vinos | Vino Rodante',
      description:
        'Descubrí las mejores guías de vinos argentinos, maridajes, catas y consejos de expertos.',
      url: `${baseUrl}/blog`,
      siteName: 'Vino Rodante',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Blog de Vinos - Vino Rodante',
        },
      ],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog de Vinos | Vino Rodante',
      description:
        'Descubrí las mejores guías de vinos argentinos, maridajes, catas y consejos de expertos.',
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>
}) {
  const params = await searchParams
  const allPosts = getAllBlogPosts()
  const categories = getAllCategories()
  const tags = getAllTags()

  // Filtrar posts si hay parámetros
  let filteredPosts = allPosts
  if (params.category) {
    filteredPosts = filteredPosts.filter(
      (post) => post.category.toLowerCase() === params.category.toLowerCase()
    )
  }
  if (params.tag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags.some((t) => t.toLowerCase() === params.tag.toLowerCase())
    )
  }

  const baseUrl = getAppBaseUrl()

  // Structured Data para Blog
  const blogStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog de Vinos - Vino Rodante',
    description:
      'Blog sobre vinos argentinos, guías, maridajes y consejos de expertos',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Vino Rodante',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo/logo2.svg`,
      },
    },
    blogPost: filteredPosts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.image ? `${baseUrl}${post.image}` : `${baseUrl}/og-image.jpg`,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      url: `${baseUrl}/blog/${post.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogStructuredData),
        }}
      />
      <SEO>
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Blog de Vinos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubrí las mejores guías de vinos argentinos, maridajes, catas
              y consejos de expertos
            </p>
          </div>

          <BlogFilters
            categories={categories}
            tags={tags}
            activeCategory={params.category}
            activeTag={params.tag}
          />

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No se encontraron artículos con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </SEO>
    </>
  )
}

