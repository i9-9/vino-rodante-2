'use client'

interface SEOProps {
  children: React.ReactNode
}

export default function SEO({ children }: SEOProps) {
  // For client-side rendering, we don't need to do anything special
  // The metadata is handled by Next.js metadata API in the page components
  return <>{children}</>
}
