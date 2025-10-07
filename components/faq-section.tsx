'use client'

import { Accordion } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
  id?: string
}

interface FAQSectionProps {
  faqs: FAQItem[]
  title?: string
  className?: string
}

export function FAQSection({ faqs, title = "Preguntas Frecuentes", className }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) {
    return null
  }

  // Convertir FAQs al formato del Accordion
  const accordionItems = faqs.map((faq) => ({
    title: faq.question,
    content: (
      <p className="text-gray-700 leading-relaxed">
        {faq.answer}
      </p>
    )
  }))

  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#5B0E2D] mb-8 text-center">
          {title}
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <Accordion items={accordionItems} />
        </div>
      </div>
    </section>
  )
}
