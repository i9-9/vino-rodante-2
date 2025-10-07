// Reviews and Ratings Schema for better SEO and rich snippets
export interface Review {
  id: string
  author: string
  rating: number // 1-5 stars
  reviewBody: string
  datePublished: string
  helpful?: number
}

export interface AggregateRating {
  ratingValue: number
  reviewCount: number
  bestRating: 5
  worstRating: 1
}

export const generateReviewStructuredData = (reviews: Review[], aggregateRating?: AggregateRating) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinorodante.com'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewBody": review.reviewBody,
      "datePublished": review.datePublished,
      "publisher": {
        "@type": "Organization",
        "name": "Vino Rodante"
      }
    }))
  }

  // Add aggregate rating if provided
  if (aggregateRating) {
    structuredData["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": aggregateRating.bestRating,
      "worstRating": aggregateRating.worstRating
    }
  }

  return structuredData
}

// Mock reviews for demonstration (in production, these would come from your database)
export const getMockReviews = (productName: string): Review[] => [
  {
    id: "1",
    author: "María González",
    rating: 5,
    reviewBody: `Excelente ${productName}. La calidad superó mis expectativas. Perfecto para una cena especial.`,
    datePublished: "2024-01-15",
    helpful: 12
  },
  {
    id: "2", 
    author: "Carlos Mendoza",
    rating: 4,
    reviewBody: `Muy buen vino, buena relación calidad-precio. Lo recomiendo para acompañar con carnes.`,
    datePublished: "2024-01-10",
    helpful: 8
  },
  {
    id: "3",
    author: "Ana Rodríguez",
    rating: 5,
    reviewBody: `Increíble sabor y aroma. El ${productName} se convirtió en uno de mis favoritos.`,
    datePublished: "2024-01-08",
    helpful: 15
  },
  {
    id: "4",
    author: "Roberto Silva",
    rating: 4,
    reviewBody: `Buen vino para el precio. Entrega rápida y bien embalado.`,
    datePublished: "2024-01-05",
    helpful: 6
  },
  {
    id: "5",
    author: "Laura Fernández",
    rating: 5,
    reviewBody: `Perfecto para regalar. El ${productName} tiene una presentación elegante y sabor excepcional.`,
    datePublished: "2024-01-03",
    helpful: 10
  }
]

export const getMockAggregateRating = (): AggregateRating => ({
  ratingValue: 4.6,
  reviewCount: 127,
  bestRating: 5,
  worstRating: 1
})

// Component helper for rendering star ratings
export const renderStarRating = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// Generate reviews for different product types
export const getProductReviews = (productName: string, category: string): Review[] => {
  const baseReviews = getMockReviews(productName)
  
  // Add category-specific reviews
  if (category.toLowerCase().includes('tinto') || category.toLowerCase().includes('red')) {
    baseReviews.push({
      id: "6",
      author: "Diego Martín",
      rating: 5,
      reviewBody: `Este tinto es perfecto para acompañar un asado. Cuerpo robusto y taninos equilibrados.`,
      datePublished: "2024-01-20",
      helpful: 7
    })
  }
  
  if (category.toLowerCase().includes('blanco') || category.toLowerCase().includes('white')) {
    baseReviews.push({
      id: "7", 
      author: "Sofía López",
      rating: 4,
      reviewBody: `Fresco y frutal, ideal para el verano. Perfecto para acompañar con pescados.`,
      datePublished: "2024-01-18",
      helpful: 9
    })
  }
  
  return baseReviews
}

