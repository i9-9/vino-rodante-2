import { getBlogPost, getRelatedPosts, getAllBlogPosts } from '@/lib/blog/utils'
import { BlogPostContent } from '@/components/blog/blog-post-content'
import { RelatedPosts } from '@/components/blog/related-posts'
import SEO from '@/components/SEO'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAppBaseUrl } from '@/lib/url-utils'

export const revalidate = 3600 // Revalidar cada hora

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Post no encontrado | Vino Rodante',
    }
  }

  const baseUrl = getAppBaseUrl()
  const postUrl = `${baseUrl}/blog/${slug}`
  const postImage = post.image
    ? `${baseUrl}${post.image}`
    : `${baseUrl}/og-image.jpg`

  return {
    title: `${post.title} | Blog Vino Rodante`,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      'blog vinos',
      'guía vinos',
      'vinos argentinos',
      post.category,
    ],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: 'Vino Rodante',
      images: [
        {
          url: postImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'es_AR',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [postImage],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug, 3)
  const baseUrl = getAppBaseUrl()

  // Structured Data para BlogPosting
  const blogPostStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image ? `${baseUrl}${post.image}` : `${baseUrl}/og-image.jpg`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vino Rodante',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo/logo2.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`,
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostStructuredData),
        }}
      />
      <SEO>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <BlogPostContent post={post} />
          {relatedPosts.length > 0 && (
            <RelatedPosts posts={relatedPosts} />
          )}
        </div>
      </SEO>
    </>
  )
}

