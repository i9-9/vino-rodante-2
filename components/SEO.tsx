'use client'

import { NextSeo } from 'next-seo'
import type { NextSeoProps } from 'next-seo'

interface SEOProps {
  seo: NextSeoProps
  children: React.ReactNode
}

export default function SEO({ seo, children }: SEOProps) {
  return (
    <>
      <NextSeo {...seo} />
      {children}
    </>
  )
}
