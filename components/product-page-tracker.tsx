'use client'

import { useEffect } from 'react'
import { useProductTracking } from '@/lib/hooks/use-tracking'
import type { Product } from '@/lib/types'

// Component to track product page views
export function ProductPageTracker({ product }: { product: Product }) {
  const { trackProductView } = useProductTracking()

  useEffect(() => {
    // Track product view when component mounts
    trackProductView(product)
  }, [product, trackProductView])

  return null // This component doesn't render anything
}

// Component to track FAQ interactions
export function FAQTracker({ faqs }: { faqs: Array<{question: string, answer: string}> }) {
  const { trackFAQInteraction } = useProductTracking()

  useEffect(() => {
    // Track FAQ interactions
    const faqElements = document.querySelectorAll('[data-faq-question]')
    
    faqElements.forEach((element) => {
      element.addEventListener('click', () => {
        const question = element.getAttribute('data-faq-question')
        const category = element.getAttribute('data-faq-category')
        
        if (question && category) {
          trackFAQInteraction(question, category)
        }
      })
    })

    return () => {
      faqElements.forEach((element) => {
        element.removeEventListener('click', () => {})
      })
    }
  }, [faqs, trackFAQInteraction])

  return null
}
